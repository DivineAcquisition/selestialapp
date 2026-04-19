import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started — Selestial',
  description:
    'Set up your branded Selestial booking page in 4 quick steps. We\u2019ll provision your sub-account and have you live in 48 hours.',
  robots: { index: false, follow: false },
};

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
