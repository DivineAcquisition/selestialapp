import { notFound } from 'next/navigation';

import { AppShell } from '@/components/v2/AppShell';
import { Badge, Card, CardHeader, Stat, formatDateTime } from '@/components/v2/Primitives';
import { adminDb } from '@/lib/v2/db';
import { workspaceNav } from '@/lib/v2/nav';
import type { Campaign, CampaignTouch } from '@/lib/v2/types';
import { listWorkspaces, requireWorkspace } from '@/lib/v2/workspace';
import { CampaignControls } from './CampaignControls';
import { SequenceView } from './SequenceView';

export const dynamic = 'force-dynamic';

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string; campaignId: string }>;
}) {
  const { slug, campaignId } = await params;

  const [{ workspace, viewer, canWrite }, workspaces] = await Promise.all([
    requireWorkspace(slug),
    listWorkspaces(),
  ]);

  const db = adminDb();

  const { data: campaignRow } = await db
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('workspace_id', workspace.id)
    .maybeSingle();

  if (!campaignRow) notFound();
  const campaign = campaignRow as Campaign;

  const [{ data: touchRows }, { data: enrollmentRows }, { data: messageRows }] = await Promise.all([
    db
      .from('campaign_touches')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('version', campaign.sequence_version)
      .order('step_index'),
    db.from('campaign_enrollments').select('status').eq('campaign_id', campaignId).limit(100_000),
    db.from('outreach_messages').select('status').eq('campaign_id', campaignId).limit(200_000),
  ]);

  const touches = (touchRows ?? []) as CampaignTouch[];
  const enrollments = tally((enrollmentRows ?? []) as { status: string }[]);
  const messages = tally((messageRows ?? []) as { status: string }[]);

  const meta = campaign.generation_meta ?? {};
  const sent = (messages.sent ?? 0) + (messages.delivered ?? 0);

  return (
    <AppShell
      workspaces={workspaces}
      current={workspace}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={workspaceNav(slug)}
      pathname={`/w/${slug}/campaigns`}
      docsHref="/docs/campaign-generation"
      title={campaign.name}
      subtitle={meta.angle ?? `${campaign.kind} campaign`}
      actions={
        <CampaignControls
          slug={slug}
          campaignId={campaignId}
          status={campaign.status}
          canWrite={canWrite}
          hasSequence={touches.length > 0}
        />
      }
    >
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Contacts" value={(enrollments.total ?? 0).toLocaleString()} />
        <Stat label="Still in sequence" value={(enrollments.active ?? 0).toLocaleString()} />
        <Stat label="Scheduled" value={(messages.scheduled ?? 0).toLocaleString()} />
        <Stat label="Sent" value={sent.toLocaleString()} />
        <Stat
          label="Exited"
          value={((enrollments.exited ?? 0) + (enrollments.completed ?? 0)).toLocaleString()}
          hint="Replied, booked or opted out"
        />
      </section>

      {campaign.generation_error ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong className="font-medium">Generation fell back to the built-in sequence.</strong>{' '}
          {campaign.generation_error} Regenerate once the cause is fixed.
        </div>
      ) : null}

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SequenceView slug={slug} campaignId={campaignId} touches={touches} canWrite={canWrite} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Schedule" />
            <dl className="divide-y divide-zinc-100 text-sm">
              <Row
                label="Send window"
                value={`${formatHour(campaign.send_window_start)} – ${formatHour(
                  campaign.send_window_end
                )} contact local time`}
              />
              <Row label="Send days" value={formatDays(campaign.send_days)} />
              <Row label="Daily cap" value={`${campaign.daily_cap.toLocaleString()} contacts/day`} />
              <Row label="Channels" value={campaign.channel_mix} />
              <Row
                label="Launched"
                value={campaign.launched_at ? formatDateTime(campaign.launched_at) : 'Not yet'}
              />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Provenance" description="What produced this copy." />
            <dl className="divide-y divide-zinc-100 text-sm">
              <Row label="Model" value={meta.model ?? '—'} />
              <Row label="Prompt version" value={meta.promptVersion ?? '—'} />
              <Row label="Template version" value={`v${campaign.sequence_version}`} />
              <Row label="Touches" value={String(touches.length)} />
              <Row label="Spans" value={meta.spanDays ? `${meta.spanDays} days` : '—'} />
              <Row
                label="Generated"
                value={meta.generatedAt ? formatDateTime(meta.generatedAt) : '—'}
              />
              {meta.fallback ? (
                <div className="px-5 py-3">
                  <Badge tone="amber">Built-in fallback copy</Badge>
                </div>
              ) : null}
            </dl>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

function tally(rows: { status: string }[]): Record<string, number> {
  const counts: Record<string, number> = { total: rows.length };
  for (const row of rows) counts[row.status] = (counts[row.status] ?? 0) + 1;
  return counts;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-2.5">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-zinc-800">{value}</dd>
    </div>
  );
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return '12am';
  if (hour === 12) return '12pm';
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatDays(days: number[]): string {
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && days.every((d) => d <= 5)) return 'Weekdays';
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => DAY_NAMES[d - 1] ?? d)
    .join(', ');
}
