import { createHmac, createVerify, timingSafeEqual } from 'node:crypto';

/**
 * Webhook signature verification.
 *
 * Kept free of server-only imports so it can be unit tested directly against a real
 * signing secret — this is security-critical code, and "it looked right" is not the
 * standard it should be held to.
 */

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export interface SvixVerifyParams {
  /** The `whsec_...` signing secret from the provider. */
  secret: string;
  id: string | null;
  timestamp: string | null;
  signature: string | null;
  body: string;
  toleranceSeconds?: number;
  /** Injectable for tests. */
  now?: () => number;
}

/**
 * Verifies a Svix-style signature, which is what Resend uses.
 *
 * The signed payload is `${id}.${timestamp}.${body}`, HMAC-SHA256 with the secret after
 * its `whsec_` prefix is base64-decoded. The header may carry several space-separated
 * `v1,<sig>` values during a secret rotation, so any match counts.
 */
export function verifySvixSignature(params: SvixVerifyParams): boolean {
  const { secret, id, timestamp, signature, body } = params;
  if (!secret || !id || !timestamp || !signature) return false;

  const nowMs = (params.now ?? Date.now)();
  const tolerance = params.toleranceSeconds ?? 300;

  // Reject a replay of an old capture.
  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt)) return false;
  if (Math.abs(nowMs / 1000 - sentAt) > tolerance) return false;

  let key: Buffer;
  try {
    key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  } catch {
    return false;
  }
  if (key.length === 0) return false;

  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64');

  return signature
    .split(' ')
    .map((part) => part.split(',', 2)[1] ?? part)
    .some((candidate) => safeEqual(candidate, expected));
}

/** Produces a valid Svix signature header. Used by the tests and by local replay tooling. */
export function signSvix(secret: string, id: string, timestamp: string, body: string): string {
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const digest = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64');
  return `v1,${digest}`;
}

/**
 * Verifies GoHighLevel's `x-wh-signature`, an RSA-SHA256 signature over the raw body,
 * checked against GHL's published public key.
 *
 * Returns false when no key is configured. The caller decides what to do with an
 * unverified payload — the endpoints record it and flag `signature_verified: false` so
 * the gap is visible in the admin screen rather than invisible.
 */
export function verifyRsaSignature(
  body: string,
  signature: string | null,
  publicKey: string | undefined
): boolean {
  if (!publicKey || !signature) return false;

  try {
    const verifier = createVerify('SHA256');
    verifier.update(body);
    verifier.end();
    return verifier.verify(normalizePublicKey(publicKey), signature, 'base64');
  } catch {
    return false;
  }
}

/** Accepts the key with real newlines or with the `\n` escapes an env var usually carries. */
export function normalizePublicKey(key: string): string {
  const unescaped = key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
  if (unescaped.includes('BEGIN PUBLIC KEY')) return unescaped;
  return `-----BEGIN PUBLIC KEY-----\n${unescaped.trim()}\n-----END PUBLIC KEY-----`;
}
