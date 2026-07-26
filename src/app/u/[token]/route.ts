import { NextResponse, type NextRequest } from 'next/server';

import { resolveToken } from '@/lib/v2/links';
import { optOutContact } from '@/lib/v2/sequence';

export const runtime = 'nodejs';

/**
 * RFC 8058 one-click unsubscribe. Mail clients POST here directly from the
 * `List-Unsubscribe-Post` header, with no page visit.
 *
 * Only POST is handled: a GET on this path renders the confirmation page instead, so
 * link-prefetching mail scanners cannot unsubscribe someone who never clicked.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const link = await resolveToken(token);

  if (!link || link.kind !== 'unsubscribe' || !link.contact_id) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    await optOutContact({
      contactId: link.contact_id,
      workspaceId: link.workspace_id,
      channel: 'email',
      reason: 'One-click unsubscribe',
      source: 'list-unsubscribe-header',
    });
  } catch (err) {
    console.error('[unsubscribe] failed', token, err);
    return new NextResponse('Error', { status: 500 });
  }

  return new NextResponse('Unsubscribed', { status: 200 });
}
