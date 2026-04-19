'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Video } from 'lucide-react';

import { WistiaPlayer } from '@/components/marketing/WistiaPlayer';
import { SelestialBookingCalendar } from '@/components/marketing/GhlCalendarEmbed';
import { cn } from '@/lib/utils';

const CALENDAR_ANCHOR = '#book-a-call';

// ============================================================================
// CTAs (kept consistent with /demo)
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </p>
  );
}

// ============================================================================
// TOP BANNER (matches /demo)
// ============================================================================
function TopBanner() {
  return (
    <div className="bg-primary px-4 py-3 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white sm:text-xs">
        For Remote-Operated Cleaning Companies Doing 15K+ in Revenue
      </p>
    </div>
  );
}

// ============================================================================
// MINIMAL NAV (logo + single CTA — no other links on a retargeting page)
// ============================================================================
function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/retarget" className="flex items-center gap-2.5">
          <Image
            src="/logo-icon-new.png"
            alt="Selestial"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-base font-semibold text-zinc-900">Selestial</span>
        </Link>
        <PrimaryCTA size="sm">
          Book Demo
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </PrimaryCTA>
      </div>
    </nav>
  );
}

// ============================================================================
// HEADLINE (mirrors /demo hero copy verbatim — same brand promise)
// ============================================================================
function Headline() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-3xl px-5 pb-10 pt-16 text-center md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary"
        >
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          Free Growth Blueprint
        </motion.div>

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
          Watch the 60-second walkthrough below, then pick a time to see Selestial running on
          your pricing.
        </motion.p>
      </div>
    </section>
  );
}

// ============================================================================
// VSL (the new Wistia media id from the supplied snippet)
// ============================================================================
function VSL() {
  return (
    <section id="vsl" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-4xl px-5 py-16 md:py-20">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 shadow-sm">
          <WistiaPlayer mediaId="ttvt5ujpfb" aspect={16 / 9} />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS — same two cards as /demo (BadgerLuxClean, Bay Area Cleaning Pros)
// ============================================================================
const TESTIMONIALS = [
  {
    name: 'BadgerLuxClean',
    role: 'Remote-Operated Residential Cleaning',
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
    role: 'Remote-Operated Residential Cleaning · Bay Area, CA',
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

function Testimonials() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="mb-10 text-center md:mb-12">
          <SectionLabel>Real Results</SectionLabel>
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-4xl">
            Built on <span className="text-primary">live revenue.</span> Not theory.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 md:gap-7">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name}
              className="relative flex flex-col rounded-xl border border-zinc-200 bg-white p-7 shadow-sm md:p-8"
            >
              <span className="absolute -top-3 right-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md">
                <Video className="h-3 w-3" />
                Live interview soon
              </span>

              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="flex-1 text-base leading-relaxed text-zinc-700">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// BOOK A CALL (inline GHL embed — same component / id as /demo)
// ============================================================================
function BookACall() {
  return (
    <section id="book-a-call" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-4xl px-5 py-16 md:py-20">
        <div className="mb-8 text-center">
          <SectionLabel>Book a demo</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Pick a 15-minute slot.
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <SelestialBookingCalendar fallbackHeight={900} />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER (same disclaimer as /demo)
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
          Inc. We use cookies, including third-party cookies, on this website to help operate
          our site and for analytics and advertising purposes.
        </p>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function RetargetPage() {
  return (
    <main className="bg-white text-zinc-900 antialiased">
      <TopBanner />
      <Nav />
      <Headline />
      <VSL />
      <Testimonials />
      <BookACall />
      <Footer />
    </main>
  );
}
