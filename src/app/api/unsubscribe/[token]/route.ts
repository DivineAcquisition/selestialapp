import { NextResponse, type NextRequest } from 'next/server';

import { resolveToken } from '@/lib/v2/links';
import { optOutContact } from '@/lib/v2/sequence';

export const runtime = 'nodejs';

/**
 * RFC 8058 one-click unsubscribe. Mail clients POST here directly from the
 * `List-Unsubscribe` header with no page visit.
 *
 * It lives on its own path rather than on `/u/[token]` because the human-facing page at
 * that URL must stay a GET-only confirmation screen — link-prefetching mail scanners
 * follow GET links, and unsubscribing someone who never clicked would be worse than
 * making them press a button.
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
    console.error('[unsubscribe] one-click failed', token, err);
    return new NextResponse('Error', { status: 500 });
  }

  return new NextResponse('Unsubscribed', { status: 200 });
}
