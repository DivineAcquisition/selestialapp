import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/server';

/**
 * POST /api/onboarding/create-subscription
 *
 * Creates (or reuses) a Stripe Customer + an incomplete subscription for
 * the supplied onboarding signup, then returns the PaymentIntent
 * `client_secret` so the wizard's Stripe Payment Element can collect a
 * real card and confirm in one round-trip.
 *
 * Inputs:
 *   { signupId: string }
 *
 * Output (200):
 *   {
 *     clientSecret: string,
 *     subscriptionId: string,
 *     customerId: string,
 *     amount: number,         // cents
 *     currency: 'usd',
 *   }
 *
 * Failure modes:
 *   - 404 if signupId doesn't exist
 *   - 409 if STRIPE_PRICE_ID is unset
 *   - 502 if Stripe rejects the create call (passes message through)
 */
export async function POST(request: NextRequest) {
  let body: { signupId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const signupId = body.signupId;
  if (!signupId || typeof signupId !== 'string') {
    return NextResponse.json({ error: 'signupId is required' }, { status: 400 });
  }

  // Live recurring price for the Selestial Standard $297/mo plan, created
  // 2026-04-19 against the Selestial Stripe account. Override via
  // STRIPE_PRICE_ID env if you ever rotate it (e.g. for a discounted SKU
  // or a test-mode key). See supabase/migrations/20260418_*.sql for the
  // matching monthly_price_cents stamp.
  const priceId =
    process.env.STRIPE_PRICE_ID || 'price_1TO0eEFf3bMythdksBEemOKP';

  const supabase = getSupabaseAdmin();

  // Fetch the signup we're about to charge.
  const { data: signup, error: lookupError } = await supabase
    .from('onboarding_signups')
    .select(
      'id, email, contact_name, business_name, phone, ' +
        'stripe_customer_id, stripe_subscription_id, payment_status'
    )
    .eq('id', signupId)
    .single();

  if (lookupError || !signup) {
    return NextResponse.json({ error: 'Signup not found' }, { status: 404 });
  }

  // Cast — committed types.ts may not yet reflect the new Stripe columns.
  const row = signup as unknown as {
    id: string;
    email: string;
    contact_name: string;
    business_name: string;
    phone: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    payment_status: string | null;
  };

  if (row.payment_status === 'paid') {
    return NextResponse.json(
      { error: 'This signup is already paid.' },
      { status: 409 }
    );
  }

  const stripe = getStripe();

  try {
    // 1. Reuse or create the Stripe Customer.
    let customerId = row.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: row.email,
        name: row.contact_name,
        phone: row.phone ?? undefined,
        metadata: {
          selestial_signup_id: row.id,
          selestial_business_name: row.business_name,
        },
      });
      customerId = customer.id;
    }

    // 2. Reuse the subscription if one already exists in a non-terminal state;
    //    otherwise create a new incomplete subscription.
    let subscription: Stripe.Subscription;
    if (row.stripe_subscription_id) {
      subscription = await stripe.subscriptions.retrieve(row.stripe_subscription_id, {
        expand: ['latest_invoice.confirmation_secret'],
      });
      // If retrieve found something terminal, fall through to create a new one.
      if (['canceled', 'incomplete_expired'].includes(subscription.status)) {
        subscription = await createSelestialSubscription(stripe, customerId, priceId, row.id);
      }
    } else {
      subscription = await createSelestialSubscription(stripe, customerId, priceId, row.id);
    }

    // 3. Pull the PaymentIntent client_secret off the latest invoice.
    //
    // IMPORTANT (Stripe 2025-12-15.clover billing rebuild): the legacy
    // `invoice.payment_intent` field was removed. The client_secret now
    // lives at `invoice.confirmation_secret.client_secret`, and the
    // PaymentIntent id is the prefix of that secret (`pi_xxx_secret_...`).
    // We retrieve the invoice with the new expand path and parse out
    // both values directly.
    const latestInvoice = subscription.latest_invoice;
    const invoice =
      typeof latestInvoice === 'string'
        ? await stripe.invoices.retrieve(latestInvoice, {
            expand: ['confirmation_secret'],
          })
        : latestInvoice;

    if (!invoice) {
      return NextResponse.json(
        { error: 'Stripe did not return an invoice for the subscription.' },
        { status: 502 }
      );
    }

    const confirmationSecret = (
      invoice as Stripe.Invoice & {
        confirmation_secret?: { client_secret?: string; type?: string } | null;
      }
    ).confirmation_secret;

    const clientSecret = confirmationSecret?.client_secret ?? null;
    if (!clientSecret) {
      return NextResponse.json(
        { error: 'Stripe did not return a payment client secret.' },
        { status: 502 }
      );
    }

    // PaymentIntent id is the part before `_secret_` in the client secret.
    const paymentIntentId = clientSecret.split('_secret_')[0];

    // 4. Persist the Stripe ids back onto the signup.
    await supabase
      .from('onboarding_signups')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        stripe_payment_intent_id: paymentIntentId,
        payment_status: 'requires_payment',
      })
      .eq('id', row.id);

    return NextResponse.json({
      clientSecret,
      subscriptionId: subscription.id,
      customerId,
      // Invoice amount_due is set on creation for default_incomplete subs;
      // it equals the recurring price's unit_amount for a fresh sub. Falls
      // back to `total` if Stripe ever drops `amount_due` from this shape.
      amount: invoice.amount_due ?? invoice.total ?? 0,
      currency: invoice.currency,
    });
  } catch (err) {
    console.error('[create-subscription] stripe error:', err);
    const message =
      err instanceof Error ? err.message : 'Stripe rejected the subscription request.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

async function createSelestialSubscription(
  stripe: Stripe,
  customerId: string,
  priceId: string,
  signupId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    // 2025-12-15.clover: confirmation_secret replaces the legacy
    // payment_intent expansion path on invoices.
    expand: ['latest_invoice.confirmation_secret'],
    metadata: { selestial_signup_id: signupId },
  });
}
