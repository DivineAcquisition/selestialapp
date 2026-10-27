/**
 * Public agency site settings.
 * Change these values here. The homepage, booking form, and consent text read them.
 */

/** Qualified estimates booked on the calendar each month. */
export const ESTIMATES_PER_MONTH = 5;

/** Percent of contract value earned when a booked job signs. */
export const COMMISSION_PERCENT = 7;

/** What the remodeler pays Meta directly. */
export const AD_BUDGET_RANGE = "$1,000 to $2,000 a month";

/** Time to ads live, counted from the day we have account access. */
export const LAUNCH_TIME = "7 days";

/** Founding partner openings left in a market. */
export const FOUNDING_PARTNER_SPOTS_REMAINING = 1;

/**
 * When false, hide the founding partner bar, the founding partner section,
 * and the last comparison row. Show "Pricing is set after your audit" instead.
 */
export const FOUNDING_PARTNER_OFFER = true;

/**
 * Scheduling link for the free Lead Leak Audit.
 * Replace this placeholder with the live calendar URL.
 * Qualifying answers and ad parameters are appended as query params.
 * Point the scheduler's confirmation redirect at /audit/confirmed when it supports one.
 */
export const BOOKING_URL = "https://placeholder.selestial.io/lead-leak-audit";

/**
 * Meta Pixel ID. Paste the numeric pixel id here.
 * NEXT_PUBLIC_META_PIXEL_ID overrides this when set.
 */
export const META_PIXEL_ID = "";

/** Legal name used in the booking consent line. */
export const COMPANY_LEGAL_NAME = "Selestial";

/** Flip to true to show remodeler case-study cards. The layout is already built. */
export const SHOW_REMODELER_RESULTS = false;

export const CTA_LABEL = "Get My Free Lead Leak Audit";
export const NAV_CTA_LABEL = "Get My Free Audit";

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

export const LEAD_SOURCE_OPTIONS = [
  { value: "referrals", label: "Referrals" },
  { value: "lead_marketplaces", label: "Lead marketplaces" },
  { value: "google_lsa", label: "Google or LSA" },
  { value: "meta_ads", label: "Meta ads" },
  { value: "houzz", label: "Houzz" },
  { value: "other", label: "Other" },
] as const;

export const AD_BUDGET_READY_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "not_yet", label: "Not yet" },
  { value: "not_sure", label: "Not sure" },
] as const;

export interface AuditAnswers {
  companyName: string;
  serviceArea: string;
  jobSize: string;
  leadSource: string;
  adBudgetReady: string;
}

export function commissionLabel(): string {
  return `${COMMISSION_PERCENT}%`;
}

export function spotsLeftPhrase(): string {
  const count = FOUNDING_PARTNER_SPOTS_REMAINING;
  return `${count} ${count === 1 ? "spot" : "spots"} left`;
}

/** Keeps the headline grammatical when the founding partner fee claim is hidden. */
export function headlineFeeClause(): string {
  return FOUNDING_PARTNER_OFFER ? "No Monthly Fee, And" : "And";
}

export function fullHeadline(): string {
  return `Get ${ESTIMATES_PER_MONTH} Exclusive, Pre-Qualified Kitchen, Bath & Whole-Home Estimates Booked On Your Calendar Every Month, With Every Proposal Followed Up Until It Signs. Done For You, Ads Live In ${LAUNCH_TIME}, ${headlineFeeClause()} No Shared Leads Ever.`;
}

/** Phone headline drops the project list, then the proposal clause, so it stays within six lines. */
export function phoneHeadline(): string {
  return `Get ${ESTIMATES_PER_MONTH} Exclusive, Pre-Qualified Estimates Booked On Your Calendar Every Month. Done For You, Ads Live In ${LAUNCH_TIME}, ${headlineFeeClause()} No Shared Leads Ever.`;
}

export function socialHeadline(): string {
  const fee = FOUNDING_PARTNER_OFFER ? " No monthly fee." : "";
  return `Get ${ESTIMATES_PER_MONTH} exclusive estimates booked every month. Ads live in ${LAUNCH_TIME}.${fee} No shared leads.`;
}

export function consentText(): string {
  return `By submitting, you agree that ${COMPANY_LEGAL_NAME} may contact you by call, text, or email about your request, including with automated technology. Consent is not a condition of purchase. Message and data rates may apply. Reply STOP to opt out at any time.`;
}

export function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function jobSizeLabel(value: string): string {
  return optionLabel(JOB_SIZE_OPTIONS, value);
}

export function showBookingFitNote(answers: Pick<AuditAnswers, "jobSize" | "adBudgetReady">): boolean {
  return answers.jobSize === "under_10k" || answers.adBudgetReady === "not_yet";
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
  const source = optionLabel(LEAD_SOURCE_OPTIONS, answers.leadSource).trim();
  const budgetReady = optionLabel(AD_BUDGET_READY_OPTIONS, answers.adBudgetReady).trim();

  if (company) {
    url.searchParams.set("company_name", company);
    url.searchParams.set("company", company);
    url.searchParams.set("a1", company);
  }
  if (area) {
    url.searchParams.set("service_area", area);
    url.searchParams.set("a2", area);
  }
  if (job) {
    url.searchParams.set("average_job_size", job);
    url.searchParams.set("job_size", job);
    url.searchParams.set("a3", job);
  }
  if (source) {
    url.searchParams.set("lead_source", source);
    url.searchParams.set("a4", source);
  }
  if (budgetReady) {
    url.searchParams.set("ad_budget_ready", budgetReady);
    url.searchParams.set("a5", budgetReady);
  }

  const notes = [
    company ? `Company: ${company}` : "",
    area ? `Service area: ${area}` : "",
    job ? `Average project size: ${job}` : "",
    source ? `Lead source: ${source}` : "",
    budgetReady ? `Ad budget ready: ${budgetReady}` : "",
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
