'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRight, Check, Sparkles, ShieldCheck, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icon, type IconName } from '@/components/ui/icon';
import { GridPattern } from '@/components/ui/grid-pattern';
import { Spotlight } from '@/components/ui/spotlight';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { NumberTicker } from '@/components/ui/number-ticker';
import { GradientText } from '@/components/ui/text-effects';
import { cn } from '@/lib/utils';

import { HeroDashboardPreview } from '@/components/marketing/HeroDashboardPreview';
import { BookingFlowPreview } from '@/components/marketing/BookingFlowPreview';
import { CustomerMarquee } from '@/components/marketing/CustomerMarquee';
import { GhlCalendarEmbed } from '@/components/marketing/GhlCalendarEmbed';

// ============================================================================
// HERO
// ============================================================================
function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-white">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-50/40 via-white to-white" />
      <GridPattern
        width={56}
        height={56}
        className="absolute inset-0 -z-0 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)] text-violet-200/40"
      />
      <Spotlight className="-top-20 left-0 md:left-60 md:-top-20" fill="rgba(124,58,237,0.25)" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] bg-violet-500/10 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-5">
        <div className="text-center max-w-4xl mx-auto mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs sm:text-sm font-semibold text-primary">
              Online Booking for Residential Cleaning Companies
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6"
          >
            Stop losing bookings to{' '}
            <GradientText
              gradient="from-primary via-violet-500 to-fuchsia-500"
              className="font-bold"
            >
              quote forms
            </GradientText>{' '}
            no one wants to fill out.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Selestial is the online booking platform built for residential cleaning
            companies. Show your pricing upfront, collect deposits, and book jobs in 60 seconds —
            plus automated SMS that turns every quote into a booked customer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
          >
            <Link href="#book-a-call">
              <ShimmerButton className="px-7 py-3.5 text-sm sm:text-base font-semibold text-white">
                Book a 15-min demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </ShimmerButton>
            </Link>
            <Link href="#product-tour">
              <Button variant="lovable-light" size="lg">
                See it in action
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-500"
          >
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              SOC 2 compliant
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-500" />
              Bank-level encryption
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
      <div className="max-w-6xl mx-auto px-5">
        <p className="text-center text-xs uppercase tracking-wider text-gray-500 font-semibold mb-6">
          Built on the engine processing real cleaning revenue
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {[
            { value: 510000, label: 'Tracked revenue', prefix: '$' },
            { value: 1740, label: 'Bookings processed', prefix: '' },
            { value: 32.3, label: 'Recurring conversion', suffix: '%', decimals: 1 },
            { value: 60, label: 'Seconds, average', suffix: 's' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">
                <NumberTicker
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRODUCT TOUR — booking flow preview
// ============================================================================
function ProductTour() {
  return (
    <section id="product-tour" className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-violet-50/30 to-white" />
      <div className="relative max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-4 bg-violet-100 text-violet-700 border-violet-200">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Live booking demo
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Your customer goes from{' '}
            <GradientText gradient="from-primary to-violet-500">ZIP to deposit paid</GradientText>{' '}
            in under 60 seconds.
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Same flow your customers see — auto-cycling so you can preview every step. Pricing
            adjusts to home size and service. Stripe collects the deposit before they leave.
          </p>
          <ul className="space-y-3 mb-8">
            {[
              'Live ZIP validation against your service area',
              'Per-tenant pricing tiers — Standard, Deep, Move-In/Out',
              '25% deposit collected via Stripe (automatic refunds on cancel)',
              'SMS + email confirmation fires the moment payment clears',
            ].map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-gray-700">
                <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <Link href="#book-a-call">
            <Button variant="lovable" size="lg">
              Book a demo to see your data
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <BookingFlowPreview />
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES BENTO
// ============================================================================
const FEATURES: { icon: IconName; title: string; body: string; color: string }[] = [
  {
    icon: 'bolt',
    title: 'Speed-to-Lead SMS & Email',
    body:
      'Instantly text and email every new lead from your website, Google ads, or call tracking — in under 60 seconds.',
    color: 'from-primary to-violet-500',
  },
  {
    icon: 'fileText',
    title: 'Quote Follow-Up Sequences',
    body:
      'Multi-touch SMS & email sequences that turn cleaning quotes into booked jobs over 21 days — no manual follow-up.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: 'heart',
    title: 'Re-Engagement & Win-Back',
    body:
      'Automatically win back past customers and re-engage dormant leads — seasonal cleans, holiday prep, allergy season.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: 'calendar',
    title: 'Online Booking Widget',
    body:
      'Homeowners book service 24/7 with live pricing by home size, Stripe deposits, and instant SMS confirmations.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: 'chart',
    title: 'Pipeline & Revenue Analytics',
    body:
      'Bookings, recurring conversion, revenue by service type, customer lifetime value — in one cleaning dashboard.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: 'sparkles',
    title: 'Branded for Your Business',
    body:
      'Your logo, brand color, phone number, pricing tiers, service area. Customers never see Selestial branding.',
    color: 'from-violet-500 to-fuchsia-500',
  },
];

function FeaturesBento() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-violet-100 text-violet-700 border-violet-200">Features</Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything your cleaning business needs to{' '}
            <GradientText gradient="from-primary to-violet-500">book more jobs.</GradientText>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Online booking, instant pricing, speed-to-lead SMS, and recurring customer flows —
            built specifically for residential cleaning operations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={cn(
                  'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br',
                  f.color,
                  'blur-2xl -z-10'
                )}
                style={{ filter: 'blur(40px)' }}
              />
              <div
                className={cn(
                  'inline-flex items-center justify-center w-12 h-12 rounded-xl text-white mb-4 bg-gradient-to-br',
                  f.color
                )}
              >
                <Icon name={f.icon} size="lg" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SEQUENCES
// ============================================================================
const SEQUENCE_CATEGORIES = [
  {
    id: 'speed-to-lead',
    name: 'Speed-to-Lead',
    icon: 'bolt' as IconName,
    color: 'red',
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
    color: 'blue',
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
    color: 'green',
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
    color: 'purple',
    sequences: [
      { name: 'At-Risk Intervention', metric: 'Churn prevention', description: 'Detect and save at-risk customers' },
      { name: 'Rebooking Reminder', metric: 'Service intervals', description: 'Proactive scheduling for recurring' },
      { name: 'Win-Back Campaign', metric: 'Lapsed customers', description: 'Re-engage inactive accounts' },
      { name: 'Subscription Conversion', metric: 'Recurring revenue', description: 'Convert one-time to recurring' },
    ],
  },
  {
    id: 'seasonal',
    name: 'Seasonal Cleaning',
    icon: 'sun' as IconName,
    color: 'orange',
    sequences: [
      { name: 'Spring Deep Clean', metric: 'Mar–Apr', description: 'Annual top-to-bottom refresh promo' },
      { name: 'Move-Out Season', metric: 'May–Aug', description: 'Lease-turnover deep cleans' },
      { name: 'Holiday Prep', metric: 'Nov–Dec', description: 'Pre-guest deep clean push' },
      { name: 'Allergy Season Push', metric: 'Apr–Jun', description: 'Dust + air-quality focused cleans' },
    ],
  },
];

function SequencesShowcase() {
  const [active, setActive] = useState(SEQUENCE_CATEGORIES[0].id);
  const current = SEQUENCE_CATEGORIES.find((c) => c.id === active);

  const colorMap: Record<string, { tile: string; border: string; metric: string }> = {
    red: { tile: 'bg-red-50', border: 'border-red-200', metric: 'text-red-700' },
    blue: { tile: 'bg-blue-50', border: 'border-blue-200', metric: 'text-blue-700' },
    green: { tile: 'bg-emerald-50', border: 'border-emerald-200', metric: 'text-emerald-700' },
    purple: { tile: 'bg-violet-50', border: 'border-violet-200', metric: 'text-violet-700' },
    orange: { tile: 'bg-amber-50', border: 'border-amber-200', metric: 'text-amber-700' },
  };
  const colors = current ? colorMap[current.color] : colorMap.purple;

  return (
    <section id="sequences" className="py-16 md:py-24 bg-gray-50/60 border-y border-gray-200">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-violet-100 text-violet-700 border-violet-200">
            Pre-built sequences
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            34+ workflows built for cleaning companies.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Booking confirmations, recurring service reminders, win-back flows, deep clean promos.
            Install in one click from <span className="font-medium text-gray-900">Sequences → Templates</span>.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SEQUENCE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-sm font-medium',
                active === cat.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-primary/40'
              )}
            >
              <Icon name={cat.icon} size="sm" />
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-3 py-1 bg-white border border-gray-200 rounded-md text-[11px] text-gray-500 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-500" />
                app.selestial.io / sequences / templates
              </div>
            </div>
          </div>
          <div className="p-6">
            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {current.sequences.map((seq, i) => (
                    <motion.div
                      key={seq.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        'p-4 rounded-xl border-2 bg-white hover:shadow-md transition-all',
                        colors.border
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm">{seq.name}</h3>
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded', colors.tile, colors.metric)}>
                          {seq.metric}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{seq.description}</p>
                    </motion.div>
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
// TESTIMONIALS — marquee
// ============================================================================
function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-violet-100 text-violet-700 border-violet-200">
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by cleaning company owners.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real cleaning operations using Selestial to book more jobs and convert one-time
            customers to recurring revenue.
          </p>
        </div>
        <CustomerMarquee />
      </div>
    </section>
  );
}

// ============================================================================
// CUSTOMIZATION REQUEST FORM
// ============================================================================
function CustomBookingPageSection() {
  const [form, setForm] = useState({
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

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
    <section id="custom-booking-page" className="py-16 md:py-24 bg-gray-50/60 border-y border-gray-200">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-violet-100 text-violet-700 border-violet-200">
            Done-for-you setup
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Want your own branded booking page?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your cleaning business and we&apos;ll build your branded booking page —
            home-size pricing, services, deposits, brand colors — and have it live in 48 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-2 space-y-3">
            {[
              { icon: 'bolt' as IconName, title: 'Live in 48 hours', desc: 'Plug in your services and pricing, ship to a Selestial subdomain or your own domain.' },
              { icon: 'dollar' as IconName, title: 'Your pricing, your services', desc: 'Home-size pricing, add-ons, recurring discounts, deposits — mirrored to how you charge today.' },
              { icon: 'sparkles' as IconName, title: 'Branded end-to-end', desc: 'Your logo, colors, photos, copy. Customers never see Selestial branding unless you want them to.' },
              { icon: 'check' as IconName, title: 'Connected to everything', desc: 'Stripe deposits, Twilio SMS, recurring sequences, GHL / HubSpot CRM sync.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-200">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon name={item.icon} size="lg" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-primary/15 via-violet-500/15 to-primary/15 rounded-3xl blur-2xl" />
              <div className="relative bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-2xl shadow-gray-300/30">
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
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="Business name *">
                          <Input value={form.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="Sparkle Clean Co." required />
                        </Field>
                        <Field label="Your name *">
                          <Input value={form.contactName} onChange={(e) => update('contactName', e.target.value)} placeholder="Jane Smith" required />
                        </Field>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="Email *">
                          <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="jane@sparkleclean.co" required />
                        </Field>
                        <Field label="Phone">
                          <Input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(555) 123-4567" />
                        </Field>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="Website">
                          <Input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://sparkleclean.co" />
                        </Field>
                        <Field label="Service area">
                          <Input value={form.serviceArea} onChange={(e) => update('serviceArea', e.target.value)} placeholder="Dallas, TX metro" />
                        </Field>
                      </div>
                      <Field label="Services and add-ons offered">
                        <textarea
                          value={form.servicesOffered}
                          onChange={(e) => update('servicesOffered', e.target.value)}
                          placeholder="Standard, Deep Clean, Move-Out. Add-ons: oven, fridge, windows. Biweekly recurring discount."
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm text-gray-900 placeholder:text-gray-400 resize-none"
                        />
                      </Field>
                      <div className="grid sm:grid-cols-[auto_1fr] gap-3 items-end">
                        <Field label="Brand color">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={form.brandColor}
                              onChange={(e) => update('brandColor', e.target.value)}
                              className="h-10 w-12 rounded-lg border border-gray-200 bg-white cursor-pointer"
                            />
                            <Input value={form.brandColor} onChange={(e) => update('brandColor', e.target.value)} className="w-28" />
                          </div>
                        </Field>
                        <Field label="Anything else we should know?">
                          <Input value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Existing CRM, peak season, etc." />
                        </Field>
                      </div>
                      <ShimmerButton
                        type="submit"
                        disabled={submitting}
                        className="w-full px-5 py-3 text-sm font-semibold text-white"
                      >
                        {submitting ? 'Sending request...' : 'Request my branded booking page'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </ShimmerButton>
                      <p className="text-xs text-center text-gray-500">
                        We&apos;ll reply within 1 business day with a setup link and a 48-hour go-live timeline.
                      </p>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <Check className="h-7 w-7 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Request received.</h3>
                      <p className="text-gray-500 max-w-sm mx-auto">
                        We&apos;ll email you within 1 business day with a setup link and a 48-hour go-live timeline.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ============================================================================
// BOOK A CALL — GHL embed
// ============================================================================
function BookACall() {
  return (
    <section id="book-a-call" className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-5">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-violet-100 text-violet-700 border-violet-200">
            Talk to a real human
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Book a 15-minute Selestial walkthrough.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pick a time and we&apos;ll show you Selestial running on a real cleaning company&apos;s
            schedule and pricing.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-r from-primary/15 via-violet-500/15 to-primary/15 rounded-3xl blur-2xl" />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-300/30 overflow-hidden">
            <GhlCalendarEmbed
              src="https://api.divineacquisition.io/widget/booking/bdGyTVXFRxIW5RI49fGp"
              id="09O94JadkIsrarld4LMd_welcome_inline"
              minHeight={840}
              maxHeight={1400}
            />
          </div>
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
    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-5">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/25 via-violet-500/25 to-primary/25 rounded-3xl blur-2xl" />
          <div className="relative bg-gradient-to-br from-primary to-violet-700 rounded-3xl p-10 md:p-14 text-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
                Stop losing cleaning bookings to quote forms.
              </h2>
              <p className="text-base md:text-lg text-white/85 max-w-xl mx-auto mb-3">
                Join cleaning operations using Selestial to show pricing upfront, book more jobs,
                and convert one-time customers into recurring revenue — automatically.
              </p>
              <p className="text-xs md:text-sm text-white/60 mb-8">
                Built on the engine processing $510K+ in tracked cleaning revenue.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="#book-a-call">
                  <ShimmerButton
                    background="linear-gradient(110deg, #ffffff, 45%, #f5f3ff, 55%, #ffffff)"
                    className="px-7 py-3.5 text-sm sm:text-base font-bold text-primary"
                  >
                    Book my 15-min demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ShimmerButton>
                </Link>
                <Link href="#custom-booking-page">
                  <Button
                    variant="lovable-dark"
                    size="lg"
                    className="from-white/15 to-white/5 border-white/25 text-white shadow-[0_4px_0_0_rgba(0,0,0,0.25),0_6px_16px_-4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.3),0_8px_22px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.25)]"
                  >
                    Request a custom page
                  </Button>
                </Link>
              </div>

              <p className="text-white/60 text-xs sm:text-sm mt-6">
                No credit card required • 30-day money-back • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function LandingPage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <ProductTour />
      <FeaturesBento />
      <SequencesShowcase />
      <Testimonials />
      <CustomBookingPageSection />
      <BookACall />
      <FinalCta />
    </>
  );
}
