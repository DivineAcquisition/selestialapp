import { AppShell } from '@/components/v2/AppShell';
import { workspaceNav } from '@/lib/v2/nav';
import { listWorkspaces, requireWorkspace } from '@/lib/v2/workspace';
import { NewCampaignWizard } from './NewCampaignWizard';

export const dynamic = 'force-dynamic';

export default async function NewCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [{ workspace, viewer, canWrite }, workspaces] = await Promise.all([
    requireWorkspace(slug),
    listWorkspaces(),
  ]);

  return (
    <AppShell
      workspaces={workspaces}
      current={workspace}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={workspaceNav(slug)}
      pathname={`/w/${slug}/campaigns`}
      docsHref="/docs/list-upload"
      title="New campaign"
      subtitle="Upload the list, confirm the columns, and Selestial does the rest."
    >
      {canWrite ? (
        <NewCampaignWizard
          slug={slug}
          workspaceProvisioned={Boolean(workspace.ghl_location_id)}
          defaultBookingUrl={workspace.booking_url ?? ''}
        />
      ) : (
        <p className="text-sm text-zinc-500">
          You have read-only access to this workspace. Ask your account manager to launch a
          campaign.
        </p>
      )}
    </AppShell>
  );
}
