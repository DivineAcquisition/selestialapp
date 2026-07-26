import { NextResponse, type NextRequest } from 'next/server';

import { applyEngagement } from '@/lib/v2/engagement';
import { bumpClickCounters, isExpired, isSafeDestination, resolveToken } from '@/lib/v2/links';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Tokenized link resolver.
 *
 * Records the click against the exact contact, campaign and touch the token was minted
 * for, then redirects. The event write is awaited: a click we failed to record is a
 * click that never happened as far as every dashboard is concerned, and a few extra
 * milliseconds is a fair price for that.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const link = await resolveToken(token);

  if (!link || link.kind !== 'url') {
    return NextResponse.redirect(new URL('/link-not-found', request.nextUrl.origin));
  }

  if (isExpired(link)) {
    return NextResponse.redirect(new URL('/link-expired', request.nextUrl.origin));
  }

  if (!isSafeDestination(link.destination_url)) {
    return NextResponse.redirect(new URL('/link-not-found', request.nextUrl.origin));
  }

  try {
    await applyEngagement({
      workspaceId: link.workspace_id,
      contactId: link.contact_id,
      campaignId: link.campaign_id,
      messageId: link.message_id,
      touchId: link.touch_id,
      linkId: link.id,
      eventType: 'link_clicked',
      metadata: {
        destination: link.destination_url,
        label: link.label,
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
      },
    });

    await bumpClickCounters(link);
  } catch (err) {
    // Never let a tracking failure strand someone on an error page.
    console.error('[link] failed to record click', token, err);
  }

  return NextResponse.redirect(link.destination_url!, { status: 302 });
}
