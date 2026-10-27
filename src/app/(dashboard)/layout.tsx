// Force dynamic rendering for all dashboard routes
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import DashboardLayoutClient from './DashboardLayoutClient';

export const metadata: Metadata = {
  title: { absolute: 'Selestial' },
  description: 'Selestial workspace',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
