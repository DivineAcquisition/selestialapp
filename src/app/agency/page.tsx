import Link from 'next/link';

import { AppShell } from '@/components/v2/AppShell';
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  Stat,
  percent,
} from '@/components/v2/Primitives';
import { getAgencyRollup, HEALTH_LABELS, weekRange, type HealthFlag } from '@/lib/v2/metrics';
import { agencyNav } from '@/lib/v2/nav';
import { listWorkspaces, requireAgencyAdmin } from '@/lib/v2/workspace';

export const dynamic = 'force-dynamic';

const HEALTH_TONE: Record<HealthFlag, 'green' | 'amber' | 'red' | 'neutral'> = {
  ok: 'green',
  not_provisioned: 'neutral',
  behind_schedule: 'amber',
  webhook_failures: 'red',
  high_opt_out: 'red',
};

/**
 * Cross-workspace rollup: one row per client, this week's numbers, and a health flag
 * that says what to go look at.
 */
export default async function AgencyDashboard({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const offset = Math.max(-52, Math.min(0, Number(week ?? 0) || 0));
  const range = weekRange(offset);

  const [viewer, workspaces, rows] = await Promise.all([
    requireAgencyAdmin(),
    listWorkspaces(),
    getAgencyRollup(range),
  ]);

  const totals = rows.reduce(
    (acc, row) => ({
      committed: acc.committed + row.committed,
      sent: acc.sent + row.sent,
      clicks: acc.clicks + row.clicks,
      replies: acc.replies + row.replies,
      bookings: acc.bookings + row.bookings,
    }),
    { committed: 0, sent: 0, clicks: 0, replies: 0, bookings: 0 }
  );

  const needsAttention = rows.filter((row) => row.health !== 'ok');

  return (
    <AppShell
      workspaces={workspaces}
      current={null}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={agencyNav()}
      pathname="/agency"
      docsHref="/docs/metrics"
      title="All clients"
      subtitle={range.label}
      actions={<ButtonLink href="/agency/onboard">Onboard a client</ButtonLink>}
    >
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Clients" value={rows.length} />
        <Stat label="Outreach committed" value={totals.committed.toLocaleString()} />
        <Stat label="Sent" value={totals.sent.toLocaleString()} />
        <Stat label="Clicks" value={totals.clicks.toLocaleString()} />
        <Stat
          label="Replies"
          value={totals.replies.toLocaleString()}
          tone={totals.replies > 0 ? 'positive' : 'default'}
        />
      </section>

      {needsAttention.length > 0 ? (
        <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">
            {needsAttention.length} client{needsAttention.length === 1 ? '' : 's'} need attention
          </p>
          <ul className="mt-1.5 space-y-0.5 text-sm text-amber-800">
            {needsAttention.map((row) => (
              <li key={row.workspaceId}>
                <Link href={`/w/${row.slug}`} className="font-medium underline-offset-2 hover:underline">
                  {row.name}
                </Link>{' '}
                — {HEALTH_LABELS[row.health].toLowerCase()}
                {row.overdue > 0 ? ` (${row.overdue} messages overdue)` : ''}
                {row.webhookFailures > 0 ? ` (${row.webhookFailures} webhook failures)` : ''}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        {rows.length === 0 ? (
          <EmptyState
            title="No clients yet"
            description="Onboarding a client creates their GoHighLevel sub-account, provisions the fields, tags and webhooks, and emails them an invite."
            action={<ButtonLink href="/agency/onboard">Onboard the first client</ButtonLink>}
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-5 py-2.5 font-medium">Client</th>
                    <th className="px-5 py-2.5 text-right font-medium">Committed</th>
                    <th className="px-5 py-2.5 text-right font-medium">Sent</th>
                    <th className="px-5 py-2.5 text-right font-medium">Clicks</th>
                    <th className="px-5 py-2.5 text-right font-medium">Replies</th>
                    <th className="px-5 py-2.5 text-right font-medium">Bookings</th>
                    <th className="px-5 py-2.5 text-right font-medium">Opt-out</th>
                    <th className="px-5 py-2.5 font-medium">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.workspaceId} className="border-b border-zinc-50 last:border-0">
                      <td className="px-5 py-3">
                        <Link
                          href={`/w/${row.slug}`}
                          className="font-medium text-zinc-900 hover:text-primary"
                        >
                          {row.name}
                        </Link>
                        {row.status !== 'active' ? (
                          <span className="ml-2">
                            <Badge tone="neutral">{row.status}</Badge>
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {row.committed.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{row.sent.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{row.clicks.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{row.replies.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {row.bookings.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {percent(row.optOutRate, row.sent)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={HEALTH_TONE[row.health]}>{HEALTH_LABELS[row.health]}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </AppShell>
  );
}
