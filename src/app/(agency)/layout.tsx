import { Suspense, type ReactNode } from "react";
import { Inter } from "next/font/google";
import { AgencyShell } from "@/components/agency/chrome";
import { AgencyPixel } from "@/components/agency/pixel";
import { CaptureTracking } from "@/components/agency/capture-tracking";
import "./agency.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
  variable: "--font-inter-agency",
});

export default function AgencyLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.variable} agency-site min-h-screen antialiased`}>
      <AgencyPixel />
      <Suspense fallback={null}>
        <CaptureTracking />
      </Suspense>
      <AgencyShell>{children}</AgencyShell>
    </div>
  );
}
