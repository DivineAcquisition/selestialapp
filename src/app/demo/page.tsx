'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Lock, ShieldCheck, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon, type IconName } from '@/components/ui/icon';
import { GridPattern } from '@/components/ui/grid-pattern';
import { Spotlight } from '@/components/ui/spotlight';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { NumberTicker } from '@/components/ui/number-ticker';
import { GradientText } from '@/components/ui/text-effects';
import { cn } from '@/lib/utils';

import { BookingFlowPreview } from '@/components/marketing/BookingFlowPreview';
import { HeroDashboardPreview } from '@/components/marketing/HeroDashboardPreview';
import { GhlCalendarEmbed } from '@/components/marketing/GhlCalendarEmbed';
import { WistiaPlayer } from '@/components/marketing/WistiaPlayer';

const CALENDAR_ANCHOR = '#book-a-call';

// ============================================================================
// HERO
// ============================================================================
function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-12 md:pb-28 md:pt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-50/40 via-white to-white" />
      <GridPattern
        width={56}
        height={56}
        className="absolute inset-0 -z-0 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)] text-violet-200/40"
      />
      <Spotlight
        className="-top-20 left-0 md:-top-20 md:left-60"
        fill="rgba(124,58,237,0.25)"
      />
      <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5">
        <div className="mx-auto mb-12 max-w-4xl text-center md:mb-16">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary sm:text-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            For Residential Cleaning Companies Doing 20+ Jobs/Month
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-5 text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Your website is losing cleaning bookings every day.{' '}
            <GradientText
              gradient="from-primary via-violet-500 to-fuchsia-500"
              className="font-bold"
            >
              Here&apos;s how to fix it in 48 hours.
            </GradientText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-7 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg md:text-xl"
          >
            See your pricing upfront. Collect deposits instantly. Book jobs in 60 seconds —
            no quote forms, no callbacks, no lost customers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href={CALENDAR_ANCHOR}>
              <ShimmerButton className="px-7 py-3.5 text-sm font-semibold text-white sm:text-base">
                See How It Works — Book 15-Min Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </ShimmerButton>
            </Link>
            <Link href="#product-tour">
              <Button variant="lovable-light" size="lg">
                Watch the 60-second tour
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500 sm:text-sm"
          >
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Built for residential cleaning
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-500" /> Live in 48 hours
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-gray-700 sm:text-sm">
              Built on the engine that powered $510K in tracked cleaning revenue.
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <HeroDashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// LIVE STATS BAR
// ============================================================================
function StatsBar() {
  return (
    <section className="border-y border-gray-200 bg-gray-50/60 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-5">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
          Real cleaning companies. Real numbers. Live right now.
        </p>
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4 md:gap-8">
          {[
            { value: 510000, label: 'Tracked revenue', prefix: '$' },
            { value: 1740, label: 'Bookings processed' },
            { value: 32.3, label: 'Recurring conversion', suffix: '%', decimals: 1 },
            { value: 60, label: 'Seconds, average', suffix: 's' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-gray-900 md:text-4xl">
                <NumberTicker
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PAIN — pattern interrupt
// ============================================================================
function Pain() {
  return (
    <section className="bg-gray-50/60 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <h2 className="mb-8 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-4xl">
          Every &ldquo;Request A Quote&rdquo; form is a customer your competitor just{' '}
          <GradientText gradient="from-primary to-violet-500">booked.</GradientText>
        </h2>

        <div className="space-y-5 text-base leading-relaxed text-gray-700 sm:text-lg">
          <p>
            It&apos;s 9 PM on a Tuesday. A woman just moved into a 3-bedroom in your service area.
            She opens Google, searches &ldquo;house cleaning near me,&rdquo; and clicks on four
            different cleaning companies — including yours.
          </p>
          <p>
            Your site says: <strong>&ldquo;Fill out this form for a free quote.&rdquo;</strong>
            <br />
            Her next-door competitor&apos;s site says:{' '}
            <strong className="text-primary">&ldquo;3BR biweekly — $145. Book now.&rdquo;</strong>
          </p>
          <p>
            She&apos;s not going to wait for your callback tomorrow. She&apos;s not going to fill
            out a form at 9 PM. She&apos;s going to click the one that shows her the price, books
            the time, and lets her get back to unpacking.
          </p>
          <p className="font-semibold text-gray-900">
            You just lost a $3,500/year recurring customer. You&apos;ll never even know she existed.
          </p>
          <p>
            This is happening on your website every single day. Not sometimes. Daily. And no
            &ldquo;respond faster&rdquo; plan fixes it — because the problem isn&apos;t how quickly
            you respond. It&apos;s that you&apos;re making her ask in the first place.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRODUCT TOUR — booking flow preview + VSL
// ============================================================================
function ProductTour() {
  return (
    <section id="product-tour" className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-violet-50/30 to-white" />
      <div className="relative mx-auto max-w-7xl px-5">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <Badge className="mb-3 border-violet-200 bg-violet-100 text-violet-700">
            <Sparkles className="mr-1.5 h-3 w-3" />
            Live product demo
          </Badge>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
            Selestial is the booking page built specifically for{' '}
            <GradientText gradient="from-primary to-violet-500">
              residential cleaning companies.
            </GradientText>
          </h2>
          <p className="text-lg text-gray-600">
            Same flow your customers see. Auto-cycling so you can preview every step before you
            book a demo.
          </p>
        </div>

        <div className="grid items-center gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            {[
              {
                icon: 'dollar' as IconName,
                title: 'Shows your exact price — instantly',
                body:
                  'Customer picks home size, bedrooms, and cleaning type. She sees your price in 3 seconds. No forms. No waiting. No quote calls.',
              },
              {
                icon: 'lock' as IconName,
                title: 'Collects the deposit before she leaves your site',
                body:
                  'Stripe-powered deposit at booking. Your calendar gets the job and your bank gets the payment in the same flow. No-shows drop to near zero.',
              },
              {
                icon: 'sparkles' as IconName,
                title: 'Upsells recurring service at the booking moment',
                body:
                  'Built-in recurring upgrade prompt turns one-time customers into biweekly subscribers during checkout. BadgerLuxClean converts 32% of one-time bookings using this.',
              },
              {
                icon: 'bolt' as IconName,
                title: 'Handles every confirmation automatically',
                body:
                  'SMS and email confirmations, day-before reminders, post-service follow-ups — all automated. You stop managing the admin of every booking.',
              },
            ].map((b, i) => (
              <div
                key={b.title}
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Icon name={b.icon} size="lg" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mb-1 text-base font-semibold text-gray-900">{b.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{b.body}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <BookingFlowPreview />
          </motion.div>
        </div>

        {/* VSL — optional, gracefully hidden if Wistia script doesn't load */}
        <div className="mt-16">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
              Or watch the 60-second walkthrough
            </p>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-2xl shadow-gray-200/50">
              <WistiaPlayer mediaId="7zigms7aiy" aspect={16 / 9} />
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link href={CALENDAR_ANCHOR}>
            <ShimmerButton className="px-7 py-3.5 text-sm font-semibold text-white sm:text-base">
              Book my 15-min demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </ShimmerButton>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PROOF — testimonials with stats
// ============================================================================
function Proof() {
  const tiles = [
    {
      name: 'BadgerLuxClean',
      role: 'Premium Residential Cleaning',
      initials: 'BL',
      quote:
        'We processed 1,740 bookings and tracked $510K in revenue through Selestial. 32% of our one-time customers converted to recurring service at the booking page — not after weeks of follow-up.',
      stats: [
        { value: '1,740', label: 'Bookings' },
        { value: '$510K', label: 'Tracked revenue' },
        { value: '32.3%', label: 'Recurring conversion' },
        { value: '775', label: 'Customers captured' },
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

  return (
    <section className="border-y border-gray-200 bg-gray-50/60 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-10 text-center">
          <Badge className="mb-3 border-violet-200 bg-violet-100 text-violet-700">Proof</Badge>
          <h2 className="text-3xl font-bold text-gray-900 md:text-5xl">
            Real cleaning companies.{' '}
            <GradientText gradient="from-primary to-violet-500">Real numbers.</GradientText>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {tiles.map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" size="sm" className="text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 leading-relaxed text-gray-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-sm font-semibold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
              <div
                className={cn(
                  'grid gap-3 border-t border-gray-100 pt-4',
                  t.stats.length === 4 ? 'grid-cols-2' : 'grid-cols-3'
                )}
              >
                {t.stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-base font-bold text-gray-900md:text-lg">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href={CALENDAR_ANCHOR}>
            <ShimmerButton className="px-7 py-3.5 text-sm font-semibold text-white sm:text-base">
              See how Selestial works — Book a Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </ShimmerButton>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING
// ============================================================================
const INCLUDES = [
  'Done-for-you setup — we configure your pricing tiers, service types, add-ons, and branding from your existing rates. Live in 48 hours.',
  'Fully-branded booking page hosted on your domain or a Selestial subdomain you choose',
  'Pricing engine that adjusts by home size, service type, and add-ons',
  'Stripe deposit collection at the moment of booking',
  'Recurring service upsell flow that converts one-time to subscription',
  'SMS and email confirmations sent automatically on your behalf',
  'Monthly check-in call with you to optimize conversion, pricing, and upsell',
  'Calendar sync with Google Calendar, Outlook, or any ICS feed',
  'Unlimited bookings. No per-user fees. No feature gates.',
];

function Pricing() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <div className="mb-10 text-center">
          <Badge className="mb-3 border-violet-200 bg-violet-100 text-violet-700">Pricing</Badge>
          <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-5xl">
            Everything you need.{' '}
            <GradientText gradient="from-primary to-violet-500">$297/month.</GradientText>
          </h2>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-primary/15 via-violet-500/15 to-primary/15 blur-2xl" />
          <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl shadow-gray-300/30 md:p-10">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-900 md:text-6xl">$297</span>
              <span className="text-lg text-gray-500">/month</span>
            </div>
            <p className="mb-6 text-sm text-gray-500">
              Done-for-you setup included. No setup fee. Cancel anytime.
            </p>

            <ul className="mb-8 space-y-3">
              {INCLUDES.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-sm text-gray-700 md:text-base"
                >
                  <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3">
              <Link href={CALENDAR_ANCHOR}>
                <ShimmerButton className="w-full px-7 py-3.5 text-sm font-semibold text-white sm:text-base">
                  Book Your 15-Min Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </ShimmerButton>
              </Link>
              <p className="text-xs text-gray-500">
                30-day money-back guarantee — if you don&apos;t capture a single incremental
                booking through Selestial in your first 30 days, we refund the month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ
// ============================================================================
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'I already use Jobber / Housecall Pro / BookingKoala. Why would I need this?',
    a: (
      <>
        Selestial isn&apos;t a replacement — it&apos;s the front door. Jobber and Housecall Pro
        were built to <em>run</em> your operations (dispatching, invoicing, routes). They
        weren&apos;t built to convert website visitors into bookings. Selestial sits on your site,
        captures the booking, and hands it off to whatever you&apos;re using for the back end.
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
        48 hours from the moment you share your pricing and brand assets. Most cleaning companies
        are booking jobs through Selestial by the end of day 2.
      </>
    ),
  },
  {
    q: "What if it doesn't work?",
    a: (
      <>
        Your first 30 days are money-back guaranteed. If you don&apos;t capture a single booking
        you can attribute to Selestial in that window, we refund the month.
      </>
    ),
  },
  {
    q: 'Is my data safe? What about my existing customer list?',
    a: (
      <>
        Your data lives in encrypted Supabase infrastructure. Nothing is shared with third
        parties. And if you ever leave, you export everything — customer list, booking history,
        pricing configurations.
      </>
    ),
  },
];

function FAQ() {
  return (
    <section className="border-y border-gray-200 bg-gray-50/60 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <div className="mb-10 text-center">
          <Badge className="mb-3 border-violet-200 bg-violet-100 text-violet-700">FAQ</Badge>
          <h2 className="text-3xl font-bold text-gray-900 md:text-5xl">
            Questions you&apos;re probably{' '}
            <GradientText gradient="from-primary to-violet-500">asking right now.</GradientText>
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition-shadow open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <h3 className="pr-6 text-base font-semibold text-gray-900 sm:text-lg">{item.q}</h3>
                <Icon
                  name="chevronDown"
                  size="sm"
                  className="shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// BOOK A CALL — inline GHL calendar (no modal)
// ============================================================================
function BookACall() {
  return (
    <section id="book-a-call" className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-5">
        <div className="mb-10 text-center">
          <Badge className="mb-3 border-violet-200 bg-violet-100 text-violet-700">
            Talk to a real human
          </Badge>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-5xl">
            Book your 15-minute{' '}
            <GradientText gradient="from-primary to-violet-500">Selestial demo.</GradientText>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Pick a time below. We&apos;ll show you Selestial running on a real cleaning
            company&apos;s pricing, schedule, and recurring flow.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-primary/15 via-violet-500/15 to-primary/15 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-300/30">
            <GhlCalendarEmbed
              src="https://api.divineacquisition.io/widget/booking/bdGyTVXFRxIW5RI49fGp"
              id="09O94JadkIsrarld4LMd_demo_inline"
              minHeight={840}
              maxHeight={1400}
            />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          No credit card required • 30-day money-back guarantee • Cancel anytime
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA
// ============================================================================
function FinalCta() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-5">
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/25 via-violet-500/25 to-primary/25 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-violet-700 p-10 text-center md:p-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold leading-tight text-white md:text-5xl">
                Stop losing cleaning bookings you never knew you had.
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-base text-white/85 md:text-lg">
                Your website is generating traffic right now. Most of it is leaving because of a
                form your customers don&apos;t want to fill out. Selestial fixes it in 48 hours.
              </p>
              <div className="flex justify-center">
                <Link href={CALENDAR_ANCHOR}>
                  <ShimmerButton
                    background="linear-gradient(110deg, #ffffff, 45%, #f5f3ff, 55%, #ffffff)"
                    className="px-7 py-3.5 text-sm font-bold text-primary sm:text-base"
                  >
                    Book My 15-Min Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ShimmerButton>
                </Link>
              </div>
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/80 sm:text-sm">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> No credit card required
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> 30-day money-back guarantee
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Cancel anytime
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> $297/month, all features included
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER (minimal)
// ============================================================================
function MinimalFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-gray-900">Selestial</span>
          <span className="text-xs text-gray-400">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-gray-500">
          <a
            href="https://selestial.io/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900"
          >
            Privacy
          </a>
          <a
            href="https://selestial.io/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900"
          >
            Terms
          </a>
          <a href="mailto:hello@selestial.io" className="hover:text-gray-900">
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
    <main className="bg-white">
      {/* Lightweight nav — logo + single CTA, no other links */}
      <nav className="sticky top-0 z-30 border-b border-gray-100 bg-white/85 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/demo" className="text-lg font-semibold text-gray-900">
            Selestial
          </Link>
          <Link href={CALENDAR_ANCHOR}>
            <Button variant="lovable" size="sm">
              Book Demo
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      <Hero />
      <StatsBar />
      <Pain />
      <ProductTour />
      <Proof />
      <Pricing />
      <FAQ />
      <BookACall />
      <FinalCta />
      <MinimalFooter />
    </main>
  );
}
