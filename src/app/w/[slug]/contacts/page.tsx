import Link from 'next/link';

import { AppShell } from '@/components/v2/AppShell';
import { Badge, ButtonLink, EmptyState, formatDate } from '@/components/v2/Primitives';
import { adminDb } from '@/lib/v2/db';
import { workspaceNav } from '@/lib/v2/nav';
import { describeDormancy } from '@/lib/v2/normalize';
import type { Campaign, Contact, ContactStatus } from '@/lib/v2/types';
import { listWorkspaces, requireWorkspace } from '@/lib/v2/workspace';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

const STATUS_TONE: Record<ContactStatus, 'green' | 'amber' | 'neutral' | 'red' | 'violet'> = {
  active: 'green',
  booked: 'violet',
  opted_out: 'red',
  do_not_contact: 'red',
  bounced: 'amber',
};

const TIER_TONE: Record<string, 'green' | 'amber' | 'neutral' | 'blue' | 'violet'> = {
  ready: 'violet',
  hot: 'green',
  warm: 'blue',
  cool: 'amber',
  cold: 'neutral',
};

interface Filters {
  q?: string;
  status?: string;
  tier?: string;
  campaign?: string;
  dormancy?: string;
  page?: string;
}

export default async function ContactsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Filters>;
}) {
  const { slug } = await params;
  const filters = await searchParams;

  const [{ workspace, viewer }, workspaces] = await Promise.all([
    requireWorkspace(slug),
    listWorkspaces(),
  ]);

  const db = adminDb();
  const page = Math.max(0, Number(filters.page ?? 0) || 0);

  const { data: campaignRows } = await db
    .from('campaigns')
    .select('id, name')
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: false });

  const campaigns = (campaignRows ?? []) as Pick<Campaign, 'id' | 'name'>[];

  let query = db
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('workspace_id', workspace.id);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.tier) query = query.eq('engagement_tier', filters.tier);

  if (filters.q) {
    const needle = `%${filters.q.replace(/[%_]/g, '')}%`;
    query = query.or(`full_name.ilike.${needle},email.ilike.${needle},phone.ilike.${needle}`);
  }

  if (filters.dormancy) {
    const months = Number(filters.dormancy);
    if (Number.isFinite(months) && months > 0) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - months);
      query = query.lte('last_service_date', cutoff.toISOString().slice(0, 10));
    }
  }

  // Campaign filter has to resolve through enrollments; done as a separate lookup so
  // the main query stays a single indexed scan.
  if (filters.campaign) {
    const { data: enrolled } = await db
      .from('campaign_enrollments')
      .select('contact_id')
      .eq('campaign_id', filters.campaign)
      .limit(20_000);

    const ids = (enrolled ?? []).map((row) => row.contact_id as string);
    query = ids.length > 0 ? query.in('id', ids) : query.eq('id', '00000000-0000-0000-0000-000000000000');
  }

  const { data, count } = await query
    .order('engagement_score', { ascending: false })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  const contacts = (data ?? []) as Contact[];
  const total = count ?? 0;

  return (
    <AppShell
      workspaces={workspaces}
      current={workspace}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={workspaceNav(slug)}
      pathname={`/w/${slug}/contacts`}
      docsHref="/docs/case-files"
      title="Contacts"
      subtitle={`${total.toLocaleString()} contact${total === 1 ? '' : 's'} in this workspace`}
      actions={<ButtonLink href={`/w/${slug}/campaigns/new`}>Upload a list</ButtonLink>}
    >
      <form className="mb-4 flex flex-wrap gap-2" method="get">
        <input
          name="q"
          defaultValue={filters.q ?? ''}
          placeholder="Search name, email or phone"
          className="min-w-56 flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={filters.status ?? ''}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        >
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="booked">Booked</option>
          <option value="opted_out">Opted out</option>
          <option value="do_not_contact">Do not contact</option>
          <option value="bounced">Bounced</option>
        </select>
        <select
          name="tier"
          defaultValue={filters.tier ?? ''}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        >
          <option value="">Any engagement</option>
          <option value="ready">Ready</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cool">Cool</option>
          <option value="cold">Cold</option>
        </select>
        <select
          name="campaign"
          defaultValue={filters.campaign ?? ''}
          className="max-w-48 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        >
          <option value="">Any campaign</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
        <select
          name="dormancy"
          defaultValue={filters.dormancy ?? ''}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        >
          <option value="">Any dormancy</option>
          <option value="6">6+ months</option>
          <option value="12">12+ months</option>
          <option value="24">24+ months</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Filter
        </button>
        <Link
          href={`/w/${slug}/contacts`}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          Clear
        </Link>
      </form>

      {contacts.length === 0 ? (
        <EmptyState
          title="No contacts match"
          description="Adjust the filters, or upload a list to get started."
          action={<ButtonLink href={`/w/${slug}/campaigns/new`}>Upload a list</ButtonLink>}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-2.5 font-medium">Contact</th>
                  <th className="px-5 py-2.5 font-medium">Dormancy</th>
                  <th className="px-5 py-2.5 font-medium">Service</th>
                  <th className="px-5 py-2.5 text-right font-medium">Score</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Last engaged</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-zinc-50 last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        href={`/w/${slug}/contacts/${contact.id}`}
                        className="font-medium text-zinc-900 hover:text-primary"
                      >
                        {contact.full_name || contact.email || contact.phone || 'Unnamed'}
                      </Link>
                      <p className="text-xs text-zinc-500">
                        {[contact.email, contact.phone].filter(Boolean).join(' · ') || 'No contact details'}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-zinc-600">
                      {describeDormancy(contact.last_service_date)}
                    </td>
                    <td className="px-5 py-3 text-zinc-600">{contact.service_type ?? '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="tabular-nums font-medium text-zinc-900">
                        {contact.engagement_score}
                      </span>{' '}
                      <Badge tone={TIER_TONE[contact.engagement_tier] ?? 'neutral'}>
                        {contact.engagement_tier}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[contact.status]}>{contact.status.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-5 py-3 text-zinc-500">
                      {formatDate(contact.last_engagement_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination slug={slug} page={page} total={total} filters={filters} />
        </>
      )}
    </AppShell>
  );
}

function Pagination({
  slug,
  page,
  total,
  filters,
}: {
  slug: string;
  page: number;
  total: number;
  filters: Filters;
}) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;

  const link = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value && key !== 'page') query.set(key, value);
    }
    if (target > 0) query.set('page', String(target));
    const suffix = query.toString();
    return `/w/${slug}/contacts${suffix ? `?${suffix}` : ''}`;
  };

  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <p className="text-zinc-500">
        Page {page + 1} of {pages}
      </p>
      <div className="flex gap-2">
        {page > 0 ? (
          <Link
            href={link(page - 1)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-zinc-700 hover:bg-zinc-50"
          >
            Previous
          </Link>
        ) : null}
        {page + 1 < pages ? (
          <Link
            href={link(page + 1)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-zinc-700 hover:bg-zinc-50"
          >
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
