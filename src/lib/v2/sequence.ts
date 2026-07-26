import 'server-only';

import { randomUUID } from 'node:crypto';

import { logActivity } from './activity';
import { suppressionReason, SUPPRESSION_LABELS } from './compliance';
import { adminDb } from './db';
import { recordEvent } from './events';
import { jitterOffsetMs, nextSendTime, type SendWindow } from './schedule';
import type { Campaign, CampaignTouch, Contact, Workspace } from './types';

/**
 * The sequence engine: who is in a campaign, when each touch is due, and when a contact
 * stops receiving them.
 *
 * All touches for a contact are materialized at launch rather than scheduled one at a
 * time. That is what makes "outreach committed this week" a real number the dashboard
 * can read straight off the table, and it makes an exit a single UPDATE that cancels
 * everything still pending instead of a race against the next scheduler tick.
 */

export function windowOf(campaign: Campaign): SendWindow {
  return {
    startHour: campaign.send_window_start,
    endHour: campaign.send_window_end,
    days: campaign.send_days,
  };
}

/** Stable key so a retried launch cannot double-schedule the same touch. */
function idempotencyKey(campaignId: string, contactId: string, version: number, step: number): string {
  return `${campaignId}:${contactId}:v${version}:s${step}`;
}

export interface LaunchResult {
  enrolled: number;
  skipped: number;
  scheduled: number;
  skipReasons: Record<string, number>;
}

/**
 * Enrolls every contact on the campaign's lists and schedules their whole sequence.
 *
 * The daily cap is applied by spreading enrollment across cohort days: with a cap of 250
 * and 900 contacts, the first 250 start today, the next 250 tomorrow, and so on. Within a
 * day, sends are jittered across the window so a launch does not fire as one burst.
 */
export async function launchCampaign(
  campaignId: string,
  options: { actorId?: string | null } = {}
): Promise<LaunchResult> {
  const db = adminDb();

  const { data: campaignRow } = await db.from('campaigns').select('*').eq('id', campaignId).maybeSingle();
  if (!campaignRow) throw new Error('Campaign not found');
  const campaign = campaignRow as Campaign;

  if (campaign.status !== 'ready' && campaign.status !== 'paused') {
    throw new Error(
      `Campaign is "${campaign.status}". Only a ready or paused campaign can be launched.`
    );
  }

  const { data: workspaceRow } = await db
    .from('workspaces')
    .select('*')
    .eq('id', campaign.workspace_id)
    .maybeSingle();
  if (!workspaceRow) throw new Error('Workspace not found');
  const workspace = workspaceRow as Workspace;

  const { data: touchRows } = await db
    .from('campaign_touches')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('version', campaign.sequence_version)
    .order('step_index');

  const touches = (touchRows ?? []) as CampaignTouch[];
  if (touches.length === 0) {
    throw new Error('Campaign has no generated sequence yet. Generate it before launching.');
  }

  await db.from('campaigns').update({ status: 'launching' }).eq('id', campaignId);

  const contacts = await contactsForCampaign(campaign);

  const window = windowOf(campaign);
  const cap = Math.max(1, campaign.daily_cap);
  const windowHours = Math.max(1, campaign.send_window_end - campaign.send_window_start);
  const launchAt = new Date();

  let enrolled = 0;
  let skipped = 0;
  let scheduled = 0;
  const skipReasons: Record<string, number> = {};

  let eligibleIndex = 0;

  for (const contact of contacts) {
    // A contact who cannot be reached on any channel this campaign uses is suppressed
    // up front, with the reason recorded, rather than enrolled and silently failed later.
    const channels = Array.from(new Set(touches.map((t) => t.channel)));
    const reachable = channels.some((channel) => suppressionReason(contact, channel) === null);

    if (!reachable) {
      const reason = suppressionReason(contact, channels[0]) ?? 'no_phone';
      skipReasons[reason] = (skipReasons[reason] ?? 0) + 1;
      skipped++;

      await db.from('campaign_enrollments').upsert(
        {
          workspace_id: workspace.id,
          campaign_id: campaignId,
          contact_id: contact.id,
          status: 'suppressed',
          sequence_version: campaign.sequence_version,
          exited_at: new Date().toISOString(),
          exit_reason: SUPPRESSION_LABELS[reason],
        },
        { onConflict: 'campaign_id,contact_id', ignoreDuplicates: true }
      );
      continue;
    }

    const { data: enrollment, error: enrollError } = await db
      .from('campaign_enrollments')
      .upsert(
        {
          workspace_id: workspace.id,
          campaign_id: campaignId,
          contact_id: contact.id,
          status: 'active',
          sequence_version: campaign.sequence_version,
        },
        { onConflict: 'campaign_id,contact_id' }
      )
      .select('id, status')
      .maybeSingle();

    if (enrollError || !enrollment) {
      skipped++;
      skipReasons.enrollment_failed = (skipReasons.enrollment_failed ?? 0) + 1;
      continue;
    }

    const cohortDay = Math.floor(eligibleIndex / cap);
    const positionInDay = eligibleIndex % cap;
    eligibleIndex++;

    const base =
      launchAt.getTime() + cohortDay * 86_400_000 + jitterOffsetMs(positionInDay, cap, windowHours);

    const rows = touches
      .map((touch) => {
        const desired = new Date(base + touch.delay_hours * 3_600_000);
        const sendAt = nextSendTime(desired, contact.timezone || workspace.timezone, window);

        return {
          workspace_id: workspace.id,
          campaign_id: campaignId,
          enrollment_id: enrollment.id,
          contact_id: contact.id,
          touch_id: touch.id,
          step_index: touch.step_index,
          channel: touch.channel,
          status: 'scheduled',
          scheduled_for: sendAt.toISOString(),
          to_address: touch.channel === 'sms' ? contact.phone : contact.email,
          template_version: touch.version,
          idempotency_key: idempotencyKey(
            campaignId,
            contact.id,
            campaign.sequence_version,
            touch.step_index
          ),
        };
      })
      // Only schedule touches on a channel this contact can actually receive.
      .filter((row) => Boolean(row.to_address));

    if (rows.length === 0) {
      skipped++;
      skipReasons.no_reachable_channel = (skipReasons.no_reachable_channel ?? 0) + 1;
      continue;
    }

    const { error: scheduleError } = await db
      .from('outreach_messages')
      .upsert(rows, { onConflict: 'idempotency_key', ignoreDuplicates: true });

    if (scheduleError) {
      skipped++;
      skipReasons.schedule_failed = (skipReasons.schedule_failed ?? 0) + 1;
      continue;
    }

    for (const row of rows) {
      await recordEvent({
        workspaceId: workspace.id,
        contactId: contact.id,
        campaignId,
        eventType: 'message_scheduled',
        channel: row.channel,
        occurredAt: new Date(),
        metadata: { stepIndex: row.step_index, scheduledFor: row.scheduled_for },
      });
    }

    enrolled++;
    scheduled += rows.length;
  }

  await db
    .from('campaigns')
    .update({ status: 'active', launched_at: new Date().toISOString() })
    .eq('id', campaignId);

  await logActivity({
    workspaceId: workspace.id,
    actorType: options.actorId ? 'user' : 'system',
    actorId: options.actorId ?? null,
    action: 'campaign.launched',
    summary:
      `Launched "${campaign.name}": ${enrolled} contacts enrolled, ${scheduled} messages committed, ` +
      `${skipped} suppressed.`,
    entityType: 'campaign',
    entityId: campaignId,
    metadata: {
      enrolled,
      scheduled,
      skipped,
      skipReasons,
      templateVersion: campaign.sequence_version,
      touchCount: touches.length,
      dailyCap: cap,
    },
  });

  return { enrolled, skipped, scheduled, skipReasons };
}

/** Contacts on every list attached to this campaign, deduped. */
export async function contactsForCampaign(campaign: Campaign): Promise<Contact[]> {
  const db = adminDb();

  const { data: lists } = await db
    .from('contact_lists')
    .select('id')
    .eq('campaign_id', campaign.id);

  const listIds = (lists ?? []).map((l) => l.id as string);
  if (listIds.length === 0) return [];

  const { data: members } = await db
    .from('contact_list_members')
    .select('contact_id')
    .in('list_id', listIds);

  const contactIds = Array.from(new Set((members ?? []).map((m) => m.contact_id as string)));
  if (contactIds.length === 0) return [];

  const contacts: Contact[] = [];
  for (let i = 0; i < contactIds.length; i += 500) {
    const { data } = await db
      .from('contacts')
      .select('*')
      .in('id', contactIds.slice(i, i + 500));
    contacts.push(...((data ?? []) as Contact[]));
  }

  return contacts;
}

// ---------------------------------------------------------------------------
// Exits
// ---------------------------------------------------------------------------

export type ExitReason =
  | 'replied'
  | 'booked'
  | 'opted_out'
  | 'do_not_contact'
  | 'campaign_paused'
  | 'campaign_completed'
  | 'manual';

const EXIT_LABELS: Record<ExitReason, string> = {
  replied: 'Replied — removed from the remaining touches',
  booked: 'Booked — removed from the remaining touches',
  opted_out: 'Opted out',
  do_not_contact: 'Marked do-not-contact',
  campaign_paused: 'Campaign paused',
  campaign_completed: 'Campaign completed',
  manual: 'Removed manually',
};

/**
 * Removes a contact from the rest of a campaign and cancels every message still pending.
 *
 * This is the reply-detection exit: the moment someone answers, the queued follow-ups
 * stop. Cancelling the rows rather than deleting them keeps the record of what we had
 * committed to send, which the activity log and dashboards both rely on.
 */
export async function exitEnrollment(
  enrollmentId: string,
  reason: ExitReason,
  metadata: Record<string, unknown> = {}
): Promise<number> {
  const db = adminDb();

  const { data: enrollment } = await db
    .from('campaign_enrollments')
    .select('id, workspace_id, campaign_id, contact_id, status')
    .eq('id', enrollmentId)
    .maybeSingle();

  if (!enrollment || enrollment.status !== 'active') return 0;

  const { data: cancelled } = await db
    .from('outreach_messages')
    .update({ status: 'canceled', skip_reason: EXIT_LABELS[reason] })
    .eq('enrollment_id', enrollmentId)
    .eq('status', 'scheduled')
    .select('id');

  await db
    .from('campaign_enrollments')
    .update({
      status: reason === 'campaign_completed' ? 'completed' : 'exited',
      exited_at: new Date().toISOString(),
      exit_reason: EXIT_LABELS[reason],
    })
    .eq('id', enrollmentId);

  const count = (cancelled ?? []).length;

  await recordEvent({
    workspaceId: enrollment.workspace_id,
    contactId: enrollment.contact_id,
    campaignId: enrollment.campaign_id,
    eventType: 'sequence_exited',
    metadata: { reason, cancelledMessages: count, ...metadata },
  });

  await db.from('contact_notes').insert({
    workspace_id: enrollment.workspace_id,
    contact_id: enrollment.contact_id,
    kind: 'system',
    body: `${EXIT_LABELS[reason]}. ${count} scheduled message${count === 1 ? '' : 's'} cancelled.`,
  });

  return count;
}

/** Exits a contact from every active campaign at once. */
export async function exitContactEverywhere(
  contactId: string,
  reason: ExitReason
): Promise<number> {
  const { data: enrollments } = await adminDb()
    .from('campaign_enrollments')
    .select('id')
    .eq('contact_id', contactId)
    .eq('status', 'active');

  let cancelled = 0;
  for (const enrollment of enrollments ?? []) {
    cancelled += await exitEnrollment(enrollment.id as string, reason);
  }
  return cancelled;
}

/**
 * Records an opt-out and makes it stick everywhere, immediately.
 *
 * Sets the terminal status, cancels every pending message across all campaigns, mirrors
 * the tag into GHL, and writes the event. Nothing else in the system needs to remember
 * to check — `suppressionReason` gates every send regardless.
 */
export async function optOutContact(params: {
  contactId: string;
  workspaceId: string;
  channel: 'sms' | 'email';
  reason?: string;
  source: string;
}): Promise<void> {
  const db = adminDb();

  await db
    .from('contacts')
    .update({
      status: 'opted_out',
      opted_out_at: new Date().toISOString(),
      opted_out_channel: params.channel,
      opted_out_reason: params.reason ?? params.source,
      ai_summary_stale: true,
    })
    .eq('id', params.contactId);

  await recordEvent({
    workspaceId: params.workspaceId,
    contactId: params.contactId,
    eventType: 'opted_out',
    channel: params.channel,
    metadata: { source: params.source, reason: params.reason },
  });

  const cancelled = await exitContactEverywhere(params.contactId, 'opted_out');

  const { syncEngagementTag, SELESTIAL_TAGS } = await import('./ghl-sync');
  await syncEngagementTag(params.workspaceId, params.contactId, SELESTIAL_TAGS.optedOut);

  await logActivity({
    workspaceId: params.workspaceId,
    actorType: 'system',
    action: 'contact.opted_out',
    summary: `Contact opted out via ${params.channel}. ${cancelled} pending message${
      cancelled === 1 ? '' : 's'
    } cancelled across all campaigns.`,
    entityType: 'contact',
    entityId: params.contactId,
    metadata: { channel: params.channel, source: params.source, cancelled },
  });
}

/** Pauses a campaign, holding its queue without losing it. */
export async function pauseCampaign(campaignId: string, actorId?: string | null): Promise<void> {
  const db = adminDb();

  const { data: campaign } = await db
    .from('campaigns')
    .select('id, name, workspace_id')
    .eq('id', campaignId)
    .maybeSingle();
  if (!campaign) throw new Error('Campaign not found');

  await db.from('campaigns').update({ status: 'paused' }).eq('id', campaignId);

  await logActivity({
    workspaceId: campaign.workspace_id,
    actorType: actorId ? 'user' : 'system',
    actorId: actorId ?? null,
    action: 'campaign.paused',
    summary: `Paused "${campaign.name}". Scheduled messages are held, not cancelled.`,
    entityType: 'campaign',
    entityId: campaignId,
  });
}

export async function resumeCampaign(campaignId: string, actorId?: string | null): Promise<void> {
  const db = adminDb();

  const { data: campaign } = await db
    .from('campaigns')
    .select('id, name, workspace_id')
    .eq('id', campaignId)
    .maybeSingle();
  if (!campaign) throw new Error('Campaign not found');

  await db.from('campaigns').update({ status: 'active' }).eq('id', campaignId);

  await logActivity({
    workspaceId: campaign.workspace_id,
    actorType: actorId ? 'user' : 'system',
    actorId: actorId ?? null,
    action: 'campaign.resumed',
    summary: `Resumed "${campaign.name}".`,
    entityType: 'campaign',
    entityId: campaignId,
  });
}

/** Marks campaigns complete once nothing is left to send. */
export async function completeFinishedCampaigns(): Promise<number> {
  const db = adminDb();

  const { data: active } = await db.from('campaigns').select('id, name, workspace_id').eq('status', 'active');

  let completed = 0;

  for (const campaign of active ?? []) {
    const { count } = await db
      .from('outreach_messages')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaign.id)
      .eq('status', 'scheduled');

    if ((count ?? 0) > 0) continue;

    await db
      .from('campaigns')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', campaign.id);

    await db
      .from('campaign_enrollments')
      .update({ status: 'completed', exited_at: new Date().toISOString() })
      .eq('campaign_id', campaign.id)
      .eq('status', 'active');

    await logActivity({
      workspaceId: campaign.workspace_id,
      action: 'campaign.completed',
      summary: `"${campaign.name}" finished — every scheduled message has been sent or cancelled.`,
      entityType: 'campaign',
      entityId: campaign.id as string,
    });

    completed++;
  }

  return completed;
}

/** A lock token good for one dispatch run. */
export function newLockToken(): string {
  return randomUUID();
}
