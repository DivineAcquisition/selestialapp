import assert from 'node:assert/strict';
import test from 'node:test';

import {
  describeDormancy,
  dormancyMonths,
  normalizeDate,
  normalizeEmail,
  normalizeMoneyCents,
  normalizePhone,
  splitName,
} from '../normalize';

test('normalizes the US phone formats that appear in exported lists', () => {
  assert.equal(normalizePhone('(512) 555-0142'), '+15125550142');
  assert.equal(normalizePhone('512.555.0142'), '+15125550142');
  assert.equal(normalizePhone('1-512-555-0142'), '+15125550142');
  assert.equal(normalizePhone('+1 512 555 0142'), '+15125550142');
  assert.equal(normalizePhone('5125550142'), '+15125550142');
});

test('drops phone extensions instead of folding them into the number', () => {
  assert.equal(normalizePhone('512-555-0142 x204'), '+15125550142');
  assert.equal(normalizePhone('512-555-0142 ext. 12'), '+15125550142');
});

test('rejects phone numbers it cannot trust rather than guessing', () => {
  assert.equal(normalizePhone('555-0142'), null, 'too short');
  assert.equal(normalizePhone('123-555-0142'), null, 'area code cannot start with 1');
  assert.equal(normalizePhone('512-155-0142'), null, 'exchange cannot start with 1');
  assert.equal(normalizePhone('n/a'), null);
  assert.equal(normalizePhone(''), null);
  assert.equal(normalizePhone(null), null);
});

test('keeps already-international numbers intact', () => {
  assert.equal(normalizePhone('+44 20 7946 0958'), '+442079460958');
  assert.equal(normalizePhone('+1 (512) 555-0142'), '+15125550142');
});

test('normalizes and validates email addresses', () => {
  assert.equal(normalizeEmail('  Jane.Doe@Example.COM '), 'jane.doe@example.com');
  assert.equal(normalizeEmail('Jane Doe <jane@example.com>'), 'jane@example.com');
  assert.equal(normalizeEmail('jane+tag@example.co.uk'), 'jane+tag@example.co.uk');

  assert.equal(normalizeEmail('not-an-email'), null);
  assert.equal(normalizeEmail('jane@'), null);
  assert.equal(normalizeEmail('jane@example'), null);
  assert.equal(normalizeEmail('jane doe@example.com'), null);
  assert.equal(normalizeEmail(''), null);
});

test('parses the date formats found in customer exports', () => {
  assert.equal(normalizeDate('2024-03-09'), '2024-03-09');
  assert.equal(normalizeDate('3/9/2024'), '2024-03-09');
  assert.equal(normalizeDate('03-09-2024'), '2024-03-09');
  assert.equal(normalizeDate('3/9/24'), '2024-03-09');
  assert.equal(normalizeDate('2024-03-09T14:22:00Z'), '2024-03-09');
  assert.equal(normalizeDate('March 9, 2024'), '2024-03-09');
});

test('rejects impossible dates', () => {
  assert.equal(normalizeDate('2024-02-30'), null);
  assert.equal(normalizeDate('13/45/2024'), null);
  assert.equal(normalizeDate('never'), null);
  assert.equal(normalizeDate(''), null);
});

test('parses money into cents', () => {
  assert.equal(normalizeMoneyCents('$1,240.50'), 124050);
  assert.equal(normalizeMoneyCents('240'), 24000);
  assert.equal(normalizeMoneyCents('n/a'), null);
});

test('splits names, preferring explicit columns and handling "Last, First"', () => {
  assert.deepEqual(splitName(null, 'Jane', 'Doe'), {
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
  });

  assert.deepEqual(splitName('Jane Doe'), {
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
  });

  assert.deepEqual(splitName('Doe, Jane'), {
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
  });

  assert.deepEqual(splitName('Cher'), { firstName: 'Cher', lastName: null, fullName: 'Cher' });

  assert.deepEqual(splitName('Maria del Carmen Garcia'), {
    firstName: 'Maria',
    lastName: 'del Carmen Garcia',
    fullName: 'Maria del Carmen Garcia',
  });
});

test('computes dormancy in whole months', () => {
  const now = new Date();
  const fourteenMonthsAgo = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 14, now.getUTCDate())
  )
    .toISOString()
    .slice(0, 10);

  assert.equal(dormancyMonths(fourteenMonthsAgo), 14);
  assert.equal(describeDormancy(fourteenMonthsAgo), 'Dormant 14 months');
  assert.equal(describeDormancy(null), 'No service history');
});
