import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { getViewer } from '@/lib/v2/workspace';

export const dynamic = 'force-dynamic';

/** Agency-only surfaces. A client who guesses the URL is sent back to their workspace. */
export default async function AgencyLayout({ children }: { children: ReactNode }) {
  const viewer = await getViewer();

  if (!viewer) redirect('/login?redirect=/agency');
  if (!viewer.isAgencyAdmin) redirect('/');

  return <>{children}</>;
}
