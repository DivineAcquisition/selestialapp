"use client";

import { FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { IClosedCalendar } from "@/components/marketing/IClosedCalendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandButton } from "@/components/marketing/BrandButton";
import { trackLead, trackSchedule } from "@/components/agency/pixel";
import {
  AD_BUDGET_READY_OPTIONS,
  ANSWERS_STORAGE_KEY,
  BOOKING_URL,
  CTA_LABEL,
  FOUNDING_PARTNER_OFFER,
  JOB_SIZE_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  TRACKING_STORAGE_KEY,
  type AuditAnswers,
  type TrackingParams,
  buildBookingUrl,
  consentText,
  isBookingConfirmedMessage,
  isPlaceholderBookingUrl,
  jobSizeLabel,
  mergeTracking,
  optionLabel,
  readTrackingRecord,
  showBookingFitNote,
} from "@/lib/marketing/agency";

const EMPTY_ANSWERS: AuditAnswers = {
  companyName: "",
  serviceArea: "",
  jobSize: "",
  leadSource: "",
  adBudgetReady: "",
};

const fieldClass =
  "flex h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 text-[16px] text-zinc-950 placeholder:text-zinc-400 focus:border-[#6428F9] focus:outline-none focus:ring-2 focus:ring-[#6428F9]/20";

function subscribeToStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function readStorageItem(key: string) {
  try {
    return window.sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function parseTracking(raw: string): TrackingParams {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as TrackingParams;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function parseAnswers(raw: string): AuditAnswers | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuditAnswers;
    if (!parsed?.companyName || !parsed.serviceArea || !parsed.jobSize || !parsed.leadSource || !parsed.adBudgetReady) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function BookingEmbed({ src }: { src: string }) {
  if (src.includes("iclosed.io")) {
    return <IClosedCalendar url={src} title="Book your Lead Leak Audit" height={740} />;
  }

  return (
    <iframe
      src={src}
      title="Book your Lead Leak Audit"
      className="h-[740px] w-full border-0"
      loading="lazy"
    />
  );
}

function PlaceholderCalendar({
  src,
  answers,
}: {
  src: string;
  answers: AuditAnswers;
}) {
  const rows = [
    ["Company", answers.companyName],
    ["Service area", answers.serviceArea],
    ["Average project size", jobSizeLabel(answers.jobSize)],
    ["Leads today", optionLabel(LEAD_SOURCE_OPTIONS, answers.leadSource)],
    ["Ad budget", optionLabel(AD_BUDGET_READY_OPTIONS, answers.adBudgetReady)],
  ];

  return (
    <div className="rounded-2xl border border-dashed border-[#6428F9]/30 bg-[#F7F4FF] p-5 sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6428F9]">
        Placeholder calendar
      </p>
      <p className="mt-3 text-[15px] leading-snug text-zinc-700">
        The scheduling calendar embeds here. This link is a placeholder until the live booking URL is set.
      </p>
      <p className="mt-4 break-all rounded-lg bg-white px-3 py-2 font-mono text-[12px] text-zinc-600">
        {src}
      </p>
      <dl className="mt-5 grid gap-2 text-[14px] text-zinc-700">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-zinc-500">{label}</dt>
            <dd className="text-right font-medium text-zinc-950">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ConfirmationMessage() {
  return (
    <div className="rounded-2xl border border-[#6428F9]/20 bg-[#F7F4FF] px-6 py-10 text-center">
      <p className="font-display text-[26px] font-semibold leading-snug tracking-[-0.03em] text-zinc-950 sm:text-[32px]">
        You&apos;re booked. Before the call, we&apos;ll look at how your leads come in so we can make
        the 30 minutes count.
      </p>
    </div>
  );
}

export function AuditFlow() {
  const searchParams = useSearchParams();
  const calendarRef = useRef<HTMLDivElement>(null);
  const scheduled = useRef(false);
  const storedAnswersRaw = useSyncExternalStore(
    subscribeToStorage,
    () => readStorageItem(ANSWERS_STORAGE_KEY),
    () => ""
  );
  const storedTrackingRaw = useSyncExternalStore(
    subscribeToStorage,
    () => readStorageItem(TRACKING_STORAGE_KEY),
    () => ""
  );
  const storedAnswers = parseAnswers(storedAnswersRaw);
  const [draft, setDraft] = useState<AuditAnswers | null>(null);
  const [didSubmit, setDidSubmit] = useState(false);
  const [bookedFromCalendar, setBookedFromCalendar] = useState(false);
  const answers = draft ?? storedAnswers ?? EMPTY_ANSWERS;
  const submitted = didSubmit || storedAnswers !== null;
  const bookedFromQuery = searchParams.get("booked") === "1";
  const booked = bookedFromQuery || bookedFromCalendar;
  const tracking = mergeTracking(readTrackingRecord(searchParams), parseTracking(storedTrackingRaw));

  let bookingSrc = "";
  if (submitted) {
    try {
      bookingSrc = buildBookingUrl(BOOKING_URL, answers, tracking);
    } catch {
      bookingSrc = "";
    }
  }

  useEffect(() => {
    if (!bookedFromQuery || scheduled.current) return;
    scheduled.current = true;
    trackSchedule();
  }, [bookedFromQuery]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      let data: unknown = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!isBookingConfirmedMessage(data) || scheduled.current) return;
      scheduled.current = true;
      trackSchedule();
      setBookedFromCalendar(true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !answers.companyName.trim() ||
      !answers.serviceArea.trim() ||
      !answers.jobSize ||
      !answers.leadSource ||
      !answers.adBudgetReady
    ) {
      return;
    }
    const next = {
      companyName: answers.companyName.trim(),
      serviceArea: answers.serviceArea.trim(),
      jobSize: answers.jobSize,
      leadSource: answers.leadSource,
      adBudgetReady: answers.adBudgetReady,
    };
    setDraft(next);
    setDidSubmit(true);
    window.sessionStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(next));
    trackLead();
    requestAnimationFrame(() => {
      calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6428F9]">
        Free 30-minute audit
      </p>
      <h1 className="font-display mt-3 text-balance text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] text-zinc-950 sm:text-[40px]">
        Find out how many jobs are leaking out of your pipeline.
      </h1>
      <div className="mt-4 space-y-3 text-[16px] leading-snug text-zinc-600">
        <p>Book your free 30-minute Lead Leak Audit.</p>
        <p>We&apos;ll show you where your jobs are getting lost and check whether your market is open.</p>
        {FOUNDING_PARTNER_OFFER ? (
          <p>We&apos;ll also walk you through the founding partner deal.</p>
        ) : (
          <p>Pricing is set after your audit.</p>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="company-name" className="text-zinc-800">
            Company name
          </Label>
          <Input
            id="company-name"
            name="companyName"
            autoComplete="organization"
            required
            value={answers.companyName}
            onChange={(event) =>
              setDraft((current) => ({
                ...(current ?? storedAnswers ?? EMPTY_ANSWERS),
                companyName: event.target.value,
              }))
            }
            className={fieldClass}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-area" className="text-zinc-800">
            Service area
          </Label>
          <Input
            id="service-area"
            name="serviceArea"
            required
            placeholder="City or region"
            value={answers.serviceArea}
            onChange={(event) =>
              setDraft((current) => ({
                ...(current ?? storedAnswers ?? EMPTY_ANSWERS),
                serviceArea: event.target.value,
              }))
            }
            className={fieldClass}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-size" className="text-zinc-800">
            Average project size
          </Label>
          <select
            id="job-size"
            name="jobSize"
            required
            value={answers.jobSize}
            onChange={(event) =>
              setDraft((current) => ({
                ...(current ?? storedAnswers ?? EMPTY_ANSWERS),
                jobSize: event.target.value,
              }))
            }
            className={fieldClass}
          >
            <option value="" disabled>
              Select a range
            </option>
            {JOB_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead-source" className="text-zinc-800">
            How do you get most of your leads today?
          </Label>
          <select
            id="lead-source"
            name="leadSource"
            required
            value={answers.leadSource}
            onChange={(event) =>
              setDraft((current) => ({
                ...(current ?? storedAnswers ?? EMPTY_ANSWERS),
                leadSource: event.target.value,
              }))
            }
            className={fieldClass}
          >
            <option value="" disabled>
              Select one
            </option>
            {LEAD_SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ad-budget" className="text-zinc-800">
            Can you put an ad budget into ads?
          </Label>
          <select
            id="ad-budget"
            name="adBudgetReady"
            required
            value={answers.adBudgetReady}
            onChange={(event) =>
              setDraft((current) => ({
                ...(current ?? storedAnswers ?? EMPTY_ANSWERS),
                adBudgetReady: event.target.value,
              }))
            }
            className={fieldClass}
          >
            <option value="" disabled>
              Select one
            </option>
            {AD_BUDGET_READY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {showBookingFitNote(answers) ? (
          <p className="text-[15px] leading-snug text-zinc-700">
            Our system works best for projects over $15K with an ad budget in place. We&apos;ll still take a look.
          </p>
        ) : null}
        <BrandButton type="submit" size="xl" className="h-12 w-full">
          {CTA_LABEL}
        </BrandButton>
        <p className="text-[13px] leading-snug text-zinc-600">{consentText()}</p>
        <p className="text-[12px] leading-snug text-zinc-500">
          This wording is a placeholder. A lawyer must review it before launch.
        </p>
      </form>

      {submitted && (
        <div ref={calendarRef} className="mt-10 scroll-mt-24">
          {booked ? (
            <ConfirmationMessage />
          ) : isPlaceholderBookingUrl(BOOKING_URL) || !bookingSrc ? (
            <PlaceholderCalendar src={bookingSrc || BOOKING_URL} answers={answers} />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <BookingEmbed src={bookingSrc} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
