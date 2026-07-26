'use server';

import { revalidatePath } from 'next/cache';

import { runGhlPreflight, type PreflightResult } from '@/lib/ghl/preflight';
import { logActivity } from '@/lib/v2/activity';
import { adminDb, userDb } from '@/lib/v2/db';
import { sendWorkspaceInvite } from '@/lib/v2/invites';
import {
  connectExistingLocation,
  ensureProvisioningSteps,
  runProvisioning,
  runProvisioningStep,
  type ProvisioningStepKey,
} from '@/lib/v2/provisioning';
import { replayWebhook } from '@/lib/v2/webhook-replay';
import { requireAgencyAdmin, requireViewer, uniqueSlug } from '@/lib/v2/workspace';

export interface AgencyActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
}

function fail(err: unknown): AgencyActionResult {
  const message = err instanceof Error ? err.message : String(err);
  console.error('[agency-action]', message);
  return { ok: false, error: message };
}

/**
 * Creates the workspace, then provisions the GHL sub-account.
 *
 * The workspace row is committed before provisioning starts so a GHL failure leaves a
 * retryable record rather than losing the operator's input. Provisioning itself runs in
 * the background, with per-step status on the workspace page.
 */
export async function onboardClient(formData: FormData): Promise<AgencyActionResult> {
  try {
    const viewer = await requireAgencyAdmin();
    const db = adminDb();

    const name = String(formData.get('business_name') ?? '').trim();
    if (!name) return { ok: false, error: 'Business name is required.' };

    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    if (!email) return { ok: false, error: 'Owner email is required — it is how they get access.' };

    const serviceTypes = String(formData.get('service_types') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    const slug = await uniqueSlug(name);

    const { data: workspace, error } = await db
      .from('workspaces')
      .insert({
        name,
        slug,
        status: 'onboarding',
        owner_name: String(formData.get('owner_name') ?? '').trim() || null,
        email,
        phone: String(formData.get('phone') ?? '').trim() || null,
        website: String(formData.get('website') ?? '').trim() || null,
        timezone: String(formData.get('timezone') ?? 'America/Chicago'),
        service_area: String(formData.get('service_area') ?? '').trim() || null,
        service_types: serviceTypes,
        physical_address: String(formData.get('physical_address') ?? '').trim() || null,
        booking_url: String(formData.get('booking_url') ?? '').trim() || null,
        business_profile: {
          tone: String(formData.get('tone') ?? '').trim() || undefined,
          positioning: String(formData.get('positioning') ?? '').trim() || undefined,
          differentiators: String(formData.get('differentiators') ?? '').trim() || undefined,
        },
        created_by: viewer.userId,
      })
      .select('id')
      .single();

    if (error) throw error;
    const workspaceId = workspace.id as string;

    await ensureProvisioningSteps(workspaceId);

    await logActivity({
      workspaceId,
      actorType: 'user',
      actorId: viewer.userId,
      action: 'workspace.created',
      summary: `Onboarded "${name}". Provisioning the GoHighLevel sub-account next.`,
      entityType: 'workspace',
      entityId: workspaceId,
      metadata: { slug, email },
    });

    const existingLocation = String(formData.get('existing_location_id') ?? '').trim();
    if (existingLocation) {
      await connectExistingLocation(workspaceId, existingLocation);
    }

    // Fire and forget: the UI polls the per-step status rather than blocking on a
    // sequence of GHL calls that can take tens of seconds.
    void runProvisioning(workspaceId).catch((err) => {
      console.error('[onboard] provisioning run failed', workspaceId, err);
    });

    revalidatePath('/agency');
    return { ok: true, redirectTo: `/agency/workspaces/${workspaceId}` };
  } catch (err) {
    return fail(err);
  }
}

export async function retryProvisioningStep(
  workspaceId: string,
  stepKey: string
): Promise<AgencyActionResult> {
  try {
    await requireAgencyAdmin();
    const outcome = await runProvisioningStep(workspaceId, stepKey as ProvisioningStepKey);

    revalidatePath(`/agency/workspaces/${workspaceId}`);

    return outcome.status === 'failed'
      ? { ok: false, error: outcome.error ?? 'Step failed.' }
      : { ok: true, message: `Step "${stepKey}" ${outcome.status}.` };
  } catch (err) {
    return fail(err);
  }
}

export async function runAllProvisioning(workspaceId: string): Promise<AgencyActionResult> {
  try {
    await requireAgencyAdmin();
    const outcomes = await runProvisioning(workspaceId);
    revalidatePath(`/agency/workspaces/${workspaceId}`);

    const failed = outcomes.find((outcome) => outcome.status === 'failed');
    return failed
      ? { ok: false, error: `Stopped at "${failed.step}": ${failed.error}` }
      : { ok: true, message: 'Provisioning complete.' };
  } catch (err) {
    return fail(err);
  }
}

export async function connectExistingSubAccount(
  workspaceId: string,
  locationId: string
): Promise<AgencyActionResult> {
  try {
    await requireAgencyAdmin();
    await connectExistingLocation(workspaceId, locationId.trim());

    // Fields, tags and webhooks still need provisioning against the existing sub-account.
    void runProvisioning(workspaceId).catch((err) => {
      console.error('[connect] provisioning run failed', workspaceId, err);
    });

    revalidatePath(`/agency/workspaces/${workspaceId}`);
    return { ok: true, message: 'Connected. Provisioning the fields, tags and webhooks now.' };
  } catch (err) {
    return fail(err);
  }
}

export async function resendInvite(workspaceId: string): Promise<AgencyActionResult> {
  try {
    const viewer = await requireAgencyAdmin();

    const { data: workspace } = await adminDb()
      .from('workspaces')
      .select('email')
      .eq('id', workspaceId)
      .maybeSingle();

    if (!workspace?.email) return { ok: false, error: 'This workspace has no owner email.' };

    const invite = await sendWorkspaceInvite({
      workspaceId,
      email: workspace.email as string,
      invitedBy: viewer.userId,
    });

    return invite.emailSent
      ? { ok: true, message: `Invite sent to ${workspace.email}.` }
      : { ok: false, error: 'Invite created but the email could not be sent. Check RESEND_API_KEY.' };
  } catch (err) {
    return fail(err);
  }
}

/**
 * Verifies a sub-account Private Integration Token and stores it against the workspace.
 *
 * The token is probed before it is saved, so an under-scoped one is rejected at the
 * point of entry with the missing scope named — rather than accepted, stored, and
 * discovered days later when a campaign silently fails to send.
 */
export async function saveSubAccountToken(
  workspaceId: string,
  token: string
): Promise<AgencyActionResult & { preflight?: PreflightResult }> {
  try {
    const viewer = await requireWorkspaceWriter(workspaceId);
    const db = adminDb();

    const trimmed = token.trim();
    if (!trimmed) return { ok: false, error: 'Paste the token first.' };
    if (!/^pit-[0-9a-f-]{8,}$/i.test(trimmed)) {
      return {
        ok: false,
        error: 'That does not look like a Private Integration Token. They start with "pit-".',
      };
    }

    const { data: workspace } = await db
      .from('workspaces')
      .select('id, name, ghl_location_id')
      .eq('id', workspaceId)
      .maybeSingle();

    if (!workspace?.ghl_location_id) {
      return {
        ok: false,
        error: 'This workspace has no sub-account yet. Create or connect one first.',
      };
    }

    const locationId = workspace.ghl_location_id as string;
    const preflight = await runGhlPreflight(locationId, trimmed);

    if (!preflight.ready) {
      return {
        ok: false,
        error:
          'That token cannot send campaigns. Add the missing scopes in the sub-account under ' +
          'Settings → Private Integrations, regenerate the token, and paste the new value.',
        preflight,
      };
    }

    const { storeLocationPit } = await import('@/lib/ghl/tokens');
    await storeLocationPit({
      workspaceId,
      locationId,
      token: trimmed,
      label: `Sub-account PIT for ${workspace.name as string}`,
      verifiedCapabilities: preflight.capabilities.map((c) => ({ key: c.key, ok: c.ok })),
    });

    await logActivity({
      workspaceId,
      actorType: 'user',
      actorId: viewer.userId,
      action: 'ghl.subaccount_token_stored',
      // Never log the token itself, only that one was stored and what it can do.
      summary: 'Stored the sub-account GoHighLevel token. Provisioning can continue.',
      entityType: 'workspace',
      entityId: workspaceId,
      metadata: {
        locationId,
        capabilities: preflight.capabilities.map((c) => ({ key: c.key, ok: c.ok })),
      },
    });

    // Everything after the token step was waiting on exactly this.
    void runProvisioning(workspaceId).catch((err) => {
      console.error('[token] provisioning resume failed', workspaceId, err);
    });

    revalidatePath(`/agency/workspaces/${workspaceId}`);

    return { ok: true, message: 'Token verified and stored. Provisioning is continuing.', preflight };
  } catch (err) {
    return fail(err);
  }
}

export async function removeSubAccountToken(workspaceId: string): Promise<AgencyActionResult> {
  try {
    const viewer = await requireWorkspaceWriter(workspaceId);

    const { data: workspace } = await adminDb()
      .from('workspaces')
      .select('ghl_location_id')
      .eq('id', workspaceId)
      .maybeSingle();

    if (!workspace?.ghl_location_id) return { ok: false, error: 'No sub-account connected.' };

    const { removeLocationCredential } = await import('@/lib/ghl/tokens');
    await removeLocationCredential(workspace.ghl_location_id as string);

    await logActivity({
      workspaceId,
      actorType: 'user',
      actorId: viewer.userId,
      action: 'ghl.subaccount_token_removed',
      summary: 'Removed the stored sub-account GoHighLevel token. Sending is paused.',
      entityType: 'workspace',
      entityId: workspaceId,
    });

    revalidatePath(`/agency/workspaces/${workspaceId}`);
    return { ok: true, message: 'Token removed.' };
  } catch (err) {
    return fail(err);
  }
}

/** Tests a workspace's stored sub-account token without changing anything. */
export async function checkWorkspaceGhlScopes(workspaceId: string): Promise<PreflightResult> {
  await requireWorkspaceMember(workspaceId);

  const { data: workspace } = await adminDb()
    .from('workspaces')
    .select('ghl_location_id')
    .eq('id', workspaceId)
    .maybeSingle();

  return runGhlPreflight((workspace?.ghl_location_id as string) ?? null);
}

/**
 * Both an agency admin and a client owner may manage their own sub-account token —
 * the operator sets it up, and the client can rotate it without waiting on us.
 */
async function requireWorkspaceWriter(workspaceId: string) {
  const viewer = await requireViewer();
  if (viewer.isAgencyAdmin) return viewer;

  const { data } = await (await userDb())
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', viewer.userId)
    .maybeSingle();

  if (data?.role !== 'client_owner') {
    throw new Error('You do not have permission to change this workspace.');
  }
  return viewer;
}

async function requireWorkspaceMember(workspaceId: string) {
  const viewer = await requireViewer();
  if (viewer.isAgencyAdmin) return viewer;

  const { data } = await (await userDb())
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', viewer.userId)
    .maybeSingle();

  if (!data) throw new Error('Workspace not found.');
  return viewer;
}

/** Live GoHighLevel capability check, probed against the first connected sub-account. */
export async function checkGhlScopes(): Promise<PreflightResult> {
  await requireAgencyAdmin();

  const { data } = await adminDb()
    .from('workspaces')
    .select('ghl_location_id')
    .not('ghl_location_id', 'is', null)
    .limit(1)
    .maybeSingle();

  return runGhlPreflight((data?.ghl_location_id as string) ?? null);
}

export async function retryWebhook(webhookId: string): Promise<AgencyActionResult> {
  try {
    await requireAgencyAdmin();
    const result = await replayWebhook(webhookId);
    revalidatePath('/agency/webhooks');

    return result.ok
      ? { ok: true, message: 'Processed.' }
      : { ok: false, error: `Replay failed with status ${result.status}.` };
  } catch (err) {
    return fail(err);
  }
}

export async function discardWebhook(webhookId: string): Promise<AgencyActionResult> {
  try {
    await requireAgencyAdmin();
    await adminDb()
      .from('inbound_webhooks')
      .update({ status: 'ignored', error: 'Discarded by an operator' })
      .eq('id', webhookId);
    revalidatePath('/agency/webhooks');
    return { ok: true, message: 'Discarded.' };
  } catch (err) {
    return fail(err);
  }
}
