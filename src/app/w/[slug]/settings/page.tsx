import Link from 'next/link';

import { AppShell } from '@/components/v2/AppShell';
import { Badge, Card, CardHeader, formatDateTime } from '@/components/v2/Primitives';
import { adminDb } from '@/lib/v2/db';
import { SHARED_SENDING_DOMAIN } from '@/lib/v2/email';
import { workspaceNav } from '@/lib/v2/nav';
import { getProvisioningSteps } from '@/lib/v2/provisioning';
import type { SendingIdentity } from '@/lib/v2/types';
import { listWorkspaces, requireWorkspace } from '@/lib/v2/workspace';

export const dynamic = 'force-dynamic';

const STEP_TONE = {
  succeeded: 'green',
  running: 'violet',
  pending: 'neutral',
  skipped: 'amber',
  failed: 'red',
} as const;

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [{ workspace, viewer, role }, workspaces] = await Promise.all([
    requireWorkspace(slug),
    listWorkspaces(),
  ]);

  const db = adminDb();

  const [steps, { data: identityRow }, { data: members }] = await Promise.all([
    getProvisioningSteps(workspace.id),
    db.from('sending_identities').select('*').eq('workspace_id', workspace.id).maybeSingle(),
    db.from('workspace_members').select('user_id, role, created_at').eq('workspace_id', workspace.id),
  ]);

  const identity = identityRow as SendingIdentity | null;
  const profile = workspace.business_profile ?? {};

  return (
    <AppShell
      workspaces={workspaces}
      current={workspace}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={workspaceNav(slug)}
      pathname={`/w/${slug}/settings`}
      docsHref="/docs/ghl-provisioning"
      title="Settings"
      subtitle={`You are signed in as ${role.replace(/_/g, ' ')}`}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Business profile" description="What message generation is told." />
          <dl className="divide-y divide-zinc-100 text-sm">
            <Row label="Name">{workspace.name}</Row>
            <Row label="Owner">{workspace.owner_name ?? '—'}</Row>
            <Row label="Email">{workspace.email ?? '—'}</Row>
            <Row label="Phone">{workspace.phone ?? '—'}</Row>
            <Row label="Website">{workspace.website ?? '—'}</Row>
            <Row label="Timezone">{workspace.timezone}</Row>
            <Row label="Service area">{workspace.service_area ?? '—'}</Row>
            <Row label="Services">
              {workspace.service_types.length > 0 ? workspace.service_types.join(', ') : '—'}
            </Row>
            <Row label="Tone">{profile.tone ?? 'warm, direct, plainspoken (default)'}</Row>
            <Row label="Booking link">{workspace.booking_url ?? '—'}</Row>
            <Row label="Physical address">
              {workspace.physical_address ?? (
                <span className="text-amber-600">
                  Required on marketing email. Ask your account manager to add it.
                </span>
              )}
            </Row>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="GoHighLevel sub-account"
              description="Selestial is the source of truth; GHL mirrors it."
            />
            <dl className="divide-y divide-zinc-100 text-sm">
              <Row label="Location ID">{workspace.ghl_location_id ?? 'Not provisioned'}</Row>
              <Row label="Connected">{formatDateTime(workspace.ghl_connected_at)}</Row>
              <Row label="Custom fields">
                {Object.keys(workspace.ghl_custom_fields ?? {}).length} provisioned
              </Row>
            </dl>

            <div className="border-t border-zinc-100 px-5 py-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Provisioning
              </p>
              <ol className="space-y-2">
                {steps.length === 0 ? (
                  <li className="text-sm text-zinc-500">Provisioning has not started.</li>
                ) : (
                  steps.map((step) => (
                    <li key={step.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-zinc-700">{step.label}</span>
                      <Badge tone={STEP_TONE[step.status]}>{step.status}</Badge>
                    </li>
                  ))
                )}
              </ol>

              {viewer.isAgencyAdmin ? (
                <Link
                  href={`/agency/workspaces/${workspace.id}`}
                  className="mt-3 inline-block text-sm text-primary hover:underline"
                >
                  Manage provisioning →
                </Link>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Email sending" />
            <dl className="divide-y divide-zinc-100 text-sm">
              <Row label="From">
                {identity ? `${identity.from_name} <${identity.from_email}>` : 'Created on first send'}
              </Row>
              <Row label="Reply-to">{identity?.reply_to ?? workspace.email ?? '—'}</Row>
              <Row label="Domain">{identity?.domain ?? SHARED_SENDING_DOMAIN}</Row>
              <Row label="Verified">
                <Badge tone={identity?.verified ? 'green' : 'amber'}>
                  {identity?.verified ? 'yes' : 'pending'}
                </Badge>
              </Row>
            </dl>
            <p className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500">
              Selestial sends from a shared, agency-verified domain with your business name on it,
              so you never have to touch DNS.{' '}
              <Link href="/docs/email-sending" className="text-primary hover:underline">
                How sending works
              </Link>
            </p>
          </Card>

          <Card>
            <CardHeader title="People" />
            <ul className="divide-y divide-zinc-100 text-sm">
              {(members ?? []).map((member) => (
                <li
                  key={member.user_id as string}
                  className="flex items-center justify-between px-5 py-2.5"
                >
                  <span className="truncate text-zinc-700">{member.user_id as string}</span>
                  <Badge>{(member.role as string).replace(/_/g, ' ')}</Badge>
                </li>
              ))}
              {(members ?? []).length === 0 ? (
                <li className="px-5 py-3 text-sm text-zinc-500">No members yet.</li>
              ) : null}
            </ul>
          </Card>
        </div>
      </div>
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
