import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://selestial.io"),
  title: {
    default: "Selestial | Qualified In-Home Estimates for Remodelers",
    template: "%s · Selestial",
  },
  description:
    "Selestial runs your Meta ads, responds to every lead in minutes, and books qualified homeowners onto your calendar. Book a free Lead Leak Audit.",
  openGraph: {
    title: "More qualified in-home estimates. Without chasing leads.",
    description:
      "Selestial runs your Meta ads, responds to every lead in minutes, and books qualified homeowners onto your calendar. Book a free Lead Leak Audit.",
    images: [
      {
        url: "/marketing/og.jpg",
        width: 1200,
        height: 630,
        alt: "More qualified in-home estimates. Without chasing leads.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "More qualified in-home estimates. Without chasing leads.",
    description:
      "Selestial runs your Meta ads, responds to every lead in minutes, and books qualified homeowners onto your calendar. Book a free Lead Leak Audit.",
    images: ["/marketing/og.jpg"],
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
