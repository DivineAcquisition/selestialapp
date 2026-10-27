/**
 * Public agency site settings.
 *
 * Change the guarantee, the booking link, and the Meta Pixel in this file.
 * Nothing else on the marketing site hard-codes those three values.
 */

/** Qualified estimates promised in the first 30 days. */
export const GUARANTEE_QUALIFIED_ESTIMATES = 10;

/**
 * Scheduling link for the free Lead Leak Audit.
 * Replace this placeholder with the live calendar URL (Cal.com, Calendly,
 * iClosed, or GoHighLevel). Qualifying answers and ad parameters are
 * appended as query params. Point the scheduler's confirmation redirect
 * at /audit/confirmed when the tool supports it.
 */
export const BOOKING_URL = "https://placeholder.selestial.io/lead-leak-audit";

/**
 * Meta Pixel ID. Paste the numeric pixel id here.
 * NEXT_PUBLIC_META_PIXEL_ID overrides this when it is set in the environment.
 */
export const META_PIXEL_ID = "";

/** Flip to true to show remodeler case-study cards. The layout is already built. */
export const SHOW_REMODELER_RESULTS = false;

export const AUDIT_PATH = "/audit";
export const AUDIT_CONFIRMED_PATH = "/audit/confirmed";

export const TRACKING_STORAGE_KEY = "selestial_audit_tracking";
export const ANSWERS_STORAGE_KEY = "selestial_audit_answers";

export const TRACKING_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
] as const;

export type TrackingParamKey = (typeof TRACKING_PARAM_KEYS)[number];
export type TrackingParams = Partial<Record<TrackingParamKey, string>>;

export const JOB_SIZE_OPTIONS = [
  { value: "under_10k", label: "Under $10K" },
  { value: "10k_25k", label: "$10K to $25K" },
  { value: "25k_50k", label: "$25K to $50K" },
  { value: "50k_plus", label: "$50K+" },
] as const;

export interface AuditAnswers {
  companyName: string;
  jobSize: string;
  serviceArea: string;
}

export function jobSizeLabel(value: string): string {
  return JOB_SIZE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function activePixelId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  const raw = fromEnv || META_PIXEL_ID.trim();
  return /^\d{5,20}$/.test(raw) ? raw : "";
}

export function isPlaceholderBookingUrl(url: string): boolean {
  try {
    return new URL(url).hostname === "placeholder.selestial.io";
  } catch {
    return true;
  }
}

export function readTrackingRecord(
  searchParams: { get(name: string): string | null }
): TrackingParams {
  const tracking: TrackingParams = {};
  for (const key of TRACKING_PARAM_KEYS) {
    const value = searchParams.get(key)?.trim();
    if (value) tracking[key] = value.slice(0, 200);
  }
  return tracking;
}

export function mergeTracking(primary: TrackingParams, fallback: TrackingParams): TrackingParams {
  return { ...fallback, ...primary };
}

/**
 * Build the scheduler URL with qualifying answers and ad parameters.
 * Several aliases are set so Cal.com, Calendly, iClosed, and GoHighLevel
 * can show the answers on the appointment when they map query params.
 */
export function buildBookingUrl(
  bookingUrl: string,
  answers: AuditAnswers,
  tracking: TrackingParams
): string {
  const url = new URL(bookingUrl);
  const company = answers.companyName.trim().slice(0, 160);
  const area = answers.serviceArea.trim().slice(0, 160);
  const job = jobSizeLabel(answers.jobSize).trim();

  if (company) {
    url.searchParams.set("company_name", company);
    url.searchParams.set("company", company);
    url.searchParams.set("a1", company);
  }
  if (job) {
    url.searchParams.set("average_job_size", job);
    url.searchParams.set("job_size", job);
    url.searchParams.set("a2", job);
  }
  if (area) {
    url.searchParams.set("service_area", area);
    url.searchParams.set("a3", area);
  }

  const notes = [
    company ? `Company: ${company}` : "",
    job ? `Average job size: ${job}` : "",
    area ? `Service area: ${area}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
  if (notes) url.searchParams.set("notes", notes);

  for (const key of TRACKING_PARAM_KEYS) {
    const value = tracking[key];
    if (value) url.searchParams.set(key, value);
  }

  return url.toString();
}

export function auditHref(tracking: TrackingParams): string {
  const params = new URLSearchParams();
  for (const key of TRACKING_PARAM_KEYS) {
    const value = tracking[key];
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${AUDIT_PATH}?${query}` : AUDIT_PATH;
}

/** True only for known scheduler "booking completed" messages. */
export function isBookingConfirmedMessage(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  const event = typeof record.event === "string" ? record.event : "";
  const type = typeof record.type === "string" ? record.type : "";
  const joined = `${event} ${type}`.toLowerCase().replace(/[\s-]+/g, "_");

  return (
    event === "calendly.event_scheduled" ||
    type === "bookingSuccessful" ||
    joined.includes("event_scheduled") ||
    joined.includes("bookingsuccessful") ||
    joined.includes("appointment_booked") ||
    joined.includes("appointmentbooked") ||
    event === "booked" ||
    type === "booked"
  );
}
