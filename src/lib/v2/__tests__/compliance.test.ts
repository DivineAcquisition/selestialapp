import assert from 'node:assert/strict';
import test from 'node:test';

import {
  enforceSmsOptOut,
  hasOptOutLanguage,
  isOptOutReply,
  smsSegments,
  suppressionReason,
} from '../compliance';

const reachable = {
  status: 'active',
  do_not_contact: false,
  email: 'jane@example.com',
  phone: '+15125550142',
  email_bounced_at: null,
};

test('appends opt-out language when the generated copy omitted it', () => {
  const result = enforceSmsOptOut('Hi Jane, it has been a while since your last deep clean.', true);
  assert.ok(result.includes('Reply STOP to opt out.'));
});

test('does not duplicate opt-out language the model already included', () => {
  const body = 'Hi Jane, want to rebook? Reply STOP to opt out.';
  assert.equal(enforceSmsOptOut(body, true), body);
  assert.equal(hasOptOutLanguage(body), true);
});

test('recognises the common phrasings of opt-out language', () => {
  assert.equal(hasOptOutLanguage('Text STOP to unsubscribe'), true);
  assert.equal(hasOptOutLanguage('Reply stop to opt out'), true);
  assert.equal(hasOptOutLanguage('Let us know if you want to opt out'), true);
  assert.equal(hasOptOutLanguage('We stopped by last Tuesday'), false);
});

test('trims the body rather than overflowing when adding opt-out language', () => {
  const long = 'x'.repeat(400);
  const result = enforceSmsOptOut(long, true, 320);

  assert.ok(result.length <= 320, `expected <= 320 chars, got ${result.length}`);
  assert.ok(result.endsWith('Reply STOP to opt out.'));
});

test('leaves later touches alone when opt-out language is not required', () => {
  const body = 'Quick follow-up on that quote.';
  assert.equal(enforceSmsOptOut(body, false), body);
});

test('counts SMS segments for GSM-7 and unicode bodies', () => {
  assert.equal(smsSegments('short'), 1);
  assert.equal(smsSegments('a'.repeat(160)), 1);
  assert.equal(smsSegments('a'.repeat(161)), 2);
  assert.equal(smsSegments('emoji ✨'), 1);
  assert.equal(smsSegments(`${'a'.repeat(71)}✨`), 2, 'unicode drops the limit to 70');
});

test('detects opt-out replies without over-triggering on ordinary messages', () => {
  assert.equal(isOptOutReply('STOP'), true);
  assert.equal(isOptOutReply('stop'), true);
  assert.equal(isOptOutReply('  Unsubscribe  '), true);
  assert.equal(isOptOutReply('STOP!'), true);
  assert.equal(isOptOutReply('opt out'), true);

  assert.equal(isOptOutReply('please stop by on Tuesday around noon'), false);
  assert.equal(isOptOutReply('Yes please book me in'), false);
  assert.equal(isOptOutReply(''), false);
});

test('opt-out suppresses every channel, permanently', () => {
  const optedOut = { ...reachable, status: 'opted_out' };

  assert.equal(suppressionReason(optedOut, 'sms'), 'opted_out');
  assert.equal(suppressionReason(optedOut, 'email'), 'opted_out');
});

test('do-not-contact and booked statuses suppress sends', () => {
  assert.equal(suppressionReason({ ...reachable, do_not_contact: true }, 'sms'), 'do_not_contact');
  assert.equal(suppressionReason({ ...reachable, status: 'booked' }, 'email'), 'already_booked');
});

test('a bounced address is suppressed for email but not for SMS', () => {
  const bounced = { ...reachable, email_bounced_at: '2024-01-01T00:00:00Z' };

  assert.equal(suppressionReason(bounced, 'email'), 'email_bounced');
  assert.equal(suppressionReason(bounced, 'sms'), null);
});

test('a missing channel address suppresses only that channel', () => {
  assert.equal(suppressionReason({ ...reachable, email: null }, 'email'), 'no_email');
  assert.equal(suppressionReason({ ...reachable, email: null }, 'sms'), null);
  assert.equal(suppressionReason({ ...reachable, phone: null }, 'sms'), 'no_phone');
});

test('a reachable active contact is not suppressed', () => {
  assert.equal(suppressionReason(reachable, 'sms'), null);
  assert.equal(suppressionReason(reachable, 'email'), null);
});
