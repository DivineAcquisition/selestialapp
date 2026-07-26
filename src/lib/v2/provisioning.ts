import 'server-only';

import { ghl } from '@/lib/ghl/client';
import { SELESTIAL_TAG_LIST } from '@/lib/ghl/config';
import { logActivity } from './activity';
import { adminDb } from './db';
import type { ProvisioningStep, ProvisioningStatus, Workspace } from './types';

/**
 * The provisioning pipeline that turns a freshly created workspace into a working GHL
 * sub-account. Every step is idempotent and individually retryable: re-running a step
 * that already succeeded is a no-op, and re-running a failed one picks up where it left
 * off rather than duplicating work in GHL.
 */
export const PROVISIONING_STEPS = [
  { key: 'create_location', label: 'Creating GoHighLevel sub-account', position: 0 },
  { key: 'provision_fields', label: 'Provisioning custom fields', position: 1 },
  { key: 'provision_tags', label: 'Provisioning tag taxonomy', position: 2 },
  { key: 'register_webhooks', label: 'Registering webhooks', position: 3 },
  { key: 'invite_owner', label: 'Inviting the client owner', position: 4 },
] as const;

export type ProvisioningStepKey = (typeof PROVISIONING_STEPS)[number]['key'];

export async function ensureProvisioningSteps(workspaceId: string): Promise<void> {
  const rows = PROVISIONING_STEPS.map((step) => ({
    workspace_id: workspaceId,
    step_key: step.key,
    label: step.label,
    position: step.position,
  }));

  // Ignore conflicts so calling this again never resets a step that already ran.
  await adminDb().from('workspace_provisioning_steps').upsert(rows, {
    onConflict: 'workspace_id,step_key',
    ignoreDuplicates: true,
  });
}

export async function getProvisioningSteps(workspaceId: string): Promise<ProvisioningStep[]> {
  const { data } = await adminDb()
    .from('workspace_provisioning_steps')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('position');
  return (data ?? []) as ProvisioningStep[];
}

async function setStep(
  workspaceId: string,
  stepKey: string,
  status: ProvisioningStatus,
  patch: { result?: Record<string, unknown>; error?: string | null } = {}
): Promise<void> {
  const now = new Date().toISOString();
  await adminDb()
    .from('workspace_provisioning_steps')
    .update({
      status,
      result: patch.result ?? null,
      error: patch.error ?? null,
      started_at: status === 'running' ? now : undefined,
      completed_at: status === 'succeeded' || status === 'skipped' ? now : null,
    })
    .eq('workspace_id', workspaceId)
    .eq('step_key', stepKey);
}

async function bumpAttempts(workspaceId: string, stepKey: string): Promise<void> {
  const { data } = await adminDb()
    .from('workspace_provisioning_steps')
    .select('attempts')
    .eq('workspace_id', workspaceId)
    .eq('step_key', stepKey)
    .maybeSingle();

  await adminDb()
    .from('workspace_provisioning_steps')
    .update({ attempts: ((data?.attempts as number) ?? 0) + 1 })
    .eq('workspace_id', workspaceId)
    .eq('step_key', stepKey);
}

export interface StepOutcome {
  step: ProvisioningStepKey;
  status: ProvisioningStatus;
  result?: Record<string, unknown>;
  error?: string;
}

async function loadWorkspace(workspaceId: string): Promise<Workspace> {
  const { data, error } = await adminDb()
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .maybeSingle();
  if (error || !data) throw new Error(`Workspace ${workspaceId} not found`);
  return data as Workspace;
}

// ---------------------------------------------------------------------------
// Individual steps
// ---------------------------------------------------------------------------

async function stepCreateLocation(workspace: Workspace): Promise<Record<string, unknown>> {
  if (workspace.ghl_location_id) {
    return { locationId: workspace.ghl_location_id, reused: true };
  }

  const client = ghl(workspace.id);
  const location = await client.createLocation({
    businessName: workspace.name,
    email: workspace.email ?? undefined,
    phone: workspace.phone ?? undefined,
    website: workspace.website ?? undefined,
    timezone: workspace.timezone,
    address: workspace.service_area ?? undefined,
  });

  await adminDb()
    .from('workspaces')
    .update({
      ghl_location_id: location.id,
      ghl_connected_at: new Date().toISOString(),
      ghl_metadata: {
        name: location.name,
        timezone: location.timezone,
        phone: location.phone,
        website: location.website,
        address: location.address,
      },
    })
    .eq('id', workspace.id);

  return { locationId: location.id, created: true };
}

async function stepProvisionFields(workspace: Workspace): Promise<Record<string, unknown>> {
  const locationId = await requireLocation(workspace);
  const map = await ghl(workspace.id).ensureCustomFields(locationId);

  await adminDb().from('workspaces').update({ ghl_custom_fields: map }).eq('id', workspace.id);

  return { fields: map, count: Object.keys(map).length };
}

async function stepProvisionTags(workspace: Workspace): Promise<Record<string, unknown>> {
  const locationId = await requireLocation(workspace);
  const tags = await ghl(workspace.id).ensureTags(locationId);
  return { tags, count: tags.length };
}

async function stepRegisterWebhooks(
  workspace: Workspace
): Promise<{ result: Record<string, unknown>; status: ProvisioningStatus }> {
  const locationId = await requireLocation(workspace);
  const requirements = ghl(workspace.id).describeWebhookRequirements();

  // GHL v2 has no per-location webhook subscription endpoint; delivery is configured
  // once on the marketplace app. Rather than pretend to call an API that does not
  // exist, record exactly what must be true and mark the step skipped until the
  // operator confirms it, so the UI shows an honest "action needed" instead of a
  // green tick over a channel that is silently dead.
  const result = {
    locationId,
    webhookUrl: requirements.url,
    events: requirements.events,
    delivery: 'marketplace-app-subscription',
    docs: '/docs/ghl-provisioning',
  };

  return {
    result,
    status: requirements.appConfigured ? 'succeeded' : 'skipped',
  };
}

async function stepInviteOwner(workspace: Workspace): Promise<Record<string, unknown>> {
  if (!workspace.email) {
    return { skipped: true, reason: 'Workspace has no owner email' };
  }

  // Imported lazily: the invite path pulls in Resend, and provisioning must still run
  // in an install where email is not configured yet.
  const { sendWorkspaceInvite } = await import('./invites');
  const invite = await sendWorkspaceInvite({
    workspaceId: workspace.id,
    email: workspace.email,
    role: 'client_owner',
  });

  return { inviteId: invite.id, email: workspace.email, emailSent: invite.emailSent };
}

async function requireLocation(workspace: Workspace): Promise<string> {
  if (workspace.ghl_location_id) return workspace.ghl_location_id;
  const fresh = await loadWorkspace(workspace.id);
  if (!fresh.ghl_location_id) {
    throw new Error('No GHL sub-account yet. Run the "Creating GoHighLevel sub-account" step first.');
  }
  return fresh.ghl_location_id;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

export async function runProvisioningStep(
  workspaceId: string,
  stepKey: ProvisioningStepKey
): Promise<StepOutcome> {
  await ensureProvisioningSteps(workspaceId);
  await setStep(workspaceId, stepKey, 'running');
  await bumpAttempts(workspaceId, stepKey);

  const workspace = await loadWorkspace(workspaceId);

  try {
    let status: ProvisioningStatus = 'succeeded';
    let result: Record<string, unknown>;

    switch (stepKey) {
      case 'create_location':
        result = await stepCreateLocation(workspace);
        break;
      case 'provision_fields':
        result = await stepProvisionFields(workspace);
        break;
      case 'provision_tags':
        result = await stepProvisionTags(workspace);
        break;
      case 'register_webhooks': {
        const outcome = await stepRegisterWebhooks(workspace);
        result = outcome.result;
        status = outcome.status;
        break;
      }
      case 'invite_owner':
        result = await stepInviteOwner(workspace);
        break;
      default:
        throw new Error(`Unknown provisioning step: ${stepKey}`);
    }

    await setStep(workspaceId, stepKey, status, { result });

    await logActivity({
      workspaceId,
      action: `provisioning.${stepKey}`,
      summary:
        status === 'skipped'
          ? `Provisioning step "${stepKey}" needs a manual confirmation before it can pass.`
          : `Provisioning step "${stepKey}" completed.`,
      entityType: 'workspace',
      entityId: workspaceId,
      metadata: result,
    });

    return { step: stepKey, status, result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await setStep(workspaceId, stepKey, 'failed', { error: message.slice(0, 1000) });

    await logActivity({
      workspaceId,
      action: `provisioning.${stepKey}.failed`,
      summary: `Provisioning step "${stepKey}" failed: ${message}`,
      entityType: 'workspace',
      entityId: workspaceId,
      metadata: { error: message },
    });

    return { step: stepKey, status: 'failed', error: message };
  }
}

/**
 * Runs the whole pipeline in order, skipping steps that already succeeded and stopping
 * at the first failure so a later step never runs against a half-built sub-account.
 */
export async function runProvisioning(workspaceId: string): Promise<StepOutcome[]> {
  await ensureProvisioningSteps(workspaceId);

  const existing = await getProvisioningSteps(workspaceId);
  const doneKeys = new Set(
    existing.filter((s) => s.status === 'succeeded').map((s) => s.step_key)
  );

  const outcomes: StepOutcome[] = [];

  for (const step of PROVISIONING_STEPS) {
    if (doneKeys.has(step.key)) {
      outcomes.push({ step: step.key, status: 'succeeded', result: { alreadyDone: true } });
      continue;
    }

    const outcome = await runProvisioningStep(workspaceId, step.key);
    outcomes.push(outcome);

    if (outcome.status === 'failed') break;
  }

  const allDone = outcomes.every((o) => o.status === 'succeeded' || o.status === 'skipped');
  if (allDone) {
    await adminDb().from('workspaces').update({ status: 'active' }).eq('id', workspaceId);
    await logActivity({
      workspaceId,
      action: 'provisioning.completed',
      summary: 'Sub-account provisioning finished. Workspace is active.',
      entityType: 'workspace',
      entityId: workspaceId,
      metadata: { tags: SELESTIAL_TAG_LIST },
    });
  }

  return outcomes;
}

/** Attaches a workspace to a sub-account that already exists under the agency. */
export async function connectExistingLocation(
  workspaceId: string,
  locationId: string
): Promise<void> {
  const location = await ghl(workspaceId).getLocation(locationId);
  if (!location) throw new Error(`GHL sub-account ${locationId} not found under this agency`);

  await adminDb()
    .from('workspaces')
    .update({
      ghl_location_id: location.id,
      ghl_connected_at: new Date().toISOString(),
      ghl_metadata: {
        name: location.name,
        timezone: location.timezone,
        phone: location.phone,
        website: location.website,
      },
    })
    .eq('id', workspaceId);

  await ensureProvisioningSteps(workspaceId);
  await setStep(workspaceId, 'create_location', 'succeeded', {
    result: { locationId: location.id, connectedExisting: true },
  });

  await logActivity({
    workspaceId,
    action: 'provisioning.connected_existing',
    summary: `Connected existing GoHighLevel sub-account "${location.name ?? locationId}".`,
    entityType: 'workspace',
    entityId: workspaceId,
    metadata: { locationId },
  });
}
