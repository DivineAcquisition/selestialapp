import Stripe from "https://esm.sh/stripe@18.5.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: "2025-08-27.basil",
});

const PLATFORM_FEE_PERCENT = parseFloat(Deno.env.get('STRIPE_PLATFORM_FEE_PERCENT') || '2.5');
const APP_URL = Deno.env.get('APP_URL') || 'https://selestial.app';

// ============================================
// ACCOUNT MANAGEMENT
// ============================================

export async function createConnectAccount(
  businessId: string,
  email: string,
  businessName: string,
  country: string = 'US'
): Promise<{ accountId: string; accountLink: string }> {
  const account = await stripe.accounts.create({
    type: 'express',
    country,
    email,
    business_type: 'company',
    company: {
      name: businessName,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      business_id: businessId,
    },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${APP_URL}/settings?tab=payments&refresh=true`,
    return_url: `${APP_URL}/settings?tab=payments&success=true`,
    type: 'account_onboarding',
  });

  return {
    accountId: account.id,
    accountLink: accountLink.url,
  };
}

export async function createAccountLink(
  stripeAccountId: string,
  type: 'account_onboarding' | 'account_update' = 'account_onboarding'
): Promise<string> {
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${APP_URL}/settings?tab=payments&refresh=true`,
    return_url: `${APP_URL}/settings?tab=payments&success=true`,
    type,
  });

  return accountLink.url;
}

export async function createLoginLink(stripeAccountId: string): Promise<string> {
  const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
  return loginLink.url;
}

export async function getAccount(stripeAccountId: string): Promise<Stripe.Account> {
  return stripe.accounts.retrieve(stripeAccountId);
}

export async function deleteAccount(stripeAccountId: string): Promise<void> {
  await stripe.accounts.del(stripeAccountId);
}

// ============================================
// CHECKOUT SESSIONS
// ============================================

export interface CreateCheckoutParams {
  stripeAccountId: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  description: string;
  quoteId: string;
  businessId: string;
  businessName: string;
  successUrl: string;
  cancelUrl: string;
  collectAddress?: boolean;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<{ sessionId: string; url: string }> {
  const platformFee = Math.round(params.amount * (PLATFORM_FEE_PERCENT / 100));

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: params.currency || 'usd',
          unit_amount: params.amount,
          product_data: {
            name: params.description,
            description: `Payment to ${params.businessName}`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: params.stripeAccountId,
      },
      metadata: {
        quote_id: params.quoteId,
        business_id: params.businessId,
      },
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: {
      quote_id: params.quoteId,
      business_id: params.businessId,
      platform: 'selestial',
      ...params.metadata,
    },
  };

  if (params.collectAddress) {
    sessionParams.billing_address_collection = 'required';
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return {
    sessionId: session.id,
    url: session.url!,
  };
}

export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'payment_intent.charges'],
  });
}

// ============================================
// PAYMENT INTENTS
// ============================================

export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['charges', 'latest_charge'],
  });
}

export async function refundPayment(
  paymentIntentId: string,
  amount?: number,
  stripeAccountId?: string
): Promise<Stripe.Refund> {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };

  if (amount) {
    refundParams.amount = amount;
  }

  const options: Stripe.RequestOptions = {};
  if (stripeAccountId) {
    options.stripeAccount = stripeAccountId;
  }

  return stripe.refunds.create(refundParams, options);
}

// ============================================
// BALANCE & PAYOUTS
// ============================================

export async function getAccountBalance(stripeAccountId: string): Promise<Stripe.Balance> {
  return stripe.balance.retrieve({
    stripeAccount: stripeAccountId,
  });
}

export async function getPayouts(
  stripeAccountId: string,
  limit: number = 10
): Promise<Stripe.Payout[]> {
  const payouts = await stripe.payouts.list(
    { limit },
    { stripeAccount: stripeAccountId }
  );
  return payouts.data;
}

// ============================================
// WEBHOOK VERIFICATION
// ============================================

export function constructWebhookEvent(
  payload: string,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// ============================================
// UTILITIES
// ============================================

export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * (PLATFORM_FEE_PERCENT / 100));
}

export { stripe, PLATFORM_FEE_PERCENT };
