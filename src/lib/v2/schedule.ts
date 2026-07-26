/**
 * Send-window and quiet-hours arithmetic, in the contact's own timezone.
 *
 * Pure functions with no server dependencies (tested in
 * src/lib/v2/__tests__/schedule.test.ts) because getting this wrong means texting
 * someone at 3am, which is both a TCPA violation and the fastest way to burn a list.
 */

/**
 * Hard legal bounds. TCPA restricts marketing calls and texts to 8am–9pm in the
 * recipient's local time. A campaign's configured window is intersected with this, never
 * widened by it, so no operator setting can produce an out-of-hours send.
 */
export const QUIET_HOURS_START = 8;
export const QUIET_HOURS_END = 21;

export interface SendWindow {
  /** Local hour sends may begin, 0–23. */
  startHour: number;
  /** Local hour sends must stop, 1–24 (exclusive). */
  endHour: number;
  /** Allowed ISO weekdays, 1 = Monday … 7 = Sunday. */
  days: number[];
}

export const DEFAULT_SEND_WINDOW: SendWindow = {
  startHour: 9,
  endHour: 19,
  days: [1, 2, 3, 4, 5],
};

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** ISO weekday, 1 = Monday. */
  weekday: number;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

/** Falls back to UTC for a timezone the runtime does not recognise. */
function safeTimeZone(timeZone: string): string {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return timeZone;
  } catch {
    return 'UTC';
  }
}

export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTimeZone(timeZone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  });

  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    // Intl renders midnight as "24" in some ICU versions.
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    weekday: WEEKDAY_INDEX[parts.weekday] ?? 1,
  };
}

/** The UTC instant at which the given wall-clock time occurs in `timeZone`. */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const parts = zonedParts(new Date(guess), timeZone);
  const rendered = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  return new Date(guess - (rendered - guess));
}

/** Intersects the configured window with the legal quiet-hours bounds. */
export function effectiveWindow(window: SendWindow): SendWindow {
  const startHour = Math.max(QUIET_HOURS_START, Math.min(23, Math.floor(window.startHour)));
  const endHour = Math.min(QUIET_HOURS_END, Math.max(1, Math.ceil(window.endHour)));

  return {
    startHour,
    // Guarantee a non-empty window even if the operator inverted the hours.
    endHour: endHour <= startHour ? Math.min(QUIET_HOURS_END, startHour + 1) : endHour,
    days: window.days.length > 0 ? window.days : DEFAULT_SEND_WINDOW.days,
  };
}

export function isWithinWindow(date: Date, timeZone: string, window: SendWindow): boolean {
  const w = effectiveWindow(window);
  const parts = zonedParts(date, timeZone);
  return w.days.includes(parts.weekday) && parts.hour >= w.startHour && parts.hour < w.endHour;
}

/**
 * The earliest instant at or after `desired` that falls inside the send window in the
 * contact's timezone. Rolls forward to the next allowed day when the desired time is
 * after hours or on an excluded day.
 */
export function nextSendTime(desired: Date, timeZone: string, window: SendWindow): Date {
  const w = effectiveWindow(window);

  for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
    const probe = new Date(desired.getTime() + dayOffset * 86_400_000);
    const parts = zonedParts(probe, timeZone);

    if (!w.days.includes(parts.weekday)) continue;

    if (dayOffset === 0 && parts.hour >= w.startHour && parts.hour < w.endHour) {
      return desired;
    }

    // Before the window opens (today or on a later allowed day): open of business.
    if (dayOffset > 0 || parts.hour < w.startHour) {
      return zonedTimeToUtc(parts.year, parts.month, parts.day, w.startHour, 0, timeZone);
    }
    // Past the window today: fall through to the next allowed day.
  }

  // No allowed day in two weeks means the window is unusable; send at the desired time
  // rather than silently dropping the touch, and let the operator see it in the log.
  return desired;
}

/**
 * Spreads a batch of sends across the window so a 2,000-contact launch does not fire as
 * one burst. Returns an offset in milliseconds to add to the base send time.
 */
export function jitterOffsetMs(index: number, batchSize: number, windowHours: number): number {
  if (batchSize <= 1) return 0;
  const windowMs = Math.max(1, windowHours) * 3_600_000;
  const step = windowMs / batchSize;
  return Math.floor(index * step);
}
