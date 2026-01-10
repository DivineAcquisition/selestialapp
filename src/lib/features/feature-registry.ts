// ============================================
// MASTER FEATURE REGISTRY
// Single source of truth for all features
// ============================================

export type FeatureKey = 
  | 'booking_widget'
  | 'payment_links'
  | 'sequences'
  | 'calendar'
  | 'invoices'
  | 'staff_management'
  | 'pricing_engine'
  | 'sms_notifications'
  | 'email_notifications'
  | 'google_calendar_sync'
  | 'customer_portal'
  | 'reports'
  | 'api_access';

export type IntegrationKey = 
  | 'stripe'
  | 'twilio'
  | 'sendgrid'
  | 'google_calendar'
  | 'google_oauth'
  | 'quickbooks'
  | 'zapier'
  | 'mailgun';

export type ConfigCategory = 
  | 'business_profile'
  | 'services'
  | 'pricing'
  | 'staff'
  | 'availability'
  | 'booking_widget'
  | 'payment'
  | 'notifications'
  | 'branding';

export type PlanType = 'free' | 'starter' | 'growth' | 'enterprise';

export interface FeatureDefinition {
  key: FeatureKey;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: 'core' | 'communication' | 'payments' | 'scheduling' | 'advanced';
  
  // Plan requirements
  availableOnPlans: PlanType[];
  
  // Dependencies
  requiredIntegrations: IntegrationKey[];
  optionalIntegrations: IntegrationKey[];
  requiredConfigs: ConfigCategory[];
  requiredFeatures: FeatureKey[];
  
  // Setup
  setupSteps: string[];
  setupUrl: string;
  docsUrl: string;
  
  // UI
  dashboardWidget?: boolean;
  sidebarItem?: boolean;
  settingsSection?: boolean;
}

export const FEATURE_REGISTRY: Record<FeatureKey, FeatureDefinition> = {
  booking_widget: {
    key: 'booking_widget',
    name: 'Booking Widget',
    description: 'Embeddable booking form for your website',
    icon: 'Calendar',
    category: 'core',
    availableOnPlans: ['free', 'starter', 'growth', 'enterprise'],
    requiredIntegrations: [],
    optionalIntegrations: ['stripe'],
    requiredConfigs: ['business_profile', 'services', 'pricing', 'availability'],
    requiredFeatures: [],
    setupSteps: [
      'Complete business profile',
      'Add at least one service',
      'Configure pricing',
      'Set availability hours',
      'Customize widget appearance'
    ],
    setupUrl: '/widget',
    docsUrl: 'https://docs.selestial.io/features/booking-widget',
    dashboardWidget: true,
    sidebarItem: true,
    settingsSection: true
  },
  
  payment_links: {
    key: 'payment_links',
    name: 'Payment Links',
    description: 'Create shareable payment links for invoices',
    icon: 'CreditCard',
    category: 'payments',
    availableOnPlans: ['starter', 'growth', 'enterprise'],
    requiredIntegrations: ['stripe'],
    optionalIntegrations: [],
    requiredConfigs: ['business_profile', 'payment'],
    requiredFeatures: [],
    setupSteps: [
      'Connect Stripe account',
      'Complete business profile',
      'Configure payment settings'
    ],
    setupUrl: '/payments',
    docsUrl: 'https://docs.selestial.io/features/payment-links',
    dashboardWidget: false,
    sidebarItem: true,
    settingsSection: true
  },
  
  sequences: {
    key: 'sequences',
    name: 'Automation Sequences',
    description: 'Automated follow-ups and reminders',
    icon: 'Workflow',
    category: 'communication',
    availableOnPlans: ['growth', 'enterprise'],
    requiredIntegrations: [],
    optionalIntegrations: ['twilio', 'sendgrid'],
    requiredConfigs: ['notifications'],
    requiredFeatures: [],
    setupSteps: [
      'Configure notification templates',
      'Connect SMS provider (optional)',
      'Connect email provider (optional)',
      'Create your first sequence'
    ],
    setupUrl: '/sequences',
    docsUrl: 'https://docs.selestial.io/features/sequences',
    dashboardWidget: false,
    sidebarItem: true,
    settingsSection: true
  },
  
  calendar: {
    key: 'calendar',
    name: 'Calendar & Scheduling',
    description: 'View and manage your schedule',
    icon: 'CalendarDays',
    category: 'scheduling',
    availableOnPlans: ['free', 'starter', 'growth', 'enterprise'],
    requiredIntegrations: [],
    optionalIntegrations: ['google_calendar'],
    requiredConfigs: ['availability'],
    requiredFeatures: [],
    setupSteps: [
      'Set availability hours',
      'Connect Google Calendar (optional)',
      'Add staff members (optional)'
    ],
    setupUrl: '/bookings/calendar',
    docsUrl: 'https://docs.selestial.io/features/calendar',
    dashboardWidget: true,
    sidebarItem: true,
    settingsSection: false
  },
  
  invoices: {
    key: 'invoices',
    name: 'Invoices',
    description: 'Create and manage invoices',
    icon: 'FileText',
    category: 'payments',
    availableOnPlans: ['starter', 'growth', 'enterprise'],
    requiredIntegrations: ['stripe'],
    optionalIntegrations: ['quickbooks'],
    requiredConfigs: ['business_profile', 'payment'],
    requiredFeatures: [],
    setupSteps: [
      'Connect Stripe account',
      'Complete business profile',
      'Configure invoice settings'
    ],
    setupUrl: '/invoices',
    docsUrl: 'https://docs.selestial.io/features/invoices',
    dashboardWidget: false,
    sidebarItem: true,
    settingsSection: true
  },
  
  staff_management: {
    key: 'staff_management',
    name: 'Staff Management',
    description: 'Manage team members and assignments',
    icon: 'Users',
    category: 'scheduling',
    availableOnPlans: ['growth', 'enterprise'],
    requiredIntegrations: [],
    optionalIntegrations: ['google_calendar'],
    requiredConfigs: ['staff'],
    requiredFeatures: ['calendar'],
    setupSteps: [
      'Enable calendar feature',
      'Add staff members',
      'Set staff availability',
      'Configure assignments'
    ],
    setupUrl: '/staff',
    docsUrl: 'https://docs.selestial.io/features/staff',
    dashboardWidget: false,
    sidebarItem: true,
    settingsSection: true
  },
  
  pricing_engine: {
    key: 'pricing_engine',
    name: 'AI Pricing Engine',
    description: 'Dynamic pricing based on multiple factors',
    icon: 'Calculator',
    category: 'core',
    availableOnPlans: ['starter', 'growth', 'enterprise'],
    requiredIntegrations: [],
    optionalIntegrations: [],
    requiredConfigs: ['services', 'pricing'],
    requiredFeatures: [],
    setupSteps: [
      'Add services',
      'Configure base pricing',
      'Set service multipliers',
      'Configure add-ons',
      'Set frequency discounts'
    ],
    setupUrl: '/pricing',
    docsUrl: 'https://docs.selestial.io/features/pricing-engine',
    dashboardWidget: false,
    sidebarItem: true,
    settingsSection: true
  },
  
  sms_notifications: {
    key: 'sms_notifications',
    name: 'SMS Notifications',
    description: 'Send SMS reminders and updates',
    icon: 'MessageSquare',
    category: 'communication',
    availableOnPlans: ['growth', 'enterprise'],
    requiredIntegrations: ['twilio'],
    optionalIntegrations: [],
    requiredConfigs: ['notifications'],
    requiredFeatures: [],
    setupSteps: [
      'Connect Twilio account',
      'Configure SMS templates',
      'Set notification triggers'
    ],
    setupUrl: '/settings/notifications',
    docsUrl: 'https://docs.selestial.io/features/sms-notifications',
    dashboardWidget: false,
    sidebarItem: false,
    settingsSection: true
  },
  
  email_notifications: {
    key: 'email_notifications',
    name: 'Email Notifications',
    description: 'Automated email communications',
    icon: 'Mail',
    category: 'communication',
    availableOnPlans: ['free', 'starter', 'growth', 'enterprise'],
    requiredIntegrations: [],
    optionalIntegrations: ['sendgrid', 'mailgun'],
    requiredConfigs: ['notifications'],
    requiredFeatures: [],
    setupSteps: [
      'Configure email templates',
      'Connect custom email provider (optional)',
      'Set notification triggers'
    ],
    setupUrl: '/settings/notifications',
    docsUrl: 'https://docs.selestial.io/features/email-notifications',
    dashboardWidget: false,
    sidebarItem: false,
    settingsSection: true
  },
  
  google_calendar_sync: {
    key: 'google_calendar_sync',
    name: 'Google Calendar Sync',
    description: 'Two-way sync with Google Calendar',
    icon: 'RefreshCw',
    category: 'scheduling',
    availableOnPlans: ['starter', 'growth', 'enterprise'],
    requiredIntegrations: ['google_calendar'],
    optionalIntegrations: [],
    requiredConfigs: [],
    requiredFeatures: ['calendar'],
    setupSteps: [
      'Enable calendar feature',
      'Connect Google account',
      'Select calendars to sync',
      'Configure sync settings'
    ],
    setupUrl: '/connections',
    docsUrl: 'https://docs.selestial.io/integrations/google-calendar',
    dashboardWidget: false,
    sidebarItem: false,
    settingsSection: true
  },
  
  customer_portal: {
    key: 'customer_portal',
    name: 'Customer Portal',
    description: 'Self-service portal for customers',
    icon: 'Users',
    category: 'advanced',
    availableOnPlans: ['growth', 'enterprise'],
    requiredIntegrations: [],
    optionalIntegrations: ['stripe'],
    requiredConfigs: ['business_profile'],
    requiredFeatures: ['booking_widget'],
    setupSteps: [
      'Enable booking widget',
      'Configure portal settings',
      'Customize portal appearance'
    ],
    setupUrl: '/settings/customer-portal',
    docsUrl: 'https://docs.selestial.io/features/customer-portal',
    dashboardWidget: false,
    sidebarItem: false,
    settingsSection: true
  },
  
  reports: {
    key: 'reports',
    name: 'Reports & Analytics',
    description: 'Business insights and reporting',
    icon: 'BarChart3',
    category: 'advanced',
    availableOnPlans: ['starter', 'growth', 'enterprise'],
    requiredIntegrations: [],
    optionalIntegrations: [],
    requiredConfigs: [],
    requiredFeatures: [],
    setupSteps: [],
    setupUrl: '/analytics',
    docsUrl: 'https://docs.selestial.io/features/reports',
    dashboardWidget: true,
    sidebarItem: true,
    settingsSection: false
  },
  
  api_access: {
    key: 'api_access',
    name: 'API Access',
    description: 'Programmatic access to your data',
    icon: 'Code',
    category: 'advanced',
    availableOnPlans: ['growth', 'enterprise'],
    requiredIntegrations: [],
    optionalIntegrations: [],
    requiredConfigs: [],
    requiredFeatures: [],
    setupSteps: [
      'Generate API keys',
      'Review API documentation'
    ],
    setupUrl: '/settings/api',
    docsUrl: 'https://docs.selestial.io/api',
    dashboardWidget: false,
    sidebarItem: false,
    settingsSection: true
  }
};

// Integration definitions
export interface IntegrationDefinition {
  key: IntegrationKey;
  name: string;
  description: string;
  icon: string;
  category: 'payment' | 'communication' | 'calendar' | 'accounting' | 'automation';
  connectUrl: string;
  docsUrl: string;
  requiredScopes?: string[];
}

export const INTEGRATION_REGISTRY: Record<IntegrationKey, IntegrationDefinition> = {
  stripe: {
    key: 'stripe',
    name: 'Stripe',
    description: 'Accept payments and manage subscriptions',
    icon: 'CreditCard',
    category: 'payment',
    connectUrl: '/connections',
    docsUrl: 'https://docs.selestial.io/integrations/stripe'
  },
  twilio: {
    key: 'twilio',
    name: 'Twilio',
    description: 'Send SMS notifications',
    icon: 'MessageSquare',
    category: 'communication',
    connectUrl: '/connections',
    docsUrl: 'https://docs.selestial.io/integrations/twilio'
  },
  sendgrid: {
    key: 'sendgrid',
    name: 'SendGrid',
    description: 'Send transactional emails',
    icon: 'Mail',
    category: 'communication',
    connectUrl: '/connections',
    docsUrl: 'https://docs.selestial.io/integrations/sendgrid'
  },
  google_calendar: {
    key: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync with Google Calendar',
    icon: 'Calendar',
    category: 'calendar',
    connectUrl: '/connections',
    docsUrl: 'https://docs.selestial.io/integrations/google-calendar',
    requiredScopes: ['calendar.events', 'calendar.readonly']
  },
  google_oauth: {
    key: 'google_oauth',
    name: 'Google Sign-In',
    description: 'Sign in with Google',
    icon: 'Chrome',
    category: 'automation',
    connectUrl: '/connections',
    docsUrl: 'https://docs.selestial.io/integrations/google'
  },
  quickbooks: {
    key: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync invoices and payments',
    icon: 'Calculator',
    category: 'accounting',
    connectUrl: '/connections',
    docsUrl: 'https://docs.selestial.io/integrations/quickbooks'
  },
  zapier: {
    key: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps',
    icon: 'Zap',
    category: 'automation',
    connectUrl: '/connections',
    docsUrl: 'https://docs.selestial.io/integrations/zapier'
  },
  mailgun: {
    key: 'mailgun',
    name: 'Mailgun',
    description: 'Send transactional emails',
    icon: 'Mail',
    category: 'communication',
    connectUrl: '/connections',
    docsUrl: 'https://docs.selestial.io/integrations/mailgun'
  }
};

// Config category definitions
export interface ConfigDefinition {
  category: ConfigCategory;
  name: string;
  description: string;
  checkItems: ConfigCheckItem[];
  settingsUrl: string;
}

export interface ConfigCheckItem {
  key: string;
  label: string;
  description: string;
  required: boolean;
}

export const CONFIG_REGISTRY: Record<ConfigCategory, ConfigDefinition> = {
  business_profile: {
    category: 'business_profile',
    name: 'Business Profile',
    description: 'Your business information',
    settingsUrl: '/settings',
    checkItems: [
      { key: 'name', label: 'Business Name', description: 'Your business name', required: true },
      { key: 'address', label: 'Business Address', description: 'Your service area address', required: true },
      { key: 'phone', label: 'Phone Number', description: 'Contact phone number', required: true },
      { key: 'email', label: 'Business Email', description: 'Contact email', required: true },
      { key: 'logo', label: 'Logo', description: 'Business logo', required: false },
      { key: 'timezone', label: 'Timezone', description: 'Business timezone', required: true }
    ]
  },
  services: {
    category: 'services',
    name: 'Services',
    description: 'Services you offer',
    settingsUrl: '/services',
    checkItems: [
      { key: 'has_services', label: 'At Least One Service', description: 'You need at least one service', required: true },
      { key: 'services_have_pricing', label: 'Services Have Pricing', description: 'All services have pricing configured', required: true }
    ]
  },
  pricing: {
    category: 'pricing',
    name: 'Pricing',
    description: 'Your pricing configuration',
    settingsUrl: '/pricing',
    checkItems: [
      { key: 'base_pricing', label: 'Base Pricing Set', description: 'Base pricing method configured', required: true },
      { key: 'service_multipliers', label: 'Service Multipliers', description: 'Service type multipliers configured', required: false }
    ]
  },
  staff: {
    category: 'staff',
    name: 'Staff',
    description: 'Your team members',
    settingsUrl: '/staff',
    checkItems: [
      { key: 'has_staff', label: 'Staff Added', description: 'At least one staff member', required: false },
      { key: 'staff_availability', label: 'Staff Availability', description: 'Staff availability is set', required: false }
    ]
  },
  availability: {
    category: 'availability',
    name: 'Availability',
    description: 'Your business hours',
    settingsUrl: '/settings',
    checkItems: [
      { key: 'hours_set', label: 'Business Hours Set', description: 'Operating hours configured', required: true },
      { key: 'booking_window', label: 'Booking Window', description: 'How far ahead customers can book', required: true }
    ]
  },
  booking_widget: {
    category: 'booking_widget',
    name: 'Booking Widget',
    description: 'Widget customization',
    settingsUrl: '/widget',
    checkItems: [
      { key: 'widget_enabled', label: 'Widget Enabled', description: 'Booking widget is active', required: false },
      { key: 'widget_branded', label: 'Branding Applied', description: 'Widget has custom branding', required: false }
    ]
  },
  payment: {
    category: 'payment',
    name: 'Payment Settings',
    description: 'Payment configuration',
    settingsUrl: '/settings',
    checkItems: [
      { key: 'stripe_connected', label: 'Stripe Connected', description: 'Stripe account connected', required: false },
      { key: 'payment_methods', label: 'Payment Methods', description: 'Accepted payment methods set', required: false }
    ]
  },
  notifications: {
    category: 'notifications',
    name: 'Notifications',
    description: 'Notification settings',
    settingsUrl: '/settings',
    checkItems: [
      { key: 'email_templates', label: 'Email Templates', description: 'Email templates configured', required: true },
      { key: 'sms_templates', label: 'SMS Templates', description: 'SMS templates configured', required: false }
    ]
  },
  branding: {
    category: 'branding',
    name: 'Branding',
    description: 'Your brand settings',
    settingsUrl: '/settings',
    checkItems: [
      { key: 'colors', label: 'Brand Colors', description: 'Primary brand colors set', required: false },
      { key: 'logo', label: 'Logo Uploaded', description: 'Business logo uploaded', required: false }
    ]
  }
};

// Helper to get all features
export function getAllFeatures(): FeatureDefinition[] {
  return Object.values(FEATURE_REGISTRY);
}

// Helper to get features by category
export function getFeaturesByCategory(category: FeatureDefinition['category']): FeatureDefinition[] {
  return getAllFeatures().filter(f => f.category === category);
}

// Helper to check if plan has access to feature
export function planHasFeature(plan: PlanType, featureKey: FeatureKey): boolean {
  const feature = FEATURE_REGISTRY[featureKey];
  return feature?.availableOnPlans.includes(plan) ?? false;
}

// Helper to get all integrations
export function getAllIntegrations(): IntegrationDefinition[] {
  return Object.values(INTEGRATION_REGISTRY);
}

// Helper to get integrations by category
export function getIntegrationsByCategory(category: IntegrationDefinition['category']): IntegrationDefinition[] {
  return getAllIntegrations().filter(i => i.category === category);
}
