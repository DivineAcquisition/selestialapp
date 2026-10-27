import type { ReactNode } from "react";
import Image from "next/image";
import { Check, ShieldCheck, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AuditCta } from "@/components/agency/audit-cta";
import { GUARANTEE_QUALIFIED_ESTIMATES, SHOW_REMODELER_RESULTS } from "@/lib/marketing/agency";
import { cn } from "@/lib/utils";

const LEAKS = ["Slow response.", "Unqualified leads.", "No-shows."] as const;

const STEPS = [
  {
    title: "We attract the right homeowners.",
    body: "Meta ads built around your best work, targeting homeowners planning kitchens, baths, and basements in your area.",
  },
  {
    title: "We respond in minutes, not hours.",
    body: "Every lead gets an instant text and call, so you reach them before your competitors do.",
  },
  {
    title: "We qualify and book.",
    body: "Budget, timeline, and homeownership confirmed before anything hits your calendar. No tire kickers.",
  },
  {
    title: "We protect the appointment.",
    body: "Reminders and confirmations so homeowners actually show up for the estimate.",
  },
] as const;

const INCLUDED = [
  "Meta ad campaigns and creative",
  "Landing page and lead capture",
  "Speed-to-lead system (text, call, and follow-up)",
  "Appointment setting and qualification",
  "No-show recovery and reminder sequences",
  "Monthly performance review: cost per booked estimate, show rate, and jobs closed",
] as const;

const GOOD_FIT = [
  "Remodeling companies doing kitchens, baths, or full home projects",
  "Average job of $15K or more",
  "Capacity to take on more work",
] as const;

const NOT_A_FIT = ["Solo handymen", "Companies not ready to run more estimates"] as const;

const FAQS = [
  {
    q: "How fast will I see appointments?",
    a: "Most campaigns launch within 2 to 3 weeks of kickoff. Booked estimates typically start coming in during the first 30 days.",
  },
  {
    q: "Do I need to manage the ads or the leads?",
    a: "No. We run the ads, respond to leads, qualify them, and book them onto your calendar. You show up to the estimate.",
  },
  {
    q: "Who owns the ad account and the data?",
    a: "You do. Everything we build lives in accounts you own.",
  },
  {
    q: "What areas do you work in?",
    a: "We take one remodeler per market. Book an audit to check if your area is available.",
  },
  {
    q: "What happens on the free audit?",
    a: "In 30 minutes we look at how leads come in today, where they're falling through, and what it would take to fill your calendar. No obligation.",
  },
] as const;

const PLACEHOLDER_RESULTS = [
  {
    quote: "Placeholder testimonial. Replace this with a real remodeler quote before turning results on.",
    name: "Owner name",
    company: "Remodeling company",
  },
  {
    quote: "Placeholder testimonial. Replace this with a real remodeler quote before turning results on.",
    name: "Owner name",
    company: "Remodeling company",
  },
  {
    quote: "Placeholder testimonial. Replace this with a real remodeler quote before turning results on.",
    name: "Owner name",
    company: "Remodeling company",
  },
] as const;

function Section({
  children,
  tone = "white",
  className,
  id,
}: {
  children: ReactNode;
  tone?: "white" | "muted";
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-5 py-16 sm:py-24",
        tone === "muted" ? "bg-[#F7F6FB]" : "bg-white",
        className
      )}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display max-w-3xl text-balance text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-zinc-950 sm:text-[40px]">
      {children}
    </h2>
  );
}

function PrimaryCta({ label = "Get Your Free Lead Leak Audit" }: { label?: string }) {
  return (
    <div className="mt-10 flex justify-center">
      <AuditCta label={label} className="w-full sm:w-auto" />
    </div>
  );
}

function PlaceholderPhoto({
  src,
  alt,
  priority = false,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-[0_24px_60px_-36px_rgba(62,24,164,0.45)]",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
      <figcaption className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-700 shadow-sm">
        Placeholder
      </figcaption>
    </figure>
  );
}

export function Homepage() {
  return (
    <>
      <section className="overflow-hidden bg-white px-5 pb-16 pt-10 sm:pb-24 sm:pt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <h1 className="font-display text-balance text-[36px] font-semibold leading-[1.05] tracking-[-0.035em] text-zinc-950 sm:text-[52px] lg:text-[58px]">
              More qualified in-home estimates. Without chasing leads.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-zinc-600 sm:text-[18px]">
              Selestial runs your Meta ads, responds to every lead in under 5 minutes, and books
              qualified homeowners straight onto your calendar. You show up and sell.
            </p>
            <div className="mt-7">
              <AuditCta label="Get Your Free Lead Leak Audit" className="w-full sm:w-auto" />
            </div>
            <p className="mt-4 text-[13px] font-medium text-zinc-500">
              One remodeler per market. Limited availability.
            </p>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(146,148,255,0.45),transparent_68%)]"
            />
            <PlaceholderPhoto
              src="/marketing/kitchen.jpg"
              alt="Placeholder photo of a finished kitchen remodel"
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="aspect-[16/10] w-full"
            />
          </div>
        </div>
      </section>

      <Section tone="muted">
        <SectionHeading>
          Most remodelers don&apos;t have a lead problem. They have a follow-up problem.
        </SectionHeading>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-zinc-600 sm:text-[17px]">
          Leads come in while you&apos;re on a job site. By the time you call back, they&apos;ve
          booked someone else. The ones you do reach aren&apos;t ready, aren&apos;t qualified, or
          don&apos;t show. You&apos;re paying for leads and losing them in the gap.
        </p>
        <div className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6428F9]">
            Where leads leak
          </p>
          <ol className="mt-3 grid gap-3 sm:grid-cols-3">
            {LEAKS.map((leak, index) => (
              <li
                key={leak}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(24,24,27,0.04)]"
              >
                <span className="font-display text-[13px] font-semibold text-[#6428F9]/70">
                  0{index + 1}
                </span>
                <p className="mt-1 text-[16px] font-semibold tracking-tight text-zinc-950">{leak}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section>
        <SectionHeading>How Selestial fills your calendar</SectionHeading>
        <ol className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)] transition-shadow hover:shadow-[0_22px_44px_-28px_rgba(100,40,249,0.55)]"
            >
              <span className="font-display text-[2.5rem] font-semibold leading-none tracking-[-0.04em] text-[#6428F9]/25">
                0{index + 1}
              </span>
              <h3 className="font-display mt-4 text-[1.15rem] font-semibold leading-snug tracking-[-0.02em] text-zinc-950">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">{step.body}</p>
            </li>
          ))}
        </ol>
        <PrimaryCta />
      </Section>

      <Section tone="muted">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <SectionHeading>Everything you need to fill your calendar</SectionHeading>
            <ul className="mt-8 space-y-4">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#E7E1FF] text-[#4F1FD0]">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  <span className="text-[16px] leading-relaxed text-zinc-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <PlaceholderPhoto
            src="/marketing/bathroom.jpg"
            alt="Placeholder photo of a finished bathroom remodel"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="aspect-[4/3] w-full"
          />
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl rounded-[28px] border border-[#6428F9]/15 bg-[linear-gradient(180deg,#F4F0FF_0%,#FFFFFF_55%)] px-6 py-12 text-center shadow-[0_30px_70px_-40px_rgba(100,40,249,0.65)] sm:px-12 sm:py-14">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#6428F9] text-white shadow-[0_12px_30px_-12px_rgba(100,40,249,0.8)]">
            <ShieldCheck className="size-7" aria-hidden />
          </span>
          <h2 className="font-display mt-6 text-[30px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[40px]">
            Our guarantee
          </h2>
          <p className="font-display mx-auto mt-4 max-w-xl text-balance text-[22px] font-semibold leading-snug tracking-[-0.03em] text-zinc-950 sm:text-[28px]">
            <span className="text-[#4F1FD0]">{GUARANTEE_QUALIFIED_ESTIMATES}</span> qualified
            estimates booked in your first 30 days, or your next month is free.
          </p>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading>Built by operators who install sales systems that work</SectionHeading>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-zinc-600 sm:text-[17px]">
          Built by the team behind sales systems that helped a coaching business add $16K in
          monthly recurring revenue and a cleaning company add $50K+ in new annual revenue.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 bg-white px-6 py-8">
            <p className="font-display text-5xl font-semibold tracking-[-0.04em] text-[#4F1FD0] sm:text-6xl">
              +$16K MRR
            </p>
            <p className="mt-3 text-[15px] text-zinc-600">Added for a coaching business</p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-white px-6 py-8">
            <p className="font-display text-5xl font-semibold tracking-[-0.04em] text-[#4F1FD0] sm:text-6xl">
              +$50K ARR
            </p>
            <p className="mt-3 text-[15px] text-zinc-600">Added for a cleaning company</p>
          </article>
        </div>

        <div className={cn("mt-12", !SHOW_REMODELER_RESULTS && "hidden")} hidden={!SHOW_REMODELER_RESULTS}>
          <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
            Remodeler Results
          </h3>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {PLACEHOLDER_RESULTS.map((result, index) => (
              <li key={index} className="rounded-2xl border border-dashed border-zinc-300 bg-white p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Placeholder
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-700">&ldquo;{result.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-zinc-900">{result.name}</p>
                <p className="text-sm text-zinc-500">{result.company}</p>
              </li>
            ))}
          </ul>
        </div>
        <PrimaryCta />
      </Section>

      <Section>
        <SectionHeading>Who this is for</SectionHeading>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold tracking-tight text-zinc-950">Good fit</h3>
            <ul className="mt-5 space-y-4">
              {GOOD_FIT.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  <span className="text-[16px] leading-relaxed text-zinc-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold tracking-tight text-zinc-950">Not a fit</h3>
            <ul className="mt-5 space-y-4">
              {NOT_A_FIT.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-zinc-200 text-zinc-700">
                    <X className="size-3.5" aria-hidden />
                  </span>
                  <span className="text-[16px] leading-relaxed text-zinc-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <section className="bg-white px-5 pb-4">
        <div className="mx-auto max-w-3xl rounded-2xl bg-[#2C1278] px-6 py-8 text-center sm:px-10">
          <h2 className="font-display text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
            One remodeler per market.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-white/80">
            We work with one remodeler per market. Once your area is taken, it&apos;s closed.
          </p>
        </div>
      </section>

      <Section id="faq">
        <SectionHeading>FAQ</SectionHeading>
        <Accordion className="mx-auto mt-8 max-w-3xl rounded-2xl border border-zinc-200 bg-white px-5 sm:px-7">
          {FAQS.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`}>
              <AccordionTrigger className="py-5 text-left text-[16px] font-semibold text-zinc-950 sm:text-[17px]">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-zinc-600">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <section className="bg-white px-5 pb-20 sm:pb-28">
        <div className="mx-auto max-w-3xl rounded-[28px] bg-[linear-gradient(160deg,#3E18A4_0%,#6428F9_58%,#9294FF_140%)] px-6 py-12 text-center shadow-[0_30px_70px_-36px_rgba(62,24,164,0.7)] sm:px-12 sm:py-16">
          <h2 className="font-display text-balance text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[40px]">
            Find out how many estimates you&apos;re losing.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-white/85 sm:text-[17px]">
            Book a free 30-minute Lead Leak Audit. We&apos;ll show you where leads are falling
            through and what it would take to fill your calendar.
          </p>
          <div className="mt-8 flex justify-center">
            <AuditCta
              label="Book My Free Audit"
              variant="inverted"
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </section>
    </>
  );
}
