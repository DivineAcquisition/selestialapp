import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title:
    "Selestial — The Retention System Built for Residential Cleaning Companies",
  description:
    "Branded booking, automated follow-up, referral capture — installed on top of your existing CRM. Stop leaking revenue from customers you already paid to acquire.",
  openGraph: {
    title: "Selestial — Retention System for Residential Cleaning Companies",
    description:
      "Branded booking, automated follow-up, referral capture. Installed on top of your existing CRM.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Selestial — Retention System for Residential Cleaning Companies",
    description:
      "Branded booking, automated follow-up, referral capture. Installed on top of your existing CRM.",
  },
  // Icons (favicon, apple-touch-icon, and PNG icon) are picked up
  // automatically from the file-system conventions in this directory:
  //   src/app/favicon.ico
  //   src/app/icon.png
  //   src/app/apple-icon.png
  // No `icons` field is needed here — Next.js generates the correct
  // <link> tags from those files.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster />
          <Sonner />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
