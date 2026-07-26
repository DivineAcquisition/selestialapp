import 'server-only';

import { ghl } from '@/lib/ghl/client';
import { SELESTIAL_TAGS } from '@/lib/ghl/config';
import { suppressionReason, SUPPRESSION_LABELS } from './compliance';
import { adminDb } from './db';
import { sendCampaignEmail } from './email';
import { recordEvent } from './events';
import { mirrorContactToGhl } from './ghl-sync';
import { createTrackedLink, oneClickUnsubscribeUrl, tokenFromUrl } from './links';
import { renderMessage } from './render';
import { isWithinWindow } from './schedule';
import { newLockToken, windowOf } from './sequence';
import type {
  Campaign,
  CampaignTouch,
  Contact,
  OutreachMessage,
  Workspace,
} from './types';

/**
 * The send worker, driven by cron.
 *
 * Contract for every message it touches:
 *   1. Claim the row with a lock token, so two overlapping cron runs cannot double-send.
 *   2. Re-check suppression immediately before sending, not at schedule time.
 *   3. Re-check the send window, because a queue can back up past the window's close.
 *   4. Render, send, and write exactly one event.
 * A message is only marked `sent` after the provider accepted it.
 */

export interface DispatchResult {
  claimed: number;
  sent: number;
  skipped: number;
  failed: number;
  errors: string[];
}

const DEFAULT_BATCH = Number(process.env.SELESTIAL_DISPATCH_BATCH || 100);
/** A row locked longer than this is assumed to belong to a crashed run. */
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

export async function dispatchDueMessages(
  options: { limit?: number; workspaceId?: string } = {}
): Promise<DispatchResult> {
  const db = adminDb();
  const limit = options.limit ?? DEFAULT_BATCH;
  const lockToken = newLockToken();
  const now = new Date();

  const result: DispatchResult = { claimed: 0, sent: 0, skipped: 0, failed: 0, errors: [] };

  // Release rows abandoned by a run that died mid-flight.
  await db
    .from('outreach_messages')
    .update({ status: 'scheduled', lock_token: null, locked_at: null })
    .eq('status', 'sending')
    .lt('locked_at', new Date(now.getTime() - LOCK_TIMEOUT_MS).toISOString());

  const dueQuery = db
    .from('outreach_messages')
    .select('id')
    .eq('status', 'scheduled')
    .lte('scheduled_for', now.toISOString())
    .order('scheduled_for')
    .limit(limit);

  if (options.workspaceId) dueQuery.eq('workspace_id', options.workspaceId);

  const { data: dueRows } = await dueQuery;
  const dueIds = (dueRows ?? []).map((r) => r.id as string);
  if (dueIds.length === 0) return result;

  // Claim by writing our token, then read back only the rows we actually won. Another
  // instance that got there first will have changed the status out from under us.
  await db
    .from('outreach_messages')
    .update({ status: 'sending', lock_token: lockToken, locked_at: now.toISOString() })
    .in('id', dueIds)
    .eq('status', 'scheduled');

  const { data: claimedRows } = await db
    .from('outreach_messages')
    .select('*')
    .in('id', dueIds)
    .eq('lock_token', lockToken);

  const messages = (claimedRows ?? []) as OutreachMessage[];
  result.claimed = messages.length;

  const workspaces = new Map<string, Workspace>();
  const campaigns = new Map<string, Campaign>();
  const touches = new Map<string, CampaignTouch>();

  for (const message of messages) {
    try {
      const workspace = await cached(workspaces, message.workspace_id, () =>
        loadOne<Workspace>('workspaces', message.workspace_id)
      );
      const campaign = await cached(campaigns, message.campaign_id, () =>
        loadOne<Campaign>('campaigns', message.campaign_id)
      );

      if (!workspace || !campaign) {
        await markSkipped(message, 'Workspace or campaign is missing');
        result.skipped++;
        continue;
      }

      // A campaign paused after this batch was claimed must not send.
      if (campaign.status === 'paused') {
        await db
          .from('outreach_messages')
          .update({ status: 'scheduled', lock_token: null, locked_at: null })
          .eq('id', message.id);
        result.skipped++;
        continue;
      }

      const contact = await loadOne<Contact>('contacts', message.contact_id);
      if (!contact) {
        await markSkipped(message, 'Contact no longer exists');
        result.skipped++;
        continue;
      }

      // Opt-out is checked here, immediately before the send — not at schedule time —
      // so a contact who opted out an hour ago never receives an already-queued touch.
      const suppression = suppressionReason(contact, message.channel);
      if (suppression) {
        await markSkipped(message, SUPPRESSION_LABELS[suppression]);
        await recordEvent({
          workspaceId: workspace.id,
          contactId: contact.id,
          campaignId: campaign.id,
          messageId: message.id,
          eventType: 'message_skipped',
          channel: message.channel,
          metadata: { reason: suppression },
        });
        result.skipped++;
        continue;
      }

      // A backed-up queue can push a message past the window; reschedule rather than
      // send at a time the recipient did not agree to.
      const timezone = contact.timezone || workspace.timezone;
      if (!isWithinWindow(now, timezone, windowOf(campaign))) {
        const { nextSendTime } = await import('./schedule');
        const next = nextSendTime(now, timezone, windowOf(campaign));
        await db
          .from('outreach_messages')
          .update({
            status: 'scheduled',
            scheduled_for: next.toISOString(),
            lock_token: null,
            locked_at: null,
          })
          .eq('id', message.id);
        result.skipped++;
        continue;
      }

      const touch = message.touch_id
        ? await cached(touches, message.touch_id, () =>
            loadOne<CampaignTouch>('campaign_touches', message.touch_id!)
          )
        : null;

      if (!touch) {
        await markSkipped(message, 'The template for this touch no longer exists');
        result.skipped++;
        continue;
      }

      const sent = await sendOne({ workspace, campaign, contact, touch, message });

      if (sent.ok) result.sent++;
      else {
        result.failed++;
        if (sent.error) result.errors.push(`${message.id}: ${sent.error}`);
      }
    } catch (err) {
      const messageText = err instanceof Error ? err.message : String(err);
      result.failed++;
      result.errors.push(`${message.id}: ${messageText}`);

      await db
        .from('outreach_messages')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          error: messageText.slice(0, 500),
          attempts: message.attempts + 1,
          lock_token: null,
          locked_at: null,
        })
        .eq('id', message.id);
    }
  }

  return result;
}

interface SendParams {
  workspace: Workspace;
  campaign: Campaign;
  contact: Contact;
  touch: CampaignTouch;
  message: OutreachMessage;
}

async function sendOne(params: SendParams): Promise<{ ok: boolean; error?: string }> {
  const { workspace, campaign, contact, touch, message } = params;
  const db = adminDb();

  // Email needs an unsubscribe token before rendering so the same URL can go in the
  // body and the List-Unsubscribe header.
  const unsubscribeUrl =
    message.channel === 'email'
      ? await createTrackedLink({
          workspaceId: workspace.id,
          contactId: contact.id,
          campaignId: campaign.id,
          messageId: message.id,
          touchId: touch.id,
          kind: 'unsubscribe',
          label: 'Unsubscribe',
        })
      : undefined;

  const rendered = await renderMessage(
    {
      workspace,
      contact,
      touch,
      messageId: message.id,
      campaignId: campaign.id,
      offer: campaign.offer,
      bookingUrl: campaign.booking_url ?? workspace.booking_url,
    },
    { unsubscribeUrl }
  );

  let providerId: string | null = null;
  let provider: string;
  let error: string | null = null;

  if (message.channel === 'sms') {
    provider = 'ghl';
    const outcome = await sendSms(workspace, contact, rendered.body, message.idempotency_key);
    providerId = outcome.messageId;
    error = outcome.error;
  } else {
    provider = 'resend';
    const outcome = await sendCampaignEmail({
      workspace,
      to: contact.email!,
      subject: rendered.subject ?? 'A quick note',
      html: rendered.html ?? rendered.body,
      text: rendered.body,
      idempotencyKey: message.idempotency_key,
      // The header must point at a POST-capable endpoint; the body link points at the
      // confirmation page. Both carry the same token.
      unsubscribeUrl: unsubscribeUrl ? oneClickUnsubscribeUrl(tokenFromUrl(unsubscribeUrl)) : undefined,
    });
    providerId = outcome.id;
    error = outcome.error;
  }

  const now = new Date().toISOString();

  if (error) {
    await db
      .from('outreach_messages')
      .update({
        status: 'failed',
        failed_at: now,
        error: error.slice(0, 500),
        attempts: message.attempts + 1,
        subject: rendered.subject,
        body: rendered.body,
        provider,
        render_meta: rendered.meta,
        lock_token: null,
        locked_at: null,
      })
      .eq('id', message.id);

    await recordEvent({
      workspaceId: workspace.id,
      contactId: contact.id,
      campaignId: campaign.id,
      messageId: message.id,
      touchId: touch.id,
      eventType: 'message_failed',
      channel: message.channel,
      metadata: { provider, error },
    });

    return { ok: false, error };
  }

  // The rendered copy is stored on the row: this is the record of exactly what this
  // person received, which the case-file timeline reads back verbatim.
  await db
    .from('outreach_messages')
    .update({
      status: 'sent',
      sent_at: now,
      subject: rendered.subject,
      body: rendered.body,
      from_address: message.channel === 'email' ? null : workspace.phone,
      provider,
      provider_message_id: providerId,
      attempts: message.attempts + 1,
      render_meta: rendered.meta,
      lock_token: null,
      locked_at: null,
    })
    .eq('id', message.id);

  await db
    .from('contacts')
    .update({ last_contacted_at: now })
    .eq('id', contact.id);

  await db
    .from('campaign_enrollments')
    .update({ current_step: touch.step_index })
    .eq('id', message.enrollment_id);

  await recordEvent({
    workspaceId: workspace.id,
    contactId: contact.id,
    campaignId: campaign.id,
    messageId: message.id,
    touchId: touch.id,
    eventType: 'message_sent',
    channel: message.channel,
    occurredAt: now,
    provider,
    metadata: {
      stepIndex: touch.step_index,
      templateVersion: touch.version,
      personalized: rendered.meta.personalized,
      segments: rendered.segments,
    },
  });

  // First contact on this campaign: mirror the tag so client automations see it.
  if (touch.step_index === 0) {
    const { syncEngagementTag } = await import('./ghl-sync');
    await syncEngagementTag(workspace.id, contact.id, SELESTIAL_TAGS.contacted);
  }

  return { ok: true };
}

async function sendSms(
  workspace: Workspace,
  contact: Contact,
  body: string,
  idempotencyKey: string
): Promise<{ messageId: string | null; error: string | null }> {
  if (!workspace.ghl_location_id) {
    return { messageId: null, error: 'Workspace has no GHL sub-account, so SMS cannot be sent' };
  }

  // SMS goes through the client's own sub-account, so the contact must exist there
  // first. Mirroring on demand covers a contact imported before provisioning finished.
  let ghlContactId = contact.ghl_contact_id;
  if (!ghlContactId) {
    const mirror = await mirrorContactToGhl(workspace, contact);
    ghlContactId = mirror.ghlContactId;
  }

  if (!ghlContactId) {
    return { messageId: null, error: 'Could not mirror the contact into GoHighLevel' };
  }

  try {
    const result = await ghl(workspace.id).sendSms({
      locationId: workspace.ghl_location_id,
      contactId: ghlContactId,
      message: body,
      idempotencyKey,
    });
    return { messageId: result.messageId, error: null };
  } catch (err) {
    return { messageId: null, error: err instanceof Error ? err.message : String(err) };
  }
}

async function markSkipped(message: OutreachMessage, reason: string): Promise<void> {
  await adminDb()
    .from('outreach_messages')
    .update({
      status: 'skipped',
      skip_reason: reason,
      lock_token: null,
      locked_at: null,
    })
    .eq('id', message.id);
}

async function loadOne<T>(table: string, id: string): Promise<T | null> {
  const { data } = await adminDb().from(table).select('*').eq('id', id).maybeSingle();
  return (data as T) ?? null;
}

async function cached<T>(
  store: Map<string, T>,
  key: string,
  load: () => Promise<T | null>
): Promise<T | null> {
  const hit = store.get(key);
  if (hit) return hit;
  const value = await load();
  if (value) store.set(key, value);
  return value;
}
