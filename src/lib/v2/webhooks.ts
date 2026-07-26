import 'server-only';

import { adminDb } from './db';
import { verifyRsaSignature, verifySvixSignature } from './signatures';

export { verifySvixSignature };

/**
 * Shared webhook intake: log the raw payload first, then process.
 *
 * Nothing is ever dropped silently. A payload that fails processing stays in
 * `inbound_webhooks` with its error and is retryable from the admin screen, which is the
 * difference between "the client says replies stopped working" being a five-minute fix
 * and an afternoon of guessing.
 */

export interface IntakeParams {
  provider: 'ghl' | 'resend';
  eventType: string | null;
  raw: unknown;
  headers: Record<string, string>;
  signatureVerified: boolean;
  workspaceId?: string | null;
  /** Provider event id, when there is one, so retries collapse onto one row. */
  dedupeKey?: string | null;
}

export interface IntakeResult {
  id: string | null;
  duplicate: boolean;
}

export async function recordInboundWebhook(params: IntakeParams): Promise<IntakeResult> {
  const { data, error } = await adminDb()
    .from('inbound_webhooks')
    .insert({
      provider: params.provider,
      event_type: params.eventType,
      workspace_id: params.workspaceId ?? null,
      signature_verified: params.signatureVerified,
      headers: params.headers,
      raw: params.raw as Record<string, unknown>,
      dedupe_key: params.dedupeKey ?? null,
      status: 'received',
    })
    .select('id')
    .maybeSingle();

  if (error) {
    if (error.code === '23505') return { id: null, duplicate: true };
    throw error;
  }

  return { id: (data?.id as string) ?? null, duplicate: false };
}

export async function markWebhookProcessed(
  id: string | null,
  patch: { workspaceId?: string | null; eventType?: string | null } = {}
): Promise<void> {
  if (!id) return;
  await adminDb()
    .from('inbound_webhooks')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString(),
      error: null,
      ...(patch.workspaceId ? { workspace_id: patch.workspaceId } : {}),
      ...(patch.eventType ? { event_type: patch.eventType } : {}),
    })
    .eq('id', id);
}

export async function markWebhookIgnored(id: string | null, reason: string): Promise<void> {
  if (!id) return;
  await adminDb()
    .from('inbound_webhooks')
    .update({ status: 'ignored', error: reason, processed_at: new Date().toISOString() })
    .eq('id', id);
}

/** After this many attempts a payload stops retrying and waits for a human. */
export const DEAD_LETTER_AFTER = 5;

export async function markWebhookFailed(id: string | null, error: string): Promise<void> {
  if (!id) return;
  const db = adminDb();

  const { data } = await db.from('inbound_webhooks').select('attempts').eq('id', id).maybeSingle();
  const attempts = ((data?.attempts as number) ?? 0) + 1;

  await db
    .from('inbound_webhooks')
    .update({
      status: attempts >= DEAD_LETTER_AFTER ? 'dead_letter' : 'failed',
      attempts,
      error: error.slice(0, 1000),
    })
    .eq('id', id);
}

// ---------------------------------------------------------------------------
// Signature verification
// ---------------------------------------------------------------------------

/** Verifies GoHighLevel's `x-wh-signature` against the configured public key. */
export function verifyGhlSignature(body: string, signature: string | null): boolean {
  return verifyRsaSignature(body, signature, process.env.GHL_WEBHOOK_PUBLIC_KEY);
}

export function headerMap(headers: Headers): Record<string, string> {
  const interesting = [
    'x-wh-signature',
    'svix-id',
    'svix-timestamp',
    'svix-signature',
    'content-type',
    'user-agent',
  ];

  const out: Record<string, string> = {};
  for (const name of interesting) {
    const value = headers.get(name);
    if (value) out[name] = name.includes('signature') ? `${value.slice(0, 12)}…` : value;
  }
  return out;
}
