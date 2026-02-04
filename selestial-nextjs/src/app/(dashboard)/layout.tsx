// Force dynamic rendering for all dashboard routes
export const dynamic = 'force-dynamic';

import DashboardLayoutClient from './DashboardLayoutClient';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
