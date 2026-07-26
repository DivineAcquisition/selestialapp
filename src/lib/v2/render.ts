import 'server-only';

import { callModel, isAiConfigured, PROMPT_VERSIONS, SUMMARY_MODEL } from './ai';
import {
  emailFooterHtml,
  emailFooterText,
  enforceSmsOptOut,
  smsSegments,
} from './compliance';
import { createTrackedLink } from './links';
import { describeDormancy } from './normalize';
import { substitute, textToHtml } from './template';
import type { CampaignTouch, Contact, Workspace } from './types';

export { substitute, textToHtml };

/**
 * Per-contact rendering: turns a campaign template into the exact bytes that go out.
 *
 * Merge substitution is deterministic. The optional AI pass only rewrites a message when
 * the contact has a case-file summary worth using, and it is held to the same length and
 * compliance rules as the deterministic path — if it returns anything suspicious the
 * deterministic render is used instead.
 */

export interface RenderContext {
  workspace: Workspace;
  contact: Contact;
  touch: CampaignTouch;
  /** Set once the outreach_messages row exists, so links can be attributed to it. */
  messageId?: string | null;
  campaignId: string;
  offer?: string | null;
  bookingUrl?: string | null;
  attachmentId?: string | null;
  /** Preview mode mints no tokens and writes nothing. */
  preview?: boolean;
}

export interface RenderedMessage {
  subject: string | null;
  body: string;
  html: string | null;
  segments: number | null;
  meta: {
    personalized: boolean;
    model?: string;
    promptVersion?: string;
    templateVersion: number;
    variablesFilled: string[];
    variablesMissing: string[];
  };
}

function firstNameOf(contact: Contact): string {
  return (contact.first_name ?? contact.full_name?.split(/\s+/)[0] ?? '').trim();
}

function displayNameOf(contact: Contact): string {
  return (contact.full_name ?? [contact.first_name, contact.last_name].filter(Boolean).join(' ')).trim();
}

function lastServiceLabel(contact: Contact): string {
  if (!contact.last_service_date) return 'your last visit';
  const date = new Date(contact.last_service_date);
  if (Number.isNaN(date.getTime())) return 'your last visit';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

async function buildVariables(context: RenderContext): Promise<Record<string, string>> {
  const { workspace, contact, touch } = context;

  const bookingUrl = context.bookingUrl || workspace.booking_url || '';
  let bookingLink = '';
  let attachmentLink = '';

  if (touch.link_kind === 'booking' || touch.link_kind === 'offer') {
    if (context.preview) {
      bookingLink = `${process.env.NEXT_PUBLIC_LINK_BASE_URL || 'https://app.selestial.io'}/l/preview`;
    } else if (bookingUrl) {
      bookingLink = await createTrackedLink({
        workspaceId: workspace.id,
        contactId: contact.id,
        campaignId: context.campaignId,
        messageId: context.messageId ?? null,
        touchId: touch.id,
        kind: 'url',
        destinationUrl: bookingUrl,
        label: touch.link_kind === 'offer' ? 'Offer' : 'Booking',
      });
    }
  }

  const attachmentId = context.attachmentId ?? touch.attachment_id;
  if (touch.link_kind === 'attachment' && attachmentId) {
    attachmentLink = context.preview
      ? `${process.env.NEXT_PUBLIC_LINK_BASE_URL || 'https://app.selestial.io'}/v/preview`
      : await createTrackedLink({
          workspaceId: workspace.id,
          contactId: contact.id,
          campaignId: context.campaignId,
          messageId: context.messageId ?? null,
          touchId: touch.id,
          kind: 'attachment',
          attachmentId,
          label: 'Attachment',
        });
  }

  return {
    first_name: firstNameOf(contact),
    full_name: displayNameOf(contact),
    business_name: workspace.name,
    service_type: contact.service_type || workspace.service_types[0] || 'service',
    last_service: lastServiceLabel(contact),
    dormancy: describeDormancy(contact.last_service_date).replace(/^Dormant\s+/i, ''),
    city: contact.city || workspace.service_area || '',
    offer: context.offer || workspace.business_profile?.offer || '',
    booking_link: bookingLink,
    attachment_link: attachmentLink,
  };
}

const PERSONALIZATION_SYSTEM = `You adapt one already-approved marketing message to one specific recipient, using what is known about them.

Rules:
- Keep the same intent, the same call to action, and the same link. Never remove or alter a URL.
- Change at most one or two sentences. This is a light touch, not a rewrite.
- Never invent facts. Only use what the case file states.
- Keep SMS under 300 characters. Keep the same overall length for email.
- Never remove opt-out or unsubscribe language.
- Return only the adapted message text. No preamble, no quotes, no explanation.`;

async function personalize(
  context: RenderContext,
  baseText: string
): Promise<{ text: string; model: string } | null> {
  const { contact, workspace, touch } = context;

  if (!isAiConfigured() || !contact.ai_summary) return null;

  try {
    const result = await callModel({
      workspaceId: workspace.id,
      operation: 'message.personalize',
      promptVersion: PROMPT_VERSIONS.contactPersonalization,
      model: SUMMARY_MODEL,
      system: PERSONALIZATION_SYSTEM,
      user: [
        `Channel: ${touch.channel}`,
        `Business: ${workspace.name}`,
        '',
        'Case file for this recipient:',
        contact.ai_summary,
        '',
        'Message to adapt:',
        baseText,
      ].join('\n'),
      maxTokens: 700,
      temperature: 0.6,
    });

    const text = result.text.trim();
    if (!text) return null;

    // Guard the model against itself: a personalization that drops the link or balloons
    // the length is discarded in favour of the deterministic render.
    const originalUrls = baseText.match(/https?:\/\/\S+/g) ?? [];
    const keptAllUrls = originalUrls.every((url) => text.includes(url));
    const lengthSane = text.length <= Math.max(360, baseText.length * 1.6);

    if (!keptAllUrls || !lengthSane) return null;

    return { text, model: result.model };
  } catch (err) {
    console.error('[render] personalization failed, using the base render', err);
    return null;
  }
}

/**
 * Renders one touch for one contact.
 *
 * `unsubscribeUrl` is required for email and is minted by the caller so the same token
 * can go in both the body and the List-Unsubscribe header.
 */
export async function renderMessage(
  context: RenderContext,
  options: { personalize?: boolean; unsubscribeUrl?: string } = {}
): Promise<RenderedMessage> {
  const { touch, contact, workspace } = context;

  const variables = await buildVariables(context);
  const bodyResult = substitute(touch.body_template, variables);
  const subjectResult = touch.subject_template
    ? substitute(touch.subject_template, variables)
    : null;

  let body = bodyResult.text;
  let personalizedWith: string | undefined;

  if (options.personalize !== false && contact.ai_summary) {
    const personalized = await personalize(context, body);
    if (personalized) {
      body = personalized.text;
      personalizedWith = personalized.model;
    }
  }

  if (touch.channel === 'sms') {
    body = enforceSmsOptOut(body, touch.include_optout);

    return {
      subject: null,
      body,
      html: null,
      segments: smsSegments(body),
      meta: {
        personalized: Boolean(personalizedWith),
        model: personalizedWith,
        promptVersion: personalizedWith ? PROMPT_VERSIONS.contactPersonalization : undefined,
        templateVersion: touch.version,
        variablesFilled: bodyResult.filled,
        variablesMissing: bodyResult.missing,
      },
    };
  }

  const unsubscribeUrl = options.unsubscribeUrl ?? '#';
  const footerParams = {
    businessName: workspace.name,
    physicalAddress: workspace.physical_address,
    unsubscribeUrl,
  };

  const html = `${textToHtml(body)}${emailFooterHtml(footerParams)}`;
  const text = `${body}\n${emailFooterText(footerParams)}`;

  return {
    subject: subjectResult?.text || 'A quick note',
    body: text,
    html: wrapEmailHtml(html, workspace.primary_color ?? '#6428F9'),
    segments: null,
    meta: {
      personalized: Boolean(personalizedWith),
      model: personalizedWith,
      promptVersion: personalizedWith ? PROMPT_VERSIONS.contactPersonalization : undefined,
      templateVersion: touch.version,
      variablesFilled: [...bodyResult.filled, ...(subjectResult?.filled ?? [])],
      variablesMissing: [...bodyResult.missing, ...(subjectResult?.missing ?? [])],
    },
  };
}

function wrapEmailHtml(inner: string, accent: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:28px 16px;background:#f6f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;padding:32px;border-top:3px solid ${accent}">
      <tr><td>${inner}</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
