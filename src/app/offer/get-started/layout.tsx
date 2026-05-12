import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started — Selestial',
  description:
    'Set up your branded Selestial retention system in 4 quick steps. Done-for-you, live across your customer base in under a month.',
  robots: { index: false, follow: false },
};

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
