import { SupabaseClient } from '@supabase/supabase-js';
import { 
  FeatureKey, 
  IntegrationKey, 
  ConfigCategory,
  PlanType,
  FEATURE_REGISTRY,
  INTEGRATION_REGISTRY,
  CONFIG_REGISTRY 
} from './feature-registry';

// ============================================
// TYPES
// ============================================

export interface FeatureStatus {
  key: FeatureKey;
  isEnabled: boolean;
  isConfigured: boolean;
  isAvailable: boolean; // Based on plan
  configProgress: number;
  missingDependencies: MissingDependency[];
  configErrors: string[];
  configWarnings: string[];
  canEnable: boolean;
  setupUrl: string;
}

export interface MissingDependency {
  type: 'feature' | 'integration' | 'config';
  key: string;
  label: string;
  isRequired: boolean;
  setupUrl: string;
}

export interface IntegrationStatus {
  key: IntegrationKey;
  isConnected: boolean;
  connectionStatus: string;
  healthStatus: string;
  lastError?: string;
  expiresAt?: string;
}

export interface ConfigStatus {
  category: ConfigCategory;
  isConfigured: boolean;
  progress: number;
  missingItems: string[];
  settingsUrl: string;
}

export interface PlatformAwareness {
  features: Record<FeatureKey, FeatureStatus>;
  integrations: Record<IntegrationKey, IntegrationStatus>;
  configs: Record<ConfigCategory, ConfigStatus>;
  onboarding: OnboardingStatus;
  overallHealth: 'healthy' | 'warnings' | 'critical';
  criticalIssues: string[];
  warnings: string[];
}

export interface OnboardingStatus {
  overallProgress: number;
  isComplete: boolean;
  currentStep: string;
  completedSteps: string[];
  remainingSteps: string[];
}

// ============================================
// SERVICE
// ============================================

export class FeatureAwarenessService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private supabase: SupabaseClient<any>;
  private businessId: string;
  private businessPlan: PlanType = 'free';
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(supabase: SupabaseClient<any>, businessId: string) {
    this.supabase = supabase;
    this.businessId = businessId;
  }
  
  /**
   * Get complete platform awareness status
   */
  async getPlatformAwareness(): Promise<PlatformAwareness> {
    // Fetch business plan first
    await this.fetchBusinessPlan();
    
    const [features, integrations, configs, onboarding] = await Promise.all([
      this.getAllFeatureStatuses(),
      this.getAllIntegrationStatuses(),
      this.getAllConfigStatuses(),
      this.getOnboardingStatus()
    ]);
    
    const { health, criticalIssues, warnings } = this.calculateOverallHealth(features, integrations, configs);
    
    return {
      features,
      integrations,
      configs,
      onboarding,
      overallHealth: health,
      criticalIssues,
      warnings
    };
  }
  
  /**
   * Fetch and cache business plan
   */
  private async fetchBusinessPlan(): Promise<void> {
    try {
      const { data } = await this.supabase
        .from('businesses')
        .select('plan')
        .eq('id', this.businessId)
        .single();
      
      this.businessPlan = (data?.plan as PlanType) || 'free';
    } catch {
      this.businessPlan = 'free';
    }
  }
  
  /**
   * Check if a specific feature can be used
   */
  async canUseFeature(featureKey: FeatureKey): Promise<{
    canUse: boolean;
    reason?: string;
    missingDependencies: MissingDependency[];
  }> {
    const status = await this.getFeatureStatus(featureKey);
    
    if (!status.isAvailable) {
      return {
        canUse: false,
        reason: 'This feature is not available on your current plan',
        missingDependencies: []
      };
    }
    
    if (!status.isEnabled) {
      return {
        canUse: false,
        reason: 'This feature is not enabled',
        missingDependencies: status.missingDependencies
      };
    }
    
    const requiredMissing = status.missingDependencies.filter(d => d.isRequired);
    if (requiredMissing.length > 0) {
      return {
        canUse: false,
        reason: 'Missing required dependencies',
        missingDependencies: requiredMissing
      };
    }
    
    return {
      canUse: true,
      missingDependencies: status.missingDependencies.filter(d => !d.isRequired)
    };
  }
  
  /**
   * Check if an integration is connected and healthy
   */
  async isIntegrationReady(integrationKey: IntegrationKey): Promise<{
    isReady: boolean;
    status: IntegrationStatus;
  }> {
    const status = await this.getIntegrationStatus(integrationKey);
    
    return {
      isReady: status.isConnected && status.healthStatus !== 'failing',
      status
    };
  }
  
  /**
   * Get status of a specific feature
   */
  async getFeatureStatus(featureKey: FeatureKey): Promise<FeatureStatus> {
    const definition = FEATURE_REGISTRY[featureKey];
    if (!definition) {
      return this.getDefaultFeatureStatus(featureKey);
    }
    
    // Get stored feature status
    const { data: featureData } = await this.supabase
      .from('business_features')
      .select('*')
      .eq('business_id', this.businessId)
      .eq('feature_key', featureKey)
      .single();
    
    const isAvailable = definition.availableOnPlans.includes(this.businessPlan);
    
    // Check dependencies
    const missingDependencies = await this.checkDependencies(featureKey);
    
    // Calculate if can enable
    const requiredMissing = missingDependencies.filter(d => d.isRequired);
    const canEnable = isAvailable && requiredMissing.length === 0;
    
    return {
      key: featureKey,
      isEnabled: featureData?.is_enabled || false,
      isConfigured: featureData?.is_configured || false,
      isAvailable,
      configProgress: featureData?.config_progress || 0,
      missingDependencies,
      configErrors: (featureData?.config_errors as string[]) || [],
      configWarnings: (featureData?.config_warnings as string[]) || [],
      canEnable,
      setupUrl: definition.setupUrl
    };
  }
  
  /**
   * Get default feature status when not in registry
   */
  private getDefaultFeatureStatus(featureKey: FeatureKey): FeatureStatus {
    return {
      key: featureKey,
      isEnabled: false,
      isConfigured: false,
      isAvailable: false,
      configProgress: 0,
      missingDependencies: [],
      configErrors: [],
      configWarnings: [],
      canEnable: false,
      setupUrl: '/settings'
    };
  }
  
  /**
   * Check dependencies for a feature
   */
  private async checkDependencies(featureKey: FeatureKey): Promise<MissingDependency[]> {
    const definition = FEATURE_REGISTRY[featureKey];
    if (!definition) return [];
    
    const missing: MissingDependency[] = [];
    
    // Check required integrations
    for (const integrationKey of definition.requiredIntegrations) {
      const { isReady } = await this.isIntegrationReady(integrationKey);
      if (!isReady) {
        const intDef = INTEGRATION_REGISTRY[integrationKey];
        missing.push({
          type: 'integration',
          key: integrationKey,
          label: `Connect ${intDef?.name || integrationKey}`,
          isRequired: true,
          setupUrl: intDef?.connectUrl || '/connections'
        });
      }
    }
    
    // Check optional integrations
    for (const integrationKey of definition.optionalIntegrations) {
      const { isReady } = await this.isIntegrationReady(integrationKey);
      if (!isReady) {
        const intDef = INTEGRATION_REGISTRY[integrationKey];
        missing.push({
          type: 'integration',
          key: integrationKey,
          label: `Connect ${intDef?.name || integrationKey} (optional)`,
          isRequired: false,
          setupUrl: intDef?.connectUrl || '/connections'
        });
      }
    }
    
    // Check required configs
    for (const configCategory of definition.requiredConfigs) {
      const configStatus = await this.getConfigStatus(configCategory);
      if (!configStatus.isConfigured) {
        const configDef = CONFIG_REGISTRY[configCategory];
        missing.push({
          type: 'config',
          key: configCategory,
          label: `Complete ${configDef?.name || configCategory}`,
          isRequired: true,
          setupUrl: configDef?.settingsUrl || '/settings'
        });
      }
    }
    
    // Check required features
    for (const requiredFeature of definition.requiredFeatures) {
      const featureStatus = await this.getFeatureStatus(requiredFeature);
      if (!featureStatus.isEnabled) {
        const featureDef = FEATURE_REGISTRY[requiredFeature];
        missing.push({
          type: 'feature',
          key: requiredFeature,
          label: `Enable ${featureDef?.name || requiredFeature}`,
          isRequired: true,
          setupUrl: featureDef?.setupUrl || '/settings'
        });
      }
    }
    
    return missing;
  }
  
  /**
   * Get all feature statuses
   */
  private async getAllFeatureStatuses(): Promise<Record<FeatureKey, FeatureStatus>> {
    const statuses: Partial<Record<FeatureKey, FeatureStatus>> = {};
    
    for (const featureKey of Object.keys(FEATURE_REGISTRY) as FeatureKey[]) {
      statuses[featureKey] = await this.getFeatureStatus(featureKey);
    }
    
    return statuses as Record<FeatureKey, FeatureStatus>;
  }
  
  /**
   * Get integration status
   */
  async getIntegrationStatus(integrationKey: IntegrationKey): Promise<IntegrationStatus> {
    const { data } = await this.supabase
      .from('business_integrations')
      .select('*')
      .eq('business_id', this.businessId)
      .eq('integration_key', integrationKey)
      .single();
    
    // Check for built-in integrations from business record or environment
    const isBuiltInConnected = await this.checkBuiltInIntegration(integrationKey);
    
    return {
      key: integrationKey,
      isConnected: data?.is_connected || isBuiltInConnected,
      connectionStatus: data?.connection_status || (isBuiltInConnected ? 'connected' : 'not_connected'),
      healthStatus: data?.health_status || (isBuiltInConnected ? 'healthy' : 'unknown'),
      lastError: data?.last_error,
      expiresAt: data?.expires_at
    };
  }
  
  /**
   * Check if integration is connected via built-in methods (env vars, business settings)
   */
  private async checkBuiltInIntegration(integrationKey: IntegrationKey): Promise<boolean> {
    switch (integrationKey) {
      case 'stripe': {
        // Check if business has Stripe connected
        const { data } = await this.supabase
          .from('businesses')
          .select('stripe_account_id, stripe_onboarding_complete')
          .eq('id', this.businessId)
          .single();
        return !!(data?.stripe_account_id && data?.stripe_onboarding_complete);
      }
      case 'twilio': {
        // Check if Twilio is configured at platform level
        return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
      }
      case 'sendgrid': {
        // Check if SendGrid/Resend is configured
        return !!(process.env.SENDGRID_API_KEY || process.env.RESEND_API_KEY);
      }
      default:
        return false;
    }
  }
  
  /**
   * Get all integration statuses
   */
  private async getAllIntegrationStatuses(): Promise<Record<IntegrationKey, IntegrationStatus>> {
    const statuses: Partial<Record<IntegrationKey, IntegrationStatus>> = {};
    
    for (const integrationKey of Object.keys(INTEGRATION_REGISTRY) as IntegrationKey[]) {
      statuses[integrationKey] = await this.getIntegrationStatus(integrationKey);
    }
    
    return statuses as Record<IntegrationKey, IntegrationStatus>;
  }
  
  /**
   * Get config status
   */
  async getConfigStatus(category: ConfigCategory): Promise<ConfigStatus> {
    const definition = CONFIG_REGISTRY[category];
    if (!definition) {
      return {
        category,
        isConfigured: false,
        progress: 0,
        missingItems: [],
        settingsUrl: '/settings'
      };
    }
    
    // Check actual configuration based on category
    const configResult = await this.checkConfigCategory(category);
    
    return {
      category,
      isConfigured: configResult.isConfigured,
      progress: configResult.progress,
      missingItems: configResult.missingItems,
      settingsUrl: definition.settingsUrl
    };
  }
  
  /**
   * Check actual configuration for a category
   */
  private async checkConfigCategory(category: ConfigCategory): Promise<{
    isConfigured: boolean;
    progress: number;
    missingItems: string[];
  }> {
    const missing: string[] = [];
    let total = 0;
    let completed = 0;
    
    switch (category) {
      case 'business_profile': {
        const { data } = await this.supabase
          .from('businesses')
          .select('name, phone, email, address, timezone')
          .eq('id', this.businessId)
          .single();
        
        total = 5;
        if (!data?.name) missing.push('Business Name');
        else completed++;
        if (!data?.phone) missing.push('Phone Number');
        else completed++;
        if (!data?.email) missing.push('Business Email');
        else completed++;
        if (!data?.address) missing.push('Business Address');
        else completed++;
        if (!data?.timezone) missing.push('Timezone');
        else completed++;
        break;
      }
      
      case 'services': {
        // Check for cleaning service multipliers or other service configs
        const { count } = await this.supabase
          .from('cleaning_service_multipliers')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', this.businessId);
        
        total = 1;
        if (!count || count === 0) missing.push('At least one service');
        else completed++;
        break;
      }
      
      case 'pricing': {
        const { data } = await this.supabase
          .from('cleaning_pricing_config')
          .select('*')
          .eq('business_id', this.businessId)
          .single();
        
        total = 1;
        if (!data) missing.push('Base pricing configuration');
        else completed++;
        break;
      }
      
      case 'availability': {
        const { data } = await this.supabase
          .from('businesses')
          .select('business_hours')
          .eq('id', this.businessId)
          .single();
        
        total = 1;
        if (!data?.business_hours) missing.push('Business hours');
        else completed++;
        break;
      }
      
      case 'payment': {
        const { data } = await this.supabase
          .from('businesses')
          .select('stripe_account_id, stripe_onboarding_complete')
          .eq('id', this.businessId)
          .single();
        
        total = 1;
        if (!data?.stripe_account_id || !data?.stripe_onboarding_complete) {
          missing.push('Stripe connection');
        } else {
          completed++;
        }
        break;
      }
      
      case 'notifications': {
        // Check if any notification templates exist
        const { count } = await this.supabase
          .from('sequence_templates')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', this.businessId);
        
        total = 1;
        if (!count || count === 0) missing.push('Notification templates');
        else completed++;
        break;
      }
      
      case 'staff': {
        // Staff is optional
        total = 1;
        completed = 1;
        break;
      }
      
      case 'booking_widget': {
        // Widget config is optional
        total = 1;
        completed = 1;
        break;
      }
      
      case 'branding': {
        // Branding is optional
        total = 1;
        completed = 1;
        break;
      }
      
      default:
        total = 1;
        completed = 1;
    }
    
    const progress = total > 0 ? Math.round((completed / total) * 100) : 100;
    
    return {
      isConfigured: missing.length === 0,
      progress,
      missingItems: missing
    };
  }
  
  /**
   * Get all config statuses
   */
  private async getAllConfigStatuses(): Promise<Record<ConfigCategory, ConfigStatus>> {
    const statuses: Partial<Record<ConfigCategory, ConfigStatus>> = {};
    
    for (const category of Object.keys(CONFIG_REGISTRY) as ConfigCategory[]) {
      statuses[category] = await this.getConfigStatus(category);
    }
    
    return statuses as Record<ConfigCategory, ConfigStatus>;
  }
  
  /**
   * Get onboarding status
   */
  async getOnboardingStatus(): Promise<OnboardingStatus> {
    const { data } = await this.supabase
      .from('business_onboarding')
      .select('*')
      .eq('business_id', this.businessId)
      .single();
    
    const allSteps = [
      'business_profile',
      'first_service',
      'pricing',
      'availability',
      'booking_widget',
      'first_booking'
    ];
    
    const stepsCompleted = data?.steps_completed || {};
    const completedSteps = Object.keys(stepsCompleted).filter(
      key => stepsCompleted[key as keyof typeof stepsCompleted]
    );
    
    const remainingSteps = allSteps.filter(step => !completedSteps.includes(step));
    
    return {
      overallProgress: data?.overall_progress || 0,
      isComplete: data?.is_complete || false,
      currentStep: data?.current_step || 'business_profile',
      completedSteps,
      remainingSteps
    };
  }
  
  /**
   * Calculate overall platform health
   */
  private calculateOverallHealth(
    features: Record<FeatureKey, FeatureStatus>,
    integrations: Record<IntegrationKey, IntegrationStatus>,
    configs: Record<ConfigCategory, ConfigStatus>
  ): { health: 'healthy' | 'warnings' | 'critical'; criticalIssues: string[]; warnings: string[] } {
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    
    // Check critical configs
    const criticalConfigs: ConfigCategory[] = ['business_profile', 'services', 'pricing', 'availability'];
    for (const configKey of criticalConfigs) {
      if (!configs[configKey]?.isConfigured) {
        criticalIssues.push(`${CONFIG_REGISTRY[configKey]?.name || configKey} is not configured`);
      }
    }
    
    // Check enabled features with missing dependencies
    for (const [key, status] of Object.entries(features)) {
      if (status.isEnabled) {
        const requiredMissing = status.missingDependencies.filter(d => d.isRequired);
        if (requiredMissing.length > 0) {
          criticalIssues.push(`${FEATURE_REGISTRY[key as FeatureKey]?.name || key} is missing required dependencies`);
        }
        
        const optionalMissing = status.missingDependencies.filter(d => !d.isRequired);
        if (optionalMissing.length > 0) {
          warnings.push(`${FEATURE_REGISTRY[key as FeatureKey]?.name || key} could be enhanced with additional integrations`);
        }
      }
    }
    
    // Check integration health
    for (const [key, status] of Object.entries(integrations)) {
      if (status.isConnected && status.healthStatus === 'failing') {
        criticalIssues.push(`${INTEGRATION_REGISTRY[key as IntegrationKey]?.name || key} connection is failing`);
      }
      if (status.isConnected && status.healthStatus === 'degraded') {
        warnings.push(`${INTEGRATION_REGISTRY[key as IntegrationKey]?.name || key} is experiencing issues`);
      }
    }
    
    const health = criticalIssues.length > 0 ? 'critical' 
      : warnings.length > 0 ? 'warnings' 
      : 'healthy';
    
    return { health, criticalIssues, warnings };
  }
  
  /**
   * Enable a feature
   */
  async enableFeature(featureKey: FeatureKey): Promise<{ success: boolean; error?: string }> {
    const status = await this.getFeatureStatus(featureKey);
    
    if (!status.canEnable) {
      const requiredMissing = status.missingDependencies.filter(d => d.isRequired);
      return { 
        success: false, 
        error: `Cannot enable feature. Missing: ${requiredMissing.map(d => d.label).join(', ')}` 
      };
    }
    
    const { error } = await this.supabase
      .from('business_features')
      .upsert({
        business_id: this.businessId,
        feature_key: featureKey,
        is_enabled: true,
        enabled_at: new Date().toISOString()
      }, {
        onConflict: 'business_id,feature_key'
      });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  }
  
  /**
   * Disable a feature
   */
  async disableFeature(featureKey: FeatureKey): Promise<{ success: boolean; error?: string }> {
    // Check if other features depend on this
    const dependentFeatures = Object.entries(FEATURE_REGISTRY)
      .filter(([, def]) => def.requiredFeatures.includes(featureKey))
      .map(([key]) => key);
    
    for (const depFeature of dependentFeatures) {
      const depStatus = await this.getFeatureStatus(depFeature as FeatureKey);
      if (depStatus.isEnabled) {
        return {
          success: false,
          error: `Cannot disable. ${FEATURE_REGISTRY[depFeature as FeatureKey]?.name || depFeature} depends on this feature.`
        };
      }
    }
    
    const { error } = await this.supabase
      .from('business_features')
      .update({ is_enabled: false })
      .eq('business_id', this.businessId)
      .eq('feature_key', featureKey);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  }
  
  /**
   * Update onboarding step
   */
  async updateOnboardingStep(step: string, completed: boolean): Promise<void> {
    const { data: current } = await this.supabase
      .from('business_onboarding')
      .select('steps_completed, overall_progress')
      .eq('business_id', this.businessId)
      .single();
    
    const stepsCompleted = { ...(current?.steps_completed || {}), [step]: completed };
    const totalSteps = 6;
    const completedCount = Object.values(stepsCompleted).filter(Boolean).length;
    const overallProgress = Math.round((completedCount / totalSteps) * 100);
    
    await this.supabase
      .from('business_onboarding')
      .upsert({
        business_id: this.businessId,
        steps_completed: stepsCompleted,
        overall_progress: overallProgress,
        is_complete: overallProgress === 100,
        completed_at: overallProgress === 100 ? new Date().toISOString() : null,
        last_activity_at: new Date().toISOString()
      }, {
        onConflict: 'business_id'
      });
  }
}
