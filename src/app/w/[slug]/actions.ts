'use server';

import { revalidatePath } from 'next/cache';

import { logActivity } from '@/lib/v2/activity';
import { regenerateSummary } from '@/lib/v2/case-file';
import { detectMapping, type ColumnMapping } from '@/lib/v2/csv';
import { adminDb } from '@/lib/v2/db';
import { generateCampaignSequence } from '@/lib/v2/generate';
import { runImport } from '@/lib/v2/import';
import {
  exitContactEverywhere,
  launchCampaign,
  optOutContact,
  pauseCampaign,
  resumeCampaign,
} from '@/lib/v2/sequence';
import type { CampaignKind, ChannelMix, Contact } from '@/lib/v2/types';
import { requireWorkspace } from '@/lib/v2/workspace';

/**
 * Server actions for the workspace surfaces.
 *
 * Each one re-resolves the workspace from the slug and checks write access, so
 * authorization never depends on a hidden form field the browser could change.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
  redirectTo?: string;
  message?: string;
}

async function requireWriter(slug: string) {
  const context = await requireWorkspace(slug);
  if (!context.canWrite) throw new Error('You do not have permission to change this workspace.');
  return context;
}

function fail(err: unknown): ActionResult {
  const message = err instanceof Error ? err.message : String(err);
  console.error('[action]', message);
  return { ok: false, error: message };
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export async function createCampaignAndImport(
  slug: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const { workspace, viewer } = await requireWriter(slug);
    const db = adminDb();

    const name = String(formData.get('name') ?? '').trim();
    if (!name) return { ok: false, error: 'Give the campaign a name.' };

    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: 'Choose a CSV file to upload.' };
    }
    if (file.size > 20 * 1024 * 1024) {
      return { ok: false, error: 'That file is over 20MB. Split it and upload in parts.' };
    }

    const csvText = await file.text();

    // The mapping the operator confirmed on screen, or the detected one if the form
    // was submitted without touching it.
    let mapping: ColumnMapping;
    const submitted = formData.get('mapping');
    if (typeof submitted === 'string' && submitted.trim()) {
      mapping = JSON.parse(submitted) as ColumnMapping;
    } else {
      const { parseCsv } = await import('@/lib/v2/csv');
      mapping = detectMapping(parseCsv(csvText).headers);
    }

    const { data: campaign, error } = await db
      .from('campaigns')
      .insert({
        workspace_id: workspace.id,
        name,
        kind: (formData.get('kind') as CampaignKind) || 'reactivation',
        channel_mix: (formData.get('channel_mix') as ChannelMix) || 'both',
        offer: String(formData.get('offer') ?? '').trim() || null,
        booking_url: String(formData.get('booking_url') ?? '').trim() || workspace.booking_url,
        daily_cap: Number(formData.get('daily_cap') ?? 250) || 250,
        created_by: viewer.userId,
        status: 'draft',
      })
      .select('id')
      .single();

    if (error) throw error;
    const campaignId = campaign.id as string;

    const summary = await runImport({
      workspace,
      csvText,
      mapping,
      listName: file.name || name,
      sourceFilename: file.name,
      campaignId,
      importedBy: viewer.userId,
      mirrorToGhl: Boolean(workspace.ghl_location_id),
    });

    await logActivity({
      workspaceId: workspace.id,
      actorType: 'user',
      actorId: viewer.userId,
      action: 'campaign.created',
      summary: `Created campaign "${name}" from ${summary.imported + summary.merged} contacts.`,
      entityType: 'campaign',
      entityId: campaignId,
      metadata: { ...summary },
    });

    // Generation runs inline: the operator is standing at the screen waiting for the
    // sequence, and it is the only thing between upload and launch.
    await generateCampaignSequence(campaignId, { actorId: viewer.userId });

    revalidatePath(`/w/${slug}/campaigns`);
    return { ok: true, redirectTo: `/w/${slug}/campaigns/${campaignId}` };
  } catch (err) {
    return fail(err);
  }
}

export async function regenerateCampaign(slug: string, campaignId: string): Promise<ActionResult> {
  try {
    const { workspace, viewer } = await requireWriter(slug);
    await assertCampaignInWorkspace(campaignId, workspace.id);

    const result = await generateCampaignSequence(campaignId, {
      regenerate: true,
      actorId: viewer.userId,
    });

    revalidatePath(`/w/${slug}/campaigns/${campaignId}`);
    return {
      ok: true,
      message: `Regenerated: ${result.touches.length} touches on a new angle.`,
    };
  } catch (err) {
    return fail(err);
  }
}

export async function launchCampaignAction(
  slug: string,
  campaignId: string
): Promise<ActionResult> {
  try {
    const { workspace, viewer } = await requireWriter(slug);
    await assertCampaignInWorkspace(campaignId, workspace.id);

    const result = await launchCampaign(campaignId, { actorId: viewer.userId });

    revalidatePath(`/w/${slug}/campaigns/${campaignId}`);
    revalidatePath(`/w/${slug}`);

    return {
      ok: true,
      message:
        `Launched. ${result.enrolled} contacts enrolled and ${result.scheduled} messages committed` +
        (result.skipped > 0 ? `, ${result.skipped} suppressed.` : '.'),
    };
  } catch (err) {
    return fail(err);
  }
}

export async function pauseCampaignAction(slug: string, campaignId: string): Promise<ActionResult> {
  try {
    const { workspace, viewer } = await requireWriter(slug);
    await assertCampaignInWorkspace(campaignId, workspace.id);
    await pauseCampaign(campaignId, viewer.userId);
    revalidatePath(`/w/${slug}/campaigns/${campaignId}`);
    return { ok: true, message: 'Paused. Scheduled messages are held, not cancelled.' };
  } catch (err) {
    return fail(err);
  }
}

export async function resumeCampaignAction(slug: string, campaignId: string): Promise<ActionResult> {
  try {
    const { workspace, viewer } = await requireWriter(slug);
    await assertCampaignInWorkspace(campaignId, workspace.id);
    await resumeCampaign(campaignId, viewer.userId);
    revalidatePath(`/w/${slug}/campaigns/${campaignId}`);
    return { ok: true, message: 'Resumed.' };
  } catch (err) {
    return fail(err);
  }
}

async function assertCampaignInWorkspace(campaignId: string, workspaceId: string): Promise<void> {
  const { data } = await adminDb()
    .from('campaigns')
    .select('id')
    .eq('id', campaignId)
    .eq('workspace_id', workspaceId)
    .maybeSingle();
  if (!data) throw new Error('Campaign not found in this workspace.');
}

// ---------------------------------------------------------------------------
// Previews
// ---------------------------------------------------------------------------

export interface PreviewSample {
  contactName: string;
  contactId: string;
  messages: { stepIndex: number; channel: string; subject: string | null; body: string; segments: number | null }[];
}

/**
 * Renders the sequence against five random contacts from the campaign's own lists, so
 * the operator sees what real people will receive rather than a lorem-ipsum mock.
 * Mints no tokens and writes nothing.
 */
export async function previewCampaign(
  slug: string,
  campaignId: string
): Promise<{ ok: boolean; samples?: PreviewSample[]; error?: string }> {
  try {
    const { workspace } = await requireWorkspace(slug);
    await assertCampaignInWorkspace(campaignId, workspace.id);

    const db = adminDb();

    const { data: campaign } = await db
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .maybeSingle();
    if (!campaign) throw new Error('Campaign not found');

    const { data: touchRows } = await db
      .from('campaign_touches')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('version', campaign.sequence_version)
      .order('step_index');

    const touches = touchRows ?? [];
    if (touches.length === 0) return { ok: false, error: 'This campaign has no sequence yet.' };

    const { contactsForCampaign } = await import('@/lib/v2/sequence');
    const all = await contactsForCampaign(campaign);

    const sample = pickRandom(all, 5);
    if (sample.length === 0) {
      return { ok: false, error: 'No contacts are attached to this campaign yet.' };
    }

    const { renderMessage } = await import('@/lib/v2/render');
    const samples: PreviewSample[] = [];

    for (const contact of sample) {
      const messages = [];

      for (const touch of touches) {
        const rendered = await renderMessage(
          {
            workspace,
            contact,
            touch,
            campaignId,
            offer: campaign.offer,
            bookingUrl: campaign.booking_url ?? workspace.booking_url,
            preview: true,
          },
          // Personalization calls the model once per message; a 5-contact preview of a
          // 7-touch sequence would be 35 calls for a screen the operator glances at.
          { personalize: false, unsubscribeUrl: '#preview' }
        );

        messages.push({
          stepIndex: touch.step_index,
          channel: touch.channel,
          subject: rendered.subject,
          body: rendered.body,
          segments: rendered.segments,
        });
      }

      samples.push({
        contactId: contact.id,
        contactName: contact.full_name || contact.email || contact.phone || 'Unnamed contact',
        messages,
      });
    }

    return { ok: true, samples };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

function pickRandom<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const copy = [...items];
  const picked: T[] = [];
  while (picked.length < count && copy.length > 0) {
    picked.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return picked;
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export async function addContactNote(
  slug: string,
  contactId: string,
  body: string
): Promise<ActionResult> {
  try {
    const { workspace, viewer } = await requireWorkspace(slug);
    const text = body.trim();
    if (!text) return { ok: false, error: 'Write something first.' };

    await assertContactInWorkspace(contactId, workspace.id);

    await adminDb().from('contact_notes').insert({
      workspace_id: workspace.id,
      contact_id: contactId,
      kind: 'user',
      body: text,
      author_id: viewer.userId,
    });

    revalidatePath(`/w/${slug}/contacts/${contactId}`);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export type ContactStatusChange = 'opt_out' | 'do_not_contact' | 'mark_booked' | 'reactivate';

export async function changeContactStatus(
  slug: string,
  contactId: string,
  change: ContactStatusChange
): Promise<ActionResult> {
  try {
    const { workspace, viewer } = await requireWriter(slug);
    const contact = await assertContactInWorkspace(contactId, workspace.id);
    const db = adminDb();

    switch (change) {
      case 'opt_out':
        await optOutContact({
          contactId,
          workspaceId: workspace.id,
          channel: 'sms',
          reason: 'Marked opted out by an operator',
          source: 'manual',
        });
        break;

      case 'do_not_contact': {
        await db
          .from('contacts')
          .update({ do_not_contact: true, status: 'do_not_contact', ai_summary_stale: true })
          .eq('id', contactId);
        const cancelled = await exitContactEverywhere(contactId, 'do_not_contact');
        await auditStatus(workspace.id, contactId, viewer.userId, 'do-not-contact', cancelled);
        break;
      }

      case 'mark_booked': {
        const { handleBooking } = await import('@/lib/v2/engagement');
        await handleBooking({
          workspaceId: workspace.id,
          contactId,
          provider: 'manual',
          metadata: { markedBy: viewer.userId },
        });
        await auditStatus(workspace.id, contactId, viewer.userId, 'booked', 0);
        break;
      }

      case 'reactivate': {
        // Deliberately does not clear an opt-out. Opt-out is permanent; only a
        // do-not-contact flag an operator set by mistake can be undone here.
        if (contact.status === 'opted_out') {
          return {
            ok: false,
            error: 'An opt-out cannot be reversed from here. The contact must opt back in.',
          };
        }
        await db
          .from('contacts')
          .update({ status: 'active', do_not_contact: false, ai_summary_stale: true })
          .eq('id', contactId);
        await auditStatus(workspace.id, contactId, viewer.userId, 'active', 0);
        break;
      }
    }

    revalidatePath(`/w/${slug}/contacts/${contactId}`);
    revalidatePath(`/w/${slug}/contacts`);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

async function auditStatus(
  workspaceId: string,
  contactId: string,
  actorId: string,
  status: string,
  cancelled: number
): Promise<void> {
  const { recordEvent } = await import('@/lib/v2/events');

  await recordEvent({
    workspaceId,
    contactId,
    eventType: 'status_changed',
    metadata: { status, actorId, cancelledMessages: cancelled },
  });

  await logActivity({
    workspaceId,
    actorType: 'user',
    actorId,
    action: 'contact.status_changed',
    summary: `Contact marked ${status}${
      cancelled > 0 ? `; ${cancelled} scheduled message${cancelled === 1 ? '' : 's'} cancelled` : ''
    }.`,
    entityType: 'contact',
    entityId: contactId,
    metadata: { status, cancelled },
  });

  await adminDb().from('contact_notes').insert({
    workspace_id: workspaceId,
    contact_id: contactId,
    kind: 'system',
    body: `Status changed to ${status} by an operator.`,
  });
}

export async function refreshContactSummary(
  slug: string,
  contactId: string
): Promise<ActionResult> {
  try {
    const { workspace } = await requireWorkspace(slug);
    await assertContactInWorkspace(contactId, workspace.id);
    await regenerateSummary(contactId);
    revalidatePath(`/w/${slug}/contacts/${contactId}`);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

async function assertContactInWorkspace(contactId: string, workspaceId: string): Promise<Contact> {
  const { data } = await adminDb()
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .eq('workspace_id', workspaceId)
    .maybeSingle();
  if (!data) throw new Error('Contact not found in this workspace.');
  return data as Contact;
}
