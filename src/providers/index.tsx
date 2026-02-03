"use client";

import { AuthProvider } from "./AuthProvider";
import { BusinessProvider } from "./BusinessProvider";
import { QueryProvider } from "./QueryProvider";
import { FeatureAwarenessProvider } from "./FeatureAwarenessProvider";
import { AnalyticsProvider } from "./AnalyticsProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider>
        <AuthProvider>
          <BusinessProvider>
            <FeatureAwarenessProvider>
              <AnalyticsProvider>
                {children}
              </AnalyticsProvider>
            </FeatureAwarenessProvider>
          </BusinessProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryProvider>
  );
}

// Re-export hooks for convenience
export { useAuth } from "./AuthProvider";
export { useBusiness } from "./BusinessProvider";
export { useFeatureAwareness, useFeature, useIntegration, useConfig } from "./FeatureAwarenessProvider";
export { useAnalyticsContext } from "./AnalyticsProvider";
