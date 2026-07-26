import { AppShell } from '@/components/v2/AppShell';
import { ghl } from '@/lib/ghl/client';
import { isGhlConfigured, resolveAuthMode } from '@/lib/ghl/config';
import { agencyNav } from '@/lib/v2/nav';
import { listWorkspaces, requireAgencyAdmin } from '@/lib/v2/workspace';
import { OnboardForm } from './OnboardForm';

export const dynamic = 'force-dynamic';

export default async function OnboardPage() {
  const [viewer, workspaces] = await Promise.all([requireAgencyAdmin(), listWorkspaces()]);

  // Offered as the "connect existing" path. A failure here is not fatal: the operator
  // can still create a new sub-account.
  let existingLocations: { id: string; name?: string }[] = [];
  let lookupError: string | null = null;

  if (isGhlConfigured()) {
    try {
      const claimed = new Set(
        workspaces.map((w) => w.ghl_location_id).filter((id): id is string => Boolean(id))
      );
      existingLocations = (await ghl().listLocations()).filter((loc) => !claimed.has(loc.id));
    } catch (err) {
      lookupError = err instanceof Error ? err.message : String(err);
    }
  }

  return (
    <AppShell
      workspaces={workspaces}
      current={null}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={agencyNav()}
      pathname="/agency/onboard"
      docsHref="/docs/onboarding"
      title="Onboard a client"
      subtitle="Creates the GoHighLevel sub-account, provisions it, and invites the owner."
    >
      {!isGhlConfigured() ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          GoHighLevel is not connected, so no sub-account will be created. You can still create the
          workspace and provision it later from{' '}
          <a href="/agency/integrations" className="font-medium underline">
            Integrations
          </a>
          .
        </div>
      ) : null}

      <OnboardForm
        existingLocations={existingLocations}
        lookupError={lookupError}
        authMode={resolveAuthMode()}
      />
    </AppShell>
  );
}
