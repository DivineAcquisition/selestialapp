import type { Metadata } from "next";
import { Homepage } from "@/components/agency/homepage";
import { socialHeadline } from "@/lib/marketing/agency";

const title = "Selestial | Pre-Qualified Estimates and Proposal Follow-Up for Remodelers";
const description =
  "Selestial runs your Meta ads, answers every lead in minutes, books qualified estimates on your calendar, and follows up on every proposal. Founding partners pay only when a job signs.";

export const metadata: Metadata = {
  metadataBase: new URL("https://selestial.io"),
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: socialHeadline(),
    description,
    url: "/",
    siteName: "Selestial",
    type: "website",
    images: [
      {
        url: "/marketing/og.jpg",
        width: 1200,
        height: 630,
        alt: socialHeadline(),
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialHeadline(),
    description,
    images: ["/marketing/og.jpg"],
  },
};

export default function AgencyHomePage() {
  return <Homepage />;
}
