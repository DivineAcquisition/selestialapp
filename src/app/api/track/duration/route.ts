import { NextResponse, type NextRequest } from 'next/server';

import { recordEvent } from '@/lib/v2/events';
import { resolveToken } from '@/lib/v2/links';

export const runtime = 'nodejs';

/** Upper bound on a credible reading session; anything longer is an abandoned tab. */
const MAX_CREDIBLE_SECONDS = 30 * 60;
const MIN_CREDIBLE_SECONDS = 2;

/**
 * Receives the `sendBeacon` payload from the attachment viewer.
 *
 * Client-reported and therefore untrusted, so the value is clamped and recorded as its
 * own event type. Nothing in the dashboard treats duration as a primary metric — it is
 * context on the case file, not something to optimise.
 */
export async function POST(request: NextRequest) {
  try {
    const { token, seconds } = (await request.json()) as { token?: string; seconds?: number };

    if (!token || typeof seconds !== 'number' || !Number.isFinite(seconds)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (seconds < MIN_CREDIBLE_SECONDS) return NextResponse.json({ ok: true, ignored: true });

    const link = await resolveToken(token);
    if (!link || link.kind !== 'attachment') return NextResponse.json({ ok: false }, { status: 404 });

    await recordEvent({
      workspaceId: link.workspace_id,
      contactId: link.contact_id,
      campaignId: link.campaign_id,
      messageId: link.message_id,
      linkId: link.id,
      eventType: 'attachment_view_duration',
      metadata: {
        seconds: Math.min(Math.round(seconds), MAX_CREDIBLE_SECONDS),
        attachmentId: link.attachment_id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
