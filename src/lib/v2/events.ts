import 'server-only';

import { adminDb } from './db';
import type { EngagementEventType, OutreachChannel } from './types';

export interface RecordEventInput {
  workspaceId: string;
  eventType: EngagementEventType;
  contactId?: string | null;
  campaignId?: string | null;
  messageId?: string | null;
  touchId?: string | null;
  linkId?: string | null;
  channel?: OutreachChannel | null;
  occurredAt?: Date | string;
  metadata?: Record<string, unknown>;
  provider?: string | null;
  /**
   * Provider-side event id. When set, the unique index on (provider, provider_event_id)
   * makes the insert idempotent, which is what keeps webhook retries from double-counting.
   */
  providerEventId?: string | null;
}

/**
 * Appends one row to `engagement_events`, the only table dashboards read from.
 *
 * Returns the new row id, or null when the event was a duplicate of one already
 * recorded (same provider event id) — callers use that to skip side effects like
 * re-tagging in GHL.
 */
export async function recordEvent(input: RecordEventInput): Promise<number | null> {
  const row = {
    workspace_id: input.workspaceId,
    contact_id: input.contactId ?? null,
    campaign_id: input.campaignId ?? null,
    message_id: input.messageId ?? null,
    touch_id: input.touchId ?? null,
    link_id: input.linkId ?? null,
    event_type: input.eventType,
    channel: input.channel ?? null,
    occurred_at: toIso(input.occurredAt) ?? new Date().toISOString(),
    metadata: input.metadata ?? {},
    provider: input.provider ?? null,
    provider_event_id: input.providerEventId ?? null,
  };

  const { data, error } = await adminDb()
    .from('engagement_events')
    .insert(row)
    .select('id')
    .maybeSingle();

  if (error) {
    // 23505 = unique violation, i.e. this provider event was already recorded.
    if (error.code === '23505') return null;
    throw error;
  }

  return (data?.id as number) ?? null;
}

function toIso(value: Date | string | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

// ---------------------------------------------------------------------------
// Engagement score
// ---------------------------------------------------------------------------

/**
 * Depth of engagement, weakest to strongest. The score takes the strongest signal a
 * contact has ever produced, so a reply can never be diluted by a quiet week.
 */
const DEPTH_WEIGHTS: Partial<Record<EngagementEventType, number>> = {
  message_delivered: 2,
  email_opened: 10,
  link_clicked: 30,
  attachment_viewed: 45,
  reply_received: 70,
  booking_created: 100,
};

/** Recency multiplier applied to the depth score, keyed by days since last engagement. */
function recencyFactor(daysSince: number): number {
  if (daysSince <= 3) return 1;
  if (daysSince <= 7) return 0.9;
  if (daysSince <= 14) return 0.75;
  if (daysSince <= 30) return 0.55;
  if (daysSince <= 60) return 0.35;
  return 0.2;
}

export function scoreTier(score: number): string {
  if (score >= 75) return 'ready';
  if (score >= 50) return 'hot';
  if (score >= 25) return 'warm';
  if (score >= 1) return 'cool';
  return 'cold';
}

export interface ScoreResult {
  score: number;
  tier: string;
  lastEngagementAt: string | null;
  deepestSignal: EngagementEventType | null;
}

/**
 * Recomputes a contact's engagement score from the event log and persists it.
 *
 * score = (deepest signal weight + breadth bonus) x recency factor, clamped to 0..100.
 * The breadth bonus is 2 points per engagement event up to 15, so a contact who clicked
 * five times outranks one who clicked once. Definitions are documented for clients in
 * `src/content/docs/metrics.md` — keep the two in sync.
 */
export async function recomputeEngagementScore(contactId: string): Promise<ScoreResult> {
  const db = adminDb();

  const { data: events } = await db
    .from('engagement_events')
    .select('event_type, occurred_at')
    .eq('contact_id', contactId)
    .in('event_type', Object.keys(DEPTH_WEIGHTS))
    .order('occurred_at', { ascending: false })
    .limit(500);

  const rows = (events ?? []) as { event_type: EngagementEventType; occurred_at: string }[];

  let deepest: EngagementEventType | null = null;
  let deepestWeight = 0;

  for (const row of rows) {
    const weight = DEPTH_WEIGHTS[row.event_type] ?? 0;
    if (weight > deepestWeight) {
      deepestWeight = weight;
      deepest = row.event_type;
    }
  }

  // `message_delivered` is a send-side fact, not something the contact did, so it does
  // not count toward breadth or set the last-engagement timestamp.
  const contactActions = rows.filter((r) => r.event_type !== 'message_delivered');
  const breadthBonus = Math.min(15, contactActions.length * 2);
  const lastEngagementAt = contactActions[0]?.occurred_at ?? null;

  const daysSince = lastEngagementAt
    ? Math.max(0, (Date.now() - new Date(lastEngagementAt).getTime()) / 86_400_000)
    : Number.POSITIVE_INFINITY;

  const raw = (deepestWeight + breadthBonus) * recencyFactor(daysSince);
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const tier = scoreTier(score);

  await db
    .from('contacts')
    .update({
      engagement_score: score,
      engagement_tier: tier,
      last_engagement_at: lastEngagementAt,
    })
    .eq('id', contactId);

  return { score, tier, lastEngagementAt, deepestSignal: deepest };
}
