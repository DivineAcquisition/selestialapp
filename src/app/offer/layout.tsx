import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Selestial — 50% off the cleaning booking page that pays for itself in week one',
  description:
    'For the next 14 days only — get the Selestial booking system at 50% off your first 3 months. Live in 48 hours. Done-for-you setup included.',
  robots: { index: false, follow: false },
};

export default function OfferLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
