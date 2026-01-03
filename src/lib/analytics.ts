// Product analytics integration (PostHog/Mixpanel compatible)
// Install PostHog: npm install posthog-js

let isInitialized = false;

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined | null;
}

export function initAnalytics() {
  if (isProduction && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    // Uncomment when posthog-js is installed:
    /*
    import posthog from 'posthog-js';
    
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      autocapture: true,
      capture_pageview: true,
      persistence: 'localStorage',
    });
    */
    isInitialized = true;
    console.log('[Analytics] Initialized for production');
  } else {
    console.log('[Analytics] Running in development mode - events logged to console');
  }
}

export function identify(userId: string, properties?: AnalyticsProperties) {
  if (isDevelopment) {
    console.log('[Analytics:identify]', userId, properties);
  }
  
  if (isProduction && isInitialized) {
    // Uncomment when posthog-js is installed:
    // posthog.identify(userId, properties);
  }
}

export function track(event: string, properties?: AnalyticsProperties) {
  if (isDevelopment) {
    console.log('[Analytics:track]', event, properties);
  }
  
  if (isProduction && isInitialized) {
    // Uncomment when posthog-js is installed:
    // posthog.capture(event, properties);
  }
}

export function page(pageName?: string, properties?: AnalyticsProperties) {
  if (isDevelopment) {
    console.log('[Analytics:page]', pageName, properties);
  }
  
  if (isProduction && isInitialized) {
    // Uncomment when posthog-js is installed:
    // posthog.capture('$pageview', { page: pageName, ...properties });
  }
}

export function reset() {
  if (isDevelopment) {
    console.log('[Analytics:reset] User session cleared');
  }
  
  if (isProduction && isInitialized) {
    // Uncomment when posthog-js is installed:
    // posthog.reset();
  }
}

// ============================================
// COMMON EVENTS TO TRACK
// ============================================

// Auth events
export const trackSignupCompleted = (method: 'email' | 'google') => 
  track('signup_completed', { method });

export const trackLoginCompleted = (method: 'email' | 'google') => 
  track('login_completed', { method });

export const trackOnboardingCompleted = () => 
  track('onboarding_completed');

// Quote events
export const trackQuoteCreated = (amount?: number) => 
  track('quote_created', { amount });

export const trackQuoteWon = (amount?: number) => 
  track('quote_won', { amount });

export const trackQuoteLost = (amount?: number) => 
  track('quote_lost', { amount });

// Messaging events
export const trackMessageSent = (channel: 'sms' | 'email') => 
  track('message_sent', { channel });

// Payment events
export const trackPaymentReceived = (amount: number) => 
  track('payment_received', { amount });

export const trackPaymentLinkCreated = (amount: number) => 
  track('payment_link_created', { amount });

// Subscription events
export const trackSubscriptionStarted = (plan: string) => 
  track('subscription_started', { plan });

export const trackSubscriptionCancelled = (plan: string) => 
  track('subscription_cancelled', { plan });

export const trackTrialStarted = () => 
  track('trial_started');
