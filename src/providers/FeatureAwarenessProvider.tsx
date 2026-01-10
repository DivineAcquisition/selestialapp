"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from './BusinessProvider';
import type { 
  PlatformAwareness, 
  FeatureStatus, 
  IntegrationStatus,
  ConfigStatus 
} from '@/lib/features/feature-awareness-service';
import type { FeatureKey, IntegrationKey, ConfigCategory } from '@/lib/features/feature-registry';

interface FeatureAwarenessContextType {
  awareness: PlatformAwareness | null;
  isLoading: boolean;
  error: string | null;
  
  // Feature checks
  canUseFeature: (featureKey: FeatureKey) => boolean;
  getFeatureStatus: (featureKey: FeatureKey) => FeatureStatus | null;
  isFeatureEnabled: (featureKey: FeatureKey) => boolean;
  isFeatureConfigured: (featureKey: FeatureKey) => boolean;
  isFeatureAvailable: (featureKey: FeatureKey) => boolean;
  
  // Integration checks
  isIntegrationConnected: (integrationKey: IntegrationKey) => boolean;
  getIntegrationStatus: (integrationKey: IntegrationKey) => IntegrationStatus | null;
  
  // Config checks
  isConfigComplete: (category: ConfigCategory) => boolean;
  getConfigStatus: (category: ConfigCategory) => ConfigStatus | null;
  
  // Actions
  refreshAwareness: () => Promise<void>;
  enableFeature: (featureKey: FeatureKey) => Promise<boolean>;
  disableFeature: (featureKey: FeatureKey) => Promise<boolean>;
}

const FeatureAwarenessContext = createContext<FeatureAwarenessContextType | undefined>(undefined);

export function FeatureAwarenessProvider({ children }: { children: React.ReactNode }) {
  const { business, initialized: businessInitialized } = useBusiness();
  const [awareness, setAwareness] = useState<PlatformAwareness | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAwareness = useCallback(async () => {
    if (!business?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/features/awareness?businessId=${business.id}`);
      if (!response.ok) {
        // If API doesn't exist yet, return default awareness
        if (response.status === 404) {
          setAwareness(getDefaultAwareness());
          return;
        }
        throw new Error('Failed to fetch feature awareness');
      }
      
      const data = await response.json();
      setAwareness(data);
    } catch (err) {
      console.error('Error fetching feature awareness:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Set default awareness on error
      setAwareness(getDefaultAwareness());
    } finally {
      setIsLoading(false);
    }
  }, [business?.id]);

  useEffect(() => {
    if (businessInitialized) {
      fetchAwareness();
    }
  }, [fetchAwareness, businessInitialized]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!business?.id) return;
    
    const channel = supabase
      .channel(`awareness-${business.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_features',
          filter: `business_id=eq.${business.id}`
        },
        () => fetchAwareness()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_integrations',
          filter: `business_id=eq.${business.id}`
        },
        () => fetchAwareness()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [business?.id, fetchAwareness]);

  const canUseFeature = useCallback((featureKey: FeatureKey): boolean => {
    if (!awareness) return true; // Default to allowing while loading
    const status = awareness.features[featureKey];
    if (!status) return true;
    
    return status.isAvailable && 
           status.isEnabled && 
           status.missingDependencies.filter(d => d.isRequired).length === 0;
  }, [awareness]);

  const getFeatureStatus = useCallback((featureKey: FeatureKey): FeatureStatus | null => {
    return awareness?.features[featureKey] || null;
  }, [awareness]);

  const isFeatureEnabled = useCallback((featureKey: FeatureKey): boolean => {
    return awareness?.features[featureKey]?.isEnabled ?? true;
  }, [awareness]);

  const isFeatureConfigured = useCallback((featureKey: FeatureKey): boolean => {
    return awareness?.features[featureKey]?.isConfigured ?? true;
  }, [awareness]);

  const isFeatureAvailable = useCallback((featureKey: FeatureKey): boolean => {
    return awareness?.features[featureKey]?.isAvailable ?? true;
  }, [awareness]);

  const isIntegrationConnected = useCallback((integrationKey: IntegrationKey): boolean => {
    return awareness?.integrations[integrationKey]?.isConnected ?? false;
  }, [awareness]);

  const getIntegrationStatus = useCallback((integrationKey: IntegrationKey): IntegrationStatus | null => {
    return awareness?.integrations[integrationKey] || null;
  }, [awareness]);

  const isConfigComplete = useCallback((category: ConfigCategory): boolean => {
    return awareness?.configs[category]?.isConfigured ?? true;
  }, [awareness]);

  const getConfigStatus = useCallback((category: ConfigCategory): ConfigStatus | null => {
    return awareness?.configs[category] || null;
  }, [awareness]);

  const enableFeature = useCallback(async (featureKey: FeatureKey): Promise<boolean> => {
    if (!business?.id) return false;
    
    try {
      const response = await fetch(`/api/features/${featureKey}/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id })
      });
      
      if (!response.ok) return false;
      
      await fetchAwareness();
      return true;
    } catch {
      return false;
    }
  }, [business?.id, fetchAwareness]);

  const disableFeature = useCallback(async (featureKey: FeatureKey): Promise<boolean> => {
    if (!business?.id) return false;
    
    try {
      const response = await fetch(`/api/features/${featureKey}/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id })
      });
      
      if (!response.ok) return false;
      
      await fetchAwareness();
      return true;
    } catch {
      return false;
    }
  }, [business?.id, fetchAwareness]);

  return (
    <FeatureAwarenessContext.Provider
      value={{
        awareness,
        isLoading,
        error,
        canUseFeature,
        getFeatureStatus,
        isFeatureEnabled,
        isFeatureConfigured,
        isFeatureAvailable,
        isIntegrationConnected,
        getIntegrationStatus,
        isConfigComplete,
        getConfigStatus,
        refreshAwareness: fetchAwareness,
        enableFeature,
        disableFeature
      }}
    >
      {children}
    </FeatureAwarenessContext.Provider>
  );
}

export function useFeatureAwareness() {
  const context = useContext(FeatureAwarenessContext);
  if (context === undefined) {
    throw new Error('useFeatureAwareness must be used within a FeatureAwarenessProvider');
  }
  return context;
}

// Convenience hooks
export function useFeature(featureKey: FeatureKey) {
  const { canUseFeature, getFeatureStatus, isFeatureEnabled, isFeatureAvailable, enableFeature, disableFeature } = useFeatureAwareness();
  
  return {
    canUse: canUseFeature(featureKey),
    status: getFeatureStatus(featureKey),
    isEnabled: isFeatureEnabled(featureKey),
    isAvailable: isFeatureAvailable(featureKey),
    enable: () => enableFeature(featureKey),
    disable: () => disableFeature(featureKey)
  };
}

export function useIntegration(integrationKey: IntegrationKey) {
  const { isIntegrationConnected, getIntegrationStatus } = useFeatureAwareness();
  
  return {
    isConnected: isIntegrationConnected(integrationKey),
    status: getIntegrationStatus(integrationKey)
  };
}

export function useConfig(category: ConfigCategory) {
  const { isConfigComplete, getConfigStatus } = useFeatureAwareness();
  
  return {
    isComplete: isConfigComplete(category),
    status: getConfigStatus(category)
  };
}

// Default awareness when API is not available
function getDefaultAwareness(): PlatformAwareness {
  return {
    features: {} as Record<FeatureKey, FeatureStatus>,
    integrations: {} as Record<IntegrationKey, IntegrationStatus>,
    configs: {} as Record<ConfigCategory, ConfigStatus>,
    onboarding: {
      overallProgress: 0,
      isComplete: false,
      currentStep: 'business_profile',
      completedSteps: [],
      remainingSteps: ['business_profile', 'first_service', 'pricing', 'availability', 'booking_widget', 'first_booking']
    },
    overallHealth: 'healthy',
    criticalIssues: [],
    warnings: []
  };
}
