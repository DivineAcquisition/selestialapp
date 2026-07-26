import 'server-only';

import { callModel, extractJson, isAiConfigured, GENERATION_MODEL, PROMPT_VERSIONS } from './ai';
import { logActivity } from './activity';
import { hasOptOutLanguage } from './compliance';
import { adminDb } from './db';
import { describeDormancy } from './normalize';
import type { Campaign, CampaignAttachment, ChannelMix, Workspace } from './types';

/**
 * Campaign-level generation: the sequence skeleton, produced once per campaign.
 *
 * There is no message-editing surface in the product, so this is the only place campaign
 * copy comes from. The operator's controls are "regenerate" and "preview" — nothing else.
 */

export const MERGE_VARIABLES = [
  'first_name',
  'full_name',
  'business_name',
  'service_type',
  'last_service',
  'dormancy',
  'city',
  'offer',
  'booking_link',
  'attachment_link',
] as const;

export type MergeVariable = (typeof MERGE_VARIABLES)[number];

export interface GeneratedTouch {
  step_index: number;
  channel: 'sms' | 'email';
  delay_hours: number;
  angle: string;
  subject_template: string | null;
  body_template: string;
  link_kind: 'booking' | 'offer' | 'attachment' | null;
  include_optout: boolean;
}

export interface ListCharacteristics {
  contactCount: number;
  medianDormancyMonths: number | null;
  topServiceTypes: string[];
  withEmail: number;
  withPhone: number;
}

/** Summarizes the list so generation can speak to who is actually on it. */
export async function describeList(
  workspaceId: string,
  campaignId: string
): Promise<ListCharacteristics> {
  const db = adminDb();

  const { data: lists } = await db
    .from('contact_lists')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('campaign_id', campaignId);

  const listIds = (lists ?? []).map((l) => l.id as string);
  if (listIds.length === 0) {
    return { contactCount: 0, medianDormancyMonths: null, topServiceTypes: [], withEmail: 0, withPhone: 0 };
  }

  const { data: members } = await db
    .from('contact_list_members')
    .select('contact_id')
    .in('list_id', listIds)
    .limit(5000);

  const contactIds = Array.from(new Set((members ?? []).map((m) => m.contact_id as string)));
  if (contactIds.length === 0) {
    return { contactCount: 0, medianDormancyMonths: null, topServiceTypes: [], withEmail: 0, withPhone: 0 };
  }

  const { data: contacts } = await db
    .from('contacts')
    .select('last_service_date, service_type, email, phone')
    .in('id', contactIds.slice(0, 5000));

  const rows = (contacts ?? []) as {
    last_service_date: string | null;
    service_type: string | null;
    email: string | null;
    phone: string | null;
  }[];

  const dormancies = rows
    .map((r) => monthsSince(r.last_service_date))
    .filter((m): m is number => m !== null)
    .sort((a, b) => a - b);

  const serviceCounts = new Map<string, number>();
  for (const row of rows) {
    if (!row.service_type) continue;
    const key = row.service_type.trim();
    serviceCounts.set(key, (serviceCounts.get(key) ?? 0) + 1);
  }

  return {
    contactCount: rows.length,
    medianDormancyMonths: dormancies.length > 0 ? dormancies[Math.floor(dormancies.length / 2)] : null,
    topServiceTypes: Array.from(serviceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name),
    withEmail: rows.filter((r) => r.email).length,
    withPhone: rows.filter((r) => r.phone).length,
  };
}

function monthsSince(date: string | null): number | null {
  if (!date) return null;
  const then = new Date(date);
  if (Number.isNaN(then.getTime())) return null;
  const now = new Date();
  return Math.max(
    0,
    (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth())
  );
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You write reactivation campaigns for local home-service businesses. You are writing on behalf of the business, to their own former customers — people who have bought from them before and simply drifted.

How to write:
- Sound like the owner texting a past customer, not like a marketing department. Short sentences. No exclamation stacking, no "Hope this finds you well", no emoji unless it genuinely fits the brand tone.
- Lead with something specific to them (what they bought, how long it has been), not with the offer.
- One clear ask per message. Never stack two calls to action.
- SMS bodies must be under 300 characters including merge variables. Aim for under 160 where you can.
- Email subject lines under 55 characters, lowercase or sentence case, never all caps, never clickbait.
- Vary the angle across the sequence. A sequence where every touch says "we miss you" is a failed sequence.

Merge variables you may use, in double braces:
{{first_name}} {{full_name}} {{business_name}} {{service_type}} {{last_service}} {{dormancy}} {{city}} {{offer}} {{booking_link}} {{attachment_link}}

Rules about merge variables:
- {{first_name}} may be empty for some contacts, so never build a sentence that breaks without it. Prefer "Hi {{first_name}}," on its own line.
- Use {{booking_link}} on any touch whose link_kind is "booking" or "offer". Use {{attachment_link}} only when link_kind is "attachment".
- Never invent a variable that is not on the list above.

Compliance, non-negotiable:
- The first SMS in the sequence must end with opt-out language ("Reply STOP to opt out."). Set include_optout true on it.
- Never claim a discount, guarantee or timeframe that was not given to you in the brief.
- Never imply an existing appointment, outstanding balance or prior conversation that did not happen.

Return only JSON. No commentary before or after.`;

interface GenerationBrief {
  workspace: Workspace;
  campaign: Campaign;
  list: ListCharacteristics;
  attachments: CampaignAttachment[];
  /** Set when regenerating, so the model takes a different angle. */
  previousAngle?: string | null;
}

function buildUserPrompt(brief: GenerationBrief): string {
  const { workspace, campaign, list, attachments } = brief;
  const profile = workspace.business_profile ?? {};

  const touchTarget = touchTargetFor(campaign.channel_mix);

  const lines = [
    '## The business',
    `Name: ${workspace.name}`,
    workspace.service_area ? `Service area: ${workspace.service_area}` : null,
    workspace.service_types.length > 0 ? `Services: ${workspace.service_types.join(', ')}` : null,
    profile.tone ? `Tone to use: ${profile.tone}` : 'Tone to use: warm, direct, plainspoken',
    profile.positioning ? `Positioning: ${profile.positioning}` : null,
    profile.differentiators ? `What makes them different: ${profile.differentiators}` : null,
    profile.averageTicket ? `Typical ticket: ${profile.averageTicket}` : null,
    '',
    '## The campaign',
    `Type: ${campaign.kind}`,
    `Channels available: ${describeChannelMix(campaign.channel_mix)}`,
    campaign.offer ? `Offer to feature: ${campaign.offer}` : 'Offer to feature: none — do not invent one.',
    `Total touches: ${touchTarget.min} to ${touchTarget.max}, spread over 14 to 21 days.`,
    '',
    '## The list',
    `Contacts: ${list.contactCount}`,
    list.medianDormancyMonths !== null
      ? `Typical dormancy: about ${list.medianDormancyMonths} months since last service`
      : 'Dormancy: unknown, no service dates on file',
    list.topServiceTypes.length > 0
      ? `What they bought: ${list.topServiceTypes.join(', ')}`
      : 'What they bought: not recorded',
    `Reachable by email: ${list.withEmail}. Reachable by SMS: ${list.withPhone}.`,
  ];

  if (attachments.length > 0) {
    lines.push(
      '',
      '## Attachments available',
      ...attachments.map((a) => `- ${a.name}${a.description ? `: ${a.description}` : ''}`),
      'You may use link_kind "attachment" on at most one touch to share one of these.'
    );
  }

  if (brief.previousAngle) {
    lines.push(
      '',
      '## Regenerating',
      `The previous version used this angle: "${brief.previousAngle}". The operator rejected it.`,
      'Take a genuinely different approach — a different reason to reach out, a different opening move.'
    );
  }

  lines.push(
    '',
    '## Output',
    'Return a JSON object of exactly this shape:',
    '{',
    '  "angle": "one sentence describing the through-line of this sequence",',
    '  "touches": [',
    '    {',
    '      "step_index": 0,',
    '      "channel": "sms" | "email",',
    '      "delay_hours": 0,',
    '      "angle": "what this specific touch is doing",',
    '      "subject_template": "email subject, or null for sms",',
    '      "body_template": "the message with {{merge_variables}}",',
    '      "link_kind": "booking" | "offer" | "attachment" | null,',
    '      "include_optout": true | false',
    '    }',
    '  ]',
    '}',
    '',
    'step_index starts at 0 and increases by 1. delay_hours is measured from enrollment,',
    'so it must increase across the sequence. The first touch has delay_hours 0.',
    'Email bodies are plain text with blank lines between paragraphs. No HTML.'
  );

  return lines.filter((line) => line !== null).join('\n');
}

function describeChannelMix(mix: ChannelMix): string {
  if (mix === 'sms') return 'SMS only — every touch must be SMS';
  if (mix === 'email') return 'Email only — every touch must be email';
  return 'SMS and email — mix them, and do not send both on the same day';
}

function touchTargetFor(mix: ChannelMix): { min: number; max: number } {
  return mix === 'both' ? { min: 5, max: 7 } : { min: 5, max: 6 };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const KNOWN_VARIABLES = new Set<string>(MERGE_VARIABLES);

/**
 * Normalizes and repairs model output. Generation is the product, so a slightly
 * malformed response is fixed up rather than thrown away — but anything that would break
 * a send (unknown merge variable, wrong channel, non-increasing delays) is corrected
 * deterministically here rather than trusted.
 */
export function normalizeTouches(
  touches: GeneratedTouch[],
  campaign: Campaign,
  spacingHours: number
): GeneratedTouch[] {
  const allowed: ('sms' | 'email')[] =
    campaign.channel_mix === 'both' ? ['sms', 'email'] : [campaign.channel_mix];

  const cleaned = touches
    .filter((touch) => typeof touch?.body_template === 'string' && touch.body_template.trim() !== '')
    .map((touch, index) => {
      const channel = allowed.includes(touch.channel) ? touch.channel : allowed[0];

      return {
        step_index: index,
        channel,
        delay_hours: Number.isFinite(touch.delay_hours) ? Math.max(0, Math.round(touch.delay_hours)) : index * spacingHours,
        angle: (touch.angle ?? '').toString().slice(0, 300) || `Touch ${index + 1}`,
        subject_template:
          channel === 'email' ? (touch.subject_template?.trim() || 'A quick note') : null,
        body_template: stripUnknownVariables(touch.body_template.trim()),
        link_kind: normalizeLinkKind(touch.link_kind),
        include_optout: Boolean(touch.include_optout),
      } satisfies GeneratedTouch;
    });

  // Delays must strictly increase, or the whole sequence lands at once.
  let previous = -1;
  for (const touch of cleaned) {
    if (touch.step_index === 0) {
      touch.delay_hours = 0;
    } else if (touch.delay_hours <= previous) {
      touch.delay_hours = previous + spacingHours;
    }
    previous = touch.delay_hours;
  }

  // The first SMS carries the opt-out disclosure regardless of what the model decided.
  const firstSms = cleaned.find((touch) => touch.channel === 'sms');
  if (firstSms) firstSms.include_optout = true;
  for (const touch of cleaned) {
    if (touch.channel === 'sms' && touch !== firstSms && hasOptOutLanguage(touch.body_template)) {
      touch.include_optout = true;
    }
  }

  return cleaned;
}

function normalizeLinkKind(value: unknown): GeneratedTouch['link_kind'] {
  return value === 'booking' || value === 'offer' || value === 'attachment' ? value : null;
}

/** Replaces any `{{variable}}` the renderer does not know how to fill. */
function stripUnknownVariables(body: string): string {
  return body.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (match, name: string) => {
    const key = name.toLowerCase();
    return KNOWN_VARIABLES.has(key) ? `{{${key}}}` : '';
  });
}

// ---------------------------------------------------------------------------
// Fallback sequence
// ---------------------------------------------------------------------------

/**
 * Used when the model is unavailable or returns something unusable. It is deliberately
 * plain: it keeps a launch from dying on an API outage, and the campaign is flagged
 * `fallback: true` in generation_meta so the operator can see it and regenerate.
 */
export function fallbackSequence(campaign: Campaign, spacingHours: number): GeneratedTouch[] {
  const useSms = campaign.channel_mix !== 'email';
  const useEmail = campaign.channel_mix !== 'sms';

  const plan: GeneratedTouch[] = [];
  const push = (touch: Omit<GeneratedTouch, 'step_index' | 'delay_hours'>) => {
    plan.push({
      ...touch,
      step_index: plan.length,
      delay_hours: plan.length === 0 ? 0 : plan.length * spacingHours,
    });
  };

  if (useSms) {
    push({
      channel: 'sms',
      angle: 'Open the door with the specific history',
      subject_template: null,
      body_template:
        'Hi {{first_name}}, it\'s {{business_name}}. It has been {{dormancy}} since your last {{service_type}}. Want us to get you back on the schedule? {{booking_link}}',
      link_kind: 'booking',
      include_optout: true,
    });
  }

  if (useEmail) {
    push({
      channel: 'email',
      angle: 'Restate the value and make booking effortless',
      subject_template: 'ready when you are, {{first_name}}',
      body_template:
        'Hi {{first_name}},\n\nWe still have your details from your last {{service_type}} with us, so getting you back on the calendar takes about a minute.\n\nPick a time that works: {{booking_link}}\n\n— The team at {{business_name}}',
      link_kind: 'booking',
      include_optout: false,
    });
  }

  if (useSms) {
    push({
      channel: 'sms',
      angle: 'Low-pressure check-in',
      subject_template: null,
      body_template:
        'Hi {{first_name}} — no pressure either way, just checking whether you\'d like {{business_name}} back out this month. {{booking_link}}',
      link_kind: 'booking',
      include_optout: false,
    });
  }

  if (useEmail) {
    push({
      channel: 'email',
      angle: 'Address the likely reason they lapsed',
      subject_template: 'was it timing or something else?',
      body_template:
        'Hi {{first_name}},\n\nMost people who stop booking do it for one of two reasons: the schedule stopped lining up, or something about the last visit was not right.\n\nIf it was the second one, reply to this email and tell me. I read these.\n\nIf it was the first, here is the calendar: {{booking_link}}\n\n— {{business_name}}',
      link_kind: 'booking',
      include_optout: false,
    });
  }

  push({
    channel: useSms ? 'sms' : 'email',
    angle: 'Close the loop',
    subject_template: useSms ? null : 'last note from us',
    body_template: useSms
      ? 'Hi {{first_name}}, last note from {{business_name}} — the calendar is here if you want it: {{booking_link}}. We won\'t keep chasing.'
      : 'Hi {{first_name}},\n\nThis is the last note in this series. The calendar stays open if you want it: {{booking_link}}\n\n— {{business_name}}',
    link_kind: 'booking',
    include_optout: false,
  });

  return plan;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export interface GenerateResult {
  touches: GeneratedTouch[];
  version: number;
  angle: string;
  model: string;
  promptVersion: string;
  fallback: boolean;
}

/**
 * Generates the sequence for a campaign and stores it as a new version of
 * `campaign_touches`. Previous versions are kept so a message that already went out can
 * always be traced back to the exact template it was rendered from.
 */
export async function generateCampaignSequence(
  campaignId: string,
  options: { regenerate?: boolean; actorId?: string | null } = {}
): Promise<GenerateResult> {
  const db = adminDb();

  const { data: campaignRow } = await db.from('campaigns').select('*').eq('id', campaignId).maybeSingle();
  if (!campaignRow) throw new Error('Campaign not found');
  const campaign = campaignRow as Campaign;

  const { data: workspaceRow } = await db
    .from('workspaces')
    .select('*')
    .eq('id', campaign.workspace_id)
    .maybeSingle();
  if (!workspaceRow) throw new Error('Workspace not found');
  const workspace = workspaceRow as Workspace;

  await db.from('campaigns').update({ status: 'generating', generation_error: null }).eq('id', campaignId);

  const [list, { data: attachmentRows }] = await Promise.all([
    describeList(workspace.id, campaignId),
    db.from('campaign_attachments').select('*').eq('campaign_id', campaignId),
  ]);

  const attachments = (attachmentRows ?? []) as CampaignAttachment[];
  const spacingHours = campaign.drip_spacing_hours || 72;

  let touches: GeneratedTouch[] = [];
  let angle = '';
  let model = GENERATION_MODEL;
  let fallback = false;

  try {
    if (!isAiConfigured()) throw new Error('ANTHROPIC_API_KEY is not set');

    const result = await callModel({
      workspaceId: workspace.id,
      operation: 'campaign.generate',
      promptVersion: PROMPT_VERSIONS.campaignSequence,
      system: SYSTEM_PROMPT,
      user: buildUserPrompt({
        workspace,
        campaign,
        list,
        attachments,
        previousAngle: options.regenerate ? (campaign.generation_meta?.angle ?? null) : null,
      }),
      maxTokens: 4000,
      temperature: options.regenerate ? 0.9 : 0.7,
    });

    const parsed = extractJson<{ angle?: string; touches?: GeneratedTouch[] }>(result.text);
    const candidate = normalizeTouches(parsed.touches ?? [], campaign, spacingHours);

    if (candidate.length < 3) {
      throw new Error(`Model returned only ${candidate.length} usable touches`);
    }

    touches = candidate;
    angle = parsed.angle?.trim() || 'Reactivation sequence';
    model = result.model;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[generate] falling back to the built-in sequence:', message);

    touches = normalizeTouches(fallbackSequence(campaign, spacingHours), campaign, spacingHours);
    angle = 'Built-in reactivation sequence (generation unavailable)';
    fallback = true;

    await db.from('campaigns').update({ generation_error: message.slice(0, 500) }).eq('id', campaignId);
  }

  const version = campaign.sequence_version + 1;

  const { error: insertError } = await db.from('campaign_touches').insert(
    touches.map((touch) => ({
      workspace_id: workspace.id,
      campaign_id: campaignId,
      version,
      step_index: touch.step_index,
      channel: touch.channel,
      delay_hours: touch.delay_hours,
      angle: touch.angle,
      subject_template: touch.subject_template,
      body_template: touch.body_template,
      link_kind: touch.link_kind,
      attachment_id:
        touch.link_kind === 'attachment' && attachments.length > 0 ? attachments[0].id : null,
      include_optout: touch.include_optout,
      generated_by: {
        model,
        promptVersion: PROMPT_VERSIONS.campaignSequence,
        fallback,
      },
    }))
  );

  if (insertError) throw insertError;

  const spanDays = Math.ceil((touches[touches.length - 1]?.delay_hours ?? 0) / 24);

  await db
    .from('campaigns')
    .update({
      status: 'ready',
      sequence_version: version,
      generation_meta: {
        model,
        promptVersion: PROMPT_VERSIONS.campaignSequence,
        angle,
        generatedAt: new Date().toISOString(),
        touchCount: touches.length,
        spanDays,
        fallback,
      },
    })
    .eq('id', campaignId);

  await logActivity({
    workspaceId: workspace.id,
    actorType: options.actorId ? 'user' : 'system',
    actorId: options.actorId ?? null,
    action: options.regenerate ? 'campaign.regenerated' : 'campaign.generated',
    summary:
      `${options.regenerate ? 'Regenerated' : 'Generated'} "${campaign.name}": ${touches.length} touches ` +
      `over ${spanDays} days${fallback ? ' using the built-in fallback sequence' : ''}.`,
    entityType: 'campaign',
    entityId: campaignId,
    metadata: {
      model,
      promptVersion: PROMPT_VERSIONS.campaignSequence,
      templateVersion: version,
      angle,
      touchCount: touches.length,
      spanDays,
      fallback,
      listContacts: list.contactCount,
    },
  });

  return {
    touches,
    version,
    angle,
    model,
    promptVersion: PROMPT_VERSIONS.campaignSequence,
    fallback,
  };
}

/** Human-readable dormancy string used in prompts and previews. */
export { describeDormancy };
