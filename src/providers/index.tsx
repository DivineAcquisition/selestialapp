"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./AuthProvider";
import { BusinessProvider } from "./BusinessProvider";
import { QueryProvider } from "./QueryProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <TooltipProvider>
          <AuthProvider>
            <BusinessProvider>
              {children}
            </BusinessProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

// Re-export hooks for convenience
export { useAuth } from "./AuthProvider";
export { useBusiness } from "./BusinessProvider";
