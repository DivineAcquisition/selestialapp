import type { Metadata } from 'next';
import { MetaPixel } from '@/components/marketing/MetaPixel';

export const metadata: Metadata = {
  title: 'Book a 15-min demo — Selestial',
  description:
    'Pick a 15-minute slot to see Selestial running live on a real cleaning company\u2019s pricing.',
  robots: { index: false, follow: false },
};

export default function BookDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <MetaPixel />
      {children}
    </div>
  );
}
