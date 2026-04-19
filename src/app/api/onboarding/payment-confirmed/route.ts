import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/server';

/**
 * POST /api/onboarding/payment-confirmed
 *
 * Optimistic, client-driven path that flips an onboarding signup to
 * `payment_status='paid'` after the Stripe Payment Element returns a
 * succeeded PaymentIntent.
 *
 * The authoritative confirmation path is a Stripe webhook
 * (`invoice.paid` / `customer.subscription.updated` -> active). This route
 * exists so the wizard can show the success screen + onboarding-call
 * calendar immediately, without waiting for the webhook round-trip.
 *
 * Re-verifies the PaymentIntent with Stripe before flipping the row, so
 * a tampered request body can't fake a paid status.
 */
export async function POST(request: NextRequest) {
  let body: { signupId?: string; paymentIntentId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { signupId, paymentIntentId } = body;
  if (!signupId || !paymentIntentId) {
    return NextResponse.json(
      { error: 'signupId and paymentIntentId are required' },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  let succeeded = false;
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    succeeded = intent.status === 'succeeded';
  } catch (err) {
    console.error('[payment-confirmed] stripe retrieve failed:', err);
    return NextResponse.json(
      { error: 'Could not verify the payment with Stripe.' },
      { status: 502 }
    );
  }

  if (!succeeded) {
    return NextResponse.json(
      { error: 'Stripe did not report this payment as succeeded.' },
      { status: 409 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('onboarding_signups')
    .update({
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', signupId);

  if (error) {
    console.error('[payment-confirmed] supabase update failed:', error);
    return NextResponse.json(
      { error: 'Payment recorded but failed to update signup.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
