// Sentry error monitoring integration
// Install: npm install @sentry/react

// This is a placeholder implementation that logs errors locally in development
// and can be enhanced with real Sentry integration in production

interface SentryContext {
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
  user?: {
    id?: string;
    email?: string;
  };
}

let isInitialized = false;

export function initSentry() {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    // In production with Sentry DSN, initialize Sentry
    // Uncomment and configure when @sentry/react is installed:
    /*
    import * as Sentry from '@sentry/react';
    
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: 'production',
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
    });
    */
    isInitialized = true;
    console.log('[Sentry] Initialized for production');
  } else {
    console.log('[Sentry] Running in development mode - errors logged to console');
  }
}

export function captureException(error: Error, context?: SentryContext) {
  console.error('[Error]', error);
  
  if (context) {
    console.error('[Error Context]', context);
  }
  
  if (import.meta.env.PROD && isInitialized) {
    // Uncomment when @sentry/react is installed:
    // Sentry.captureException(error, { extra: context?.extra, tags: context?.tags });
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
  logFn(`[${level.toUpperCase()}]`, message);
  
  if (import.meta.env.PROD && isInitialized) {
    // Uncomment when @sentry/react is installed:
    // Sentry.captureMessage(message, level);
  }
}

export function setUser(user: { id: string; email?: string } | null) {
  if (import.meta.env.PROD && isInitialized) {
    // Uncomment when @sentry/react is installed:
    // Sentry.setUser(user);
  }
}

export function addBreadcrumb(breadcrumb: {
  category: string;
  message: string;
  level?: 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}) {
  if (import.meta.env.DEV) {
    console.log(`[Breadcrumb:${breadcrumb.category}]`, breadcrumb.message, breadcrumb.data);
  }
  
  if (import.meta.env.PROD && isInitialized) {
    // Uncomment when @sentry/react is installed:
    // Sentry.addBreadcrumb(breadcrumb);
  }
}
