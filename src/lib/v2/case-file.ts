import 'server-only';

import { callModel, isAiConfigured, PROMPT_VERSIONS, SUMMARY_MODEL } from './ai';
import { adminDb } from './db';
import { describeDormancy } from './normalize';
import type { Contact, EngagementEvent, OutreachMessage, Workspace } from './types';

/**
 * The case file: a living profile of one contact.
 *
 * The AI summary here is not decoration. It is the context that per-contact message
 * rendering reads on the next campaign, so it is written to be useful to a model as well
 * as to a human: concrete facts, no hedging, no invented detail.
 */

const SUMMARY_SYSTEM = `You write one-paragraph situation summaries about a single past customer of a local service business, for the business owner and for an AI that will write the next message to them.

Rules:
- One paragraph, 2 to 4 sentences, under 90 words.
- Only state facts present in the data. Never infer intent, mood, or reasons.
- Be specific: how long dormant, what they bought, what they did and when.
- If they have engaged, say exactly how and when. If they have not, say so plainly.
- No greeting, no advice, no recommendation on what to send next. Just the situation.
- Write in third person, present tense where natural. Do not start with the customer's name repeatedly.`;

export interface TimelineEntry {
  id: string;
  at: string;
  kind: 'message' | 'event' | 'note';
  channel: 'sms' | 'email' | null;
  title: string;
  detail: string | null;
  /** The exact copy that was sent, for message entries. */
  body?: string | null;
  subject?: string | null;
  metadata?: Record<string, unknown>;
}

const EVENT_TITLES: Record<string, string> = {
  contact_imported: 'Imported',
  contact_merged: 'Merged from a later list',
  message_scheduled: 'Message scheduled',
  message_delivered: 'Delivered',
  message_failed: 'Send failed',
  message_skipped: 'Send skipped',
  email_opened: 'Opened the email',
  link_clicked: 'Clicked a link',
  attachment_viewed: 'Opened an attachment',
  attachment_view_duration: 'Time spent on attachment',
  reply_received: 'Replied',
  booking_created: 'Booked',
  opted_out: 'Opted out',
  email_bounced: 'Email bounced',
  email_complained: 'Marked as spam',
  sequence_exited: 'Left the sequence',
  status_changed: 'Status changed',
};

/**
 * Assembles the full timeline: every message with the copy that actually went out, every
 * delivery event, click, view, reply, and every note. Reverse chronological.
 */
export async function buildTimeline(contactId: string, limit = 300): Promise<TimelineEntry[]> {
  const db = adminDb();

  const [{ data: messages }, { data: events }, { data: notes }] = await Promise.all([
    db
      .from('outreach_messages')
      .select('*')
      .eq('contact_id', contactId)
      .in('status', ['sent', 'delivered', 'failed', 'skipped', 'canceled'])
      .order('created_at', { ascending: false })
      .limit(limit),
    db
      .from('engagement_events')
      .select('*')
      .eq('contact_id', contactId)
      .order('occurred_at', { ascending: false })
      .limit(limit),
    db
      .from('contact_notes')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  const entries: TimelineEntry[] = [];

  for (const row of (messages ?? []) as OutreachMessage[]) {
    const at = row.sent_at ?? row.failed_at ?? row.created_at;
    entries.push({
      id: `msg-${row.id}`,
      at,
      kind: 'message',
      channel: row.channel,
      title:
        row.status === 'sent' || row.status === 'delivered'
          ? `Sent ${row.channel === 'sms' ? 'SMS' : 'email'} · touch ${row.step_index + 1}`
          : `${capitalize(row.status)} ${row.channel === 'sms' ? 'SMS' : 'email'} · touch ${
              row.step_index + 1
            }`,
      detail: row.error ?? row.skip_reason ?? null,
      subject: row.subject,
      body: row.body,
      metadata: row.render_meta,
    });
  }

  for (const row of (events ?? []) as EngagementEvent[]) {
    // Message send/schedule events would duplicate the message entries above.
    if (row.event_type === 'message_sent' || row.event_type === 'message_scheduled') continue;

    entries.push({
      id: `evt-${row.id}`,
      at: row.occurred_at,
      kind: 'event',
      channel: row.channel,
      title: EVENT_TITLES[row.event_type] ?? row.event_type,
      detail: describeEvent(row),
      metadata: row.metadata,
    });
  }

  for (const row of (notes ?? []) as { id: number; created_at: string; kind: string; body: string }[]) {
    entries.push({
      id: `note-${row.id}`,
      at: row.created_at,
      kind: 'note',
      channel: null,
      title: row.kind === 'system' ? 'System note' : 'Note',
      detail: row.body,
    });
  }

  return entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

function describeEvent(event: EngagementEvent): string | null {
  const meta = event.metadata ?? {};

  switch (event.event_type) {
    case 'link_clicked':
      return (meta.destination as string) ?? (meta.link as string) ?? null;
    case 'attachment_viewed':
      return (meta.attachmentName as string) ?? null;
    case 'attachment_view_duration':
      return meta.seconds ? `${meta.seconds}s` : null;
    case 'reply_received':
      return (meta.body as string)?.slice(0, 300) ?? null;
    case 'message_skipped':
      return (meta.reason as string) ?? null;
    case 'message_failed':
      return (meta.error as string) ?? null;
    case 'sequence_exited':
      return (meta.reason as string) ?? null;
    case 'email_bounced':
      return (meta.bounce as { message?: string })?.message ?? null;
    default:
      return null;
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ---------------------------------------------------------------------------
// AI summary
// ---------------------------------------------------------------------------

function buildSummaryInput(
  workspace: Workspace,
  contact: Contact,
  timeline: TimelineEntry[]
): string {
  const facts = [
    `Business: ${workspace.name}`,
    `Contact: ${contact.full_name ?? 'name unknown'}`,
    `Dormancy: ${describeDormancy(contact.last_service_date)}`,
    contact.service_type ? `Last purchased: ${contact.service_type}` : null,
    contact.lifetime_value_cents
      ? `Lifetime value: $${(contact.lifetime_value_cents / 100).toFixed(0)}`
      : null,
    contact.city ? `City: ${contact.city}` : null,
    `Status: ${contact.status}`,
    `Engagement score: ${contact.engagement_score} (${contact.engagement_tier})`,
  ].filter(Boolean);

  const recent = timeline.slice(0, 30).map((entry) => {
    const when = new Date(entry.at).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      timeZone: 'UTC',
    });
    const detail = entry.detail ? ` — ${entry.detail.slice(0, 160)}` : '';
    return `- ${when}: ${entry.title}${detail}`;
  });

  return [
    '## Facts',
    ...facts,
    '',
    '## Recent activity, newest first',
    recent.length > 0 ? recent.join('\n') : '- No activity recorded yet.',
  ].join('\n');
}

export interface SummaryResult {
  summary: string;
  generated: boolean;
}

/**
 * Regenerates a contact's narrative summary. Falls back to a deterministic sentence when
 * the model is unavailable, so the case file is never blank.
 */
export async function regenerateSummary(contactId: string): Promise<SummaryResult> {
  const db = adminDb();

  const { data: contactRow } = await db.from('contacts').select('*').eq('id', contactId).maybeSingle();
  if (!contactRow) throw new Error('Contact not found');
  const contact = contactRow as Contact;

  const { data: workspaceRow } = await db
    .from('workspaces')
    .select('*')
    .eq('id', contact.workspace_id)
    .maybeSingle();
  if (!workspaceRow) throw new Error('Workspace not found');
  const workspace = workspaceRow as Workspace;

  const timeline = await buildTimeline(contactId, 60);

  let summary = deterministicSummary(contact, timeline);
  let generated = false;

  if (isAiConfigured()) {
    try {
      const result = await callModel({
        workspaceId: workspace.id,
        operation: 'contact.summarize',
        promptVersion: PROMPT_VERSIONS.caseFileSummary,
        model: SUMMARY_MODEL,
        system: SUMMARY_SYSTEM,
        user: buildSummaryInput(workspace, contact, timeline),
        maxTokens: 300,
        temperature: 0.3,
      });

      if (result.text.trim()) {
        summary = result.text.trim();
        generated = true;
      }
    } catch (err) {
      console.error('[case-file] summary generation failed, using the deterministic one', err);
    }
  }

  await db
    .from('contacts')
    .update({
      ai_summary: summary,
      ai_summary_updated_at: new Date().toISOString(),
      ai_summary_stale: false,
    })
    .eq('id', contactId);

  return { summary, generated };
}

/** Always available, never wrong: assembled straight from the record. */
function deterministicSummary(contact: Contact, timeline: TimelineEntry[]): string {
  const parts: string[] = [describeDormancy(contact.last_service_date)];

  if (contact.service_type) parts.push(`${contact.service_type} customer`);

  const engagements = timeline.filter(
    (entry) =>
      entry.kind === 'event' &&
      ['Opened the email', 'Clicked a link', 'Opened an attachment', 'Replied', 'Booked'].includes(
        entry.title
      )
  );

  if (engagements.length === 0) {
    const sends = timeline.filter((entry) => entry.kind === 'message').length;
    parts.push(sends > 0 ? `no engagement across ${sends} messages` : 'not yet contacted');
  } else {
    const latest = engagements[0];
    const when = new Date(latest.at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
    parts.push(`${engagements.length} engagement signals, most recently "${latest.title}" on ${when}`);
  }

  if (contact.status === 'opted_out') parts.push('has opted out');
  if (contact.status === 'booked') parts.push('has booked');

  return `${parts.join('. ')}.`;
}

/** Refreshes the summaries flagged stale by new events. Driven by the maintenance cron. */
export async function refreshStaleSummaries(limit = 25): Promise<number> {
  const { data } = await adminDb()
    .from('contacts')
    .select('id')
    .eq('ai_summary_stale', true)
    .order('last_engagement_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  let refreshed = 0;
  for (const row of data ?? []) {
    try {
      await regenerateSummary(row.id as string);
      refreshed++;
    } catch (err) {
      console.error('[case-file] failed to refresh summary', row.id, err);
      // Clear the flag so one poisoned row cannot block the queue forever.
      await adminDb().from('contacts').update({ ai_summary_stale: false }).eq('id', row.id);
    }
  }

  return refreshed;
}
