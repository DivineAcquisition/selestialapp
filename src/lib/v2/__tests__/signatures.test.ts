import assert from 'node:assert/strict';
import { generateKeyPairSync, createSign } from 'node:crypto';
import test from 'node:test';

import {
  normalizePublicKey,
  signSvix,
  verifyRsaSignature,
  verifySvixSignature,
} from '../signatures';

/**
 * A synthetic secret in the shape Resend issues (`whsec_` + 32 bytes of base64), so the
 * parsing path is exercised against the real format. Generated for this test and never
 * used anywhere — deliberately not derived from any live signing secret.
 */
const SECRET = `whsec_${Buffer.from('selestial-signature-test-secret!').toString('base64')}`;

const BODY = JSON.stringify({
  type: 'email.delivered',
  created_at: '2026-07-26T01:00:00.000Z',
  data: { email_id: '4ef9a417-02e9-4d39-ad75-9611e0fcc33c', to: ['jane@example.com'] },
});

const ID = 'msg_2abcDEF';

function nowSeconds(): string {
  return String(Math.floor(Date.now() / 1000));
}

test('accepts a correctly signed Resend payload', () => {
  const timestamp = nowSeconds();
  const signature = signSvix(SECRET, ID, timestamp, BODY);

  assert.equal(
    verifySvixSignature({ secret: SECRET, id: ID, timestamp, signature, body: BODY }),
    true
  );
});

test('rejects a payload whose body was altered after signing', () => {
  const timestamp = nowSeconds();
  const signature = signSvix(SECRET, ID, timestamp, BODY);
  const tampered = BODY.replace('jane@example.com', 'attacker@example.com');

  assert.equal(
    verifySvixSignature({ secret: SECRET, id: ID, timestamp, signature, body: tampered }),
    false
  );
});

test('rejects a signature made with a different secret', () => {
  const timestamp = nowSeconds();
  const signature = signSvix('whsec_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', ID, timestamp, BODY);

  assert.equal(
    verifySvixSignature({ secret: SECRET, id: ID, timestamp, signature, body: BODY }),
    false
  );
});

test('rejects a replayed capture outside the tolerance window', () => {
  const oldTimestamp = String(Math.floor(Date.now() / 1000) - 3600);
  const signature = signSvix(SECRET, ID, oldTimestamp, BODY);

  assert.equal(
    verifySvixSignature({
      secret: SECRET,
      id: ID,
      timestamp: oldTimestamp,
      signature,
      body: BODY,
    }),
    false,
    'an hour-old signature must not be accepted'
  );

  // Same payload is valid when it arrives on time.
  assert.equal(
    verifySvixSignature({
      secret: SECRET,
      id: ID,
      timestamp: oldTimestamp,
      signature,
      body: BODY,
      now: () => (Number(oldTimestamp) + 10) * 1000,
    }),
    true
  );
});

test('binds the signature to the message id, so one cannot be reused for another', () => {
  const timestamp = nowSeconds();
  const signature = signSvix(SECRET, ID, timestamp, BODY);

  assert.equal(
    verifySvixSignature({
      secret: SECRET,
      id: 'msg_somethingElse',
      timestamp,
      signature,
      body: BODY,
    }),
    false
  );
});

test('accepts a rotation header carrying several signatures', () => {
  const timestamp = nowSeconds();
  const good = signSvix(SECRET, ID, timestamp, BODY);
  const header = `v1,someOldSignature ${good}`;

  assert.equal(
    verifySvixSignature({ secret: SECRET, id: ID, timestamp, signature: header, body: BODY }),
    true
  );
});

test('rejects missing headers rather than throwing', () => {
  const base = { secret: SECRET, body: BODY, timestamp: nowSeconds(), id: ID, signature: 'v1,x' };

  assert.equal(verifySvixSignature({ ...base, id: null }), false);
  assert.equal(verifySvixSignature({ ...base, timestamp: null }), false);
  assert.equal(verifySvixSignature({ ...base, signature: null }), false);
  assert.equal(verifySvixSignature({ ...base, secret: '' }), false);
  assert.equal(verifySvixSignature({ ...base, timestamp: 'not-a-number' }), false);
});

// ---------------------------------------------------------------------------
// GoHighLevel RSA signatures
// ---------------------------------------------------------------------------

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

function signRsa(body: string): string {
  const signer = createSign('SHA256');
  signer.update(body);
  signer.end();
  return signer.sign(privateKey, 'base64');
}

test('accepts a correctly signed GHL payload', () => {
  const body = JSON.stringify({ type: 'InboundMessage', locationId: 'loc_1', body: 'STOP' });
  assert.equal(verifyRsaSignature(body, signRsa(body), publicKey), true);
});

test('rejects a GHL payload altered after signing', () => {
  const body = JSON.stringify({ type: 'InboundMessage', locationId: 'loc_1' });
  const signature = signRsa(body);
  const tampered = JSON.stringify({ type: 'InboundMessage', locationId: 'loc_ATTACKER' });

  assert.equal(verifyRsaSignature(tampered, signature, publicKey), false);
});

test('returns false rather than throwing when no key is configured', () => {
  const body = '{}';
  assert.equal(verifyRsaSignature(body, signRsa(body), undefined), false);
  assert.equal(verifyRsaSignature(body, null, publicKey), false);
  assert.equal(verifyRsaSignature(body, 'not-base64!!', publicKey), false);
  assert.equal(verifyRsaSignature(body, signRsa(body), 'garbage key'), false);
});

test('accepts a public key however the environment mangled its newlines', () => {
  const body = JSON.stringify({ type: 'ContactUpdate' });
  const signature = signRsa(body);

  // As it would arrive from an env var with escaped newlines.
  const escaped = publicKey.replace(/\n/g, '\\n');
  assert.equal(verifyRsaSignature(body, signature, escaped), true);

  // And as a bare base64 body with no PEM armour.
  const bare = publicKey
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');
  assert.ok(normalizePublicKey(bare).includes('BEGIN PUBLIC KEY'));
  assert.equal(verifyRsaSignature(body, signature, bare), true);
});
