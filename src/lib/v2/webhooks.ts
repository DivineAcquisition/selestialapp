import 'server-only';

import { createHmac, createVerify, timingSafeEqual } from 'node:crypto';

import { adminDb } from './db';

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

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Verifies a Svix-style signature, which is what Resend uses.
 *
 * The signed payload is `${id}.${timestamp}.${body}`, HMAC-SHA256 with the secret after
 * its `whsec_` prefix is base64-decoded. The header may carry several space-separated
 * `v1,<sig>` values during a secret rotation, so any match counts.
 */
export function verifySvixSignature(params: {
  secret: string;
  id: string | null;
  timestamp: string | null;
  signature: string | null;
  body: string;
  toleranceSeconds?: number;
}): boolean {
  const { secret, id, timestamp, signature, body } = params;
  if (!secret || !id || !timestamp || !signature) return false;

  // Reject replays of an old capture.
  const tolerance = params.toleranceSeconds ?? 300;
  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt)) return false;
  if (Math.abs(Date.now() / 1000 - sentAt) > tolerance) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64');

  return signature
    .split(' ')
    .map((part) => part.split(',', 2)[1] ?? part)
    .some((candidate) => safeEqual(candidate, expected));
}

/**
 * Verifies GoHighLevel's `x-wh-signature`, an RSA-SHA256 signature over the raw body,
 * checked against GHL's published public key.
 *
 * Returns false when no key is configured. The caller decides what to do with an
 * unverified payload — the endpoints here record it and process it, but flag
 * `signature_verified: false` so the gap is visible in the admin screen rather than
 * invisible.
 */
export function verifyGhlSignature(body: string, signature: string | null): boolean {
  const publicKey = process.env.GHL_WEBHOOK_PUBLIC_KEY;
  if (!publicKey || !signature) return false;

  try {
    const verifier = createVerify('SHA256');
    verifier.update(body);
    verifier.end();
    return verifier.verify(normalizePublicKey(publicKey), signature, 'base64');
  } catch (err) {
    console.error('[webhook] GHL signature verification threw', err);
    return false;
  }
}

/** Accepts the key with real newlines or with the `\n` escapes an env var usually carries. */
function normalizePublicKey(key: string): string {
  const unescaped = key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
  if (unescaped.includes('BEGIN PUBLIC KEY')) return unescaped;
  return `-----BEGIN PUBLIC KEY-----\n${unescaped.trim()}\n-----END PUBLIC KEY-----`;
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
