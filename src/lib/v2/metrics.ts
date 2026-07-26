import 'server-only';

import { adminDb } from './db';
import { EMPTY_WEEK_STATS, type WeekStats } from './types';

/**
 * Dashboard numbers, all derived from `engagement_events`.
 *
 * Nothing here reads a denormalized counter, because a counter that drifts from the log
 * is worse than no number at all. Every definition is documented for clients in
 * `src/content/docs/metrics.md`.
 */

export interface WeekRange {
  start: Date;
  end: Date;
  label: string;
}

/** An ISO timestamp N days in the past, for "recent activity" windows. */
export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** An ISO timestamp N hours in the past. */
export function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

/** Weeks run Monday 00:00 to the following Monday 00:00, in the workspace's timezone. */
export function weekRange(offsetWeeks = 0, reference = new Date()): WeekRange {
  const base = new Date(reference);
  const isoDay = base.getUTCDay() === 0 ? 7 : base.getUTCDay();

  const start = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() - (isoDay - 1))
  );
  start.setUTCDate(start.getUTCDate() + offsetWeeks * 7);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  return { start, end, label: formatWeekLabel(start, end) };
}

function formatWeekLabel(start: Date, end: Date): string {
  const last = new Date(end.getTime() - 86_400_000);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
  return `${start.toLocaleDateString('en-US', opts)} – ${last.toLocaleDateString('en-US', opts)}`;
}

export async function getWeekStats(
  workspaceId: string,
  range: WeekRange
): Promise<WeekStats> {
  const { data, error } = await adminDb().rpc('workspace_week_stats', {
    p_workspace_id: workspaceId,
    p_start: range.start.toISOString(),
    p_end: range.end.toISOString(),
  });

  if (error) {
    console.error('[metrics] week stats failed', error);
    return { ...EMPTY_WEEK_STATS };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { ...EMPTY_WEEK_STATS };

  return {
    sms_sent: Number(row.sms_sent ?? 0),
    email_sent: Number(row.email_sent ?? 0),
    scheduled: Number(row.scheduled ?? 0),
    delivered: Number(row.delivered ?? 0),
    opens: Number(row.opens ?? 0),
    clicks: Number(row.clicks ?? 0),
    unique_clickers: Number(row.unique_clickers ?? 0),
    attachment_views: Number(row.attachment_views ?? 0),
    replies: Number(row.replies ?? 0),
    bookings: Number(row.bookings ?? 0),
    opt_outs: Number(row.opt_outs ?? 0),
    failures: Number(row.failures ?? 0),
  };
}

export interface CampaignWeekRow {
  campaignId: string;
  name: string;
  status: string;
  sends: number;
  clicks: number;
  clickRate: number;
  replies: number;
  bookings: number;
}

/** Per-campaign breakdown for the week, sorted by volume. */
export async function getCampaignBreakdown(
  workspaceId: string,
  range: WeekRange
): Promise<CampaignWeekRow[]> {
  const db = adminDb();

  const [{ data: campaigns }, { data: events }] = await Promise.all([
    db
      .from('campaigns')
      .select('id, name, status')
      .eq('workspace_id', workspaceId)
      .in('status', ['active', 'paused', 'completed', 'launching']),
    db
      .from('engagement_events')
      .select('campaign_id, event_type, contact_id')
      .eq('workspace_id', workspaceId)
      .gte('occurred_at', range.start.toISOString())
      .lt('occurred_at', range.end.toISOString())
      .in('event_type', ['message_sent', 'link_clicked', 'reply_received', 'booking_created'])
      .limit(50_000),
  ]);

  const tally = new Map<string, { sends: number; clicks: number; clickers: Set<string>; replies: number; bookings: number }>();

  for (const event of (events ?? []) as {
    campaign_id: string | null;
    event_type: string;
    contact_id: string | null;
  }[]) {
    if (!event.campaign_id) continue;

    const row =
      tally.get(event.campaign_id) ??
      { sends: 0, clicks: 0, clickers: new Set<string>(), replies: 0, bookings: 0 };

    if (event.event_type === 'message_sent') row.sends++;
    if (event.event_type === 'link_clicked') {
      row.clicks++;
      if (event.contact_id) row.clickers.add(event.contact_id);
    }
    if (event.event_type === 'reply_received') row.replies++;
    if (event.event_type === 'booking_created') row.bookings++;

    tally.set(event.campaign_id, row);
  }

  return ((campaigns ?? []) as { id: string; name: string; status: string }[])
    .map((campaign) => {
      const row = tally.get(campaign.id);
      const sends = row?.sends ?? 0;
      const clicks = row?.clicks ?? 0;

      return {
        campaignId: campaign.id,
        name: campaign.name,
        status: campaign.status,
        sends,
        clicks,
        // Unique clickers over sends: the honest version of "click rate".
        clickRate: sends > 0 ? (row?.clickers.size ?? 0) / sends : 0,
        replies: row?.replies ?? 0,
        bookings: row?.bookings ?? 0,
      };
    })
    .sort((a, b) => b.sends - a.sends);
}

export interface TrendPoint {
  label: string;
  sends: number;
  clicks: number;
}

/** Week-over-week sends and clicks, oldest first. */
export async function getTrend(workspaceId: string, weeks = 8): Promise<TrendPoint[]> {
  const oldest = weekRange(-(weeks - 1));
  const newest = weekRange(0);

  const { data } = await adminDb()
    .from('engagement_events')
    .select('event_type, occurred_at')
    .eq('workspace_id', workspaceId)
    .gte('occurred_at', oldest.start.toISOString())
    .lt('occurred_at', newest.end.toISOString())
    .in('event_type', ['message_sent', 'link_clicked'])
    .limit(100_000);

  const buckets: TrendPoint[] = [];
  const index = new Map<number, number>();

  for (let i = weeks - 1; i >= 0; i--) {
    const range = weekRange(-i);
    index.set(range.start.getTime(), buckets.length);
    buckets.push({ label: range.label, sends: 0, clicks: 0 });
  }

  for (const event of (data ?? []) as { event_type: string; occurred_at: string }[]) {
    const at = new Date(event.occurred_at);
    const isoDay = at.getUTCDay() === 0 ? 7 : at.getUTCDay();
    const weekStart = Date.UTC(
      at.getUTCFullYear(),
      at.getUTCMonth(),
      at.getUTCDate() - (isoDay - 1)
    );

    const position = index.get(weekStart);
    if (position === undefined) continue;

    if (event.event_type === 'message_sent') buckets[position].sends++;
    else buckets[position].clicks++;
  }

  return buckets;
}

// ---------------------------------------------------------------------------
// Agency rollup
// ---------------------------------------------------------------------------

export type HealthFlag =
  | 'ok'
  | 'not_provisioned'
  | 'behind_schedule'
  | 'webhook_failures'
  | 'high_opt_out';

export const HEALTH_LABELS: Record<HealthFlag, string> = {
  ok: 'Healthy',
  not_provisioned: 'Sub-account not provisioned',
  behind_schedule: 'Behind schedule',
  webhook_failures: 'Webhook failures',
  high_opt_out: 'High opt-out rate',
};

export interface AgencyRow {
  workspaceId: string;
  slug: string;
  name: string;
  status: string;
  committed: number;
  sent: number;
  clicks: number;
  replies: number;
  bookings: number;
  optOuts: number;
  optOutRate: number;
  overdue: number;
  webhookFailures: number;
  health: HealthFlag;
}

/** Opt-out rate above this is treated as a problem with the copy or the list. */
const OPT_OUT_ALARM = 0.03;
/** Messages more than an hour past due mean the dispatcher is not keeping up. */
const OVERDUE_GRACE_MS = 60 * 60 * 1000;

export async function getAgencyRollup(range: WeekRange): Promise<AgencyRow[]> {
  const db = adminDb();

  const { data: workspaces } = await db
    .from('workspaces')
    .select('id, slug, name, status, ghl_location_id')
    .neq('status', 'churned')
    .order('name');

  const rows = (workspaces ?? []) as {
    id: string;
    slug: string;
    name: string;
    status: string;
    ghl_location_id: string | null;
  }[];

  if (rows.length === 0) return [];

  const workspaceIds = rows.map((w) => w.id);
  const overdueBefore = new Date(Date.now() - OVERDUE_GRACE_MS).toISOString();

  const [{ data: events }, { data: overdue }, { data: webhookFailures }] = await Promise.all([
    db
      .from('engagement_events')
      .select('workspace_id, event_type')
      .in('workspace_id', workspaceIds)
      .gte('occurred_at', range.start.toISOString())
      .lt('occurred_at', range.end.toISOString())
      .in('event_type', [
        'message_scheduled',
        'message_sent',
        'link_clicked',
        'reply_received',
        'booking_created',
        'opted_out',
      ])
      .limit(200_000),
    db
      .from('outreach_messages')
      .select('workspace_id')
      .in('workspace_id', workspaceIds)
      .eq('status', 'scheduled')
      .lt('scheduled_for', overdueBefore)
      .limit(50_000),
    db
      .from('inbound_webhooks')
      .select('workspace_id')
      .in('status', ['failed', 'dead_letter'])
      .gte('received_at', range.start.toISOString())
      .limit(5000),
  ]);

  const tally = new Map<string, Record<string, number>>();
  for (const event of (events ?? []) as { workspace_id: string; event_type: string }[]) {
    const bucket = tally.get(event.workspace_id) ?? {};
    bucket[event.event_type] = (bucket[event.event_type] ?? 0) + 1;
    tally.set(event.workspace_id, bucket);
  }

  const overdueCounts = countBy((overdue ?? []) as { workspace_id: string }[]);
  const failureCounts = countBy(
    ((webhookFailures ?? []) as { workspace_id: string | null }[]).filter(
      (row): row is { workspace_id: string } => Boolean(row.workspace_id)
    )
  );

  return rows.map((workspace) => {
    const bucket = tally.get(workspace.id) ?? {};
    const sent = bucket.message_sent ?? 0;
    const optOuts = bucket.opted_out ?? 0;
    const optOutRate = sent > 0 ? optOuts / sent : 0;
    const overdueCount = overdueCounts.get(workspace.id) ?? 0;
    const webhookFailureCount = failureCounts.get(workspace.id) ?? 0;

    let health: HealthFlag = 'ok';
    if (!workspace.ghl_location_id) health = 'not_provisioned';
    else if (webhookFailureCount > 0) health = 'webhook_failures';
    else if (overdueCount > 0) health = 'behind_schedule';
    else if (optOutRate > OPT_OUT_ALARM) health = 'high_opt_out';

    return {
      workspaceId: workspace.id,
      slug: workspace.slug,
      name: workspace.name,
      status: workspace.status,
      committed: (bucket.message_scheduled ?? 0) + sent,
      sent,
      clicks: bucket.link_clicked ?? 0,
      replies: bucket.reply_received ?? 0,
      bookings: bucket.booking_created ?? 0,
      optOuts,
      optOutRate,
      overdue: overdueCount,
      webhookFailures: webhookFailureCount,
      health,
    };
  });
}

function countBy(rows: { workspace_id: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.workspace_id, (counts.get(row.workspace_id) ?? 0) + 1);
  }
  return counts;
}
