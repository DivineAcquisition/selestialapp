import type { Metadata } from 'next';
import { MetaPixel } from '@/components/marketing/MetaPixel';

/**
 * Standalone layout for the /demo ad landing page.
 *
 * Deliberately minimal: no marketing nav, no footer links, no chat widget.
 * Single conversion goal — book the 15-minute demo.
 */
export const metadata: Metadata = {
  title:
    'Selestial — Stop losing cleaning bookings to quote forms | Book a 15-min demo',
  description:
    'The retention system built for residential cleaning companies. Branded booking, automated follow-up, referral capture — installed on top of your existing CRM. Book a 15-min demo.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Stop losing cleaning bookings to quote forms',
    description:
      'Show pricing upfront. Collect deposits. Book jobs in 60 seconds. Live in 48 hours. Book a 15-minute Selestial demo.',
    type: 'website',
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <MetaPixel />
      {children}
    </div>
  );
}
