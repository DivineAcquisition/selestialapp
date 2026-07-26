import { NextResponse, type NextRequest } from 'next/server';

import { logActivity } from '@/lib/v2/activity';
import { adminDb } from '@/lib/v2/db';
import { applyEngagement, handleBooking, handleReply } from '@/lib/v2/engagement';
import {
  headerMap,
  markWebhookFailed,
  markWebhookIgnored,
  markWebhookProcessed,
  recordInboundWebhook,
  verifyGhlSignature,
} from '@/lib/v2/webhooks';
import {
  isAuthorizedReplay,
  REPLAY_HEADER,
  REPLAY_ID_HEADER,
} from '@/lib/v2/webhook-replay';
import { getWorkspaceByLocationId } from '@/lib/v2/workspace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GoHighLevel webhook intake.
 *
 * Verifies the signature, logs the raw payload, responds fast, and processes. GHL
 * retries aggressively, so the response is always 200 once the payload is safely stored —
 * a non-200 would earn us a retry storm for a payload we already have.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-wh-signature');
  const verified = verifyGhlSignature(body, signature);

  const replay = isAuthorizedReplay(request.headers.get(REPLAY_HEADER))
    ? request.headers.get(REPLAY_ID_HEADER)
    : null;

  if (!replay && process.env.GHL_WEBHOOK_REQUIRE_SIGNATURE === 'true' && !verified) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: GhlWebhookPayload;
  try {
    payload = JSON.parse(body) as GhlWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = payload.type ?? payload.eventType ?? null;
  const locationId = payload.locationId ?? payload.location?.id ?? null;

  const workspace = locationId ? await getWorkspaceByLocationId(locationId) : null;

  // A replay reuses the stored row so it cannot collide with itself on the dedupe index.
  const intake = replay
    ? { id: replay, duplicate: false }
    : await recordInboundWebhook({
        provider: 'ghl',
        eventType,
        raw: payload as unknown as Record<string, unknown>,
        headers: headerMap(request.headers),
        signatureVerified: verified,
        workspaceId: workspace?.id ?? null,
        dedupeKey: payload.webhookId ?? payload.id ?? null,
      });

  if (intake.duplicate) return NextResponse.json({ ok: true, duplicate: true });

  if (!workspace) {
    await markWebhookIgnored(
      intake.id,
      locationId
        ? `No workspace is connected to GHL location ${locationId}`
        : 'Payload carried no location id'
    );
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    await processEvent(payload, eventType, workspace.id);
    await markWebhookProcessed(intake.id, { workspaceId: workspace.id, eventType });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[webhook:ghl] processing failed', eventType, message);
    await markWebhookFailed(intake.id, message);

    // Stored and retryable from /agency/webhooks, so acknowledge rather than invite a retry.
    return NextResponse.json({ ok: true, deferred: true });
  }
}

interface GhlWebhookPayload {
  type?: string;
  eventType?: string;
  id?: string;
  webhookId?: string;
  locationId?: string;
  location?: { id?: string };
  contactId?: string;
  contact?: { id?: string; email?: string; phone?: string; tags?: string[] };
  messageType?: string;
  direction?: string;
  body?: string;
  message?: { body?: string; type?: string; direction?: string; id?: string };
  appointment?: { id?: string; contactId?: string; startTime?: string; status?: string };
  dateAdded?: string;
  [key: string]: unknown;
}

async function processEvent(
  payload: GhlWebhookPayload,
  eventType: string | null,
  workspaceId: string
): Promise<void> {
  const contactId = await resolveContact(workspaceId, payload);

  switch (eventType) {
    case 'InboundMessage': {
      if (!contactId) return;
      const text = payload.body ?? payload.message?.body ?? '';
      if (!text.trim()) return;

      const channel = (payload.messageType ?? payload.message?.type ?? 'SMS')
        .toUpperCase()
        .includes('EMAIL')
        ? 'email'
        : 'sms';

      const result = await handleReply({
        workspaceId,
        contactId,
        body: text,
        channel,
        provider: 'ghl',
        providerEventId: payload.message?.id ?? payload.id ?? null,
        occurredAt: payload.dateAdded,
      });

      await logActivity({
        workspaceId,
        actorType: 'webhook',
        action: result.optedOut ? 'webhook.reply_opt_out' : 'webhook.reply',
        summary: result.optedOut
          ? 'Inbound reply was an opt-out request; the contact was opted out everywhere.'
          : `Inbound reply received; ${result.exited} remaining message${
              result.exited === 1 ? '' : 's'
            } cancelled.`,
        entityType: 'contact',
        entityId: contactId,
        metadata: { channel, preview: text.slice(0, 200) },
      });
      return;
    }

    case 'OutboundMessage': {
      // Confirms the sub-account actually handed the SMS off to the carrier.
      if (!contactId) return;
      await applyEngagement({
        workspaceId,
        contactId,
        eventType: 'message_delivered',
        channel: 'sms',
        provider: 'ghl',
        providerEventId: payload.message?.id ?? payload.id ?? null,
        occurredAt: payload.dateAdded,
        metadata: { source: 'ghl-outbound' },
      });
      return;
    }

    case 'AppointmentCreate':
    case 'AppointmentUpdate': {
      const appointmentContact = payload.appointment?.contactId
        ? await resolveContact(workspaceId, { contactId: payload.appointment.contactId })
        : contactId;
      if (!appointmentContact) return;

      const status = (payload.appointment?.status ?? '').toLowerCase();
      if (eventType === 'AppointmentUpdate' && ['cancelled', 'noshow'].includes(status)) return;

      await handleBooking({
        workspaceId,
        contactId: appointmentContact,
        provider: 'ghl',
        providerEventId: payload.appointment?.id ?? null,
        occurredAt: payload.appointment?.startTime,
        metadata: { appointmentId: payload.appointment?.id, status },
      });
      return;
    }

    case 'ContactUpdate': {
      // The client may have opted someone out inside GHL directly. Selestial is the
      // source of truth for everything else, but an opt-out only ever travels toward
      // more suppression, so this direction is honoured.
      if (!contactId) return;
      const tags = payload.contact?.tags ?? [];
      const optedOut = tags.some((tag) => /opt-?out|unsubscribe|dnd/i.test(tag));
      if (!optedOut) return;

      const { optOutContact } = await import('@/lib/v2/sequence');
      await optOutContact({
        contactId,
        workspaceId,
        channel: 'sms',
        reason: 'Opted out inside GoHighLevel',
        source: 'ghl-contact-update',
      });
      return;
    }

    default:
      // Everything else is stored for the audit trail without a handler.
      return;
  }
}

/** Matches a GHL contact back to ours by mirrored id, then phone, then email. */
async function resolveContact(
  workspaceId: string,
  payload: { contactId?: string; contact?: { id?: string; email?: string; phone?: string } }
): Promise<string | null> {
  const db = adminDb();
  const ghlContactId = payload.contactId ?? payload.contact?.id;

  if (ghlContactId) {
    const { data } = await db
      .from('contacts')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('ghl_contact_id', ghlContactId)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }

  const phone = payload.contact?.phone;
  if (phone) {
    const { normalizePhone } = await import('@/lib/v2/normalize');
    const normalized = normalizePhone(phone);
    if (normalized) {
      const { data } = await db
        .from('contacts')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('phone', normalized)
        .maybeSingle();
      if (data?.id) {
        if (ghlContactId) {
          await db.from('contacts').update({ ghl_contact_id: ghlContactId }).eq('id', data.id);
        }
        return data.id as string;
      }
    }
  }

  const email = payload.contact?.email;
  if (email) {
    const { data } = await db
      .from('contacts')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (data?.id) {
      if (ghlContactId) {
        await db.from('contacts').update({ ghl_contact_id: ghlContactId }).eq('id', data.id);
      }
      return data.id as string;
    }
  }

  return null;
}
