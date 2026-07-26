import { NextResponse, type NextRequest } from 'next/server';

import { adminDb } from '@/lib/v2/db';
import { applyEngagement } from '@/lib/v2/engagement';
import { recordEvent } from '@/lib/v2/events';
import { optOutContact } from '@/lib/v2/sequence';
import type { EngagementEventType, OutreachMessage } from '@/lib/v2/types';
import {
  isAuthorizedReplay,
  REPLAY_HEADER,
  REPLAY_ID_HEADER,
} from '@/lib/v2/webhook-replay';
import {
  headerMap,
  markWebhookFailed,
  markWebhookIgnored,
  markWebhookProcessed,
  recordInboundWebhook,
  verifySvixSignature,
} from '@/lib/v2/webhooks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Resend event names mapped onto our event vocabulary. */
const EVENT_MAP: Record<string, EngagementEventType> = {
  'email.delivered': 'message_delivered',
  'email.opened': 'email_opened',
  'email.clicked': 'link_clicked',
  'email.bounced': 'email_bounced',
  'email.complained': 'email_complained',
  'email.delivery_delayed': 'message_failed',
};

interface ResendWebhookPayload {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    subject?: string;
    click?: { link?: string; timestamp?: string; userAgent?: string };
    bounce?: { type?: string; subType?: string; message?: string };
    headers?: { name: string; value: string }[];
  };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  const verified = secret
    ? verifySvixSignature({
        secret,
        id: request.headers.get('svix-id'),
        timestamp: request.headers.get('svix-timestamp'),
        signature: request.headers.get('svix-signature'),
        body,
      })
    : false;

  const replay = isAuthorizedReplay(request.headers.get(REPLAY_HEADER))
    ? request.headers.get(REPLAY_ID_HEADER)
    : null;

  // Unlike GHL, Resend's signing secret is always available, so an unverified payload
  // here means someone is spoofing us.
  if (!replay && secret && !verified) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: ResendWebhookPayload;
  try {
    payload = JSON.parse(body) as ResendWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = payload.type ?? null;

  const intake = replay
    ? { id: replay, duplicate: false }
    : await recordInboundWebhook({
        provider: 'resend',
        eventType,
        raw: payload as unknown as Record<string, unknown>,
        headers: headerMap(request.headers),
        signatureVerified: verified,
        dedupeKey: dedupeKeyFor(request.headers.get('svix-id'), payload),
      });

  if (intake.duplicate) return NextResponse.json({ ok: true, duplicate: true });

  try {
    const outcome = await processEvent(payload, eventType);

    if (outcome === 'ignored') {
      await markWebhookIgnored(intake.id, 'No Selestial message matched this Resend email id');
      return NextResponse.json({ ok: true, ignored: true });
    }

    await markWebhookProcessed(intake.id, { workspaceId: outcome, eventType });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[webhook:resend] processing failed', eventType, message);
    await markWebhookFailed(intake.id, message);
    return NextResponse.json({ ok: true, deferred: true });
  }
}

function dedupeKeyFor(svixId: string | null, payload: ResendWebhookPayload): string | null {
  if (svixId) return svixId;
  if (payload.data?.email_id && payload.type) {
    // Opens and clicks legitimately repeat, so they are not collapsed onto one row.
    if (payload.type === 'email.opened' || payload.type === 'email.clicked') return null;
    return `${payload.data.email_id}:${payload.type}`;
  }
  return null;
}

/** Returns the workspace id on success, or 'ignored' when no message matched. */
async function processEvent(
  payload: ResendWebhookPayload,
  eventType: string | null
): Promise<string | 'ignored'> {
  const emailId = payload.data?.email_id;
  if (!emailId || !eventType) return 'ignored';

  const mapped = EVENT_MAP[eventType];
  if (!mapped) return 'ignored';

  const { data: messageRow } = await adminDb()
    .from('outreach_messages')
    .select('*')
    .eq('provider', 'resend')
    .eq('provider_message_id', emailId)
    .maybeSingle();

  if (!messageRow) return 'ignored';
  const message = messageRow as OutreachMessage;

  const occurredAt = payload.created_at ?? new Date().toISOString();

  if (mapped === 'message_delivered') {
    await adminDb()
      .from('outreach_messages')
      .update({ status: 'delivered', delivered_at: occurredAt })
      .eq('id', message.id);

    await recordEvent({
      workspaceId: message.workspace_id,
      contactId: message.contact_id,
      campaignId: message.campaign_id,
      messageId: message.id,
      touchId: message.touch_id,
      eventType: 'message_delivered',
      channel: 'email',
      occurredAt,
      provider: 'resend',
      providerEventId: `${emailId}:delivered`,
    });

    return message.workspace_id;
  }

  if (mapped === 'email_bounced' || mapped === 'email_complained') {
    const patch: Record<string, unknown> = { ai_summary_stale: true };

    if (mapped === 'email_bounced') {
      patch.email_bounced_at = occurredAt;
      // Only a hard bounce marks the address dead; a mailbox-full soft bounce should
      // not cost the client a contact.
      if ((payload.data?.bounce?.type ?? '').toLowerCase() === 'hard') patch.status = 'bounced';
    }

    await adminDb().from('contacts').update(patch).eq('id', message.contact_id);

    await recordEvent({
      workspaceId: message.workspace_id,
      contactId: message.contact_id,
      campaignId: message.campaign_id,
      messageId: message.id,
      eventType: mapped,
      channel: 'email',
      occurredAt,
      provider: 'resend',
      providerEventId: `${emailId}:${eventType}`,
      metadata: { bounce: payload.data?.bounce },
    });

    // A spam complaint is an opt-out with extra steps. Treat it as one.
    if (mapped === 'email_complained') {
      await optOutContact({
        contactId: message.contact_id,
        workspaceId: message.workspace_id,
        channel: 'email',
        reason: 'Marked an email as spam',
        source: 'resend-complaint',
      });
    }

    return message.workspace_id;
  }

  await applyEngagement({
    workspaceId: message.workspace_id,
    contactId: message.contact_id,
    campaignId: message.campaign_id,
    messageId: message.id,
    touchId: message.touch_id,
    eventType: mapped,
    channel: 'email',
    occurredAt,
    provider: 'resend',
    metadata: {
      subject: payload.data?.subject,
      link: payload.data?.click?.link,
      userAgent: payload.data?.click?.userAgent,
    },
  });

  return message.workspace_id;
}
