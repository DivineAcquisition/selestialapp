'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, Video } from 'lucide-react';

import { WistiaPlayer } from '@/components/marketing/WistiaPlayer';
import { BrandButton } from '@/components/marketing/BrandButton';
import {
  MarketingFooter,
  MarketingNav,
  MarketingTopBanner,
} from '@/components/marketing/MarketingChrome';
import { cn } from '@/lib/utils';

// Hero / mid-page CTAs deep-link to the dedicated /book-demo page so users
// hit the calendar in one click. The on-page #book-a-call section anchor
// stays for users who scrolled past and want a second nudge.
const CALENDAR_ANCHOR = '/book-demo';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </p>
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
        <div className="mt-6 flex flex-col items-center justify-center gap-2">
          <BrandButton href={CALENDAR_ANCHOR} variant="primary" size="xl">
            Book my strategy session
            <ArrowRight className="h-4 w-4" />
          </BrandButton>
          <p className="text-xs text-zinc-500">15 minutes · Real strategy · No sales pitch</p>
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
      <div className="mx-auto max-w-3xl px-5 py-16 text-center md:py-20">
        <SectionLabel>Book a demo</SectionLabel>
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          Pick a 15-minute slot.
        </h2>
        <div className="mt-7 flex justify-center">
          <BrandButton href="/book-demo" variant="primary" size="xl">
            Open the calendar
            <ArrowRight className="ml-1 h-4 w-4" />
          </BrandButton>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function RetargetPage() {
  return (
    <main className="bg-white text-zinc-900 antialiased">
      <MarketingTopBanner>
        For Remote-Operated Cleaning Companies Doing 15K+ in Revenue
      </MarketingTopBanner>
      <MarketingNav
        homeHref="/retarget"
        cta={{ href: CALENDAR_ANCHOR, label: 'Book demo' }}
      />
      <Headline />
      <VSL />
      <Testimonials />
      <BookACall />
      <MarketingFooter />
    </main>
  );
}
