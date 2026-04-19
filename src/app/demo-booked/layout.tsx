import type { Metadata } from 'next';
import { MetaPixel } from '@/components/marketing/MetaPixel';

export const metadata: Metadata = {
  title: 'You\u2019re booked — Selestial',
  description:
    'Your Selestial demo is scheduled. Watch the 2-minute precall video so you get the most out of our 15 minutes together.',
  robots: { index: false, follow: false },
};

export default function DemoBookedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <MetaPixel />
      {children}
    </div>
  );
}
