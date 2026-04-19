import type { Metadata } from 'next';

/**
 * Standalone layout for the /retarget page. Tight single-purpose surface for
 * paid retargeting traffic that already knows Selestial — no shared nav,
 * no extra sections, just headline + VSL + proof + calendar.
 */
export const metadata: Metadata = {
  title:
    'Selestial — Ready when you are. Pick a time to walk through the booking system.',
  description:
    'A 60-second demo of the Selestial booking flow + a 15-minute slot to walk it through on your own pricing.',
  robots: { index: false, follow: false },
};

export default function RetargetLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
