'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Check,
  Clock,
  CreditCard,
  Handshake,
  LineChart,
  MousePointerClick,
  Palette,
  RefreshCw,
  Rocket,
  Search,
  Settings2,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

import { BookingPagePreview } from '@/components/marketing/BookingPagePreview';
import { BrandButton } from '@/components/marketing/BrandButton';
import { WistiaPlayer } from '@/components/marketing/WistiaPlayer';
import { SelestialRetentionAuditCalendar } from '@/components/marketing/IClosedCalendar';

const CALENDAR_ANCHOR = '#calendar';

// ============================================================================
// Section primitives — kept tight so every section composes the same way.
// ============================================================================
function SectionLabel({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <div className={align === 'center' ? 'flex justify-center' : ''}>
      <span className="inline-flex items-center gap-2 rounded-full border border-[#6428F9]/15 bg-[#F2EFFF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6428F9]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#6428F9]" />
        {children}
      </span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <div
      className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}
    >
      <SectionLabel align={align}>{eyebrow}</SectionLabel>
      <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-zinc-900 md:text-[40px]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-balance text-base leading-relaxed text-zinc-600 md:text-[17px]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// TOP BANNER
// ============================================================================
function TopBanner() {
  return (
    <div className="bg-[linear-gradient(90deg,#4F1FD0_0%,#6428F9_50%,#9294FF_100%)] px-4 py-2.5 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white sm:text-[12px]">
        Done-for-you retention system · Live in 2 weeks · For cleaning companies
      </p>
    </div>
  );
}

// ============================================================================
// NAV — Linear-style minimal top bar
// ============================================================================
function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/offer" className="flex items-center gap-2.5">
          <Image
            src="/logo-full.png"
            alt="Selestial"
            width={300}
            height={80}
            className="h-12 w-auto md:h-14"
            priority
          />
        </Link>
        <div className="hidden items-center gap-7 text-[13px] font-medium text-zinc-600 md:flex">
          <a href="#benefits" className="transition-colors hover:text-zinc-900">
            Benefits
          </a>
          <a href="#how" className="transition-colors hover:text-zinc-900">
            How it works
          </a>
          <a href="#preview" className="transition-colors hover:text-zinc-900">
            Preview
          </a>
          <a href="#calendar" className="transition-colors hover:text-zinc-900">
            Book a call
          </a>
        </div>
        <BrandButton href={CALENDAR_ANCHOR} variant="primary" size="sm">
          Book a call
          <ArrowRight className="h-3.5 w-3.5" />
        </BrandButton>
      </div>
    </nav>
  );
}

// ============================================================================
// HERO — Stripe/Linear inspired headline + VSL
// ============================================================================
function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-white">
      {/* Subtle backdrop wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(100,40,249,0.12),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-px bg-[linear-gradient(90deg,transparent,rgba(100,40,249,0.4),transparent)]"
      />

      <div className="relative mx-auto max-w-4xl px-5 py-16 md:py-24">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#6428F9]/20 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6428F9] shadow-[0_1px_3px_rgba(100,40,249,0.08)]"
          >
            <Star className="h-3.5 w-3.5 fill-[#6428F9] text-[#6428F9]" />
            For remote cleaning companies
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-zinc-900 md:text-[56px] lg:text-[64px]"
          >
            More rebookings.{' '}
            <span className="bg-[linear-gradient(135deg,#6428F9_0%,#9294FF_100%)] bg-clip-text text-transparent">
              More referrals. More recurring revenue.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-balance text-[17px] leading-relaxed text-zinc-600 md:text-[18px]"
          >
            We install a done-for-you retention system on top of your existing CRM —
            branded booking, automated follow-up, and referral capture — so you stop
            leaking revenue and start compounding the customers you already paid to acquire.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <BrandButton href={CALENDAR_ANCHOR} variant="primary" size="xl">
              Book your retention audit
              <ArrowRight className="h-4 w-4" />
            </BrandButton>
            <BrandButton href="#how" variant="outline" size="xl">
              See how it works
            </BrandButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12px] text-zinc-500"
          >
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              30-minute call
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Real strategy, no pitch
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Works with your existing CRM
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-12"
        >
          <div className="relative">
            {/* Soft glow under the player */}
            <div
              aria-hidden
              className="absolute -inset-x-4 -bottom-6 top-6 -z-10 rounded-3xl bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(100,40,249,0.18),transparent_70%)] blur-xl"
            />
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 shadow-[0_20px_60px_-20px_rgba(100,40,249,0.35)]">
              <WistiaPlayer mediaId="7zigms7aiy" aspect={16 / 9} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// LOGO STRIP / TRUST LINE
// ============================================================================
function TrustStrip() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Plugs into the tools you already run on
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[13px] font-semibold text-zinc-500">
          <span>Jobber</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span>GoHighLevel</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span>ServiceTitan</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span>HouseCall Pro</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span>Stripe</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span>Square</span>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// BENEFITS — six cards. Stripe-grid layout, content-first.
// ============================================================================
const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'More recurring revenue, no extra ad spend',
    body:
      "Every customer you've already paid to acquire is a rebook waiting to happen. Most cleaning companies leave 60–80% of that revenue on the table. The retention system captures it — automatically — so your MRR grows without spending another dollar on ads.",
  },
  {
    icon: MousePointerClick,
    title: 'A booking experience your customers actually finish',
    body:
      "Your follow-up messages aren't the problem. The clunky booking form they hit after tapping the link is. Our branded booking layer is one-tap, pre-filled with everything you already know about them, and confirms in seconds. Rebook completion goes from 12% to 25%+ on average.",
  },
  {
    icon: Users,
    title: 'Referrals that happen on autopilot',
    body:
      "Happy customers refer when you ask at the right moment. The system triggers referral requests post-clean, when satisfaction is highest — not weeks later when they've forgotten. Built-in incentive tracking so you know which customers are sending you business.",
  },
  {
    icon: Clock,
    title: 'Less time chasing, more time running the business',
    body:
      "No more \u201Cdid we follow up with the Smiths?\u201D SMS to your team. No more spreadsheets tracking who's due for a rebook. The system runs in the background, every day, on every customer — even when you're not thinking about it.",
  },
  {
    icon: BarChart3,
    title: 'A retention system that scales with you',
    body:
      "Whether you've got 50 customers or 500, the system works the same. As you grow, you're not adding manual work — you're adding revenue on top of the same infrastructure.",
  },
  {
    icon: Handshake,
    title: 'Done-for-you, not done-by-you',
    body:
      "You don't build it. You don't configure it. You don't maintain it. We set it up, brand it to your company, integrate your payment processor, and turn it on. Your only job is to keep cleaning houses.",
  },
];

function Benefits() {
  return (
    <section id="benefits" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <SectionHeading
          eyebrow="Benefits"
          title={
            <>
              What you actually get when{' '}
              <span className="bg-[linear-gradient(135deg,#6428F9_0%,#9294FF_100%)] bg-clip-text text-transparent">
                retention runs on a system.
              </span>
            </>
          }
          subtitle="Six things change the day the system goes live. Here's what they look like in practice."
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <article
              key={b.title}
              className="group relative bg-white p-7 transition-colors hover:bg-[#FAFAFE] md:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#6428F9]/15 bg-[#F2EFFF] text-[#6428F9] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <b.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
                <span className="font-mono text-[11px] font-medium text-zinc-400">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-[17px] font-semibold leading-tight tracking-tight text-zinc-900">
                {b.title}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-zinc-600">
                {b.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS — 4 numbered steps, vertical timeline on mobile, grid on desktop
// ============================================================================
const STEPS = [
  {
    icon: Search,
    week: 'Week 1',
    title: 'Audit & integrate',
    body:
      'We pull your customer database, audit your current rebook rate, and integrate with your existing CRM (Jobber, GHL, ServiceTitan, whatever you use). No data migration, no platform switch — we work with what you already have. You don\u2019t change anything about how you operate.',
  },
  {
    icon: Palette,
    week: 'Week 1–2',
    title: 'Build & brand',
    body:
      'We deploy your retention sequences (SMS + email), set up the branded booking layer with your colors and logo, and integrate your payment processor (Stripe or Square). Everything looks like it was built by your team.',
  },
  {
    icon: Rocket,
    week: 'Week 2–4',
    title: 'Launch & optimize',
    body:
      'The system goes live across your existing customer base. We monitor performance daily for the first 30 days — rebook rates, message engagement, booking completions — and tune the sequences based on what\u2019s converting. You start seeing rebookings within the first 2 weeks.',
  },
  {
    icon: RefreshCw,
    week: 'Month 2+',
    title: 'Run & scale',
    body:
      'The system runs in the background, every day, on every customer. New customers automatically enter the sequences. As your customer base grows, the system grows with it. We handle ongoing optimization and any tech changes.',
  },
];

function HowItWorks() {
  return (
    <section id="how" className="border-b border-zinc-200 bg-zinc-50/60">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <SectionHeading
          eyebrow="How it works"
          align="center"
          title={
            <>
              How the system runs in{' '}
              <span className="bg-[linear-gradient(135deg,#6428F9_0%,#9294FF_100%)] bg-clip-text text-transparent">
                4 steps.
              </span>
            </>
          }
          subtitle="From kickoff to live in under a month. We do the build — you keep cleaning houses."
        />

        <div className="relative mt-14">
          {/* Subtle connector line behind the cards on desktop */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-[44px] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(100,40,249,0.25),rgba(100,40,249,0.25),transparent)] lg:block"
          />

          <div className="grid gap-6 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="relative flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(100,40,249,0.25)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6428F9_0%,#9294FF_100%)] text-white shadow-[0_4px_12px_-4px_rgba(100,40,249,0.45)]">
                    <s.icon className="h-[18px] w-[18px]" />
                  </div>
                  <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    {s.week}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="font-mono text-[11px] font-medium text-zinc-400">
                    Step 0{i + 1}
                  </p>
                  <h3 className="mt-1.5 text-[17px] font-semibold tracking-tight text-zinc-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-zinc-600">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <BrandButton href={CALENDAR_ANCHOR} variant="primary" size="lg">
            Book your retention audit
            <ArrowRight className="h-4 w-4" />
          </BrandButton>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// WHAT'S INCLUDED — distilled feature grid
// ============================================================================
const INCLUDED = [
  {
    icon: Zap,
    title: 'Branded booking layer',
    body:
      'Your logo, colors, and tone — pre-filled with the customer info you already have. One-tap rebookings.',
  },
  {
    icon: CreditCard,
    title: 'Stripe / Square deposits',
    body:
      'Capture deposits at the moment of rebook. Slash no-shows. Settle the balance after service.',
  },
  {
    icon: RefreshCw,
    title: 'Retention sequences',
    body:
      'SMS + email flows that trigger at the right moment — confirmations, post-clean reviews, recurring upsells, win-backs.',
  },
  {
    icon: LineChart,
    title: 'Referral capture',
    body:
      'Asks for the referral when satisfaction is highest. Tracks which customers send you business and rewards them automatically.',
  },
  {
    icon: Settings2,
    title: 'CRM integration',
    body:
      'Jobber, GHL, ServiceTitan, HouseCall Pro — we plug in. No platform switch, no data migration.',
  },
  {
    icon: Sparkles,
    title: 'Ongoing optimization',
    body:
      'We monitor rebook rates, engagement, and completions — then tune the sequences as your business grows.',
  },
];

function WhatsIncluded() {
  return (
    <section id="whats-included" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <SectionHeading
          eyebrow="What's in the system"
          title={
            <>
              Every piece you need —{' '}
              <span className="bg-[linear-gradient(135deg,#6428F9_0%,#9294FF_100%)] bg-clip-text text-transparent">
                installed, branded, and running.
              </span>
            </>
          }
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {INCLUDED.map((f) => (
            <div key={f.title} className="bg-white p-6 md:p-7">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#6428F9]/15 bg-[#F2EFFF] text-[#6428F9]">
                <f.icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-zinc-900">{f.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-zinc-600">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PREVIEW
// ============================================================================
function Preview() {
  return (
    <section id="preview" className="border-b border-zinc-200 bg-zinc-50/60">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <SectionHeading
          eyebrow="Visual reference"
          align="center"
          title={
            <>
              Branded the same way{' '}
              <span className="bg-[linear-gradient(135deg,#6428F9_0%,#9294FF_100%)] bg-clip-text text-transparent">
                your customers expect.
              </span>
            </>
          }
          subtitle="Same flow, your brand. Colors, logo, services, and pricing — pulled in during onboarding."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <BookingPagePreview
            businessName="BadgerLuxClean"
            brandColor="#0f766e"
            tagline="Madison, WI · Premium Residential"
            services={[
              { id: 'standard', name: 'Standard Clean', price: 195 },
              { id: 'recurring', name: 'Recurring Maintenance', price: 240 },
            ]}
            recurringDiscountPct={10}
            depositPercent={25}
          />
          <BookingPagePreview
            businessName="Bay Area Cleaning Pros"
            brandColor="#1d4ed8"
            tagline="San Francisco · Move-Outs & Deep Cleans"
            services={[
              { id: 'deep', name: 'Deep Clean', price: 325 },
              { id: 'recurring', name: 'Recurring Maintenance', price: 220 },
              { id: 'move', name: 'Move-In / Move-Out', price: 455 },
            ]}
            recurringDiscountPct={15}
            depositPercent={30}
          />
          <BookingPagePreview
            businessName="Capitol Maids"
            brandColor="#dc2626"
            tagline="Austin, TX · Pet-friendly cleaning"
            services={[
              { id: 'standard', name: 'Standard Clean', price: 165 },
              { id: 'recurring', name: 'Recurring Maintenance', price: 199 },
            ]}
            recurringDiscountPct={12}
            depositPercent={20}
          />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CALENDAR — iClosed audit booking, embedded inline
// ============================================================================
function CalendarSection() {
  return (
    <section id="calendar" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-5xl px-5 py-20 md:py-24">
        <SectionHeading
          eyebrow="Book your audit"
          align="center"
          title={
            <>
              Pick a time —{' '}
              <span className="bg-[linear-gradient(135deg,#6428F9_0%,#9294FF_100%)] bg-clip-text text-transparent">
                we&apos;ll show you exactly what your retention system would look like.
              </span>
            </>
          }
          subtitle="On the call we'll review your current rebook rate, map the leaks in your follow-up flow, and walk you through the system on a real cleaning company's setup. No pitch."
        />

        <div className="mt-12 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_30px_-12px_rgba(100,40,249,0.18)]">
          <SelestialRetentionAuditCalendar height={760} />
        </div>

        <p className="mt-5 text-center text-[12px] text-zinc-500">
          30 minutes · Real strategy · Confirmation + Zoom link sent to your inbox.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA — clean, no price, single decision
// ============================================================================
function FinalCta() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(100,40,249,0.10),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-3xl px-5 py-20 text-center md:py-24">
        <Sparkles className="mx-auto mb-4 h-5 w-5 text-[#6428F9]" />
        <h2 className="text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-zinc-900 md:text-[42px]">
          Stop leaking revenue from customers you already paid to acquire.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-zinc-600 md:text-[17px]">
          Book a retention audit. We&apos;ll show you what you&apos;re leaving on the table
          and exactly how the system would close it.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BrandButton href={CALENDAR_ANCHOR} variant="primary" size="xl">
            Book your retention audit
            <ArrowRight className="h-4 w-4" />
          </BrandButton>
          <BrandButton href="#benefits" variant="ghost" size="xl">
            Re-read the benefits
          </BrandButton>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-5 flex items-center justify-center">
          <Image
            src="/logo-full.png"
            alt="Selestial"
            width={300}
            height={80}
            className="h-12 w-auto md:h-14"
          />
        </div>
        <p className="mb-4 text-[13px] text-zinc-500">
          © {year} Selestial. All rights reserved.
        </p>
        <p className="mx-auto max-w-2xl text-[11px] leading-relaxed text-zinc-400">
          This site is not a part of the Facebook website or Facebook Inc. Additionally, this
          site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK,
          Inc.
        </p>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function OfferPage() {
  return (
    <main className="bg-white text-zinc-900 antialiased">
      <TopBanner />
      <Nav />
      <Hero />
      <TrustStrip />
      <Benefits />
      <HowItWorks />
      <WhatsIncluded />
      <Preview />
      <CalendarSection />
      <FinalCta />
      <Footer />
    </main>
  );
}
