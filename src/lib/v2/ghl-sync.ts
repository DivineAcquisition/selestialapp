import 'server-only';

import { ghl } from '@/lib/ghl/client';
import { SELESTIAL_TAGS } from '@/lib/ghl/config';
import { adminDb } from './db';
import type { Contact, Workspace } from './types';

/**
 * Mirrors Selestial state into the client's GHL sub-account.
 *
 * Direction is one-way by design: Selestial is the source of truth and GHL is a
 * mirror, so a failure here degrades the client's automations but never corrupts our
 * data. Every function is therefore best-effort and returns rather than throws.
 */

function customFieldPayload(
  workspace: Workspace,
  contact: Contact
): { id: string; value: string | number }[] {
  const map = workspace.ghl_custom_fields ?? {};
  const fields: { id: string; value: string | number }[] = [];

  const push = (key: string, value: string | number | null | undefined) => {
    const id = map[key];
    if (id && value !== null && value !== undefined && value !== '') {
      fields.push({ id, value });
    }
  };

  push('selestial_contact_id', contact.id);
  push('selestial_reactivation_status', contact.status);
  push('selestial_last_service_date', contact.last_service_date ?? undefined);
  push('selestial_engagement_score', contact.engagement_score);

  return fields;
}

export interface MirrorResult {
  ok: boolean;
  ghlContactId: string | null;
  error?: string;
}

/** Upserts a contact into the workspace's sub-account and records the returned id. */
export async function mirrorContactToGhl(
  workspace: Workspace,
  contact: Contact,
  options: { tags?: string[] } = {}
): Promise<MirrorResult> {
  if (!workspace.ghl_location_id) {
    return { ok: false, ghlContactId: null, error: 'Workspace has no GHL sub-account' };
  }

  try {
    const result = await ghl(workspace.id).upsertContact({
      locationId: workspace.ghl_location_id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      name: contact.full_name,
      email: contact.email,
      phone: contact.phone,
      address1: contact.address,
      city: contact.city,
      state: contact.state,
      postalCode: contact.postal_code,
      timezone: contact.timezone ?? workspace.timezone,
      tags: options.tags ?? [SELESTIAL_TAGS.uploaded],
      source: 'Selestial',
      customFields: customFieldPayload(workspace, contact),
      workspaceId: workspace.id,
    });

    if (result?.id) {
      await adminDb()
        .from('contacts')
        .update({ ghl_contact_id: result.id, ghl_synced_at: new Date().toISOString() })
        .eq('id', contact.id);
    }

    return { ok: true, ghlContactId: result?.id ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ghl-sync] contact mirror failed', contact.id, message);
    return { ok: false, ghlContactId: null, error: message };
  }
}

/**
 * Pushes an engagement tag onto the mirrored contact so the client's own GHL
 * automations can react in near real time.
 */
export async function syncEngagementTag(
  workspaceId: string,
  contactId: string,
  tag: string
): Promise<void> {
  try {
    const db = adminDb();

    const [{ data: workspace }, { data: contact }] = await Promise.all([
      db.from('workspaces').select('id, ghl_location_id').eq('id', workspaceId).maybeSingle(),
      db.from('contacts').select('ghl_contact_id').eq('id', contactId).maybeSingle(),
    ]);

    const locationId = workspace?.ghl_location_id as string | undefined;
    const ghlContactId = contact?.ghl_contact_id as string | undefined;
    if (!locationId || !ghlContactId) return;

    await ghl(workspaceId).addContactTags(locationId, ghlContactId, [tag]);
  } catch (err) {
    console.error('[ghl-sync] tag push failed', contactId, tag, err);
  }
}

export { SELESTIAL_TAGS };
