'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  RefreshCw,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

import { NumberTicker } from '@/components/ui/number-ticker';
import { Marquee } from '@/components/ui/marquee';
import { CleanBookingDemo } from '@/components/marketing/CleanBookingDemo';
import { GhlCalendarEmbed } from '@/components/marketing/GhlCalendarEmbed';
import { cn } from '@/lib/utils';

const CALENDAR_ANCHOR = '#book-a-call';

// ============================================================================
// Reusable bits
// ============================================================================
function PrimaryCTA({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={CALENDAR_ANCHOR}>
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2',
          className
        )}
      >
        {children}
      </button>
    </Link>
  );
}

function SecondaryCTA({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <Link href={href}>
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50',
          className
        )}
      >
        {children}
      </button>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
      {children}
    </p>
  );
}

// ============================================================================
// NAV — minimal
// ============================================================================
function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/demo" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-[11px] font-semibold text-white">
            S
          </div>
          <span className="text-base font-semibold text-zinc-900">Selestial</span>
        </Link>
        <PrimaryCTA className="px-4 py-2 text-xs">
          Book Demo
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </PrimaryCTA>
      </div>
    </nav>
  );
}

// ============================================================================
// HERO
// ============================================================================
function Hero() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 md:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              For residential cleaning companies doing 20+ jobs/month
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-zinc-900 md:text-5xl lg:text-6xl"
            >
              The booking page that turns your website into your best salesperson.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 max-w-lg text-base leading-relaxed text-zinc-600 md:text-lg"
            >
              Show pricing upfront. Collect a deposit. Book the job in 60 seconds. No quote forms,
              no callbacks, no lost customers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-7 flex flex-col items-start gap-3 sm:flex-row"
            >
              <PrimaryCTA>
                Book a 15-min demo
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </PrimaryCTA>
              <SecondaryCTA href="#product">See it in action</SecondaryCTA>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-6 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-zinc-500"
            >
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Live in 48 hours
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                30-day money-back
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CleanBookingDemo />
            <p className="mt-3 text-center text-xs text-zinc-500">
              Live preview — auto-cycles through the actual booking flow.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SOCIAL PROOF — quiet logo / numbers strip
// ============================================================================
function SocialProofStrip() {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Built on the engine processing real cleaning revenue
        </p>
        <div className="mt-6 grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {[
            { value: 510000, label: 'Tracked revenue', prefix: '$' },
            { value: 1740, label: 'Bookings processed' },
            { value: 32.3, label: 'Recurring conversion', suffix: '%', decimals: 1 },
            { value: 60, label: 'Seconds, average', suffix: 's' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                <NumberTicker
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="mt-1 text-xs text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PAIN
// ============================================================================
function Pain() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <SectionLabel>The problem</SectionLabel>
        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-4xl">
          Every &ldquo;Request a quote&rdquo; form is a customer your competitor just booked.
        </h2>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-zinc-600 md:text-lg">
          <p>
            It&apos;s 9 PM on a Tuesday. A woman just moved into a 3-bedroom in your service
            area. She opens Google, searches &ldquo;house cleaning near me,&rdquo; and clicks
            on four different cleaning companies — including yours.
          </p>
          <p>
            Your site says: <strong className="text-zinc-900">&ldquo;Fill out this form for a free quote.&rdquo;</strong>
            <br />
            Her next-door competitor&apos;s site says:{' '}
            <strong className="text-zinc-900">&ldquo;3BR biweekly — $145. Book now.&rdquo;</strong>
          </p>
          <p>
            She&apos;s not going to wait for your callback tomorrow. She&apos;s not going to
            fill out a form at 9 PM. She&apos;s going to click the one that shows her the
            price, books the time, and lets her get back to unpacking.
          </p>
          <p className="font-semibold text-zinc-900">
            You just lost a $3,500/year recurring customer. You&apos;ll never even know she
            existed.
          </p>
          <p>
            This is happening on your website every single day. And no &ldquo;respond
            faster&rdquo; plan fixes it — because the problem isn&apos;t how quickly you
            respond. It&apos;s that you&apos;re making her ask in the first place.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRODUCT — 4 features in a clean two-up
// ============================================================================
const FEATURES = [
  {
    icon: Zap,
    title: 'Live pricing in 3 seconds',
    body: 'Customer picks home size, bedrooms, and cleaning type. They see your price instantly. No forms, no waiting.',
  },
  {
    icon: CreditCard,
    title: 'Stripe deposit at booking',
    body: 'Your calendar gets the job and your bank gets the deposit in the same flow. No-shows drop to near zero.',
  },
  {
    icon: RefreshCw,
    title: 'Recurring upsell at checkout',
    body: 'Built-in upgrade prompt converts one-time customers to biweekly subscribers during the booking flow.',
  },
  {
    icon: Clock,
    title: 'SMS + email on autopilot',
    body: 'Confirmations, day-before reminders, post-service review requests. Every touchpoint, automatic.',
  },
];

function Product() {
  return (
    <section id="product" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="mb-12 max-w-2xl">
          <SectionLabel>The product</SectionLabel>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-4xl">
            Four things no generic booking tool does for cleaning companies.
          </h2>
        </div>

        <div className="grid gap-px bg-zinc-200 md:grid-cols-2 rounded-xl overflow-hidden border border-zinc-200">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="bg-white p-7 md:p-9">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700">
                  <f.icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <p className="text-xs font-mono text-zinc-400">
                  0{i + 1}
                </p>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PROOF — 2 testimonials with stat strip + quiet marquee
// ============================================================================
const TESTIMONIALS = [
  {
    name: 'BadgerLuxClean',
    role: 'Premium Residential Cleaning',
    initials: 'BL',
    quote:
      'We processed 1,740 bookings and tracked $510K in revenue through Selestial. 32% of our one-time customers converted to recurring service at the booking page — not after weeks of follow-up.',
    stats: [
      { value: '1,740', label: 'Bookings' },
      { value: '$510K', label: 'Revenue' },
      { value: '32.3%', label: 'Recurring conv.' },
      { value: '775', label: 'Customers' },
    ],
  },
  {
    name: 'Bay Area Cleaning Pros',
    role: 'Residential Cleaning, Bay Area CA',
    initials: 'BA',
    quote:
      "We added $50K in new annual revenue from bookings that would've been phone tag before Selestial. Customers see the price, pick their time, and the job's on the calendar before I'd even have called them back.",
    stats: [
      { value: '$50K', label: 'New annual revenue' },
      { value: 'Q2 2025', label: 'Live since' },
      { value: '24/7', label: 'No admin' },
    ],
  },
];

const MARQUEE_QUOTES = [
  { who: 'Capitol Maids', from: 'Austin, TX', text: 'Customers see the price, pick the time, deposit hits before I\u2019d have called them back.' },
  { who: 'Bright & Tidy', from: 'Charlotte, NC', text: 'The recurring upgrade prompt at checkout doubled our biweekly subscribers in 30 days.' },
  { who: 'Spotless Squad', from: 'Phoenix, AZ', text: 'Setup was 48 hours. We replaced 3 separate tools with one Selestial booking page.' },
  { who: 'Crisp Home', from: 'Denver, CO', text: 'Bookings come in overnight while I sleep. Deposit is already paid by the time I wake up.' },
  { who: 'Polished Pro', from: 'Tampa, FL', text: 'The page looks like ours, behaves like ours. Customers don\u2019t even know it\u2019s Selestial.' },
];

function Proof() {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="mb-12 max-w-2xl">
          <SectionLabel>Proof</SectionLabel>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-4xl">
            Real cleaning companies. Real numbers.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-zinc-200 bg-white p-7 md:p-8"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-zinc-900 text-zinc-900" />
                ))}
              </div>
              <p className="text-base leading-relaxed text-zinc-700">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
              <div
                className={cn(
                  'mt-6 grid gap-3 border-t border-zinc-200 pt-4',
                  t.stats.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'
                )}
              >
                {t.stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-base font-semibold text-zinc-900">{s.value}</p>
                    <p className="text-[11px] text-zinc-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quiet marquee — small monochrome quote chips */}
        <div className="mt-12">
          <div className="relative">
            <Marquee pauseOnHover className="[--duration:38s] [--gap:0.75rem]">
              {MARQUEE_QUOTES.map((q) => (
                <div
                  key={q.who}
                  className="w-[320px] shrink-0 rounded-lg border border-zinc-200 bg-white px-4 py-3"
                >
                  <p className="text-xs leading-relaxed text-zinc-600">&ldquo;{q.text}&rdquo;</p>
                  <p className="mt-2 text-[11px] font-medium text-zinc-900">
                    {q.who}
                    <span className="ml-1 font-normal text-zinc-500">· {q.from}</span>
                  </p>
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-zinc-50" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zinc-50" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING — single clean card
// ============================================================================
const INCLUDES = [
  'Done-for-you setup, live in 48 hours',
  'Fully-branded booking page on your domain or a Selestial subdomain',
  'Pricing engine that adjusts by home size, service type, and add-ons',
  'Stripe deposit collection at the moment of booking',
  'Recurring service upsell flow that converts one-time to subscription',
  'SMS and email confirmations sent automatically',
  'Monthly check-in to optimize conversion and pricing',
  'Calendar sync with Google Calendar, Outlook, or any ICS feed',
  'Unlimited bookings, no per-user fees, no feature gates',
];

function Pricing() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <div className="mb-10 text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            One plan. Everything included. $297/month.
          </h2>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-7 md:p-10">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight text-zinc-900">$297</span>
            <span className="text-base text-zinc-500">/month</span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Done-for-you setup included. No setup fee. Cancel anytime.
          </p>

          <div className="my-7 h-px bg-zinc-200" />

          <ul className="space-y-3">
            {INCLUDES.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 text-sm leading-relaxed text-zinc-700"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <PrimaryCTA className="mt-8 w-full px-7 py-3">
            Book your 15-min demo
            <ArrowRight className="ml-2 h-4 w-4" />
          </PrimaryCTA>
          <p className="mt-3 text-center text-xs text-zinc-500">
            30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ — minimal native disclosure
// ============================================================================
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'I already use Jobber / Housecall Pro / BookingKoala. Why would I need this?',
    a: (
      <>
        Selestial isn&apos;t a replacement — it&apos;s the front door. Jobber and Housecall
        Pro were built to <em>run</em> your operations (dispatching, invoicing, routes). They
        weren&apos;t built to convert website visitors into bookings. Selestial sits on your
        site, captures the booking, and hands it off to whatever you&apos;re using for the
        back end.
      </>
    ),
  },
  {
    q: 'What if my customers want to talk to a human first?',
    a: (
      <>
        Most of them don&apos;t. Most home service website visitors abandon when they&apos;re
        forced into a phone call for basic pricing. For the jobs that genuinely need custom
        quotes — deep cleans, post-construction, hoarder scenarios — they can still call you.
        Selestial is for your standard 70% of bookings.
      </>
    ),
  },
  {
    q: 'How fast can I actually be live?',
    a: (
      <>
        48 hours from the moment you share your pricing and brand assets. Most cleaning
        companies are booking jobs through Selestial by the end of day 2.
      </>
    ),
  },
  {
    q: "What if it doesn't work?",
    a: (
      <>
        Your first 30 days are money-back guaranteed. If you don&apos;t capture a single
        booking you can attribute to Selestial in that window, we refund the month.
      </>
    ),
  },
  {
    q: 'Is my data safe? What about my existing customer list?',
    a: (
      <>
        Your data lives in encrypted Supabase infrastructure. Nothing is shared with third
        parties. And if you ever leave, you export everything — customer list, booking
        history, pricing configurations.
      </>
    ),
  },
];

function FAQ() {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <div className="mb-10">
          <SectionLabel>Questions</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Questions you&apos;re probably asking right now.
          </h2>
        </div>
        <div className="space-y-2">
          {FAQS.map((item, i) => (
            <details
              key={i}
              className="group rounded-lg border border-zinc-200 bg-white px-5 py-4 transition-colors open:bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-zinc-900 sm:text-base">{item.q}</h3>
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 text-sm leading-relaxed text-zinc-600">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// BOOK A CALL — inline GHL embed
// ============================================================================
function BookACall() {
  return (
    <section id="book-a-call" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-4xl px-5 py-20 md:py-28">
        <div className="mb-10 text-center">
          <SectionLabel>Book a demo</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Pick a 15-minute slot that works for you.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 md:text-base">
            We&apos;ll show you Selestial running on a real cleaning company&apos;s pricing,
            schedule, and recurring flow.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <GhlCalendarEmbed
            src="https://api.divineacquisition.io/widget/booking/bdGyTVXFRxIW5RI49fGp"
            id="09O94JadkIsrarld4LMd_demo_inline"
            minHeight={840}
            maxHeight={1400}
          />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA — quiet, no gradient block
// ============================================================================
function FinalCta() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28 text-center">
        <Sparkles className="mx-auto mb-4 h-5 w-5 text-zinc-400" />
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          Stop losing cleaning bookings you never knew you had.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-600">
          Your website is generating traffic right now. Most of it is leaving because of a form
          your customers don&apos;t want to fill out. Selestial fixes it in 48 hours.
        </p>
        <PrimaryCTA className="mt-7 px-6 py-3">
          Book my 15-min demo
          <ArrowRight className="ml-2 h-4 w-4" />
        </PrimaryCTA>
        <p className="mt-4 text-xs text-zinc-500">
          $297/month · 30-day money-back · Cancel anytime
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================
function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-zinc-500">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-[10px] font-semibold text-white">
            S
          </div>
          <span className="text-sm font-medium text-zinc-900">Selestial</span>
          <span className="text-xs text-zinc-400">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-zinc-500">
          <a
            href="https://selestial.io/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900"
          >
            Privacy
          </a>
          <a
            href="https://selestial.io/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900"
          >
            Terms
          </a>
          <a href="mailto:hello@selestial.io" className="hover:text-zinc-900">
            hello@selestial.io
          </a>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function DemoLandingPage() {
  return (
    <main className="bg-white text-zinc-900 antialiased">
      <Nav />
      <Hero />
      <SocialProofStrip />
      <Pain />
      <Product />
      <Proof />
      <Pricing />
      <FAQ />
      <BookACall />
      <FinalCta />
      <Footer />
    </main>
  );
}
