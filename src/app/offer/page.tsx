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
import { BrandButton } from '@/components/marketing/BrandButton';
import { WistiaPlayer } from '@/components/marketing/WistiaPlayer';
import { cn } from '@/lib/utils';

const GET_STARTED = '/offer/get-started';

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
        $297/mo · Done-for-you setup · Live in 48 hours · Cancel anytime
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
          Get started
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
      <div className="mx-auto max-w-4xl px-5 py-16 md:py-24">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary"
          >
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            Free Growth Blueprint
          </motion.div>

          {/* Two-tone headline mirroring / (i.e. /demo) */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-zinc-900 md:text-5xl lg:text-6xl"
          >
            <span className="text-primary">More jobs. More referrals. More recurring revenue.</span>{' '}
            <span className="text-zinc-900">
              Built for remote cleaning companies that run on systems, not phone calls.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-zinc-600 md:text-lg"
          >
            We&apos;ll install AI-powered booking, follow-up, and retention systems so you
            stop chasing leads and start building a business that grows on autopilot.
          </motion.p>
        </div>

        {/* VSL directly under the headline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-10"
        >
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 shadow-sm">
            <WistiaPlayer mediaId="7zigms7aiy" aspect={16 / 9} />
          </div>

          {/* Book a call CTA directly below the VSL, routes to /book-demo */}
          <div className="mt-7 flex flex-col items-center justify-center gap-3">
            <BrandButton href="/book-demo" variant="primary" size="xl">
              Book a 15-min call
              <ArrowRight className="h-4 w-4" />
            </BrandButton>
            <p className="text-xs text-zinc-500">
              15 minutes · Real strategy · No sales pitch
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-zinc-500">
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
          </div>
        </motion.div>
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
            Customize mine — $297/mo
            <ArrowRight className="ml-2 h-4 w-4" />
          </PrimaryCTA>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING — single plan, $297/month
// ============================================================================
const INCLUDES = [
  'Done-for-you setup, live in 48 hours',
  'Branded booking page on a Selestial subdomain (or your own domain)',
  'Pricing engine that adjusts by home size, service, and add-ons',
  'Stripe deposit collection at the moment of booking',
  'Recurring service upsell that converts one-time into subscriptions',
  'SMS + email confirmations sent automatically',
  'AI follow-up sequences (34+ pre-built templates)',
  'Monthly optimization call',
  'Unlimited bookings, no per-user fees, no feature gates',
];

function Pricing() {
  return (
    <section id="pricing" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-24">
        <div className="mb-10 text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            One plan. Everything included.{' '}
            <span className="text-primary">$297/month.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-zinc-600">
            Cancel anytime. 30-day money-back guarantee. Done-for-you setup included.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-7 shadow-sm md:p-10">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight text-zinc-900">$297</span>
            <span className="text-base text-zinc-500">/month</span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Billed monthly · No setup fee · Cancel anytime
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
            Get started — $297/mo
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
// BOOK A CALL (talk to a human option)
// ============================================================================
function BookACall() {
  return (
    <section id="book-a-call" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center md:py-24">
        <SectionLabel>Want to talk first?</SectionLabel>
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          Pick a 15-minute slot.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 md:text-base">
          We&apos;ll show you Selestial running on a real cleaning company&apos;s pricing,
          schedule, and recurring flow.
        </p>
        <div className="mt-7 flex justify-center">
          <BrandButton href="/book-demo" variant="primary" size="xl">
            Open the calendar
            <ArrowRight className="h-4 w-4" />
          </BrandButton>
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
          Get started — $297/month, cancel anytime.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-600">
          One plan, everything included. We&apos;ll have your branded booking page live within
          48 hours of signup.
        </p>
        <PrimaryCTA size="lg" className="mt-7">
          Get started — $297/mo
          <ArrowRight className="ml-2 h-4 w-4" />
        </PrimaryCTA>
        <p className="mt-4 text-xs text-zinc-500">
          30-day money-back · Cancel anytime
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
