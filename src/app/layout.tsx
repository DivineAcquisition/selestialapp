import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { socialHeadline } from "@/lib/marketing/agency";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://selestial.io"),
  title: {
    default: "Selestial | Pre-Qualified Estimates and Proposal Follow-Up for Remodelers",
    template: "%s · Selestial",
  },
  description:
    "Selestial runs your Meta ads, answers every lead in minutes, books qualified estimates on your calendar, and follows up on every proposal. Founding partners pay only when a job signs.",
  openGraph: {
    title: socialHeadline(),
    description:
      "Selestial runs your Meta ads, answers every lead in minutes, books qualified estimates on your calendar, and follows up on every proposal. Founding partners pay only when a job signs.",
    images: [
      {
        url: "/marketing/og.jpg",
        width: 1200,
        height: 630,
        alt: socialHeadline(),
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: socialHeadline(),
    description:
      "Selestial runs your Meta ads, answers every lead in minutes, books qualified estimates on your calendar, and follows up on every proposal. Founding partners pay only when a job signs.",
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
