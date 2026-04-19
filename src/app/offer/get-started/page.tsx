'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Plus,
  Trash2,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { BookingPagePreview } from '@/components/marketing/BookingPagePreview';
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
  // Step 1
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  serviceArea: string;

  // Step 2
  brandColor: string;
  logoUrl: string;
  tagline: string;

  // Step 3
  services: ServiceLine[];
  recurringDiscountPct: number;
  depositPercent: number;

  // Step 4
  // `null` until the user explicitly picks a plan — prevents accidentally
  // submitting a default they never selected.
  plan: 'starter' | 'growth' | 'scale' | null;
  notes: string;
}

const PLANS = {
  starter: { name: 'Starter', price: 297, discounted: 148.5 },
  growth: { name: 'Growth', price: 497, discounted: 248.5 },
  scale: { name: 'Scale', price: 997, discounted: 498.5 },
} as const;

// Initial form state. Customer-data fields (businessName, services, prices,
// plan) are intentionally empty/unset so we never submit values the user
// didn't actually enter. Operational defaults (brand color, recurring %,
// deposit %) start at industry-standard baselines that the user can adjust.
const DEFAULT_STATE: OnboardingState = {
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  serviceArea: '',
  brandColor: '#7c3aed', // Selestial brand violet — overridden by user
  logoUrl: '',
  tagline: '',
  services: [],
  recurringDiscountPct: 10, // standard cleaning-industry recurring discount
  depositPercent: 25, // standard at-booking deposit
  plan: null,
  notes: '',
};

const STEPS = [
  { id: 1, name: 'Business' },
  { id: 2, name: 'Branding' },
  { id: 3, name: 'Services' },
  { id: 4, name: 'Plan' },
] as const;

// ============================================================================
// MAIN PAGE — Suspense wrapper required because useSearchParams forces CSR.
// ============================================================================
export default function GetStartedPage() {
  return (
    <Suspense fallback={null}>
      <GetStartedInner />
    </Suspense>
  );
}

function GetStartedInner() {
  const searchParams = useSearchParams();
  // Honor ?plan=... only when it points at a real plan id. Otherwise leave
  // the plan unselected so the user has to make an explicit choice on Step 4.
  const planParam = searchParams.get('plan');
  const initialPlan: OnboardingState['plan'] =
    planParam && planParam in PLANS ? (planParam as OnboardingState['plan']) : null;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: string; plan: string } | null>(null);
  const [state, setState] = useState<OnboardingState>(() => ({
    ...DEFAULT_STATE,
    plan: initialPlan,
  }));

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
      // At least one service the user actually entered: name AND price > 0.
      return (
        state.services.length > 0 &&
        state.services.every((s) => s.name.trim().length > 0 && s.price > 0)
      );
    }
    if (step === 4) {
      // Must have explicitly chosen a plan — no implicit default.
      return state.plan !== null;
    }
    return true;
  }, [step, state]);

  const next = () => {
    if (!stepValid) {
      toast.error('Please complete the highlighted fields.');
      return;
    }
    if (step < 4) setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!stepValid) {
      toast.error('Please complete the highlighted fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state,
          offerCode: 'OFFER50',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Submission failed');
      }
      setSubmitted({ id: data.signup.id, plan: data.signup.plan });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- success view ----
  if (submitted) {
    const planMeta = PLANS[submitted.plan as keyof typeof PLANS];
    return (
      <main className="bg-white text-zinc-900 antialiased">
        <TopBar />
        <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            You&apos;re in. We&apos;ll have you live in 48 hours.
          </h1>
          <p className="mt-4 max-w-xl text-base text-zinc-600">
            We&apos;ve queued up your <strong>{planMeta?.name ?? 'Selestial'}</strong>{' '}
            booking page with the <span className="font-mono">OFFER50</span> discount applied.
            Check your inbox in the next 5 minutes for setup access — and a calendar link to
            confirm your services and brand assets with our setup team.
          </p>
          <p className="mt-6 text-xs text-zinc-500">
            Reference id <span className="font-mono">{submitted.id.slice(0, 8)}</span>
          </p>
          <Link
            href="/offer"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to offer
          </Link>
        </section>
      </main>
    );
  }

  // ---- wizard ----
  const currentPlan = state.plan ? PLANS[state.plan] : null;

  return (
    <main className="bg-white text-zinc-900 antialiased">
      <TopBar />

      <div className="mx-auto max-w-7xl px-5 py-10 md:py-14">
        {/* Progress */}
        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Get started · Step {step} of {STEPS.length}
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Set up your <span className="text-primary">branded booking page.</span>
          </h1>
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
                    <div
                      className={cn(
                        'mx-1 h-px flex-1',
                        isDone ? 'bg-primary' : 'bg-zinc-200'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px]">
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
                        placeholder="Sparkle Clean Co."
                      />
                    </Field>
                    <Field label="Your name *">
                      <Input
                        value={state.contactName}
                        onChange={(e) => update('contactName', e.target.value)}
                        placeholder="Jane Smith"
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email *">
                      <Input
                        type="email"
                        value={state.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="jane@sparkleclean.co"
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
                        placeholder="https://sparkleclean.co"
                      />
                    </Field>
                    <Field label="Service area">
                      <Input
                        value={state.serviceArea}
                        onChange={(e) => update('serviceArea', e.target.value)}
                        placeholder="Dallas, TX metro"
                      />
                    </Field>
                  </div>
                </Step>
              )}

              {step === 2 && (
                <Step key="2" title="Brand your booking page">
                  <Field label="Brand color *">
                    <div className="flex items-center gap-3">
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
                      placeholder="https://… (or upload after signup)"
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Paste a public URL now or upload during setup. PNG/SVG, square preferred.
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
                      <p className="text-sm font-medium text-zinc-900">
                        No services added yet
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Add at least one service to continue. Most cleaning operators start with{' '}
                        Standard, Deep Clean, and Recurring Maintenance — but enter what you charge today.
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
                            const next = [...state.services];
                            next[idx] = { ...svc, name: e.target.value };
                            update('services', next);
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
                              const next = [...state.services];
                              next[idx] = {
                                ...svc,
                                price: parseInt(e.target.value, 10) || 0,
                              };
                              update('services', next);
                            }}
                            className="pl-6"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = state.services.filter((_, i) => i !== idx);
                            update('services', next);
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
                        25% is standard. Higher reduces no-shows further.
                      </p>
                    </Field>
                  </div>
                </Step>
              )}

              {step === 4 && (
                <Step key="4" title="Choose your plan">
                  <div className="space-y-3">
                    {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((id) => {
                      const p = PLANS[id];
                      const selected = state.plan === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => update('plan', id)}
                          className={cn(
                            'flex w-full items-center justify-between gap-3 rounded-md border p-4 text-left transition-all',
                            selected
                              ? 'border-2 border-primary bg-primary/5'
                              : 'border-zinc-200 bg-white hover:border-zinc-300'
                          )}
                        >
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">{p.name}</p>
                            <p className="mt-0.5 text-xs text-zinc-500">
                              <span className="text-zinc-400 line-through">${p.price}/mo</span>{' '}
                              <span className="font-semibold text-emerald-700">
                                ${p.discounted}/mo
                              </span>{' '}
                              first 3 months with OFFER50
                            </p>
                          </div>
                          <div
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                              selected
                                ? 'border-primary bg-primary'
                                : 'border-zinc-300 bg-white'
                            )}
                          >
                            {selected && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <Field label="Anything else we should know?">
                    <textarea
                      value={state.notes}
                      onChange={(e) => update('notes', e.target.value)}
                      placeholder="Existing CRM, peak season, custom requests..."
                      rows={3}
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </Field>

                  <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600">
                    By submitting, you&apos;ll receive a setup link and we&apos;ll begin
                    provisioning your sub-account. <strong>OFFER50</strong> locks in 50% off
                    your first 3 months. Cancel anytime.
                  </div>
                </Step>
              )}
            </AnimatePresence>

            {/* Step nav */}
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={back}
                disabled={step === 1}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={!stepValid}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !stepValid}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? 'Submitting…'
                    : currentPlan
                    ? `Claim ${currentPlan.name} — 50% off`
                    : 'Choose a plan to continue'}
                  {!submitting && currentPlan && <ArrowRight className="h-4 w-4" />}
                </button>
              )}
            </div>
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
            <details className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-zinc-900">
                What happens after I submit?
                <ChevronDown className="h-4 w-4" />
              </summary>
              <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-[12px] leading-relaxed">
                <li>You get a setup-access email within 5 minutes.</li>
                <li>We provision your GHL sub-account with your branding and services.</li>
                <li>Your booking page goes live on a Selestial subdomain (or your own domain on Growth/Scale).</li>
                <li>OFFER50 is applied automatically — billing starts on day 14, after the trial.</li>
              </ol>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// Bits
// ============================================================================
function TopBar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 backdrop-blur">
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
        <Link
          href="/offer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to offer
        </Link>
      </div>
    </nav>
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
