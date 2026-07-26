/**
 * Compliance rules that message generation and sending are both held to.
 *
 * These are enforced at render time rather than trusted to the model: generation is
 * prompted to include opt-out language, and this module guarantees it regardless of
 * what came back.
 */

export const STOP_KEYWORDS = ['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit', 'optout', 'opt-out'];
export const HELP_KEYWORDS = ['help', 'info'];

const SMS_OPT_OUT_SUFFIX = 'Reply STOP to opt out.';

/** True when the SMS body already tells the recipient how to opt out. */
export function hasOptOutLanguage(body: string): boolean {
  return /\b(reply\s+stop|text\s+stop|stop\s+to\s+(opt\s*out|unsubscribe)|opt\s*out)\b/i.test(body);
}

/**
 * Guarantees opt-out language on an SMS that requires it, trimming the body if needed so
 * the result still fits inside the segment budget.
 */
export function enforceSmsOptOut(body: string, required: boolean, maxLength = 320): string {
  const trimmed = body.trim();
  if (!required || hasOptOutLanguage(trimmed)) return clampSms(trimmed, maxLength);

  const room = maxLength - SMS_OPT_OUT_SUFFIX.length - 1;
  const base = trimmed.length > room ? `${trimmed.slice(0, Math.max(0, room - 1)).trimEnd()}…` : trimmed;

  return `${base} ${SMS_OPT_OUT_SUFFIX}`.trim();
}

function clampSms(body: string, maxLength: number): string {
  if (body.length <= maxLength) return body;
  return `${body.slice(0, maxLength - 1).trimEnd()}…`;
}

/** GSM-7 vs UCS-2 segment count, used to show the operator what a touch actually costs. */
export function smsSegments(body: string): number {
  // eslint-disable-next-line no-control-regex
  const isUnicode = /[^\u0000-\u007F]/.test(body);
  const singleLimit = isUnicode ? 70 : 160;
  const multiLimit = isUnicode ? 67 : 153;

  if (body.length <= singleLimit) return 1;
  return Math.ceil(body.length / multiLimit);
}

/** Detects an inbound reply that is an opt-out request. */
export function isOptOutReply(body: string): boolean {
  const normalized = body
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .trim();

  if (!normalized) return false;

  // Only treat short messages as keywords; "please stop by on Tuesday" is not an opt-out.
  const words = normalized.split(/\s+/);
  if (words.length > 3) return false;

  // Collapsed form catches the spaced and hyphenated spellings of "optout".
  const collapsed = normalized.replace(/[\s-]/g, '');

  return STOP_KEYWORDS.includes(collapsed) || words.some((word) => STOP_KEYWORDS.includes(word));
}

export interface EmailFooterParams {
  businessName: string;
  /** Required by CAN-SPAM. */
  physicalAddress: string | null;
  unsubscribeUrl: string;
}

export function emailFooterHtml(params: EmailFooterParams): string {
  const address = params.physicalAddress?.trim() || 'Address on file — contact us to update it.';

  return `
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e4e4e7;font-size:12px;line-height:1.6;color:#71717a">
      <div>${escapeHtml(params.businessName)}</div>
      <div>${escapeHtml(address)}</div>
      <div style="margin-top:8px">
        <a href="${params.unsubscribeUrl}" style="color:#71717a;text-decoration:underline">Unsubscribe</a>
        from these emails.
      </div>
    </div>`;
}

export function emailFooterText(params: EmailFooterParams): string {
  const address = params.physicalAddress?.trim() || '';
  return [
    '',
    '---',
    params.businessName,
    address,
    `Unsubscribe: ${params.unsubscribeUrl}`,
  ]
    .filter((line) => line !== '')
    .join('\n');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

export type SuppressionReason =
  | 'opted_out'
  | 'do_not_contact'
  | 'already_booked'
  | 'email_bounced'
  | 'no_email'
  | 'no_phone';

export interface SuppressionCheckInput {
  status: string;
  do_not_contact: boolean;
  email: string | null;
  phone: string | null;
  email_bounced_at: string | null;
}

/**
 * The single gate every send passes through. Returns the reason a contact must not be
 * contacted on a channel, or null when the send may proceed.
 *
 * Opt-out is absolute: it applies to every channel, every campaign, permanently, and is
 * checked here immediately before dispatch rather than only at enrollment, so a contact
 * who opts out mid-sequence never receives the touch that was already queued.
 */
export function suppressionReason(
  contact: SuppressionCheckInput,
  channel: 'sms' | 'email'
): SuppressionReason | null {
  if (contact.status === 'opted_out') return 'opted_out';
  if (contact.do_not_contact) return 'do_not_contact';
  if (contact.status === 'do_not_contact') return 'do_not_contact';
  if (contact.status === 'booked') return 'already_booked';

  if (channel === 'email') {
    if (contact.status === 'bounced' || contact.email_bounced_at) return 'email_bounced';
    if (!contact.email) return 'no_email';
  }

  if (channel === 'sms' && !contact.phone) return 'no_phone';

  return null;
}

export const SUPPRESSION_LABELS: Record<SuppressionReason, string> = {
  opted_out: 'Contact opted out',
  do_not_contact: 'Marked do-not-contact',
  already_booked: 'Already booked',
  email_bounced: 'Email previously bounced',
  no_email: 'No email address',
  no_phone: 'No phone number',
};
