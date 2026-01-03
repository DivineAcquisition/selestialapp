"use client";

import { AuthProvider } from "./AuthProvider";
import { BusinessProvider } from "./BusinessProvider";
import { QueryProvider } from "./QueryProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider>
        <AuthProvider>
          <BusinessProvider>
            {children}
          </BusinessProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryProvider>
  );
}

// Re-export hooks for convenience
export { useAuth } from "./AuthProvider";
export { useBusiness } from "./BusinessProvider";
