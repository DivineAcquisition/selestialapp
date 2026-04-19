'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Clock,
  CreditCard,
  RefreshCw,
  Sparkles,
  Star,
  Tag,
  Zap,
} from 'lucide-react';

import { BookingPagePreview } from '@/components/marketing/BookingPagePreview';
import { SelestialBookingCalendar } from '@/components/marketing/GhlCalendarEmbed';
import { cn } from '@/lib/utils';

const GET_STARTED = '/offer/get-started';
const CALENDAR_ANCHOR = '#book-a-call';

// ============================================================================
// CTAs
// ============================================================================
function PrimaryCTA({
  children,
  href = GET_STARTED,
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
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <button className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50">
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
// TOP BANNER
// ============================================================================
function TopBanner() {
  return (
    <div className="bg-primary px-4 py-3 text-center">
      <p className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white sm:text-xs">
        <Tag className="h-3.5 w-3.5" />
        Limited offer · 50% off your first 3 months · Use code{' '}
        <span className="rounded bg-white/15 px-1.5 py-0.5 font-mono">OFFER50</span>
      </p>
    </div>
  );
}

// ============================================================================
// NAV
// ============================================================================
function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/offer" className="flex items-center gap-2.5">
          <Image
            src="/logo-icon-new.png"
            alt="Selestial"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-base font-semibold text-zinc-900">Selestial</span>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-zinc-600 md:flex">
          <a href="#whats-included" className="transition-colors hover:text-zinc-900">
            What&apos;s included
          </a>
          <a href="#preview" className="transition-colors hover:text-zinc-900">
            Preview
          </a>
          <a href="#pricing" className="transition-colors hover:text-zinc-900">
            Pricing
          </a>
        </div>
        <PrimaryCTA size="sm">
          Claim 50% off
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
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-14">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary"
            >
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              Limited 50% offer
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-zinc-900 md:text-5xl lg:text-6xl"
            >
              Get the booking page that pays for itself in week one{' '}
              <span className="text-primary">— 50% off for the next 14 days.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 max-w-lg text-balance text-base leading-relaxed text-zinc-600 md:text-lg"
            >
              Done-for-you setup, branded booking page, AI follow-up, recurring upsell. Live in
              48 hours. Apply <span className="font-mono text-zinc-900">OFFER50</span> at signup
              and your first 3 months are 50% off.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-7 flex flex-col items-start gap-3 sm:flex-row"
            >
              <PrimaryCTA size="lg">
                Get started — claim 50% off
                <ArrowRight className="ml-2 h-4 w-4" />
              </PrimaryCTA>
              <SecondaryCTA href={CALENDAR_ANCHOR}>Talk to us first</SecondaryCTA>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-6 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-zinc-500"
            >
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                No credit card required at signup
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
            <BookingPagePreview
              businessName="Sparkle Clean Co."
              brandColor="#7c3aed"
              tagline="Powered by Selestial"
              services={[
                { id: 'standard', name: 'Standard Clean', price: 175 },
                { id: 'recurring', name: 'Recurring Maintenance', price: 220 },
                { id: 'movein', name: 'Move-In / Move-Out', price: 350 },
              ]}
              recurringDiscountPct={10}
              depositPercent={25}
            />
            <p className="mt-3 text-center text-xs text-zinc-500">
              Live preview — what your branded page looks like out of the box.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// WHAT'S INCLUDED
// ============================================================================
const INCLUDED = [
  {
    icon: Zap,
    title: 'Branded booking page',
    body: 'Your logo, brand color, tagline, and services. Live on a Selestial subdomain or your own domain.',
  },
  {
    icon: CreditCard,
    title: 'Stripe deposit at booking',
    body: 'Customers pay 25% to reserve their slot. Balance collected after service. No-shows drop to near zero.',
  },
  {
    icon: RefreshCw,
    title: 'Recurring upsell at checkout',
    body: 'Built-in upgrade prompt converts one-time bookings into biweekly subscribers automatically.',
  },
  {
    icon: Clock,
    title: 'AI follow-up sequences',
    body: 'SMS + email confirmations, day-before reminders, post-service review requests. All automated.',
  },
];

function WhatsIncluded() {
  return (
    <section id="whats-included" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <div className="mb-12 max-w-2xl">
          <SectionLabel>What you get</SectionLabel>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-4xl">
            Everything you need to turn your website into a booking machine.
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 md:grid-cols-2">
          {INCLUDED.map((f, i) => (
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
// PREVIEW SECTION (variant of the preview with a different brand color)
// ============================================================================
function Preview() {
  return (
    <section id="preview" className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <div className="mb-12 text-center">
          <SectionLabel>Visual reference</SectionLabel>
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-4xl">
            Here&apos;s how your booking page would look.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-zinc-600">
            Same flow, your brand. Customize colors, logo, services, and pricing during signup
            and watch it update live.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
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
        <div className="mt-10 flex justify-center">
          <PrimaryCTA size="lg">
            Customize mine — claim 50% off
            <ArrowRight className="ml-2 h-4 w-4" />
          </PrimaryCTA>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING — three plans, all with OFFER50 applied
// ============================================================================
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 297,
    discounted: 148.5,
    blurb: 'For solo operators or new cleaning businesses getting their first booking page live.',
    features: [
      'Branded booking page on a Selestial subdomain',
      'Up to 5 services + add-ons',
      'Stripe deposit collection',
      'SMS + email confirmations',
      'Recurring upsell at checkout',
    ],
    cta: 'Start with 50% off',
    accent: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 497,
    discounted: 248.5,
    blurb: 'For 15K+ MRR cleaning companies that want full automation and a custom domain.',
    features: [
      'Everything in Starter, plus:',
      'Custom domain (book.yourcompany.com)',
      'Unlimited services + add-ons',
      'AI follow-up sequences (34+ templates)',
      'Recurring conversion analytics',
      'Monthly optimization call',
    ],
    cta: 'Most popular — 50% off',
    accent: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 997,
    discounted: 498.5,
    blurb: 'Multi-location operators or franchises with custom workflows.',
    features: [
      'Everything in Growth, plus:',
      'Multi-location support',
      'Dedicated GHL sub-account + agency setup',
      'Custom workflow buildouts',
      'Priority migration from your existing tools',
      'Quarterly strategy review',
    ],
    cta: 'Get scale — 50% off',
    accent: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <div className="mb-12 text-center">
          <SectionLabel>50% off · OFFER50</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Pick a plan. Lock in 50% off your first 3 months.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-zinc-600">
            Cancel anytime. 30-day money-back guarantee. Done-for-you setup included on all
            plans.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={cn(
                'relative flex flex-col rounded-xl border bg-white p-7 md:p-8',
                p.accent ? 'border-primary shadow-md' : 'border-zinc-200 shadow-sm'
              )}
            >
              {p.accent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md">
                  Most popular
                </span>
              )}
              <p className="text-sm font-semibold text-zinc-900">{p.name}</p>
              <p className="mt-1 text-xs text-zinc-500">{p.blurb}</p>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-zinc-900">
                  ${p.discounted}
                </span>
                <span className="text-sm text-zinc-500">/mo</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                <span className="text-zinc-400 line-through">${p.price}/mo</span> for first 3
                months with <span className="font-mono">OFFER50</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-zinc-700">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <PrimaryCTA
                  href={`${GET_STARTED}?plan=${p.id}`}
                  size="lg"
                  className={cn('w-full', !p.accent && 'bg-zinc-900 hover:bg-zinc-800')}
                >
                  {p.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </PrimaryCTA>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// BOOK A CALL (talk to a human option)
// ============================================================================
function BookACall() {
  return (
    <section id="book-a-call" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-4xl px-5 py-20 md:py-24">
        <div className="mb-10 text-center">
          <SectionLabel>Want to talk first?</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Pick a 15-minute slot.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 md:text-base">
            We&apos;ll show you Selestial running on a real cleaning company&apos;s pricing,
            schedule, and recurring flow.
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <SelestialBookingCalendar fallbackHeight={900} />
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
      <div className="mx-auto max-w-3xl px-5 py-20 text-center md:py-24">
        <Sparkles className="mx-auto mb-4 h-5 w-5 text-primary" />
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          Apply OFFER50 at signup. Lock the discount for life.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-600">
          Once the offer window closes, prices return to standard. Customers who claim it now
          keep the discount as long as they stay.
        </p>
        <PrimaryCTA size="lg" className="mt-7">
          Get started — claim 50% off
          <ArrowRight className="ml-2 h-4 w-4" />
        </PrimaryCTA>
        <p className="mt-4 text-xs text-zinc-500">
          14-day claim window · 30-day money-back · Cancel anytime
        </p>
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
    <footer className="bg-white px-4 py-10">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 flex items-center justify-center gap-2.5">
          <Image
            src="/logo-icon-new.png"
            alt="Selestial"
            width={28}
            height={28}
            className="rounded"
          />
          <span className="text-sm font-semibold text-zinc-900">Selestial</span>
        </div>
        <p className="mb-4 text-sm text-zinc-500">
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
      <WhatsIncluded />
      <Preview />
      <Pricing />
      <BookACall />
      <FinalCta />
      <Footer />
    </main>
  );
}
