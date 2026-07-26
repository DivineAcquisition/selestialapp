import assert from 'node:assert/strict';
import test from 'node:test';

import {
  effectiveWindow,
  isWithinWindow,
  nextSendTime,
  QUIET_HOURS_END,
  QUIET_HOURS_START,
  zonedParts,
  zonedTimeToUtc,
} from '../schedule';

const CHICAGO = 'America/Chicago';
const NEW_YORK = 'America/New_York';

test('reads wall-clock parts in the target timezone', () => {
  // 2024-03-13T15:30:00Z is 10:30 on a Wednesday in Chicago (CDT, UTC-5).
  const parts = zonedParts(new Date('2024-03-13T15:30:00Z'), CHICAGO);

  assert.equal(parts.year, 2024);
  assert.equal(parts.month, 3);
  assert.equal(parts.day, 13);
  assert.equal(parts.hour, 10);
  assert.equal(parts.weekday, 3);
});

test('round-trips a local wall-clock time back to the right UTC instant', () => {
  const utc = zonedTimeToUtc(2024, 3, 13, 9, 0, CHICAGO);
  assert.equal(utc.toISOString(), '2024-03-13T14:00:00.000Z');

  const backToLocal = zonedParts(utc, CHICAGO);
  assert.equal(backToLocal.hour, 9);
});

test('quiet hours clamp a window an operator opened too wide', () => {
  const window = effectiveWindow({ startHour: 5, endHour: 23, days: [1, 2, 3, 4, 5] });

  assert.equal(window.startHour, QUIET_HOURS_START);
  assert.equal(window.endHour, QUIET_HOURS_END);
});

test('an inverted window still yields a usable hour instead of nothing', () => {
  const window = effectiveWindow({ startHour: 18, endHour: 9, days: [1] });

  assert.ok(window.endHour > window.startHour);
});

test('recognises times inside and outside the window', () => {
  const window = { startHour: 9, endHour: 19, days: [1, 2, 3, 4, 5] };

  // Wednesday 10:30 Chicago.
  assert.equal(isWithinWindow(new Date('2024-03-13T15:30:00Z'), CHICAGO, window), true);
  // Wednesday 03:00 Chicago — the middle of the night.
  assert.equal(isWithinWindow(new Date('2024-03-13T08:00:00Z'), CHICAGO, window), false);
  // Saturday 10:30 Chicago — excluded day.
  assert.equal(isWithinWindow(new Date('2024-03-16T15:30:00Z'), CHICAGO, window), false);
});

test('a 3am target is pushed to the window opening the same morning', () => {
  const window = { startHour: 9, endHour: 19, days: [1, 2, 3, 4, 5] };
  // Wednesday 03:00 Chicago.
  const result = nextSendTime(new Date('2024-03-13T08:00:00Z'), CHICAGO, window);
  const parts = zonedParts(result, CHICAGO);

  assert.equal(parts.hour, 9);
  assert.equal(parts.day, 13);
});

test('an after-hours target rolls to the next allowed morning', () => {
  const window = { startHour: 9, endHour: 19, days: [1, 2, 3, 4, 5] };
  // Wednesday 21:00 Chicago.
  const result = nextSendTime(new Date('2024-03-14T02:00:00Z'), CHICAGO, window);
  const parts = zonedParts(result, CHICAGO);

  assert.equal(parts.day, 14, 'rolls to Thursday');
  assert.equal(parts.hour, 9);
});

test('a Saturday target skips the weekend when weekends are excluded', () => {
  const window = { startHour: 9, endHour: 19, days: [1, 2, 3, 4, 5] };
  // Saturday 14:00 Chicago.
  const result = nextSendTime(new Date('2024-03-16T19:00:00Z'), CHICAGO, window);
  const parts = zonedParts(result, CHICAGO);

  assert.equal(parts.weekday, 1, 'lands on Monday');
  assert.equal(parts.hour, 9);
});

test('a time already inside the window is left exactly as-is', () => {
  const window = { startHour: 9, endHour: 19, days: [1, 2, 3, 4, 5] };
  const desired = new Date('2024-03-13T15:30:00Z');

  assert.equal(nextSendTime(desired, CHICAGO, window).toISOString(), desired.toISOString());
});

test('the same instant resolves differently for contacts in different timezones', () => {
  const window = { startHour: 9, endHour: 19, days: [1, 2, 3, 4, 5, 6, 7] };
  // 13:30 UTC is 08:30 in New York (too early) but 07:30 in Chicago (also too early);
  // use 14:30 UTC: 10:30 New York (fine) and 09:30 Chicago (fine).
  const early = new Date('2024-03-13T13:30:00Z');

  const ny = zonedParts(nextSendTime(early, NEW_YORK, window), NEW_YORK);
  const chi = zonedParts(nextSendTime(early, CHICAGO, window), CHICAGO);

  assert.equal(ny.hour, 9, 'New York pushed to 9am local');
  assert.equal(chi.hour, 9, 'Chicago pushed to 9am local');
  assert.notEqual(
    nextSendTime(early, NEW_YORK, window).toISOString(),
    nextSendTime(early, CHICAGO, window).toISOString(),
    'the two 9am local times are different instants'
  );
});

test('an unknown timezone degrades to UTC rather than throwing', () => {
  const window = { startHour: 9, endHour: 19, days: [1, 2, 3, 4, 5] };
  assert.doesNotThrow(() => nextSendTime(new Date('2024-03-13T08:00:00Z'), 'Mars/Olympus', window));
});
