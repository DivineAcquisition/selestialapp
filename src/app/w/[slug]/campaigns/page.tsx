import Link from 'next/link';

import { AppShell } from '@/components/v2/AppShell';
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  formatDate,
} from '@/components/v2/Primitives';
import { adminDb } from '@/lib/v2/db';
import { workspaceNav } from '@/lib/v2/nav';
import type { Campaign, CampaignState } from '@/lib/v2/types';
import { listWorkspaces, requireWorkspace } from '@/lib/v2/workspace';

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<CampaignState, 'green' | 'amber' | 'neutral' | 'red' | 'violet' | 'blue'> = {
  draft: 'neutral',
  generating: 'violet',
  ready: 'blue',
  launching: 'violet',
  active: 'green',
  paused: 'amber',
  completed: 'neutral',
  failed: 'red',
};

export default async function CampaignsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [{ workspace, viewer }, workspaces] = await Promise.all([
    requireWorkspace(slug),
    listWorkspaces(),
  ]);

  const db = adminDb();

  const { data: campaignRows } = await db
    .from('campaigns')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: false });

  const campaigns = (campaignRows ?? []) as Campaign[];

  // One aggregate query rather than per-campaign counts, so the list stays fast as the
  // workspace accumulates campaigns.
  const { data: enrollmentRows } = await db
    .from('campaign_enrollments')
    .select('campaign_id, status')
    .eq('workspace_id', workspace.id)
    .limit(100_000);

  const counts = new Map<string, { total: number; active: number }>();
  for (const row of (enrollmentRows ?? []) as { campaign_id: string; status: string }[]) {
    const bucket = counts.get(row.campaign_id) ?? { total: 0, active: 0 };
    bucket.total++;
    if (row.status === 'active') bucket.active++;
    counts.set(row.campaign_id, bucket);
  }

  return (
    <AppShell
      workspaces={workspaces}
      current={workspace}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={workspaceNav(slug)}
      pathname={`/w/${slug}/campaigns`}
      docsHref="/docs/campaign-generation"
      title="Campaigns"
      subtitle="Upload a list, pick a campaign, launch. Selestial writes every message."
      actions={<ButtonLink href={`/w/${slug}/campaigns/new`}>New campaign</ButtonLink>}
    >
      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Start by uploading a dormant customer list. Selestial detects the columns, cleans the data, generates the whole sequence, and waits for you to hit launch."
          action={<ButtonLink href={`/w/${slug}/campaigns/new`}>Start a campaign</ButtonLink>}
        />
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const count = counts.get(campaign.id) ?? { total: 0, active: 0 };
            const meta = campaign.generation_meta ?? {};

            return (
              <Card key={campaign.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/w/${slug}/campaigns/${campaign.id}`}
                        className="text-base font-semibold text-zinc-900 hover:text-primary"
                      >
                        {campaign.name}
                      </Link>
                      <Badge tone={STATUS_TONE[campaign.status]}>{campaign.status}</Badge>
                      {meta.fallback ? <Badge tone="amber">fallback copy</Badge> : null}
                    </div>

                    {meta.angle ? (
                      <p className="mt-1.5 max-w-2xl text-sm text-zinc-600">{meta.angle}</p>
                    ) : null}

                    <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500">
                      <div>
                        <dt className="inline">Contacts: </dt>
                        <dd className="inline font-medium text-zinc-700">{count.total}</dd>
                      </div>
                      <div>
                        <dt className="inline">Still in sequence: </dt>
                        <dd className="inline font-medium text-zinc-700">{count.active}</dd>
                      </div>
                      <div>
                        <dt className="inline">Touches: </dt>
                        <dd className="inline font-medium text-zinc-700">{meta.touchCount ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="inline">Channels: </dt>
                        <dd className="inline font-medium text-zinc-700">{campaign.channel_mix}</dd>
                      </div>
                      <div>
                        <dt className="inline">
                          {campaign.launched_at ? 'Launched: ' : 'Created: '}
                        </dt>
                        <dd className="inline font-medium text-zinc-700">
                          {formatDate(campaign.launched_at ?? campaign.created_at)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <ButtonLink href={`/w/${slug}/campaigns/${campaign.id}`} variant="secondary">
                    Open
                  </ButtonLink>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
