'use client';

import { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { AlertCircle, CreditCard, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { getStripe } from '@/lib/stripe/client';
import { cn } from '@/lib/utils';

interface SubscriptionPaymentFormProps {
  /** PaymentIntent client_secret returned by /api/onboarding/create-subscription. */
  clientSecret: string;
  /** Subscription's first-invoice amount in cents (display-only). */
  amount: number;
  /** ISO currency, lowercase, e.g. 'usd' (display-only). */
  currency: string;
  /** Called after Stripe confirms the PaymentIntent succeeded. */
  onSuccess: (paymentIntentId: string) => void;
  className?: string;
}

/**
 * Subscription Payment Element wrapper for /offer/get-started step 4.
 *
 * Different from the booking-flow StripePaymentForm in two ways:
 *   1. Surfaces "$X / month" framing instead of "deposit + balance".
 *   2. Calls confirmPayment with a return_url that lands the user on the
 *      same page (the wizard polls /api/onboarding/payment-confirmed).
 */
export function SubscriptionPaymentForm({
  clientSecret,
  amount,
  currency,
  onSuccess,
  className,
}: SubscriptionPaymentFormProps) {
  return (
    <div className={className}>
      <Elements
        stripe={getStripe()}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#7c3aed',
              colorText: '#0a0a0a',
              colorTextSecondary: '#71717a',
              colorBackground: '#ffffff',
              borderRadius: '8px',
              fontFamily: 'Inter, system-ui, sans-serif',
              spacingUnit: '4px',
            },
          },
        }}
      >
        <PaymentFormContent amount={amount} currency={currency} onSuccess={onSuccess} />
      </Elements>
    </div>
  );
}

function PaymentFormContent({
  amount,
  currency,
  onSuccess,
}: Omit<SubscriptionPaymentFormProps, 'clientSecret' | 'className'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError('Payment system not ready. Please wait…');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        // We stay on the page and switch to the success screen ourselves.
        redirect: 'if_required',
        confirmParams: { return_url: window.location.href },
      });

      if (submitError) {
        const msg = submitError.message || 'Payment failed. Please try again.';
        setError(msg);
        toast.error(msg);
        setSubmitting(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment confirmed.');
        onSuccess(paymentIntent.id);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'requires_action') {
        toast.info('Additional verification required…');
        // Stripe will redirect; nothing more to do here.
        return;
      }

      setError('Payment did not complete. Please try another card.');
      setSubmitting(false);
    } catch (err) {
      console.error('[subscription payment] error:', err);
      setError(err instanceof Error ? err.message : 'Unexpected payment error.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-zinc-600">Today&apos;s charge</span>
          <span className="text-xl font-semibold tracking-tight text-zinc-900">
            {formatMoney(amount, currency)}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Then {formatMoney(amount, currency)} every month. Cancel anytime.
        </p>
      </div>

      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'link'],
        }}
      />

      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Lock className="h-3 w-3" />
        Encrypted by Stripe · Cards never touch our servers
      </div>

      <button
        type="submit"
        disabled={submitting || !stripe || !elements}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60'
        )}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Pay {formatMoney(amount, currency)} & start setup
          </>
        )}
      </button>
    </form>
  );
}

function formatMoney(amountCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amountCents / 100);
  } catch {
    return `$${(amountCents / 100).toFixed(2)}`;
  }
}
