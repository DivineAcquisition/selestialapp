import type { Metadata } from "next";
import { Homepage } from "@/components/agency/homepage";

const title = "Selestial | Qualified In-Home Estimates for Remodelers";
const description =
  "Selestial runs your Meta ads, responds to every lead in minutes, and books qualified homeowners onto your calendar. Book a free Lead Leak Audit.";
const socialTitle = "More qualified in-home estimates. Without chasing leads.";

export const metadata: Metadata = {
  metadataBase: new URL("https://selestial.io"),
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: socialTitle,
    description,
    url: "/",
    siteName: "Selestial",
    type: "website",
    images: [
      {
        url: "/marketing/og.jpg",
        width: 1200,
        height: 630,
        alt: socialTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description,
    images: ["/marketing/og.jpg"],
  },
};

export default function AgencyHomePage() {
  return <Homepage />;
}
