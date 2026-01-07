import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Selestial - Quote Follow-Up Automation",
  description: "Quote follow-up automation for home service businesses",
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
    <html lang="en" className={`light ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans">
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
