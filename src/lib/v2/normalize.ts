/**
 * Value normalization shared by CSV import, webhook intake and the contacts API.
 * Pure functions, unit tested in src/lib/v2/__tests__/normalize.test.ts.
 */

/** Default country used when a phone number has no country code. */
const DEFAULT_COUNTRY_CODE = process.env.SELESTIAL_DEFAULT_COUNTRY_CODE || '1';

/**
 * Normalizes a phone number to E.164, or returns null when it cannot be trusted.
 *
 * Deliberately conservative: a number we cannot confidently normalize is rejected at
 * import with a reason, rather than silently mangled into something that will bounce or,
 * worse, text a stranger.
 */
export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;

  const trimmed = String(input).trim();
  if (!trimmed) return null;

  // Strip a trailing extension before touching digits: "555-0100 x204" must not
  // become 5550100204. Anchored to the end so an "x" inside the number is left alone.
  const withoutExtension = trimmed.replace(
    /\s*(?:\bext(?:ension)?\b\.?|\bx\.?)\s*\d+\s*$/i,
    ''
  );

  const hadPlus = withoutExtension.trimStart().startsWith('+');
  const digits = withoutExtension.replace(/\D/g, '');

  if (!digits) return null;

  if (hadPlus) {
    // Already international. E.164 allows up to 15 digits.
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }

  if (DEFAULT_COUNTRY_CODE === '1') {
    if (digits.length === 10) {
      if (!isPlausibleNanp(digits)) return null;
      return `+1${digits}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      const national = digits.slice(1);
      if (!isPlausibleNanp(national)) return null;
      return `+1${national}`;
    }
    return null;
  }

  if (digits.length >= 8 && digits.length <= 15) return `+${DEFAULT_COUNTRY_CODE}${digits}`;
  return null;
}

/** North American numbering plan: area code and exchange both start 2-9. */
function isPlausibleNanp(tenDigits: string): boolean {
  if (tenDigits.length !== 10) return false;
  const areaCode = tenDigits[0];
  const exchange = tenDigits[3];
  return areaCode >= '2' && areaCode <= '9' && exchange >= '2' && exchange <= '9';
}

const EMAIL_PATTERN = /^[^\s@,;<>()[\]\\]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

export function normalizeEmail(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = String(input).trim().toLowerCase();
  if (!trimmed) return null;

  // Some exports wrap addresses as `Name <a@b.com>`.
  const angled = trimmed.match(/<([^>]+)>/);
  const candidate = angled ? angled[1].trim() : trimmed;

  if (candidate.length > 254) return null;
  if (!EMAIL_PATTERN.test(candidate)) return null;
  return candidate;
}

/**
 * Parses the date formats that show up in exported customer lists. Ambiguous
 * day/month pairs are read as US month-first, matching the source systems these lists
 * come out of. Returns an ISO date (YYYY-MM-DD) or null.
 */
export function normalizeDate(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = String(input).trim();
  if (!value) return null;

  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
  if (iso) return buildDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const slashed = value.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (slashed) {
    const month = Number(slashed[1]);
    const day = Number(slashed[2]);
    let year = Number(slashed[3]);
    if (year < 100) year += year > 60 ? 1900 : 2000;
    return buildDate(year, month, day);
  }

  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    const date = new Date(parsed);
    return buildDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  }

  return null;
}

function buildDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (year < 1900 || year > 2200) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.toISOString().slice(0, 10);
}

export function normalizeMoneyCents(input: string | null | undefined): number | null {
  if (!input) return null;
  const cleaned = String(input).replace(/[^0-9.\-]/g, '');
  if (!cleaned) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100);
}

export interface SplitName {
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
}

export function splitName(
  fullName: string | null | undefined,
  firstName?: string | null,
  lastName?: string | null
): SplitName {
  const first = firstName?.trim() || null;
  const last = lastName?.trim() || null;

  if (first || last) {
    return {
      firstName: first,
      lastName: last,
      fullName: [first, last].filter(Boolean).join(' ') || null,
    };
  }

  const full = fullName?.trim();
  if (!full) return { firstName: null, lastName: null, fullName: null };

  // "Doe, Jane" -> Jane Doe
  if (full.includes(',')) {
    const [surname, given] = full.split(',', 2).map((part) => part.trim());
    if (surname && given) {
      return { firstName: given, lastName: surname, fullName: `${given} ${surname}` };
    }
  }

  const parts = full.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: null, fullName: parts[0] };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
    fullName: full,
  };
}

/** Whole months between a service date and now, used for the dormancy display. */
export function dormancyMonths(lastServiceDate: string | null | undefined): number | null {
  if (!lastServiceDate) return null;
  const then = new Date(lastServiceDate);
  if (Number.isNaN(then.getTime())) return null;

  const now = new Date();
  const months =
    (now.getUTCFullYear() - then.getUTCFullYear()) * 12 + (now.getUTCMonth() - then.getUTCMonth());
  return Math.max(0, now.getUTCDate() < then.getUTCDate() ? months - 1 : months);
}

export function describeDormancy(lastServiceDate: string | null | undefined): string {
  const months = dormancyMonths(lastServiceDate);
  if (months === null) return 'No service history';
  if (months === 0) return 'Serviced this month';
  if (months === 1) return 'Dormant 1 month';
  if (months < 24) return `Dormant ${months} months`;
  return `Dormant ${Math.floor(months / 12)}+ years`;
}
