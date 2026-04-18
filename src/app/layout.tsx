import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title:
    "Selestial — Online Booking Built for Residential Cleaning Companies | Instant Pricing, No Quote Forms",
  description:
    "The booking page for residential cleaning companies. Show pricing upfront, collect deposits, book jobs in 60 seconds. Live in 48 hours. $97/mo.",
  openGraph: {
    title: "Selestial — Online Booking for Residential Cleaning Companies",
    description:
      "Show pricing upfront. Book jobs in 60 seconds. Live in 48 hours. $97/month.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Selestial — Online Booking for Residential Cleaning Companies",
    description:
      "Show pricing upfront. Book jobs in 60 seconds. Live in 48 hours. $97/month.",
  },
  icons: {
    icon: [
      {
        url: "/logo-icon-new.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo-icon-new.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/logo-icon-new.png",
  },
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
