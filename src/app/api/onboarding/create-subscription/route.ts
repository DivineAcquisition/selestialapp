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

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      {
        error:
          'Stripe Price is not configured. Set STRIPE_PRICE_ID in env to a recurring price id.',
      },
      { status: 409 }
    );
  }

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
        expand: ['latest_invoice.payment_intent'],
      });
      // If retrieve found something terminal, fall through to create a new one.
      if (['canceled', 'incomplete_expired'].includes(subscription.status)) {
        subscription = await createSelestialSubscription(stripe, customerId, priceId, row.id);
      }
    } else {
      subscription = await createSelestialSubscription(stripe, customerId, priceId, row.id);
    }

    // 3. Pull the PaymentIntent client_secret off the latest invoice.
    const latestInvoice = subscription.latest_invoice;
    const invoice =
      typeof latestInvoice === 'string'
        ? await stripe.invoices.retrieve(latestInvoice, { expand: ['payment_intent'] })
        : latestInvoice;

    if (!invoice) {
      return NextResponse.json(
        { error: 'Stripe did not return an invoice for the subscription.' },
        { status: 502 }
      );
    }

    const pi = (invoice as Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent | string })
      .payment_intent;
    const paymentIntent =
      typeof pi === 'string' ? await stripe.paymentIntents.retrieve(pi) : pi;

    if (!paymentIntent || !paymentIntent.client_secret) {
      return NextResponse.json(
        { error: 'Stripe did not return a payment client secret.' },
        { status: 502 }
      );
    }

    // 4. Persist the Stripe ids back onto the signup.
    await supabase
      .from('onboarding_signups')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'requires_payment',
      })
      .eq('id', row.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
      customerId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
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
    expand: ['latest_invoice.payment_intent'],
    metadata: { selestial_signup_id: signupId },
  });
}
