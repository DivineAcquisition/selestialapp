import { AppShell } from '@/components/v2/AppShell';
import { Badge, Card, EmptyState, formatDateTime } from '@/components/v2/Primitives';
import { adminDb } from '@/lib/v2/db';
import { workspaceNav } from '@/lib/v2/nav';
import type { WorkspaceActivity } from '@/lib/v2/types';
import { listWorkspaces, requireWorkspace } from '@/lib/v2/workspace';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 100;

/** Groups the action keys into the buckets the filter offers. */
const CATEGORIES: { key: string; label: string; prefixes: string[] }[] = [
  { key: 'all', label: 'Everything', prefixes: [] },
  { key: 'campaign', label: 'Campaigns', prefixes: ['campaign.'] },
  { key: 'list', label: 'Lists', prefixes: ['list.'] },
  { key: 'provisioning', label: 'Provisioning', prefixes: ['provisioning.', 'ghl.'] },
  { key: 'contact', label: 'Contacts', prefixes: ['contact.'] },
  { key: 'webhook', label: 'Webhooks', prefixes: ['webhook.'] },
];

function toneFor(action: string): 'green' | 'amber' | 'red' | 'violet' | 'neutral' {
  if (action.includes('failed') || action.includes('opted_out')) return 'red';
  if (action.startsWith('campaign.launched') || action.includes('completed')) return 'green';
  if (action.startsWith('campaign.generated') || action.startsWith('campaign.regenerated')) {
    return 'violet';
  }
  if (action.startsWith('provisioning.')) return 'amber';
  return 'neutral';
}

/**
 * The activity log — the self-documentation layer. Every consequential action writes a
 * plain-English row here, which doubles as the debugging trail and as client-facing
 * proof of work.
 */
export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { slug } = await params;
  const { category = 'all' } = await searchParams;

  const [{ workspace, viewer }, workspaces] = await Promise.all([
    requireWorkspace(slug),
    listWorkspaces(),
  ]);

  let query = adminDb()
    .from('workspace_activity')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  const selected = CATEGORIES.find((c) => c.key === category);
  if (selected && selected.prefixes.length > 0) {
    query = query.or(selected.prefixes.map((prefix) => `action.like.${prefix}*`).join(','));
  }

  const { data } = await query;
  const entries = (data ?? []) as WorkspaceActivity[];

  return (
    <AppShell
      workspaces={workspaces}
      current={workspace}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={workspaceNav(slug)}
      pathname={`/w/${slug}/activity`}
      docsHref="/docs/activity-log"
      title="Activity"
      subtitle="Everything Selestial did in this workspace, in order."
    >
      <div className="mb-4 flex flex-wrap gap-1">
        {CATEGORIES.map((option) => (
          <a
            key={option.key}
            href={`/w/${slug}/activity${option.key === 'all' ? '' : `?category=${option.key}`}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              category === option.key
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {option.label}
          </a>
        ))}
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="Nothing logged yet"
          description="Imports, campaign generation, launches, provisioning steps and webhook processing all appear here as they happen."
        />
      ) : (
        <Card>
          <ol className="divide-y divide-zinc-50">
            {entries.map((entry) => (
              <li key={entry.id} className="px-5 py-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={toneFor(entry.action)}>{entry.action}</Badge>
                    <span className="text-xs text-zinc-400">
                      {entry.actor_type === 'user'
                        ? 'operator'
                        : entry.actor_type === 'webhook'
                          ? 'webhook'
                          : 'system'}
                    </span>
                  </div>
                  <time className="text-xs text-zinc-400">{formatDateTime(entry.created_at)}</time>
                </div>

                <p className="mt-1.5 text-sm text-zinc-700">{entry.summary}</p>

                {Object.keys(entry.metadata ?? {}).length > 0 ? (
                  <details className="mt-1.5">
                    <summary className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-600">
                      Details
                    </summary>
                    <pre className="mt-1.5 overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </li>
            ))}
          </ol>
        </Card>
      )}
    </AppShell>
  );
}
