import Link from 'next/link';

import { AppShell } from '@/components/v2/AppShell';
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ButtonLink,
  Stat,
  percent,
} from '@/components/v2/Primitives';
import { workspaceNav } from '@/lib/v2/nav';
import {
  getCampaignBreakdown,
  getTrend,
  getWeekStats,
  weekRange,
} from '@/lib/v2/metrics';
import { listWorkspaces, requireWorkspace } from '@/lib/v2/workspace';

export const dynamic = 'force-dynamic';

/**
 * The weekly workspace dashboard: what we committed to send this week, and who engaged.
 * Every figure is a count from the events table — nothing is estimated or extrapolated.
 */
export default async function WorkspaceDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { slug } = await params;
  const { week } = await searchParams;

  const [{ workspace, viewer }, workspaces] = await Promise.all([
    requireWorkspace(slug),
    listWorkspaces(),
  ]);

  const offset = clampOffset(week);
  const range = weekRange(offset);

  const [stats, campaigns, trend] = await Promise.all([
    getWeekStats(workspace.id, range),
    getCampaignBreakdown(workspace.id, range),
    getTrend(workspace.id, 8),
  ]);

  const totalSent = stats.sms_sent + stats.email_sent;
  const committed = stats.scheduled + totalSent;

  return (
    <AppShell
      workspaces={workspaces}
      current={workspace}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={workspaceNav(slug)}
      pathname={`/w/${slug}`}
      docsHref="/docs/metrics"
      title="This week"
      subtitle={`${range.label} · ${workspace.name}`}
      actions={<WeekPicker slug={slug} offset={offset} />}
    >
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Outreach committed"
          value={committed.toLocaleString()}
          hint={`${stats.scheduled.toLocaleString()} scheduled · ${totalSent.toLocaleString()} sent`}
        />
        <Stat
          label="Sent"
          value={totalSent.toLocaleString()}
          hint={`${stats.sms_sent.toLocaleString()} SMS · ${stats.email_sent.toLocaleString()} email`}
        />
        <Stat
          label="Delivered"
          value={stats.delivered.toLocaleString()}
          hint={
            stats.failures > 0
              ? `${stats.failures.toLocaleString()} failed`
              : 'No delivery failures'
          }
          tone={stats.failures > 0 ? 'warning' : 'default'}
        />
        <Stat
          label="Links clicked"
          value={stats.clicks.toLocaleString()}
          hint={`${stats.unique_clickers.toLocaleString()} unique contacts`}
        />
      </section>

      <section className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Attachment views" value={stats.attachment_views.toLocaleString()} />
        <Stat
          label="Replies"
          value={stats.replies.toLocaleString()}
          tone={stats.replies > 0 ? 'positive' : 'default'}
        />
        <Stat
          label="Bookings"
          value={stats.bookings.toLocaleString()}
          tone={stats.bookings > 0 ? 'positive' : 'default'}
        />
        <Stat
          label="Opt-outs"
          value={stats.opt_outs.toLocaleString()}
          hint={totalSent > 0 ? `${percent(stats.opt_outs / totalSent, 1)} of sends` : undefined}
          tone={totalSent > 0 && stats.opt_outs / totalSent > 0.03 ? 'warning' : 'default'}
        />
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader
            title="By campaign"
            description="Sends, clicks, replies and bookings inside this week only."
          />
          {campaigns.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Nothing has gone out this week"
                description="Upload a list, pick a campaign, and launch. Selestial writes the messages."
                action={<ButtonLink href={`/w/${slug}/campaigns/new`}>Start a campaign</ButtonLink>}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-5 py-2.5 font-medium">Campaign</th>
                    <th className="px-5 py-2.5 text-right font-medium">Sends</th>
                    <th className="px-5 py-2.5 text-right font-medium">Clicks</th>
                    <th className="px-5 py-2.5 text-right font-medium">Click rate</th>
                    <th className="px-5 py-2.5 text-right font-medium">Replies</th>
                    <th className="px-5 py-2.5 text-right font-medium">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((row) => (
                    <tr key={row.campaignId} className="border-b border-zinc-50 last:border-0">
                      <td className="px-5 py-3">
                        <Link
                          href={`/w/${slug}/campaigns/${row.campaignId}`}
                          className="font-medium text-zinc-900 hover:text-primary"
                        >
                          {row.name}
                        </Link>
                        <span className="ml-2">
                          <Badge tone={row.status === 'active' ? 'green' : 'neutral'}>
                            {row.status}
                          </Badge>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{row.sends.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{row.clicks.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {percent(row.clickRate, row.sends)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{row.replies.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{row.bookings.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader title="Sends and clicks, last 8 weeks" />
          <div className="p-5">
            <TrendChart points={trend} />
          </div>
        </Card>
      </section>
    </AppShell>
  );
}

function clampOffset(value: string | undefined): number {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return 0;
  // Only the past and the current week; there is nothing to show in the future.
  return Math.max(-52, Math.min(0, Math.round(parsed)));
}

function WeekPicker({ slug, offset }: { slug: string; offset: number }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1">
      <Link
        href={`/w/${slug}?week=${offset - 1}`}
        className="rounded px-2.5 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
        aria-label="Previous week"
      >
        ←
      </Link>
      <Link
        href={`/w/${slug}`}
        className="rounded px-2.5 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
      >
        This week
      </Link>
      <Link
        href={offset < 0 ? `/w/${slug}?week=${offset + 1}` : `/w/${slug}`}
        aria-disabled={offset >= 0}
        className={`rounded px-2.5 py-1 text-sm ${
          offset >= 0 ? 'pointer-events-none text-zinc-300' : 'text-zinc-600 hover:bg-zinc-100'
        }`}
        aria-label="Next week"
      >
        →
      </Link>
    </div>
  );
}

/**
 * A plain CSS bar chart. Two series over eight points does not justify pulling a charting
 * library into a server component, and this renders with no client JavaScript at all.
 */
function TrendChart({ points }: { points: { label: string; sends: number; clicks: number }[] }) {
  const max = Math.max(1, ...points.map((p) => p.sends));

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: 140 }}>
        {points.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-1/3 rounded-t bg-primary/80"
                style={{ height: `${(point.sends / max) * 100}%`, minHeight: point.sends > 0 ? 3 : 0 }}
                title={`${point.sends} sends`}
              />
              <div
                className="w-1/3 rounded-t bg-primary/30"
                style={{ height: `${(point.clicks / max) * 100}%`, minHeight: point.clicks > 0 ? 3 : 0 }}
                title={`${point.clicks} clicks`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        {points.map((point) => (
          <div key={point.label} className="flex-1 text-center text-[10px] text-zinc-400">
            {point.label.split('–')[0].trim()}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-primary/80" /> Sends
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-primary/30" /> Clicks
        </span>
      </div>
    </div>
  );
}
