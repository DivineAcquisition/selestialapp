import type { Metadata } from 'next';
import { MetaPixel } from '@/components/marketing/MetaPixel';

export const metadata: Metadata = {
  title:
    'Selestial — the done-for-you retention system for cleaning companies',
  description:
    'Branded booking, automated follow-up, referral capture — installed on top of your existing CRM. Stop leaking revenue from customers you already paid to acquire.',
  robots: { index: false, follow: false },
};

export default function OfferLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <MetaPixel />
      {children}
    </div>
  );
}
