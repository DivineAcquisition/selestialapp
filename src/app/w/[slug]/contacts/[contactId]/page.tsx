import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AppShell } from '@/components/v2/AppShell';
import {
  Badge,
  Card,
  CardHeader,
  Stat,
  formatDate,
  formatDateTime,
} from '@/components/v2/Primitives';
import { buildTimeline } from '@/lib/v2/case-file';
import { adminDb } from '@/lib/v2/db';
import { workspaceNav } from '@/lib/v2/nav';
import { describeDormancy } from '@/lib/v2/normalize';
import type { Contact, ContactStatus } from '@/lib/v2/types';
import { listWorkspaces, requireWorkspace } from '@/lib/v2/workspace';
import { CaseFileControls } from './CaseFileControls';
import { Timeline } from './Timeline';

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<ContactStatus, 'green' | 'amber' | 'neutral' | 'red' | 'violet'> = {
  active: 'green',
  booked: 'violet',
  opted_out: 'red',
  do_not_contact: 'red',
  bounced: 'amber',
};

export default async function CaseFilePage({
  params,
}: {
  params: Promise<{ slug: string; contactId: string }>;
}) {
  const { slug, contactId } = await params;

  const [{ workspace, viewer, canWrite }, workspaces] = await Promise.all([
    requireWorkspace(slug),
    listWorkspaces(),
  ]);

  const db = adminDb();

  const { data: contactRow } = await db
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .eq('workspace_id', workspace.id)
    .maybeSingle();

  if (!contactRow) notFound();
  const contact = contactRow as Contact;

  const [timeline, { data: enrollments }, { data: sourceList }] = await Promise.all([
    buildTimeline(contactId),
    db
      .from('campaign_enrollments')
      .select('id, status, current_step, exit_reason, enrolled_at, campaign_id')
      .eq('contact_id', contactId)
      .order('enrolled_at', { ascending: false }),
    contact.source_list_id
      ? db.from('contact_lists').select('id, name, created_at').eq('id', contact.source_list_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const campaignIds = (enrollments ?? []).map((e) => e.campaign_id as string);
  const { data: campaignRows } = campaignIds.length
    ? await db.from('campaigns').select('id, name').in('id', campaignIds)
    : { data: [] };

  const campaignNames = new Map(
    ((campaignRows ?? []) as { id: string; name: string }[]).map((c) => [c.id, c.name])
  );

  const messageCount = timeline.filter((entry) => entry.kind === 'message').length;
  const engagementCount = timeline.filter(
    (entry) =>
      entry.kind === 'event' &&
      ['Opened the email', 'Clicked a link', 'Opened an attachment', 'Replied', 'Booked'].includes(
        entry.title
      )
  ).length;

  return (
    <AppShell
      workspaces={workspaces}
      current={workspace}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={workspaceNav(slug)}
      pathname={`/w/${slug}/contacts`}
      docsHref="/docs/case-files"
      title={contact.full_name || contact.email || contact.phone || 'Unnamed contact'}
      subtitle={`${describeDormancy(contact.last_service_date)}${
        contact.service_type ? ` · ${contact.service_type}` : ''
      }`}
      actions={
        <CaseFileControls
          slug={slug}
          contactId={contactId}
          status={contact.status}
          canWrite={canWrite}
        />
      }
    >
      <div className="mb-4">
        <Link href={`/w/${slug}/contacts`} className="text-sm text-zinc-500 hover:text-primary">
          ← All contacts
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Engagement score"
          value={contact.engagement_score}
          hint={contact.engagement_tier}
          tone={contact.engagement_score >= 50 ? 'positive' : 'default'}
        />
        <Stat label="Messages sent" value={messageCount} />
        <Stat label="Engagement signals" value={engagementCount} />
        <Stat label="Last engaged" value={formatDate(contact.last_engagement_at)} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader
              title="Where this stands"
              description="Regenerated automatically when something meaningful happens."
            />
            <div className="px-5 py-4">
              {contact.ai_summary ? (
                <>
                  <p className="text-sm leading-relaxed text-zinc-700">{contact.ai_summary}</p>
                  <p className="mt-3 text-xs text-zinc-400">
                    Updated {formatDateTime(contact.ai_summary_updated_at)}
                    {contact.ai_summary_stale ? ' · new activity since, refresh pending' : ''}
                  </p>
                </>
              ) : (
                <p className="text-sm text-zinc-500">
                  No summary yet. It is written once this contact has some history.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Timeline"
              description="Every message with the copy that actually went out, plus every event."
            />
            <Timeline entries={timeline} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Identity" />
            <dl className="divide-y divide-zinc-100 text-sm">
              <Row label="Status">
                <Badge tone={STATUS_TONE[contact.status]}>
                  {contact.status.replace(/_/g, ' ')}
                </Badge>
              </Row>
              <Row label="Email">{contact.email ?? '—'}</Row>
              <Row label="Phone">{contact.phone ?? '—'}</Row>
              <Row label="City">
                {[contact.city, contact.state].filter(Boolean).join(', ') || '—'}
              </Row>
              <Row label="Last service">{formatDate(contact.last_service_date)}</Row>
              <Row label="Service type">{contact.service_type ?? '—'}</Row>
              <Row label="Lifetime value">
                {contact.lifetime_value_cents
                  ? `$${(contact.lifetime_value_cents / 100).toLocaleString()}`
                  : '—'}
              </Row>
              <Row label="Source list">
                {sourceList ? (
                  <span title={formatDate(sourceList.created_at as string)}>
                    {sourceList.name as string}
                  </span>
                ) : (
                  '—'
                )}
              </Row>
              <Row label="In GoHighLevel">{contact.ghl_contact_id ? 'Mirrored' : 'Not yet'}</Row>
              {contact.opted_out_at ? (
                <Row label="Opted out">
                  {formatDate(contact.opted_out_at)}
                  {contact.opted_out_reason ? ` · ${contact.opted_out_reason}` : ''}
                </Row>
              ) : null}
            </dl>
          </Card>

          {Object.keys(contact.custom_fields ?? {}).length > 0 ? (
            <Card>
              <CardHeader title="From the import" description="Columns we did not map." />
              <dl className="divide-y divide-zinc-100 text-sm">
                {Object.entries(contact.custom_fields).map(([key, value]) => (
                  <Row key={key} label={key}>
                    {String(value)}
                  </Row>
                ))}
              </dl>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Campaigns" />
            {(enrollments ?? []).length === 0 ? (
              <p className="px-5 py-4 text-sm text-zinc-500">Not in any campaign.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {(enrollments ?? []).map((enrollment) => (
                  <li key={enrollment.id as string} className="px-5 py-3">
                    <Link
                      href={`/w/${slug}/campaigns/${enrollment.campaign_id}`}
                      className="text-sm font-medium text-zinc-900 hover:text-primary"
                    >
                      {campaignNames.get(enrollment.campaign_id as string) ?? 'Campaign'}
                    </Link>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {enrollment.status === 'active'
                        ? `In sequence · touch ${(enrollment.current_step as number) + 2} next`
                        : ((enrollment.exit_reason as string) ?? (enrollment.status as string))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-2.5">
      <dt className="shrink-0 text-xs text-zinc-500">{label}</dt>
      <dd className="min-w-0 break-words text-right text-sm text-zinc-800">{children}</dd>
    </div>
  );
}
