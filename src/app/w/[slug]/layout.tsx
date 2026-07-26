import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { NotAuthenticatedError, requireWorkspace, WorkspaceAccessError } from '@/lib/v2/workspace';

export const dynamic = 'force-dynamic';

/**
 * Gate for every workspace page. RLS already prevents cross-workspace reads; this turns
 * an unauthorized slug into a redirect rather than an empty page that could be mistaken
 * for "this client has no data".
 */
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    await requireWorkspace(slug);
  } catch (err) {
    if (err instanceof NotAuthenticatedError) redirect(`/login?redirect=/w/${slug}`);
    if (err instanceof WorkspaceAccessError) redirect('/no-workspace');
    throw err;
  }

  return <>{children}</>;
}
