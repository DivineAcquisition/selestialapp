import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AppShell } from '@/components/v2/AppShell';
import { Badge, Card, CardHeader, formatDateTime } from '@/components/v2/Primitives';
import { adminDb } from '@/lib/v2/db';
import { agencyNav } from '@/lib/v2/nav';
import { getProvisioningSteps } from '@/lib/v2/provisioning';
import type { Workspace } from '@/lib/v2/types';
import { listWorkspaces, requireAgencyAdmin } from '@/lib/v2/workspace';
import { ProvisioningPanel } from './ProvisioningPanel';

export const dynamic = 'force-dynamic';

export default async function WorkspaceProvisioningPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const [viewer, workspaces] = await Promise.all([requireAgencyAdmin(), listWorkspaces()]);

  const db = adminDb();

  const { data: workspaceRow } = await db
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .maybeSingle();

  if (!workspaceRow) notFound();
  const workspace = workspaceRow as Workspace;

  const [steps, { data: logs }] = await Promise.all([
    getProvisioningSteps(workspaceId),
    db
      .from('integration_logs')
      .select('id, provider, operation, status_code, ok, error, duration_ms, created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  return (
    <AppShell
      workspaces={workspaces}
      current={workspace}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={agencyNav()}
      pathname="/agency"
      docsHref="/docs/ghl-provisioning"
      title={workspace.name}
      subtitle="Provisioning and integration health"
      actions={
        <Link
          href={`/w/${workspace.slug}`}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Open workspace
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProvisioningPanel
            workspaceId={workspaceId}
            steps={steps}
            hasLocation={Boolean(workspace.ghl_location_id)}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Sub-account" />
            <dl className="divide-y divide-zinc-100 text-sm">
              <Row label="Status">
                <Badge tone={workspace.status === 'active' ? 'green' : 'amber'}>
                  {workspace.status}
                </Badge>
              </Row>
              <Row label="Location ID">{workspace.ghl_location_id ?? 'None'}</Row>
              <Row label="Connected">{formatDateTime(workspace.ghl_connected_at)}</Row>
              <Row label="Custom fields">
                {Object.keys(workspace.ghl_custom_fields ?? {}).length}
              </Row>
              <Row label="Owner email">{workspace.email ?? '—'}</Row>
              <Row label="Slug">{workspace.slug}</Row>
            </dl>
          </Card>

          <Card>
            <CardHeader
              title="Recent integration calls"
              description="Every outbound call, most recent first."
            />
            {(logs ?? []).length === 0 ? (
              <p className="px-5 py-4 text-sm text-zinc-500">No calls yet.</p>
            ) : (
              <ul className="divide-y divide-zinc-50 text-sm">
                {(logs ?? []).map((log) => (
                  <li key={log.id as number} className="px-5 py-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium text-zinc-800">
                        {log.provider as string}.{log.operation as string}
                      </span>
                      <Badge tone={log.ok ? 'green' : 'red'}>
                        {(log.status_code as number) ?? 'error'}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {formatDateTime(log.created_at as string)} · {(log.duration_ms as number) ?? 0}ms
                    </p>
                    {log.error ? (
                      <p className="mt-1 break-words text-xs text-red-600">{log.error as string}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
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
