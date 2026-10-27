import Image from "next/image";
import {
  AlertTriangle,
  Ban,
  CalendarCheck,
  Check,
  FileWarning,
  PhoneOff,
  Users,
  X,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AuditCta } from "@/components/agency/audit-cta";
import {
  AD_BUDGET_RANGE,
  CTA_LABEL,
  ESTIMATES_PER_MONTH,
  FOUNDING_PARTNER_OFFER,
  LAUNCH_TIME,
  SHOW_REMODELER_RESULTS,
  commissionLabel,
  fullHeadline,
  phoneHeadline,
} from "@/lib/marketing/agency";
import { cn } from "@/lib/utils";

const LEAKS = [
  {
    title: "The lead four other contractors also bought.",
    lines: [
      "You paid for it, and so did everyone else on the list.",
      "By the time you called, the homeowner said someone already came out.",
    ],
    icon: Users,
  },
  {
    title: "The call you missed on the job site.",
    lines: [
      "You were on a ladder or in a design meeting.",
      "You called back that night. They'd already moved on.",
    ],
    icon: PhoneOff,
  },
  {
    title: "The price shopper who ate your Saturday.",
    lines: [
      "No budget, no timeline, not the decision-maker.",
      "You drove out, measured, and built a proposal that was never going to sign.",
    ],
    icon: AlertTriangle,
  },
  {
    title: "The proposal that went quiet.",
    lines: [
      "Hours of estimating. One follow-up, maybe two.",
      "Then the week got busy and a month went by. You never found out why.",
    ],
    icon: FileWarning,
  },
  {
    title: "The vendor you can't get out of.",
    lines: [
      "Charges you didn't expect, a dashboard full of numbers that aren't signed jobs,",
      "and a cancellation that takes three phone calls.",
    ],
    icon: Ban,
  },
] as const;

const MECHANISM = [
  {
    tag: "Fixes: shared leads.",
    title: "Exclusive leads from your own ad account.",
    body: [
      "We run Meta ads in your service area using your project photos, in an ad account you own.",
      "Every lead is yours. Never resold, never shared.",
    ],
  },
  {
    tag: "Fixes: missed calls.",
    title: "An answer in minutes, even when you're on site.",
    body: [
      "Our AI assistant texts every new lead within minutes, day or night, and tells them it's an automated assistant for your company.",
      "You don't have to touch your phone.",
    ],
  },
  {
    tag: "Fixes: price shoppers.",
    title: "Screened before it gets near your calendar.",
    body: [
      "The assistant asks about the project, budget range, timeline, whether they own the home, and who makes the decision.",
      "Leads that don't fit never reach you.",
    ],
  },
  {
    tag: "Fixes: no-shows and wasted drives.",
    title: "A real person books it.",
    body: [
      "A sales operator on our team calls every qualified homeowner, confirms the details, and books the estimate on your calendar with the notes attached.",
      "Reminders go out before you arrive, and cancellations get rebooked.",
    ],
  },
  {
    tag: "Fixes: proposals going quiet.",
    title: "Every proposal followed up until it's a yes or a no.",
    body: [
      "After you send the proposal, follow-up goes out in your company's name by text and email.",
      "Homeowners either come back or tell us no. You finally know where every proposal stands.",
    ],
  },
] as const;

const COLUMNS = [
  "Lead marketplaces",
  "Typical marketing agency",
  "Hiring an office person",
  "Selestial",
] as const;

const COMPARISON: { label: string; cells: [string, string, string, string]; founding?: boolean }[] = [
  { label: "Leads are exclusive to you", cells: ["No", "Sometimes", "Not applicable", "Yes"] },
  { label: "Answers new leads in minutes, all day", cells: ["No", "No", "Office hours only", "Yes"] },
  { label: "Screens budget and timeline before booking", cells: ["No", "Rarely", "Sometimes", "Yes"] },
  { label: "A real person books the estimate", cells: ["No", "Rarely", "Yes", "Yes"] },
  { label: "Follows up on every proposal", cells: ["No", "No", "If they remember", "Yes"] },
  { label: "You own the ad account and data", cells: ["No", "Often not", "Not applicable", "Yes"] },
  {
    label: "You pay only when a job signs",
    cells: ["No", "No", "No, salary", "Yes (founding partner)"],
    founding: true,
  },
];

const GOOD_FIT = [
  "You run a remodeling company doing roughly $750K to $3M a year",
  "Your average project is $15K or more",
  "You can take on at least two more projects a month",
  `You can put ${AD_BUDGET_RANGE} into ads`,
  "You'll show up to the estimates we book and send proposals within a few days",
  "You'll let us see your job records so commissions are easy to verify",
];

const NOT_A_FIT = [
  "You're a solo handyman taking small repair jobs",
  "Your average job is under $10K",
  "You're booked out for months with no room for new work",
  "You want the cheapest leads possible, not signed projects",
  "You won't show up to booked estimates or follow your own proposals through",
  "You're not comfortable sharing job records",
];

const PLACEHOLDER_RESULTS = [
  "Placeholder result. Add a real remodeling project, photo, and owner quote.",
  "Placeholder result. Add a real remodeling project, photo, and owner quote.",
  "Placeholder result. Add a real remodeling project, photo, and owner quote.",
];

function faqs() {
  const payLine = FOUNDING_PARTNER_OFFER
    ? "And since you only pay us when a job signs, a slow month costs you ad spend, not our fee."
    : "Pricing is set after your audit.";
  const burned = FOUNDING_PARTNER_OFFER
    ? "Three reasons. You own the ad account and data. We report on signed jobs, not clicks. And as a founding partner you pay nothing monthly; we only earn when a job we booked signs. Start with the free audit and judge us on the numbers."
    : "You own the ad account and data. We report on signed jobs, not clicks. Start with the free audit and judge us on the numbers. Pricing is set after your audit.";
  const commission = FOUNDING_PARTNER_OFFER
    ? `We earn ${commissionLabel()} of the contract value on jobs that sign from estimates we booked. It's due when you receive the deposit, with a few days' grace. Each job is tagged in your system from the first contact, so there's no guessing about what came from us. Referrals and past customers never count.`
    : "Pricing is set after your audit.";
  const hire = FOUNDING_PARTNER_OFFER
    ? "You can. But the office closes at 5, and homeowners fill out forms at 9 p.m. on a Sunday. A good appointment setter also costs a salary whether jobs sign or not. Our system answers every hour, keeps following up on proposals for weeks, and you only pay when a job signs."
    : "You can. But the office closes at 5, and homeowners fill out forms at 9 p.m. on a Sunday. A good appointment setter also costs a salary whether jobs sign or not. Our system answers every hour and keeps following up on proposals for weeks.";
  const leave = FOUNDING_PARTNER_OFFER
    ? "Yes. 30 days' notice, no long contract. You keep the ad account, page, and data. Commission still applies to jobs that sign from estimates we already booked."
    : "Yes. 30 days' notice, no long contract. You keep the ad account, page, and data. Pricing is set after your audit.";
  const adPayers = FOUNDING_PARTNER_OFFER
    ? `You do, directly to Meta, from your own ad account. Most founding partners run ${AD_BUDGET_RANGE}. We never mark up ad spend.`
    : `You do, directly to Meta, from your own ad account. The range we usually plan for is ${AD_BUDGET_RANGE}. We never mark up ad spend.`;

  return [
    { q: "I've been burned by marketing companies before. Why is this different?", a: burned },
    {
      q: "What counts as a qualified estimate?",
      a: `Before launch we write it down together: the homeowner owns the home, is in your service area, wants a project type you sell, has a budget at or above your minimum, and the decision-maker will be there. If an estimate we booked doesn't meet that, it doesn't count toward the ${ESTIMATES_PER_MONTH} a month.`,
    },
    {
      q: `Is ${ESTIMATES_PER_MONTH} estimates a month guaranteed?`,
      a: `It's what we commit to booking once leads are flowing, at the ad budget we agree on at your audit. We count from the day leads start, not the day you sign. If we fall short in a month, we show you exactly why and what we're changing. ${payLine}`,
    },
    { q: "Who pays for the ads?", a: adPayers },
    { q: "How does the commission work?", a: commission },
    {
      q: "Will homeowners know they're texting with AI?",
      a: "Yes. The first message says it's an automated assistant for your company. A real person on our team handles the booking call. Homeowners can reply STOP at any time and we stop immediately.",
    },
    {
      q: "Will my homeowners get annoyed by texts?",
      a: "Messages only go to people who asked to be contacted, in your company's name, at reasonable hours, with a limit on how many go out in a day. Every message makes it easy to reply or opt out.",
    },
    { q: "Can't I just hire someone in the office?", a: hire },
    {
      q: "How fast does this start?",
      a: `Ads go live about ${LAUNCH_TIME} after kickoff, as long as we get access to your ad account, page, and calendar quickly. Our team starts calling qualified leads from day one, and automated texting turns on as soon as carrier approval clears, which can take a few extra days. The first estimates usually land in the first two weeks. Signed jobs follow as your proposals work through, which can take a few weeks in remodeling.`,
    },
    { q: "Can I leave?", a: leave },
    {
      q: "Do you take everyone?",
      a: "No. One remodeler per market, and only companies that fit the criteria above. Book an audit to see if your area is open.",
    },
  ];
}

function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("px-5 py-16 sm:py-24", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display max-w-3xl text-balance text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[40px]">
      {children}
    </h2>
  );
}

function Copy({ children }: { children: React.ReactNode }) {
  return <p className="max-w-xl text-[16px] leading-snug text-[#ddd6f5]">{children}</p>;
}

function PageCta() {
  return (
    <div className="mt-10">
      <AuditCta label={CTA_LABEL} className="w-full sm:w-auto" />
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
    <figure className={cn("relative overflow-hidden rounded-2xl border border-white/10", className)}>
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      <figcaption className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
        Placeholder
      </figcaption>
    </figure>
  );
}

function Mark({ value, emphasis = false }: { value: string; emphasis?: boolean }) {
  const isYes = value === "Yes" || value.startsWith("Yes");
  const isNo = value === "No" || value.startsWith("No,") || value.startsWith("No ");
  if (isYes && emphasis) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-[#ddd6fe]">
        <Check className="size-4 shrink-0" aria-hidden />
        {value === "Yes" ? <span className="sr-only">Yes</span> : value}
      </span>
    );
  }
  if (isNo && value !== "Not applicable") {
    return (
      <span className="inline-flex items-center gap-1.5 text-zinc-400">
        <X className="size-4 shrink-0" aria-hidden />
        {value === "No" ? <span className="sr-only">No</span> : value}
      </span>
    );
  }
  return <span className="text-[#ddd6f5]">{value}</span>;
}

export function Homepage() {
  const rows = COMPARISON.filter((row) => FOUNDING_PARTNER_OFFER || !row.founding);
  const finalBody = FOUNDING_PARTNER_OFFER
    ? "Book your free 30-minute Lead Leak Audit. We'll show you where your jobs are getting lost, check whether your market is open, and walk you through the founding partner deal."
    : "Book your free 30-minute Lead Leak Audit. We'll show you where your jobs are getting lost and check whether your market is open. Pricing is set after your audit.";

  return (
    <>
      <section className="overflow-hidden px-5 pb-16 pt-8 sm:pb-24 sm:pt-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full border border-[#c4b5fd]/40 bg-[#c4b5fd]/10 px-3 py-1 text-[13px] font-semibold text-[#e4dcff]">
              Remodeler doing $750K to $3M a year?
            </p>
            <h1 className="font-display mt-5 text-balance text-[20px] font-semibold leading-[1.12] tracking-[-0.03em] text-white min-[390px]:text-[23px] sm:hidden">
              {phoneHeadline()}
            </h1>
            <h1 className="font-display mt-5 hidden text-balance text-[40px] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:block lg:text-[46px]">
              {fullHeadline()}
            </h1>
            <div className="mt-5 max-w-xl space-y-3">
              <Copy>
                We run your Meta ads, our AI replies to every lead in minutes, a real person on our
                team books the qualified ones on your calendar,
              </Copy>
              <Copy>and we follow up on every proposal.</Copy>
              {FOUNDING_PARTNER_OFFER ? (
                <Copy>You only pay us when a job we booked signs.</Copy>
              ) : (
                <Copy>Pricing is set after your audit.</Copy>
              )}
            </div>
            <p className="mt-4 max-w-xl text-[14px] leading-snug text-[#b7aed4]">
              For remodelers with an average project of $15K or more, room for at least two more
              jobs a month, and {AD_BUDGET_RANGE} to put into ads.
            </p>
            <div className="mt-7">
              <AuditCta label={CTA_LABEL} className="w-full sm:w-auto" />
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {(FOUNDING_PARTNER_OFFER ? ["No monthly fee", "One remodeler per market", "You own the ad account"] : ["One remodeler per market", "You own the ad account"]).map((chip) => (
                <li
                  key={chip}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[13px] text-[#e7e2f8]"
                >
                  {chip}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.45),transparent_68%)]"
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

      <section className="glow-red px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display max-w-3xl text-balance text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[40px]">
            You&apos;re not short on leads. You&apos;re losing jobs between the inquiry and the signature.
          </h2>
          <div className="mt-5 max-w-xl space-y-3">
            <p className="text-[16px] leading-snug text-[#f3d7dc]">
              Contractors say the same things over and over in public reviews of lead services and agencies.
            </p>
            <p className="text-[16px] leading-snug text-[#f3d7dc]">
              If you&apos;ve run a remodeling company for more than a year, you&apos;ve lived every one of these.
            </p>
          </div>
          <ol className="mt-8 grid gap-3">
            {LEAKS.map((leak) => (
              <li key={leak.title} className="glow-red-card rounded-2xl p-5">
                <leak.icon className="size-5 text-red-400" aria-hidden />
                <h3 className="font-display mt-3 text-[18px] font-semibold leading-snug text-white">
                  {leak.title}
                </h3>
                {leak.lines.map((line) => (
                  <p key={line} className="mt-2 max-w-xl text-[15px] leading-snug text-[#f6d5da]">
                    {line}
                  </p>
                ))}
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-2xl text-[22px] font-semibold leading-snug text-white sm:text-[26px]">
            Every one of these happens after you&apos;ve already paid for the lead.{" "}
            <span className="text-red-300">That&apos;s the gap, and it&apos;s where your profit goes.</span>
          </p>
          <PageCta />
        </div>
      </section>

      <Section>
        <Heading>More leads won&apos;t fix a leaking bucket.</Heading>
        <div className="mt-5 max-w-xl space-y-3">
          <Copy>Lead services sell the same homeowner to several companies.</Copy>
          <Copy>Most agencies hand you leads and walk away.</Copy>
          <Copy>Neither one is there when the homeowner goes quiet after your proposal.</Copy>
          <Copy>Homeowners are being careful with money right now.</Copy>
          <Copy>A $40K kitchen takes weeks to decide.</Copy>
          <Copy>
            The remodeler who answers first, shows up prepared, and stays in touch professionally is
            usually the one who signs it.
          </Copy>
          <Copy>
            So we built Selestial to own the whole path, from the first click to the signed contract
            {FOUNDING_PARTNER_OFFER ? ", and to get paid only when it ends in a signed job." : "."}
          </Copy>
        </div>
      </Section>

      <Section className="bg-[#1a0f33]">
        <Heading>How Selestial closes every leak</Heading>
        <div className="mt-5 max-w-xl space-y-2">
          <Copy>Three layers working together.</Copy>
          <Copy>AI for speed. A real person for trust. Follow-up until there&apos;s a decision.</Copy>
        </div>
        <ol className="mt-8 grid gap-4 lg:grid-cols-2">
          {MECHANISM.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-[#c4b5fd]/25 bg-[#241445] p-5 sm:p-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#c4b5fd]">{step.tag}</p>
              <p className="font-display mt-4 text-[13px] font-semibold text-[#c4b5fd]/70">0{index + 1}</p>
              <h3 className="font-display mt-2 text-[20px] font-semibold leading-snug text-white">{step.title}</h3>
              {step.body.map((line) => (
                <p key={line} className="mt-3 text-[15px] leading-snug text-[#ddd6f5]">
                  {line}
                </p>
              ))}
            </li>
          ))}
        </ol>
        <PageCta />
      </Section>

      <Section>
        <Heading>What you actually get</Heading>
        <ol className="mt-8 grid gap-4">
          <li className="rounded-2xl border border-white/10 bg-[#1c1033] p-5 sm:p-6">
            <h3 className="font-display text-[22px] font-semibold leading-snug text-white">
              {ESTIMATES_PER_MONTH} qualified estimates on your calendar every month.
            </h3>
            <p className="mt-3 max-w-2xl text-[16px] leading-snug text-[#ddd6f5]">
              Each one meets a written definition we agree on before launch: owns the home, in your
              service area, a project type you sell, a budget at or above your minimum, and the
              decision-maker on the appointment.
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-[#1c1033] p-5 sm:p-6">
            <h3 className="font-display text-[22px] font-semibold leading-snug text-white">
              Ads live in {LAUNCH_TIME}.
            </h3>
            <p className="mt-3 max-w-2xl text-[16px] leading-snug text-[#ddd6f5]">
              We build the ads, tracking, booking, and follow-up.
            </p>
            <p className="mt-2 max-w-2xl text-[16px] leading-snug text-[#ddd6f5]">
              Your part is a kickoff call, your project photos, access to your ad account, and your calendar.
            </p>
            <p className="mt-2 max-w-2xl text-[16px] leading-snug text-[#ddd6f5]">
              Our team starts calling qualified leads right away, and the automated texting turns on as
              soon as carrier approval clears.
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-[#1c1033] p-5 sm:p-6">
            <h3 className="font-display text-[22px] font-semibold leading-snug text-white">You own all of it.</h3>
            <p className="mt-3 text-[16px] leading-snug text-[#ddd6f5]">Your ad account. Your page. Your lead data.</p>
            <p className="mt-2 text-[16px] leading-snug text-[#ddd6f5]">
              If we ever part ways, everything stays with you.
            </p>
          </li>
        </ol>
        <p className="mt-6 max-w-2xl text-[16px] leading-snug text-[#ddd6f5]">
          Every week you get a simple report: ad spend, leads, how fast they got answered, estimates
          booked and held, proposals sent, and jobs signed. No vanity numbers.
        </p>
        <PlaceholderPhoto
          src="/marketing/bathroom.jpg"
          alt="Placeholder photo of a finished bathroom remodel"
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="mt-8 aspect-[4/3] w-full max-w-3xl"
        />
      </Section>

      <Section className="bg-[#1a0f33]">
        {FOUNDING_PARTNER_OFFER ? (
          <>
            <Heading>You only pay us when a job we booked signs.</Heading>
            <div className="mt-5 max-w-xl space-y-3">
              <Copy>We&apos;re choosing one founding partner per market to build our first remodeling case study with.</Copy>
              <Copy>Here&apos;s the deal, in plain terms:</Copy>
            </div>
            <ul className="mt-6 max-w-2xl space-y-3">
              {[
                "No setup fee and no monthly fee.",
                `You pay Meta directly for ads, ${AD_BUDGET_RANGE}, from your own account.`,
                `We earn ${commissionLabel()} of the contract value on jobs that sign from estimates we booked.`,
                "Our fee is due when you receive the deposit. Not before.",
                "Every job is verified against your own records, so you see exactly what you're paying for.",
                "Leave with 30 days' notice. No long contract.",
                "In return, you agree to a short case study interview once we've earned it.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[16px] leading-snug text-[#eee9ff]">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#c4b5fd]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-xl text-[16px] leading-snug text-[#ddd6f5]">
              If we don&apos;t book the estimates, we don&apos;t get paid. That&apos;s why we only take one remodeler per market.
            </p>
          </>
        ) : (
          <Heading>Pricing is set after your audit</Heading>
        )}
        <PageCta />
      </Section>

      <Section>
        <Heading>What you&apos;ve tried vs. Selestial</Heading>
        <div className="mt-8 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-[14px]">
            <thead>
              <tr>
                <th className="p-3 font-medium text-[#b7aed4]" />
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    className={cn(
                      "p-3 font-semibold text-white",
                      column === "Selestial" && "rounded-t-xl border border-b-0 border-[#c4b5fd]/50 bg-[#241445]"
                    )}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.label}>
                  <th className="p-3 font-medium text-[#eee9ff]">{row.label}</th>
                  {row.cells.map((cell, cellIndex) => (
                    <td
                      key={`${row.label}-${cellIndex}`}
                      className={cn(
                        "p-3 align-top",
                        cellIndex === 3 && "border-x border-[#c4b5fd]/50 bg-[#241445]",
                        cellIndex === 3 && index === rows.length - 1 && "rounded-b-xl border-b"
                      )}
                    >
                      <Mark value={cell} emphasis={cellIndex === 3} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 max-w-full overflow-x-auto overscroll-x-contain md:hidden">
          <div className="flex w-max snap-x snap-mandatory gap-3 pb-2">
          {COLUMNS.map((column, columnIndex) => (
            <article
              key={column}
              className={cn(
                "w-[82vw] max-w-[300px] shrink-0 snap-start rounded-2xl border border-white/10 bg-[#1c1033] p-4",
                column === "Selestial" && "border-[#c4b5fd]/60 bg-[#241445] shadow-[0_0_32px_-12px_rgba(167,139,250,0.8)]"
              )}
            >
              <h3 className="font-display text-[18px] font-semibold text-white">{column}</h3>
              <ul className="mt-4 space-y-3">
                {rows.map((row) => (
                  <li key={row.label}>
                    <p className="text-[12px] text-[#b7aed4]">{row.label}</p>
                    <div className="mt-1 text-[14px]">
                      <Mark value={row.cells[columnIndex]} emphasis={column === "Selestial"} />
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          </div>
        </div>
      </Section>

      <Section className="bg-[#1a0f33]">
        <Heading>Why is the Lead Leak Audit free?</Heading>
        <Copy>Because most remodelers we talk to are in at least one of these spots:</Copy>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "You're paying for leads and can't say how many became signed jobs.",
            "You have proposals from the last 60 days that never got a second follow-up.",
            "You're missing calls during the day and returning them at night.",
            "You've been burned before and want proof before you spend another dollar.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#241445] p-4 text-[15px] leading-snug text-[#eee9ff]">
              <CalendarCheck className="mt-0.5 size-4 shrink-0 text-[#c4b5fd]" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 max-w-2xl space-y-3">
          <Copy>
            In 30 minutes we look at how your leads come in, how fast they get answered, and how many
            proposals are sitting without follow-up, then put a dollar figure on what&apos;s leaking.
          </Copy>
          <Copy>You keep the findings either way. We also check whether your market is still open.</Copy>
          <Copy>If it makes sense to work together, we&apos;ll show you how.</Copy>
          <Copy>If not, you&apos;ll know exactly where your jobs are going.</Copy>
        </div>
        <PageCta />
      </Section>

      <Section>
        <Heading>Built by operators who install sales systems that work</Heading>
        <div className="mt-5 max-w-2xl space-y-3">
          <Copy>We&apos;re new to remodeling, and we&apos;ll say so.</Copy>
          <Copy>
            The team behind Selestial has built lead response and follow-up systems in other service
            businesses, including a coaching business that added $16K in monthly recurring revenue and a
            cleaning company that added $50K in new annual revenue.
          </Copy>
          {FOUNDING_PARTNER_OFFER ? (
            <Copy>
              That&apos;s why our founding partner pays only on results while we build our first remodeling case study.
            </Copy>
          ) : (
            <Copy>We&apos;re building our first remodeling case study now. Pricing is set after your audit.</Copy>
          )}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-[#1c1033] p-6">
            <p className="font-display text-[42px] font-semibold tracking-[-0.04em] text-[#ddd6fe]">+$16K MRR</p>
            <p className="mt-2 text-[16px] text-white">Coaching business</p>
            <p className="mt-2 text-[13px] text-[#b7aed4]">Other industry. Not a remodeling result.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[#1c1033] p-6">
            <p className="font-display text-[42px] font-semibold tracking-[-0.04em] text-[#ddd6fe]">+$50K ARR</p>
            <p className="mt-2 text-[16px] text-white">Cleaning company</p>
            <p className="mt-2 text-[13px] text-[#b7aed4]">Other industry. Not a remodeling result.</p>
          </article>
        </div>
        <div className={cn("mt-10", !SHOW_REMODELER_RESULTS && "hidden")} hidden={!SHOW_REMODELER_RESULTS}>
          <h3 className="font-display text-[24px] font-semibold text-white">Remodeler Results</h3>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {PLACEHOLDER_RESULTS.map((item, index) => (
              <li key={index} className="rounded-2xl border border-dashed border-white/20 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b7aed4]">Placeholder</p>
                <p className="mt-3 text-[15px] leading-snug text-[#eee9ff]">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <Heading>Is Selestial a fit?</Heading>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#c4b5fd]/40 bg-[#241445] p-5 sm:p-6">
            <h3 className="font-display text-[22px] font-semibold text-white">Built for you if</h3>
            <ul className="mt-4 space-y-3">
              {GOOD_FIT.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] leading-snug text-[#eee9ff]">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#c4b5fd]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glow-red glow-red-card rounded-2xl p-5 sm:p-6">
            <h3 className="font-display text-[22px] font-semibold text-white">Not a fit if</h3>
            <ul className="mt-4 space-y-3">
              {NOT_A_FIT.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] leading-snug text-[#f6d5da]">
                  <X className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <section className="px-5 pb-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#c4b5fd]/30 bg-[#2a1466] px-6 py-8 text-center">
          <h2 className="font-display text-[28px] font-semibold tracking-[-0.03em] text-white">
            One remodeler per market.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] leading-snug text-[#e4dcff]">
            We work with one remodeling company in each service area, so we&apos;re never running ads against our own client.
          </p>
          <p className="mt-2 text-[16px] leading-snug text-[#e4dcff]">Once your area is taken, it&apos;s closed.</p>
        </div>
      </section>

      <Section id="faq">
        <Heading>FAQ</Heading>
        <Accordion className="mt-8 max-w-3xl divide-white/10 rounded-2xl border border-white/10 bg-[#1c1033] px-5 sm:px-7">
          {faqs().map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`}>
              <AccordionTrigger className="py-5 text-left text-[16px] font-semibold text-white">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-snug text-[#ddd6f5]">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <section className="px-5 pb-20 sm:pb-28">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-[#c4b5fd]/30 bg-[linear-gradient(160deg,#2a1466_0%,#4c1d95_70%,#7c6cf0_140%)] px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="font-display text-balance text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[40px]">
            Find out how many jobs are leaking out of your pipeline.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-snug text-[#efeaff]">{finalBody}</p>
          <div className="mt-8 flex justify-center">
            <AuditCta label={CTA_LABEL} variant="inverted" className="w-full sm:w-auto" />
          </div>
        </div>
      </section>
    </>
  );
}
