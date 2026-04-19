'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { BookDemoDialog } from '@/components/marketing/BookDemoDialog';
import { WistiaPlayer } from '@/components/marketing/WistiaPlayer';
import { cn } from '@/lib/utils';

const TRUST_LINE = 'Built on the engine that powered $510K in tracked cleaning revenue.';

const SECTION_PADDING = 'py-16 md:py-24';

function PrimaryCta({ children, size = 'xl' }: { children: React.ReactNode; size?: 'lg' | 'xl' }) {
  return (
    <BookDemoDialog>
      <Button variant="lovable" size={size} className="w-full sm:w-auto">
        {children}
        <Icon name="arrowRight" size="sm" className="ml-2" />
      </Button>
    </BookDemoDialog>
  );
}

function StickyMobileCta() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-gray-200 bg-white/95 backdrop-blur p-3">
      <BookDemoDialog>
        <Button variant="lovable" size="lg" className="w-full">
          Book Your 15-Min Demo
          <Icon name="arrowRight" size="sm" className="ml-2" />
        </Button>
      </BookDemoDialog>
    </div>
  );
}

// ============================================================================
// HERO
// ============================================================================
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -right-32 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 pt-12 pb-16 md:pt-20 md:pb-24 text-center">
        {/* Pre-headline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold uppercase tracking-wide mb-5"
        >
          For Residential Cleaning Companies Doing 20+ Jobs/Month
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-5"
        >
          Your Website Is Losing Cleaning Bookings Every Day.{' '}
          <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
            Here&apos;s How To Fix It In 48 Hours.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-7 leading-relaxed"
        >
          See your pricing upfront. Collect deposits instantly. Book jobs in 60 seconds —
          no quote forms, no callbacks, no lost customers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center gap-3"
        >
          <PrimaryCta>See How It Works — Book 15-Min Demo</PrimaryCta>
          <p className="text-xs sm:text-sm text-gray-500">
            No credit card required. Built specifically for residential cleaning. Live in 48 hours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200"
        >
          <Icon name="sparkles" size="sm" className="text-primary" />
          <span className="text-xs sm:text-sm text-gray-700 font-medium">{TRUST_LINE}</span>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// PAIN — pattern interrupt
// ============================================================================
function Pain() {
  return (
    <section className={cn(SECTION_PADDING, 'bg-gray-50 border-y border-gray-100')}>
      <div className="max-w-3xl mx-auto px-5">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-8">
          Every &ldquo;Request A Quote&rdquo; form is a customer your competitor just booked.
        </h2>

        <div className="space-y-5 text-base sm:text-lg text-gray-700 leading-relaxed">
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
// SOLUTION — product demo + VSL
// ============================================================================
const SOLUTION_BENEFITS: { icon: 'dollar' | 'lock' | 'sparkles' | 'bolt'; title: string; body: string }[] = [
  {
    icon: 'dollar',
    title: 'Shows Your Exact Price — Instantly',
    body:
      'Customer picks home size, bedrooms, bathrooms, and cleaning type. She sees your price in 3 seconds. No forms. No waiting. No quote calls.',
  },
  {
    icon: 'lock',
    title: 'Collects The Deposit Before She Leaves Your Site',
    body:
      'Stripe-powered deposit at booking. Your calendar gets the job and your bank gets the payment — in the same flow. No-shows drop to near zero.',
  },
  {
    icon: 'sparkles',
    title: 'Upsells Recurring Service At The Booking Moment',
    body:
      'Built-in recurring upgrade prompt turns one-time customers into biweekly or monthly subscribers during checkout. BadgerLuxClean converts 32% of one-time bookings to recurring using this.',
  },
  {
    icon: 'bolt',
    title: 'Handles Every Confirmation Automatically',
    body:
      'SMS and email confirmations, day-before reminders, and post-service follow-ups fire automatically. You stop managing the admin of every booking.',
  },
];

function Solution() {
  return (
    <section className={SECTION_PADDING}>
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Selestial Is The Booking Page Built Specifically For Residential Cleaning Companies.
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            It does four things that no generic booking tool does.
          </p>
        </div>

        {/* VSL */}
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200/50 bg-gray-100">
            <WistiaPlayer mediaId="7zigms7aiy" aspect={16 / 9} />
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            45-second walkthrough — see the actual flow your customers will see.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {SOLUTION_BENEFITS.map((b, i) => (
            <div
              key={b.title}
              className="p-6 rounded-xl border border-gray-200 bg-white hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 p-3 rounded-xl bg-primary/10 text-primary">
                  <Icon name={b.icon} size="lg" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{b.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <PrimaryCta>Book Your 15-Min Demo</PrimaryCta>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PROOF — social proof block
// ============================================================================
function Proof() {
  return (
    <section className={cn(SECTION_PADDING, 'bg-gray-50 border-y border-gray-100')}>
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Real cleaning companies. Real numbers. Live right now.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* BadgerLuxClean */}
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" size="sm" className="text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              &ldquo;We processed 1,740 bookings and tracked $510K in revenue through Selestial.
              32% of our one-time customers converted to recurring service at the booking page —
              not after weeks of follow-up. That&apos;s the number that matters.&rdquo;
            </p>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
                BL
              </div>
              <div>
                <p className="text-gray-900 font-semibold">BadgerLuxClean</p>
                <p className="text-gray-500 text-sm">Premium Residential Cleaning</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              {[
                { value: '1,740', label: 'Bookings processed' },
                { value: '$510K', label: 'Tracked revenue' },
                { value: '32.3%', label: 'Recurring conversion' },
                { value: '775', label: 'Customers captured' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bay Area Cleaning Pros */}
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" size="sm" className="text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              &ldquo;We added $50K in new annual revenue from bookings that would&apos;ve been
              phone tag before Selestial. Customers see the price, pick their time, and the
              job&apos;s on the calendar before I&apos;d even have called them back.&rdquo;
            </p>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
                BA
              </div>
              <div>
                <p className="text-gray-900 font-semibold">Bay Area Cleaning Pros</p>
                <p className="text-gray-500 text-sm">Residential Cleaning, Bay Area CA</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              {[
                { value: '$50K', label: 'New annual revenue' },
                { value: 'Q2 2025', label: 'Live since' },
                { value: '24/7', label: 'Bookings, no admin' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-base font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <PrimaryCta>See How Selestial Works — Book a Demo</PrimaryCta>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING / OFFER
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
    <section className={SECTION_PADDING}>
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Everything you need. Nothing you don&apos;t. $297/month.
          </h2>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 rounded-3xl blur-2xl" />
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 md:p-10 shadow-2xl shadow-gray-200/50">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl md:text-6xl font-bold text-gray-900">$297</span>
              <span className="text-lg text-gray-500">/month</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Done-for-you setup included. No setup fee. Cancel anytime.
            </p>

            <ul className="space-y-3 mb-8">
              {INCLUDES.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm md:text-base text-gray-700">
                  <Icon name="check" size="sm" className="text-emerald-600 mt-1 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3">
              <PrimaryCta>Book Your 15-Min Demo</PrimaryCta>
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
        forced into a phone call for basic pricing. For the jobs that genuinely need custom quotes
        — deep cleans, post-construction, hoarder scenarios — they can still call you. Selestial
        is for your standard 70% of bookings, the money you&apos;re leaving on the table right now.
      </>
    ),
  },
  {
    q: 'How fast can I actually be live?',
    a: (
      <>
        48 hours from the moment you share your pricing and brand assets. Most cleaning companies
        are booking jobs through Selestial by the end of day 2. We handle the setup — you
        don&apos;t need to touch code.
      </>
    ),
  },
  {
    q: "What if it doesn't work?",
    a: (
      <>
        Your first 30 days are money-back guaranteed. If you don&apos;t capture a single booking
        you can attribute to Selestial in that window, we refund the month. No questions, no
        hassle.
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
    <section className={cn(SECTION_PADDING, 'bg-gray-50 border-y border-gray-100')}>
      <div className="max-w-3xl mx-auto px-5">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">
          Questions you&apos;re probably asking right now
        </h2>
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-gray-200 bg-white p-5 open:shadow-md transition-shadow"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 pr-6">{item.q}</h3>
                <Icon
                  name="chevronDown"
                  size="sm"
                  className="text-gray-400 transition-transform group-open:rotate-180 shrink-0"
                />
              </summary>
              <div className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
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
// FINAL CTA
// ============================================================================
function FinalCta() {
  return (
    <section className={SECTION_PADDING}>
      <div className="max-w-3xl mx-auto px-5">
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 rounded-3xl blur-2xl" />
          <div className="relative bg-gradient-to-br from-primary to-violet-600 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Stop losing cleaning bookings you never knew you had.
              </h2>
              <p className="text-white/85 max-w-xl mx-auto mb-7 text-base md:text-lg">
                Your website is generating traffic right now. Most of it is leaving because of a
                form your customers don&apos;t want to fill out. Selestial fixes it in 48 hours —
                and the 15-minute demo will show you exactly how.
              </p>

              <div className="flex justify-center mb-5">
                <BookDemoDialog>
                  <Button variant="lovable-light" size="xl" className="w-full sm:w-auto">
                    Book Your 15-Min Demo
                    <Icon name="arrowRight" size="sm" className="ml-2" />
                  </Button>
                </BookDemoDialog>
              </div>

              <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-white/80 text-xs sm:text-sm">
                <li className="flex items-center gap-1.5">
                  <Icon name="check" size="xs" /> No credit card required
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon name="check" size="xs" /> 30-day money-back guarantee
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon name="check" size="xs" /> Cancel anytime
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon name="check" size="xs" /> $297/month, all features included
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
// FOOTER (minimal — no main-site nav)
// ============================================================================
function MinimalFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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
      {/* Spacer for sticky mobile CTA so the footer isn't hidden behind it */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </footer>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function DemoLandingPage() {
  return (
    <main>
      {/* Lightweight nav — logo only, no links anywhere else */}
      <nav className="px-5 py-4 border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/demo" className="text-lg font-semibold text-gray-900">
            Selestial
          </Link>
          <div className="hidden sm:block">
            <BookDemoDialog>
              <Button variant="lovable" size="sm">
                Book Demo
                <Icon name="arrowRight" size="xs" className="ml-1.5" />
              </Button>
            </BookDemoDialog>
          </div>
        </div>
      </nav>

      <Hero />
      <Pain />
      <Solution />
      <Proof />
      <Pricing />
      <FAQ />
      <FinalCta />
      <MinimalFooter />
      <StickyMobileCta />
    </main>
  );
}
