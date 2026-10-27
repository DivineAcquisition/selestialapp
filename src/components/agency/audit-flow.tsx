"use client";

import { FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { IClosedCalendar } from "@/components/marketing/IClosedCalendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandButton } from "@/components/marketing/BrandButton";
import { trackLead, trackSchedule } from "@/components/agency/pixel";
import {
  ANSWERS_STORAGE_KEY,
  BOOKING_URL,
  JOB_SIZE_OPTIONS,
  TRACKING_STORAGE_KEY,
  type AuditAnswers,
  type TrackingParams,
  buildBookingUrl,
  isBookingConfirmedMessage,
  isPlaceholderBookingUrl,
  mergeTracking,
  readTrackingRecord,
} from "@/lib/marketing/agency";

const EMPTY_ANSWERS: AuditAnswers = {
  companyName: "",
  jobSize: "",
  serviceArea: "",
};

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
    if (!parsed?.companyName || !parsed.jobSize || !parsed.serviceArea) return null;
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
  const job =
    JOB_SIZE_OPTIONS.find((option) => option.value === answers.jobSize)?.label ?? answers.jobSize;

  return (
    <div className="rounded-2xl border border-dashed border-[#6428F9]/40 bg-[#F7F4FF] p-5 sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6428F9]">
        Placeholder calendar
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-zinc-700">
        The scheduling calendar embeds here. This link is a placeholder until the live booking
        URL is set.
      </p>
      <p className="mt-4 break-all rounded-lg bg-white px-3 py-2 font-mono text-[12px] text-zinc-600">
        {src}
      </p>
      <dl className="mt-5 grid gap-2 text-[14px] text-zinc-700">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Company</dt>
          <dd className="text-right font-medium text-zinc-900">{answers.companyName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Average job size</dt>
          <dd className="text-right font-medium text-zinc-900">{job}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Service area</dt>
          <dd className="text-right font-medium text-zinc-900">{answers.serviceArea}</dd>
        </div>
      </dl>
    </div>
  );
}

export function ConfirmationMessage() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
      <p className="font-display text-[26px] font-semibold leading-snug tracking-[-0.03em] text-zinc-950 sm:text-[32px]">
        You&apos;re booked. We&apos;ll review your current lead flow before the call so we can make
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
    if (!answers.companyName.trim() || !answers.jobSize || !answers.serviceArea.trim()) return;
    const next = {
      companyName: answers.companyName.trim(),
      jobSize: answers.jobSize,
      serviceArea: answers.serviceArea.trim(),
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
      <h1 className="font-display mt-3 text-balance text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[40px]">
        Find out how many estimates you&apos;re losing.
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-zinc-600">
        Book a free 30-minute Lead Leak Audit. We&apos;ll show you where leads are falling through
        and what it would take to fill your calendar.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company name</Label>
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
            className="h-12 rounded-xl text-[16px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-size">Average job size</Label>
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
            className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-[16px] text-zinc-900 focus:border-[#6428F9] focus:outline-none focus:ring-2 focus:ring-[#6428F9]/20"
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
          <Label htmlFor="service-area">Service area</Label>
          <Input
            id="service-area"
            name="serviceArea"
            required
            placeholder="City or metro you serve"
            value={answers.serviceArea}
            onChange={(event) =>
              setDraft((current) => ({
                ...(current ?? storedAnswers ?? EMPTY_ANSWERS),
                serviceArea: event.target.value,
              }))
            }
            className="h-12 rounded-xl text-[16px]"
          />
        </div>
        <BrandButton type="submit" size="xl" className="h-12 w-full">
          Continue to calendar
        </BrandButton>
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
