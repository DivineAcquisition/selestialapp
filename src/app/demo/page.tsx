'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
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
  Lock,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Icon, type IconName } from '@/components/ui/icon';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Marquee } from '@/components/ui/marquee';
import { CleanBookingDemo } from '@/components/marketing/CleanBookingDemo';
import { HeroDashboardPreview } from '@/components/marketing/HeroDashboardPreview';
import { SelestialBookingCalendar } from '@/components/marketing/GhlCalendarEmbed';
import { cn } from '@/lib/utils';

const CALENDAR_ANCHOR = '#book-a-call';

// ============================================================================
// CTAs (violet primary, white secondary, monochrome typography)
// ============================================================================
function PrimaryCTA({
  children,
  href = CALENDAR_ANCHOR,
  className,
  size = 'md',
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  };
  return (
    <Link href={href}>
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md bg-primary font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
          sizes[size],
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
          'inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50',
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
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </p>
  );
}

// ============================================================================
// NAV
// ============================================================================
function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/demo" className="flex items-center gap-2.5">
          <Image
            src="/logo-icon-new.png"
            alt="Selestial"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-base font-semibold text-zinc-900">Selestial</span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm text-zinc-600">
          <a href="#product" className="transition-colors hover:text-zinc-900">
            Product
          </a>
          <a href="#sequences" className="transition-colors hover:text-zinc-900">
            Workflows
          </a>
          <a href="#pricing" className="transition-colors hover:text-zinc-900">
            Pricing
          </a>
          <a href="#book-a-call" className="transition-colors hover:text-zinc-900">
            Demo
          </a>
        </div>
        <PrimaryCTA size="sm">
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
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-14">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              For residential cleaning companies doing 20+ jobs/month
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-zinc-900 md:text-5xl lg:text-6xl"
            >
              The booking page that turns your website into your{' '}
              <span className="text-primary">best salesperson.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 max-w-lg text-base leading-relaxed text-zinc-600 md:text-lg"
            >
              Show pricing upfront. Collect a deposit. Book the job in 60 seconds. No quote
              forms, no callbacks, no lost customers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-7 flex flex-col items-start gap-3 sm:flex-row"
            >
              <PrimaryCTA size="lg">
                Book a 15-min demo
                <ArrowRight className="ml-2 h-4 w-4" />
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
// SOCIAL PROOF STRIP
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
// LIVE DASHBOARD — second product visual
// ============================================================================
function LiveDashboard() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="mb-10 max-w-2xl">
          <SectionLabel>Inside the dashboard</SectionLabel>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-4xl">
            Watch every booking, every reply, every recovered MRR — live.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-zinc-600">
            Replies sent in under 60 seconds. Bookings rolling in. Sequences enrolling
            customers automatically. This is the operator view.
          </p>
        </div>
        <HeroDashboardPreview />
      </div>
    </section>
  );
}

// ============================================================================
// PAIN
// ============================================================================
function Pain() {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <SectionLabel>The problem</SectionLabel>
        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-4xl">
          Every &ldquo;Request a quote&rdquo; form is a customer your competitor just{' '}
          <span className="text-primary">booked.</span>
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
// PRODUCT — 4 features
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

        <div className="grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="bg-white p-7 md:p-9">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-primary">
                  <f.icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <p className="font-mono text-xs text-zinc-400">0{i + 1}</p>
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
// SEQUENCES (merged from welcome page)
// ============================================================================
const SEQUENCE_CATEGORIES = [
  {
    id: 'speed-to-lead',
    name: 'Speed-to-Lead',
    icon: 'bolt' as IconName,
    sequences: [
      { name: 'Speed-to-Lead', metric: '< 60 sec', description: 'Instant response to new inquiries' },
      { name: 'Missed Call Recovery', metric: '40% recovery', description: 'Text back when you miss a call' },
      { name: 'After Hours Response', metric: '24/7 capture', description: 'Never miss a lead overnight' },
      { name: 'Hot Lead Fast Track', metric: '5 touches/24hr', description: 'Aggressive follow-up for urgent buyers' },
    ],
  },
  {
    id: 'quote-followup',
    name: 'Quote Follow-Up',
    icon: 'fileText' as IconName,
    sequences: [
      { name: 'Quote Follow-Up', metric: '21-day nurture', description: '6+ touchpoints until conversion' },
      { name: 'Estimate Expiry', metric: 'Urgency trigger', description: 'Create FOMO before quote expires' },
      { name: 'Pipeline Nurture', metric: '60-day drip', description: 'Stay top of mind for big projects' },
      { name: 'Good-Better-Best', metric: 'Option follow-up', description: 'Help customers decide on package' },
    ],
  },
  {
    id: 'booking-service',
    name: 'Booking & Service',
    icon: 'calendar' as IconName,
    sequences: [
      { name: 'Booking Reminder', metric: '< 5% no-show', description: 'Multi-touch confirmation sequence' },
      { name: 'Post-Service Thank You', metric: 'Same-day', description: 'Build goodwill immediately after service' },
      { name: 'Review Request', metric: '30% response', description: 'Automated 5-star review collection' },
      { name: 'Referral Request', metric: 'Day 7', description: 'Ask happy customers for referrals' },
    ],
  },
  {
    id: 'retention',
    name: 'Recurring Customers',
    icon: 'heart' as IconName,
    sequences: [
      { name: 'At-Risk Intervention', metric: 'Churn prevention', description: 'Detect and save at-risk customers' },
      { name: 'Rebooking Reminder', metric: 'Service intervals', description: 'Proactive scheduling for recurring' },
      { name: 'Win-Back Campaign', metric: 'Lapsed customers', description: 'Re-engage inactive accounts' },
      { name: 'Subscription Conversion', metric: 'Recurring revenue', description: 'Convert one-time to recurring' },
    ],
  },
  {
    id: 'seasonal',
    name: 'Seasonal',
    icon: 'sun' as IconName,
    sequences: [
      { name: 'Spring Deep Clean', metric: 'Mar–Apr', description: 'Annual top-to-bottom refresh promo' },
      { name: 'Move-Out Season', metric: 'May–Aug', description: 'Lease-turnover deep cleans' },
      { name: 'Holiday Prep', metric: 'Nov–Dec', description: 'Pre-guest deep clean push' },
      { name: 'Allergy Season Push', metric: 'Apr–Jun', description: 'Dust + air-quality focused cleans' },
    ],
  },
];

function Sequences() {
  const [active, setActive] = useState(SEQUENCE_CATEGORIES[0].id);
  const current = SEQUENCE_CATEGORIES.find((c) => c.id === active);

  return (
    <section id="sequences" className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="mb-10 max-w-2xl">
          <SectionLabel>Pre-built sequences</SectionLabel>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-4xl">
            34+ workflows built for cleaning companies.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-zinc-600">
            Booking confirmations, recurring service reminders, win-back flows, deep clean
            promos. Install in one click from{' '}
            <span className="font-medium text-zinc-900">Sequences → Templates</span>.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {SEQUENCE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                active === cat.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
              )}
            >
              <Icon name={cat.icon} size="xs" />
              {cat.name}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            </div>
            <div className="mx-auto flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1 font-mono text-[11px] text-zinc-500">
              <Lock className="h-3 w-3" />
              app.selestial.io / sequences / templates
            </div>
          </div>
          <div className="p-6">
            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
                >
                  {current.sequences.map((seq) => (
                    <div
                      key={seq.name}
                      className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-primary/30"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-zinc-900">{seq.name}</h3>
                        <span className="rounded bg-primary/5 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          {seq.metric}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-500">{seq.description}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PROOF — testimonial cards + marquee
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
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="mb-12 max-w-2xl">
          <SectionLabel>Proof</SectionLabel>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-4xl">
            Real cleaning companies. Real numbers.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-xl border border-zinc-200 bg-white p-7 md:p-8">
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-base leading-relaxed text-zinc-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
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

        <div className="relative mt-12">
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
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white" />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING
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
    <section id="pricing" className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <div className="mb-10 text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            One plan. Everything included. <span className="text-primary">$297/month.</span>
          </h2>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-7 shadow-sm md:p-10">
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

          <PrimaryCTA size="lg" className="mt-8 w-full">
            Book your 15-min demo
            <ArrowRight className="ml-2 h-4 w-4" />
          </PrimaryCTA>
          <p className="mt-3 text-center text-xs text-zinc-500">30-day money-back guarantee</p>
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
    <section className="border-b border-zinc-200 bg-white">
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
              className="group rounded-lg border border-zinc-200 bg-white px-5 py-4 transition-colors"
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
// CUSTOM BOOKING PAGE REQUEST FORM (merged from welcome page)
// ============================================================================
type CustomizationRequest = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  serviceArea: string;
  homeSizeFocus: string;
  servicesOffered: string;
  brandColor: string;
  notes: string;
};

const EMPTY_REQUEST: CustomizationRequest = {
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  serviceArea: '',
  homeSizeFocus: '',
  servicesOffered: '',
  brandColor: '#7c3aed',
  notes: '',
};

function CustomBookingPageSection() {
  const [form, setForm] = useState<CustomizationRequest>(EMPTY_REQUEST);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof CustomizationRequest>(
    key: K,
    value: CustomizationRequest[K]
  ) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName || !form.contactName || !form.email) {
      toast.error('Business name, contact, and email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/booking-page-customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="custom-booking-page" className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="mb-10 text-center">
          <SectionLabel>Done-for-you setup</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Want your own branded booking page?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">
            Tell us about your cleaning business and we&apos;ll build your branded booking
            page — home-size pricing, services, deposits, brand colors — and have it live in
            48 hours.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-2">
            {[
              {
                icon: 'bolt' as IconName,
                title: 'Live in 48 hours',
                desc:
                  'Plug in your services and pricing, ship to a Selestial subdomain or your own domain.',
              },
              {
                icon: 'dollar' as IconName,
                title: 'Your pricing, your services',
                desc:
                  'Home-size pricing, add-ons, recurring discounts, deposits — mirrored to how you charge today.',
              },
              {
                icon: 'sparkles' as IconName,
                title: 'Branded end-to-end',
                desc:
                  'Your logo, colors, photos, copy. Customers never see Selestial branding unless you want them to.',
              },
              {
                icon: 'check' as IconName,
                title: 'Connected to everything',
                desc: 'Stripe deposits, Twilio SMS, recurring sequences, GHL / HubSpot CRM sync.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-primary">
                  <Icon name={item.icon} size="lg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Business name *">
                        <Input
                          value={form.businessName}
                          onChange={(e) => update('businessName', e.target.value)}
                          placeholder="Sparkle Clean Co."
                          required
                        />
                      </Field>
                      <Field label="Your name *">
                        <Input
                          value={form.contactName}
                          onChange={(e) => update('contactName', e.target.value)}
                          placeholder="Jane Smith"
                          required
                        />
                      </Field>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Email *">
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          placeholder="jane@sparkleclean.co"
                          required
                        />
                      </Field>
                      <Field label="Phone">
                        <Input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </Field>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Website">
                        <Input
                          type="url"
                          value={form.website}
                          onChange={(e) => update('website', e.target.value)}
                          placeholder="https://sparkleclean.co"
                        />
                      </Field>
                      <Field label="Service area">
                        <Input
                          value={form.serviceArea}
                          onChange={(e) => update('serviceArea', e.target.value)}
                          placeholder="Dallas, TX metro"
                        />
                      </Field>
                    </div>
                    <Field label="Services and add-ons offered">
                      <textarea
                        value={form.servicesOffered}
                        onChange={(e) => update('servicesOffered', e.target.value)}
                        placeholder="Standard, Deep Clean, Move-Out. Add-ons: oven, fridge, windows."
                        rows={3}
                        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </Field>
                    <div className="grid items-end gap-3 sm:grid-cols-[auto_1fr]">
                      <Field label="Brand color">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={form.brandColor}
                            onChange={(e) => update('brandColor', e.target.value)}
                            className="h-10 w-12 cursor-pointer rounded-md border border-zinc-200 bg-white"
                          />
                          <Input
                            value={form.brandColor}
                            onChange={(e) => update('brandColor', e.target.value)}
                            className="w-28"
                          />
                        </div>
                      </Field>
                      <Field label="Anything else we should know?">
                        <Input
                          value={form.notes}
                          onChange={(e) => update('notes', e.target.value)}
                          placeholder="Existing CRM, peak season, etc."
                        />
                      </Field>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? 'Sending request…' : 'Request my branded booking page'}
                      {!submitting && <ArrowRight className="h-4 w-4" />}
                    </button>
                    <p className="text-center text-xs text-zinc-500">
                      We&apos;ll reply within 1 business day with a setup link and a 48-hour
                      go-live timeline.
                    </p>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center"
                  >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-7 w-7 text-emerald-600" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-zinc-900">
                      Request received.
                    </h3>
                    <p className="mx-auto max-w-sm text-zinc-500">
                      We&apos;ll email you within 1 business day with a setup link and a
                      48-hour go-live timeline.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-700">{label}</label>
      {children}
    </div>
  );
}

// ============================================================================
// BOOK A CALL — inline GHL embed (uses exact id from snippet)
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

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <SelestialBookingCalendar minHeight={840} maxHeight={1500} />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA
// ============================================================================
function FinalCta() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
        <Sparkles className="mx-auto mb-4 h-5 w-5 text-primary" />
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          Stop losing cleaning bookings you never knew you had.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-600">
          Your website is generating traffic right now. Most of it is leaving because of a
          form your customers don&apos;t want to fill out. Selestial fixes it in 48 hours.
        </p>
        <PrimaryCTA size="lg" className="mt-7">
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
        <div className="flex items-center gap-2.5 text-zinc-500">
          <Image
            src="/logo-icon-new.png"
            alt="Selestial"
            width={24}
            height={24}
            className="rounded"
          />
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
      <LiveDashboard />
      <Pain />
      <Product />
      <Sequences />
      <Proof />
      <Pricing />
      <FAQ />
      <CustomBookingPageSection />
      <BookACall />
      <FinalCta />
      <Footer />
    </main>
  );
}
