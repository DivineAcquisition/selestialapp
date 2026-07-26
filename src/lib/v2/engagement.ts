import 'server-only';

import { SELESTIAL_TAGS } from '@/lib/ghl/config';
import { adminDb } from './db';
import { recordEvent, recomputeEngagementScore, type RecordEventInput } from './events';
import { syncEngagementTag } from './ghl-sync';
import { exitContactEverywhere, optOutContact } from './sequence';
import type { EngagementEventType } from './types';

/**
 * The follow-through every engagement signal triggers, in one place so a click recorded
 * by the link route and a click reported by a Resend webhook produce identical effects.
 *
 * Order matters: record the event first (it is the source of truth), then derive from it.
 */

/** Signals that should push a tag back into the client's sub-account. */
const TAG_FOR_EVENT: Partial<Record<EngagementEventType, string>> = {
  link_clicked: SELESTIAL_TAGS.clicked,
  attachment_viewed: SELESTIAL_TAGS.clicked,
  reply_received: SELESTIAL_TAGS.replied,
  booking_created: SELESTIAL_TAGS.booked,
};

/** Signals meaningful enough to be worth regenerating the case-file narrative for. */
const SUMMARY_WORTHY = new Set<EngagementEventType>([
  'link_clicked',
  'attachment_viewed',
  'reply_received',
  'booking_created',
  'email_bounced',
  'opted_out',
]);

export interface EngagementOutcome {
  eventId: number | null;
  duplicate: boolean;
  score?: number;
  tier?: string;
}

export async function applyEngagement(input: RecordEventInput): Promise<EngagementOutcome> {
  const eventId = await recordEvent(input);

  // A null id means the provider already delivered this event; skip the side effects so
  // a webhook retry cannot re-tag or double-count.
  if (eventId === null && input.providerEventId) {
    return { eventId: null, duplicate: true };
  }

  if (!input.contactId) return { eventId, duplicate: false };

  const score = await recomputeEngagementScore(input.contactId);

  if (SUMMARY_WORTHY.has(input.eventType)) {
    await adminDb()
      .from('contacts')
      .update({ ai_summary_stale: true })
      .eq('id', input.contactId);
  }

  const tag = TAG_FOR_EVENT[input.eventType];
  if (tag) await syncEngagementTag(input.workspaceId, input.contactId, tag);

  return { eventId, duplicate: false, score: score.score, tier: score.tier };
}

/**
 * A reply exits the contact from the remaining touches. This is the behaviour the whole
 * sequence design rests on: the moment someone answers, we stop drip-feeding them.
 */
export async function handleReply(params: {
  workspaceId: string;
  contactId: string;
  body: string;
  channel: 'sms' | 'email';
  provider: string;
  providerEventId?: string | null;
  occurredAt?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ optedOut: boolean; exited: number }> {
  const { isOptOutReply } = await import('./compliance');

  if (isOptOutReply(params.body)) {
    await optOutContact({
      contactId: params.contactId,
      workspaceId: params.workspaceId,
      channel: params.channel,
      reason: `Replied "${params.body.trim().slice(0, 40)}"`,
      source: params.provider,
    });
    return { optedOut: true, exited: 0 };
  }

  const outcome = await applyEngagement({
    workspaceId: params.workspaceId,
    contactId: params.contactId,
    eventType: 'reply_received',
    channel: params.channel,
    provider: params.provider,
    providerEventId: params.providerEventId,
    occurredAt: params.occurredAt,
    metadata: { body: params.body.slice(0, 2000), ...params.metadata },
  });

  if (outcome.duplicate) return { optedOut: false, exited: 0 };

  const exited = await exitContactEverywhere(params.contactId, 'replied');

  await adminDb().from('contact_notes').insert({
    workspace_id: params.workspaceId,
    contact_id: params.contactId,
    kind: 'system',
    body: `Replied on ${params.channel}: "${params.body.trim().slice(0, 300)}"`,
  });

  return { optedOut: false, exited };
}

export async function handleBooking(params: {
  workspaceId: string;
  contactId: string;
  provider: string;
  providerEventId?: string | null;
  occurredAt?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const outcome = await applyEngagement({
    workspaceId: params.workspaceId,
    contactId: params.contactId,
    eventType: 'booking_created',
    provider: params.provider,
    providerEventId: params.providerEventId,
    occurredAt: params.occurredAt,
    metadata: params.metadata,
  });

  if (outcome.duplicate) return;

  await adminDb()
    .from('contacts')
    .update({ status: 'booked', booked_at: new Date().toISOString(), ai_summary_stale: true })
    .eq('id', params.contactId);

  await exitContactEverywhere(params.contactId, 'booked');
}
