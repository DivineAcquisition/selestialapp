import { AppShell } from '@/components/v2/AppShell';
import { Card, EmptyState, Stat } from '@/components/v2/Primitives';
import { adminDb } from '@/lib/v2/db';
import { daysAgoIso } from '@/lib/v2/metrics';
import { agencyNav } from '@/lib/v2/nav';
import type { InboundWebhook } from '@/lib/v2/types';
import { listWorkspaces, requireAgencyAdmin } from '@/lib/v2/workspace';
import { WebhookQueue } from './WebhookQueue';

export const dynamic = 'force-dynamic';

/**
 * The dead-letter screen. Nothing that arrives is ever dropped silently, so this is
 * where a payload that failed processing waits for a human.
 */
export default async function WebhookQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = 'problems' } = await searchParams;

  const [viewer, workspaces] = await Promise.all([requireAgencyAdmin(), listWorkspaces()]);
  const db = adminDb();

  let query = db
    .from('inbound_webhooks')
    .select('*')
    .order('received_at', { ascending: false })
    .limit(100);

  if (status === 'problems') query = query.in('status', ['failed', 'dead_letter']);
  else if (status !== 'all') query = query.eq('status', status);

  const [{ data: rows }, { data: recent }] = await Promise.all([
    query,
    db
      .from('inbound_webhooks')
      .select('status')
      .gte('received_at', daysAgoIso(7))
      .limit(20_000),
  ]);

  const webhooks = (rows ?? []) as InboundWebhook[];

  const counts = { processed: 0, failed: 0, dead_letter: 0, ignored: 0, received: 0 } as Record<
    string,
    number
  >;
  for (const row of (recent ?? []) as { status: string }[]) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  const filters = [
    { key: 'problems', label: 'Needs attention' },
    { key: 'dead_letter', label: 'Dead letter' },
    { key: 'processed', label: 'Processed' },
    { key: 'ignored', label: 'Ignored' },
    { key: 'all', label: 'Everything' },
  ];

  return (
    <AppShell
      workspaces={workspaces}
      current={null}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={agencyNav()}
      pathname="/agency/webhooks"
      docsHref="/docs/troubleshooting"
      title="Webhook queue"
      subtitle="Last 7 days. Failed payloads are retryable and never discarded automatically."
    >
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Processed" value={(counts.processed ?? 0).toLocaleString()} />
        <Stat
          label="Failed"
          value={(counts.failed ?? 0).toLocaleString()}
          tone={counts.failed > 0 ? 'warning' : 'default'}
        />
        <Stat
          label="Dead letter"
          value={(counts.dead_letter ?? 0).toLocaleString()}
          tone={counts.dead_letter > 0 ? 'warning' : 'default'}
        />
        <Stat label="Ignored" value={(counts.ignored ?? 0).toLocaleString()} />
      </section>

      <div className="mt-6 mb-4 flex flex-wrap gap-1">
        {filters.map((filter) => (
          <a
            key={filter.key}
            href={`/agency/webhooks?status=${filter.key}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              status === filter.key ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {filter.label}
          </a>
        ))}
      </div>

      {webhooks.length === 0 ? (
        <EmptyState
          title="Nothing here"
          description={
            status === 'problems'
              ? 'No webhook has failed processing. Replies, clicks and bookings are flowing.'
              : 'No webhooks match this filter.'
          }
        />
      ) : (
        <Card>
          <WebhookQueue webhooks={webhooks} />
        </Card>
      )}
    </AppShell>
  );
}
