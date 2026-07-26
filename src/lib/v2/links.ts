import 'server-only';

import { randomBytes } from 'node:crypto';

import { adminDb } from './db';
import type { TrackedLink } from './types';

/**
 * Tokenized link service.
 *
 * No message ever contains a raw destination URL. Every link, including attachments and
 * unsubscribe, is minted as a token unique to one contact, one message and one
 * destination, so a click is unambiguously attributable to a person rather than inferred
 * from a shared URL.
 */

/** Route prefixes, kept here so the renderer and the route handlers cannot drift apart. */
export const LINK_ROUTES = {
  url: 'l',
  attachment: 'v',
  unsubscribe: 'u',
} as const;

export function linkBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_LINK_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

/** 16 bytes of entropy: short enough for SMS, far too large to enumerate. */
function mintToken(): string {
  return randomBytes(12).toString('base64url');
}

export function linkUrl(token: string, kind: TrackedLink['kind']): string {
  return `${linkBaseUrl()}/${LINK_ROUTES[kind]}/${token}`;
}

/**
 * The POST target for the `List-Unsubscribe` header.
 *
 * Separate from the `/u/<token>` page on purpose: that page must stay GET-only so mail
 * scanners cannot unsubscribe someone by prefetching the link. Same token, so both paths
 * resolve to the same contact.
 */
export function oneClickUnsubscribeUrl(token: string): string {
  return `${linkBaseUrl()}/api/unsubscribe/${token}`;
}

/** Recovers the token from a URL this module produced. */
export function tokenFromUrl(url: string): string {
  return url.split('/').pop() ?? '';
}

export interface CreateLinkParams {
  workspaceId: string;
  contactId: string | null;
  campaignId?: string | null;
  messageId?: string | null;
  touchId?: string | null;
  kind: TrackedLink['kind'];
  destinationUrl?: string | null;
  attachmentId?: string | null;
  label?: string | null;
  expiresAt?: Date | null;
}

/**
 * Returns the tokenized URL for a destination, reusing the existing token when this
 * exact (message, kind, destination) triple has already been minted. Reuse matters
 * because a retried dispatch must not produce a second token — that would split one
 * contact's clicks across two rows.
 */
export async function createTrackedLink(params: CreateLinkParams): Promise<string> {
  const db = adminDb();

  if (params.messageId) {
    const { data: existing } = await db
      .from('tracked_links')
      .select('token')
      .eq('message_id', params.messageId)
      .eq('kind', params.kind)
      .eq('destination_url', params.destinationUrl ?? '')
      .maybeSingle();

    if (existing?.token) return linkUrl(existing.token as string, params.kind);
  }

  const token = mintToken();

  const { error } = await db.from('tracked_links').insert({
    token,
    workspace_id: params.workspaceId,
    contact_id: params.contactId,
    campaign_id: params.campaignId ?? null,
    message_id: params.messageId ?? null,
    touch_id: params.touchId ?? null,
    kind: params.kind,
    destination_url: params.destinationUrl ?? null,
    attachment_id: params.attachmentId ?? null,
    label: params.label ?? null,
    expires_at: params.expiresAt?.toISOString() ?? null,
  });

  if (error) {
    // Lost a race on the dedupe index: read back the winner rather than failing the send.
    if (error.code === '23505' && params.messageId) {
      const { data } = await db
        .from('tracked_links')
        .select('token')
        .eq('message_id', params.messageId)
        .eq('kind', params.kind)
        .eq('destination_url', params.destinationUrl ?? '')
        .maybeSingle();
      if (data?.token) return linkUrl(data.token as string, params.kind);
    }
    throw error;
  }

  return linkUrl(token, params.kind);
}

export async function resolveToken(token: string): Promise<TrackedLink | null> {
  const { data } = await adminDb().from('tracked_links').select('*').eq('token', token).maybeSingle();
  return (data as TrackedLink) ?? null;
}

/** Bumps the denormalized click counters. The authoritative record is the event row. */
export async function bumpClickCounters(link: TrackedLink): Promise<void> {
  const now = new Date().toISOString();
  await adminDb()
    .from('tracked_links')
    .update({
      click_count: link.click_count + 1,
      first_clicked_at: link.first_clicked_at ?? now,
      last_clicked_at: now,
    })
    .eq('id', link.id);
}

export function isExpired(link: TrackedLink): boolean {
  return Boolean(link.expires_at && new Date(link.expires_at).getTime() < Date.now());
}

/**
 * Only http(s) destinations are ever followed. Tokens are minted server-side, but this
 * closes off `javascript:` and `data:` reaching a redirect if a destination is ever set
 * from operator input.
 */
export function isSafeDestination(url: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
