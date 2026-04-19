'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { BookingPagePreview } from '@/components/marketing/BookingPagePreview';
import { SubscriptionPaymentForm } from '@/components/marketing/SubscriptionPaymentForm';
import { SelestialOnboardingCallCalendar } from '@/components/marketing/GhlCalendarEmbed';
import { cn } from '@/lib/utils';

// ============================================================================
// State
// ============================================================================
interface ServiceLine {
  id: string;
  name: string;
  price: number;
}

interface OnboardingState {
  // Step 1 — business
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  serviceArea: string;

  // Step 2 — branding
  brandColor: string;
  logoUrl: string;
  tagline: string;

  // Step 3 — services + pricing
  services: ServiceLine[];
  recurringDiscountPct: number;
  depositPercent: number;

  // Step 4 — notes only (single plan, no tier choice)
  notes: string;
}

// One plan only — $297/mo. Snapshotted in the API too. Keep both in sync.
const PLAN = {
  name: 'Selestial',
  price: 297,
  cents: 29_700,
  interval: 'month',
} as const;

const DEFAULT_STATE: OnboardingState = {
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  serviceArea: '',
  brandColor: '#7c3aed',
  logoUrl: '',
  tagline: '',
  services: [],
  recurringDiscountPct: 10,
  depositPercent: 25,
  notes: '',
};

const STEPS = [
  { id: 1, name: 'Business' },
  { id: 2, name: 'Branding' },
  { id: 3, name: 'Services' },
  { id: 4, name: 'Payment' },
] as const;

// ============================================================================
// MAIN
// ============================================================================
export default function GetStartedPage() {
  return (
    <Suspense fallback={null}>
      <GetStartedInner />
    </Suspense>
  );
}

function GetStartedInner() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);

  // Submission lifecycle
  const [signupId, setSignupId] = useState<string | null>(null);
  const [signupSubmitting, setSignupSubmitting] = useState(false);

  // Payment lifecycle
  const [paymentInit, setPaymentInit] = useState<{
    clientSecret: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [paymentInitializing, setPaymentInitializing] = useState(false);
  const [paymentInitError, setPaymentInitError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const update = <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  // ---- step validation ----
  const stepValid = useMemo(() => {
    if (step === 1) {
      return Boolean(
        state.businessName.trim() &&
          state.contactName.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())
      );
    }
    if (step === 2) {
      return /^#[0-9a-f]{6}$/i.test(state.brandColor.trim());
    }
    if (step === 3) {
      return (
        state.services.length > 0 &&
        state.services.every((s) => s.name.trim().length > 0 && s.price > 0)
      );
    }
    return true;
  }, [step, state]);

  // ---- step 1-3 navigation ----
  const back = () => setStep((s) => Math.max(1, s - 1));
  const next = async () => {
    if (!stepValid) {
      toast.error('Please complete the highlighted fields.');
      return;
    }

    // When advancing FROM step 3 -> step 4, we (a) persist the signup row
    // if we haven't yet, (b) ask the API to create the Stripe Subscription
    // and return a PaymentIntent client_secret. This batches network work
    // so step 4 mounts with the Payment Element already ready.
    if (step === 3) {
      await initializePayment();
      return;
    }

    if (step < STEPS.length) setStep((s) => s + 1);
  };

  const initializePayment = async () => {
    if (paymentInit) {
      // Already initialized — just advance.
      setStep(4);
      return;
    }
    setSignupSubmitting(true);
    setPaymentInitError(null);

    try {
      // 1. Persist the onboarding signup. The API writes the row and gives
      //    us back the id we'll use to create the subscription.
      let id = signupId;
      if (!id) {
        const res = await fetch('/api/onboarding/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to save your details.');
        id = data.signup.id as string;
        setSignupId(id);
      }

      // 2. Create the Stripe Subscription + PaymentIntent.
      setPaymentInitializing(true);
      const subRes = await fetch('/api/onboarding/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signupId: id }),
      });
      const subData = await subRes.json();
      if (!subRes.ok) throw new Error(subData?.error || 'Could not initialize payment.');

      setPaymentInit({
        clientSecret: subData.clientSecret,
        amount: subData.amount,
        currency: subData.currency,
      });
      setStep(4);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setPaymentInitError(msg);
      toast.error(msg);
    } finally {
      setSignupSubmitting(false);
      setPaymentInitializing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!signupId) return;
    try {
      await fetch('/api/onboarding/payment-confirmed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signupId, paymentIntentId }),
      });
    } catch (err) {
      // Non-fatal. Webhook is the source of truth.
      console.error('[payment-confirmed] flip failed:', err);
    }
    setPaid(true);
  };

  // ---- success view ----
  if (paid) {
    return <SuccessScreen contactName={state.contactName} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
      <CheckoutNav />

      <div className="mx-auto max-w-7xl px-5 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Selestial onboarding · Step {step} of {STEPS.length}
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            {step === 4
              ? 'One last step — secure your spot.'
              : 'Set up your branded booking page.'}
          </h1>
          <ProgressBar step={step} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
          {/* Form column */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <Step key="1" title="Tell us about your business">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Business name *">
                      <Input
                        value={state.businessName}
                        onChange={(e) => update('businessName', e.target.value)}
                        placeholder="e.g. Sparkle Clean Co."
                      />
                    </Field>
                    <Field label="Your name *">
                      <Input
                        value={state.contactName}
                        onChange={(e) => update('contactName', e.target.value)}
                        placeholder="e.g. Jane Smith"
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email *">
                      <Input
                        type="email"
                        value={state.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="you@yourcompany.com"
                      />
                    </Field>
                    <Field label="Phone">
                      <Input
                        type="tel"
                        value={state.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Website">
                      <Input
                        type="url"
                        value={state.website}
                        onChange={(e) => update('website', e.target.value)}
                        placeholder="https://yourcompany.com"
                      />
                    </Field>
                    <Field label="Service area">
                      <Input
                        value={state.serviceArea}
                        onChange={(e) => update('serviceArea', e.target.value)}
                        placeholder="City + metro you serve"
                      />
                    </Field>
                  </div>
                </Step>
              )}

              {step === 2 && (
                <Step key="2" title="Brand your booking page">
                  <Field label="Brand color *">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="color"
                        value={state.brandColor}
                        onChange={(e) => update('brandColor', e.target.value)}
                        className="h-12 w-14 cursor-pointer rounded-md border border-zinc-200 bg-white"
                      />
                      <Input
                        value={state.brandColor}
                        onChange={(e) => update('brandColor', e.target.value)}
                        className="w-32 font-mono"
                      />
                      <div className="flex gap-1.5">
                        {['#7c3aed', '#0f766e', '#1d4ed8', '#dc2626', '#ea580c', '#0a0a0a'].map(
                          (c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => update('brandColor', c)}
                              aria-label={`Use ${c}`}
                              className={cn(
                                'h-7 w-7 rounded-md border-2 transition-transform hover:scale-110',
                                state.brandColor.toLowerCase() === c
                                  ? 'border-zinc-900'
                                  : 'border-zinc-200'
                              )}
                              style={{ backgroundColor: c }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </Field>
                  <Field label="Logo URL">
                    <Input
                      value={state.logoUrl}
                      onChange={(e) => update('logoUrl', e.target.value)}
                      placeholder="https://… (or upload during the onboarding call)"
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Paste a public URL now or send us your logo on the onboarding call.
                      PNG/SVG, square preferred.
                    </p>
                  </Field>
                  <Field label="Tagline (shown under business name)">
                    <Input
                      value={state.tagline}
                      onChange={(e) => update('tagline', e.target.value)}
                      placeholder="Premium residential cleaning · Madison, WI"
                    />
                  </Field>
                </Step>
              )}

              {step === 3 && (
                <Step key="3" title="Set your services + pricing">
                  <p className="text-sm text-zinc-600">
                    Add the cleaning services you actually offer with your real prices.
                    What you enter here becomes the price grid on your live booking page.
                  </p>

                  {state.services.length === 0 && (
                    <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-5 text-center">
                      <p className="text-sm font-medium text-zinc-900">No services added yet</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Add at least one service to continue. Most operators start with
                        Standard, Deep Clean, and Recurring Maintenance — but enter what you
                        charge today.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {state.services.map((svc, idx) => (
                      <div
                        key={svc.id}
                        className="grid grid-cols-[1fr_120px_auto] items-center gap-2"
                      >
                        <Input
                          value={svc.name}
                          onChange={(e) => {
                            const nextList = [...state.services];
                            nextList[idx] = { ...svc, name: e.target.value };
                            update('services', nextList);
                          }}
                          placeholder="Service name"
                        />
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                            $
                          </span>
                          <Input
                            type="number"
                            min={0}
                            value={svc.price || ''}
                            onChange={(e) => {
                              const nextList = [...state.services];
                              nextList[idx] = {
                                ...svc,
                                price: parseInt(e.target.value, 10) || 0,
                              };
                              update('services', nextList);
                            }}
                            className="pl-6"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            update(
                              'services',
                              state.services.filter((_, i) => i !== idx)
                            );
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900"
                          aria-label="Remove service"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        update('services', [
                          ...state.services,
                          { id: crypto.randomUUID(), name: '', price: 0 },
                        ])
                      }
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md border border-dashed px-3 py-2 text-sm font-medium transition-colors',
                        state.services.length === 0
                          ? 'border-primary/40 text-primary hover:bg-primary/5'
                          : 'border-zinc-300 text-zinc-600 hover:border-primary/40 hover:text-primary'
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      {state.services.length === 0 ? 'Add your first service' : 'Add service'}
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label={`Recurring discount: ${state.recurringDiscountPct}%`}>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={state.recurringDiscountPct}
                        onChange={(e) =>
                          update('recurringDiscountPct', parseInt(e.target.value, 10))
                        }
                        className="w-full accent-[var(--primary)]"
                      />
                      <p className="mt-1.5 text-xs text-zinc-500">
                        Applied to your &ldquo;Recurring&rdquo; service automatically.
                      </p>
                    </Field>
                    <Field label={`Deposit at booking: ${state.depositPercent}%`}>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={state.depositPercent}
                        onChange={(e) =>
                          update('depositPercent', parseInt(e.target.value, 10))
                        }
                        className="w-full accent-[var(--primary)]"
                      />
                      <p className="mt-1.5 text-xs text-zinc-500">
                        25% is the cleaning-industry default. Higher reduces no-shows further.
                      </p>
                    </Field>
                  </div>

                  <Field label="Anything else we should know?">
                    <textarea
                      value={state.notes}
                      onChange={(e) => update('notes', e.target.value)}
                      placeholder="Existing CRM, peak season, custom requests…"
                      rows={3}
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </Field>
                </Step>
              )}

              {step === 4 && (
                <Step key="4" title="Pay & lock your spot">
                  <PlanSummary />

                  {paymentInit ? (
                    <SubscriptionPaymentForm
                      clientSecret={paymentInit.clientSecret}
                      amount={paymentInit.amount}
                      currency={paymentInit.currency}
                      onSuccess={handlePaymentSuccess}
                    />
                  ) : (
                    <div className="space-y-3">
                      {paymentInitError ? (
                        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                          {paymentInitError}
                          <button
                            type="button"
                            onClick={initializePayment}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Setting up secure checkout…
                        </div>
                      )}
                    </div>
                  )}

                  <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    30-day money-back guarantee · Cancel anytime
                  </p>
                </Step>
              )}
            </AnimatePresence>

            {/* Step nav (Steps 1-3 only — Step 4 is driven by the Payment Element) */}
            {step < 4 && (
              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 1}
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={!stepValid || signupSubmitting || paymentInitializing}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {step === 3 ? (
                    signupSubmitting || paymentInitializing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing checkout…
                      </>
                    ) : (
                      <>
                        Continue to payment
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
            {step === 4 && (
              <div className="mt-6 flex items-center justify-start">
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to services
                </button>
              </div>
            )}
          </div>

          {/* Live preview column */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Live preview
            </p>
            <BookingPagePreview
              businessName={state.businessName || 'Your Cleaning Business'}
              brandColor={state.brandColor}
              tagline={state.tagline || 'Powered by Selestial'}
              logoUrl={state.logoUrl || undefined}
              services={state.services}
              recurringDiscountPct={state.recurringDiscountPct}
              depositPercent={state.depositPercent}
            />
            <details className="mt-4 rounded-md border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-zinc-900">
                What happens after I pay?
                <ChevronDown className="h-4 w-4" />
              </summary>
              <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-[12px] leading-relaxed">
                <li>You pick a 30-minute onboarding call slot on the next screen.</li>
                <li>We provision your GHL sub-account and configure your branding + pricing.</li>
                <li>Your booking page goes live within 48 hours of the call.</li>
                <li>Your subscription auto-renews monthly. Cancel anytime in one click.</li>
              </ol>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Success — calendar embed for the post-payment onboarding call
// ============================================================================
function SuccessScreen({ contactName }: { contactName: string }) {
  const firstName = contactName.split(' ')[0] || 'there';
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
      <CheckoutNav />
      <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="h-7 w-7" />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Payment confirmed
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Welcome to Selestial, {firstName}.{' '}
            <span className="text-primary">Pick your onboarding call.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-600">
            Grab a 30-minute slot below. We&apos;ll walk you through your branded booking page,
            confirm your services + pricing, and have you live in 48 hours.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <SelestialOnboardingCallCalendar fallbackHeight={900} />
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
          <Calendar className="h-3.5 w-3.5" />
          A confirmation email with your call details is on its way to your inbox.
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/offer"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Subcomponents
// ============================================================================
function CheckoutNav() {
  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
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
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          Secure checkout
        </div>
      </div>
    </nav>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mt-6 flex items-center gap-2">
      {STEPS.map((s, i) => {
        const isDone = step > s.id;
        const isCurrent = step === s.id;
        return (
          <div key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                isDone
                  ? 'bg-primary text-white'
                  : isCurrent
                  ? 'border-2 border-primary bg-primary/5 text-primary'
                  : 'border border-zinc-200 bg-white text-zinc-400'
              )}
            >
              {isDone ? <Check className="h-4 w-4" /> : s.id}
            </div>
            <span
              className={cn(
                'hidden text-sm font-medium sm:inline',
                isDone || isCurrent ? 'text-zinc-900' : 'text-zinc-400'
              )}
            >
              {s.name}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn('mx-1 h-px flex-1', isDone ? 'bg-primary' : 'bg-zinc-200')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PlanSummary() {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-zinc-900">{PLAN.name}</p>
        <p className="text-2xl font-semibold tracking-tight text-zinc-900">
          ${PLAN.price}
          <span className="ml-1 text-sm font-normal text-zinc-500">/{PLAN.interval}</span>
        </p>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-zinc-700">
        {[
          'Done-for-you setup (live in 48 hours)',
          'Branded booking page on a Selestial subdomain',
          'Stripe deposit collection + recurring upsell',
          'AI follow-up sequences (SMS + email)',
          'Unlimited bookings — no per-user fees',
          '30-day money-back guarantee',
        ].map((line) => (
          <li key={line} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="space-y-5"
    >
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{title}</h2>
      {children}
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-700">{label}</label>
      {children}
    </div>
  );
}
