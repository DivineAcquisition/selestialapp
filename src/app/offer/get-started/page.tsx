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
  FileText,
  Home,
  Loader2,
  Lock,
  ShieldCheck,
  Trash2,
  Upload,
  Building2,
  HousePlus,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { BookingPagePreview } from '@/components/marketing/BookingPagePreview';
import { SubscriptionPaymentForm } from '@/components/marketing/SubscriptionPaymentForm';
import { SelestialOnboardingCallCalendar } from '@/components/marketing/GhlCalendarEmbed';
import { BrandButton } from '@/components/marketing/BrandButton';
import { cn } from '@/lib/utils';

// ============================================================================
// State
// ============================================================================
type BusinessType = 'residential' | 'commercial' | 'both';

interface OnboardingState {
  // Step 1 — business
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  serviceArea: string;
  businessType: BusinessType | null;

  // Step 2 — branding
  brandColor: string;
  logoUrl: string;
  tagline: string;

  // Step 3 — optional pricing doc + notes
  pricingDocUrl: string;
  pricingDocFilename: string;
  notes: string;
}

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
  businessType: null,
  brandColor: '#5500FF',
  logoUrl: '',
  tagline: '',
  pricingDocUrl: '',
  pricingDocFilename: '',
  notes: '',
};

const STEPS = [
  { id: 1, name: 'Business' },
  { id: 2, name: 'Branding' },
  { id: 3, name: 'Pricing' },
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

  const [signupId, setSignupId] = useState<string | null>(null);
  const [signupSubmitting, setSignupSubmitting] = useState(false);

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

  const stepValid = useMemo(() => {
    if (step === 1) {
      return Boolean(
        state.businessName.trim() &&
          state.contactName.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim()) &&
          state.businessType !== null
      );
    }
    if (step === 2) {
      return /^#[0-9a-f]{6}$/i.test(state.brandColor.trim());
    }
    // Step 3 (pricing doc) is entirely optional.
    return true;
  }, [step, state]);

  const back = () => setStep((s) => Math.max(1, s - 1));
  const next = async () => {
    if (!stepValid) {
      toast.error('Please complete the highlighted fields.');
      return;
    }
    if (step === 3) {
      await initializePayment();
      return;
    }
    if (step < STEPS.length) setStep((s) => s + 1);
  };

  const initializePayment = async () => {
    if (paymentInit) {
      setStep(4);
      return;
    }
    setSignupSubmitting(true);
    setPaymentInitError(null);

    try {
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
      console.error('[payment-confirmed] flip failed:', err);
    }
    setPaid(true);
  };

  if (paid) {
    return <SuccessScreen contactName={state.contactName} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
      <CheckoutNav />

      <div className="mx-auto max-w-7xl px-5 py-8 md:py-12">
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

                  <Field label="What do you clean? *">
                    <div className="grid gap-2 sm:grid-cols-3">
                      {(
                        [
                          { id: 'residential', label: 'Residential', icon: Home },
                          { id: 'commercial', label: 'Commercial', icon: Building2 },
                          { id: 'both', label: 'Both', icon: HousePlus },
                        ] as const
                      ).map((opt) => {
                        const selected = state.businessType === opt.id;
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => update('businessType', opt.id)}
                            className={cn(
                              'flex items-center gap-3 rounded-md border p-3 text-left transition-all',
                              selected
                                ? 'border-2 border-primary bg-primary/5'
                                : 'border-zinc-200 bg-white hover:border-zinc-300'
                            )}
                          >
                            <div
                              className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-md border',
                                selected
                                  ? 'border-primary/30 bg-primary/10 text-primary'
                                  : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-zinc-900">{opt.label}</p>
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
                    <p className="mt-1.5 text-xs text-zinc-500">
                      We tune the booking flow + sequences to your customer mix.
                    </p>
                  </Field>
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
                        {['#5500FF', '#9D96FF', '#0F766E', '#1D4ED8', '#DC2626', '#0A0A0A'].map(
                          (c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => update('brandColor', c)}
                              aria-label={`Use ${c}`}
                              className={cn(
                                'h-7 w-7 rounded-md border-2 transition-transform hover:scale-110',
                                state.brandColor.toUpperCase() === c.toUpperCase()
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
                      placeholder="https://… (or send during the onboarding call)"
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Paste a public URL now or send your logo on the onboarding call. PNG/SVG,
                      square preferred.
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
                <Step
                  key="3"
                  title="Send us your pricing (optional)"
                >
                  <p className="text-sm text-zinc-600">
                    Drop a PDF, image, or spreadsheet of your current pricing and we&apos;ll
                    plug it into your booking page during the onboarding call. Skip this if
                    you&apos;d rather walk us through it on the call.
                  </p>

                  <PricingDocUploader
                    currentUrl={state.pricingDocUrl}
                    currentName={state.pricingDocFilename}
                    onUploaded={(url, filename) => {
                      update('pricingDocUrl', url);
                      update('pricingDocFilename', filename);
                    }}
                    onClear={() => {
                      update('pricingDocUrl', '');
                      update('pricingDocFilename', '');
                    }}
                  />

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
                          <BrandButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={initializePayment}
                            className="mt-3"
                          >
                            Retry
                          </BrandButton>
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

            {step < 4 && (
              <div className="mt-8 flex items-center justify-between gap-3">
                <BrandButton
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={back}
                  disabled={step === 1}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </BrandButton>
                <BrandButton
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={next}
                  disabled={!stepValid || signupSubmitting || paymentInitializing}
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
                </BrandButton>
              </div>
            )}
            {step === 4 && (
              <div className="mt-6 flex items-center justify-start">
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
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
              services={[]}
              recurringDiscountPct={10}
              depositPercent={25}
            />
            <details className="mt-4 rounded-md border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-zinc-900">
                What happens after I pay?
                <ChevronDown className="h-4 w-4" />
              </summary>
              <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-[12px] leading-relaxed">
                <li>You pick a 30-minute onboarding call slot on the next screen.</li>
                <li>We provision your GHL sub-account and configure your branding.</li>
                <li>On the call we set up your pricing tiers, services, and add-ons.</li>
                <li>Your booking page goes live within 48 hours of the call.</li>
              </ol>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Pricing-doc uploader
// ============================================================================
function PricingDocUploader({
  currentUrl,
  currentName,
  onUploaded,
  onClear,
}: {
  currentUrl: string;
  currentName: string;
  onUploaded: (url: string, filename: string) => void;
  onClear: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/onboarding/upload-pricing', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed.');
      onUploaded(data.url, data.filename);
      toast.success('Pricing doc uploaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (currentUrl) {
    return (
      <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-emerald-700">
            <FileText className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-semibold text-zinc-900">{currentName}</p>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:underline"
            >
              View uploaded file
            </a>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-100"
          aria-label="Remove file"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <label
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-zinc-50 p-6 text-center transition-colors',
        uploading
          ? 'border-primary/40 bg-primary/5'
          : 'border-zinc-300 hover:border-primary/40 hover:bg-primary/5'
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600">
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </div>
      <p className="text-sm font-semibold text-zinc-900">
        {uploading ? 'Uploading…' : 'Click to upload pricing doc'}
      </p>
      <p className="text-xs text-zinc-500">
        PDF, PNG/JPG, CSV, or Excel · up to 10 MB · Optional
      </p>
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.xls,.xlsx,application/pdf,image/*,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
    </label>
  );
}

// ============================================================================
// Success
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
          A confirmation email is on its way to your inbox.
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
