import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from "https://esm.sh/stripe@18.5.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const STARTER_PRICE_ID = Deno.env.get('STRIPE_STARTER_PRICE_ID')!;
const GROWTH_PRICE_ID = Deno.env.get('STRIPE_GROWTH_PRICE_ID')!;
const APP_URL = Deno.env.get('APP_URL') || 'https://app.selestial.io';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      logStep('No signature provided');
      return new Response('No signature', { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : String(err);
      logStep('Signature verification failed', { error: errMessage });
      return new Response(`Webhook signature verification failed: ${errMessage}`, { status: 400 });
    }

    logStep('Webhook received', { type: event.type, id: event.id });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const businessId = session.metadata?.business_id;

        if (businessId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items?.data[0]?.price?.id;
          const plan = priceId === GROWTH_PRICE_ID ? 'growth' : 'starter';

          logStep('Updating business from checkout', { businessId, plan, status: subscription.status });

          await supabase
            .from('businesses')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: subscription.status,
              subscription_plan: plan,
              trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              quotes_limit: plan === 'growth' ? null : 50,
              sequences_limit: plan === 'growth' ? null : 3,
            })
            .eq('id', businessId);

          await supabase
            .from('billing_events')
            .insert({
              business_id: businessId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              event_type: 'checkout_completed',
              stripe_event_id: event.id,
              stripe_event_type: event.type,
              event_data: { plan, status: subscription.status },
            });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const customerId = subscription.customer as string;
        const priceId = subscription.items?.data[0]?.price?.id;
        const plan = priceId === GROWTH_PRICE_ID ? 'growth' : 'starter';

        const { data: business } = await supabase
          .from('businesses')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (business) {
          logStep('Updating subscription', { businessId: business.id, plan, status: subscription.status });

          await supabase
            .from('businesses')
            .update({
              subscription_status: subscription.status,
              subscription_plan: plan,
              trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              quotes_limit: plan === 'growth' ? null : 50,
              sequences_limit: plan === 'growth' ? null : 3,
            })
            .eq('id', business.id);

          await supabase
            .from('billing_events')
            .insert({
              business_id: business.id,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              event_type: 'subscription_updated',
              stripe_event_id: event.id,
              stripe_event_type: event.type,
              event_data: { plan, status: subscription.status },
            });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        const { data: business } = await supabase
          .from('businesses')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (business) {
          logStep('Subscription deleted', { businessId: business.id });

          await supabase
            .from('businesses')
            .update({
              subscription_status: 'canceled',
              stripe_subscription_id: null,
              current_period_end: null,
              cancel_at_period_end: false,
            })
            .eq('id', business.id);

          await supabase
            .from('billing_events')
            .insert({
              business_id: business.id,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscriptionId,
              event_type: 'subscription_canceled',
              stripe_event_id: event.id,
              stripe_event_type: event.type,
            });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const { data: business } = await supabase
            .from('businesses')
            .select('id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (business) {
            logStep('Payment succeeded', { businessId: business.id });

            await supabase
              .from('businesses')
              .update({ subscription_status: 'active' })
              .eq('id', business.id);

            await supabase
              .from('billing_events')
              .insert({
                business_id: business.id,
                stripe_customer_id: invoice.customer as string,
                stripe_subscription_id: subscriptionId,
                event_type: 'payment_succeeded',
                stripe_event_id: event.id,
                stripe_event_type: event.type,
                event_data: { amount: invoice.amount_paid },
              });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const { data: business } = await supabase
            .from('businesses')
            .select('id, email, owner_name')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (business) {
            logStep('Payment failed', { businessId: business.id });

            await supabase
              .from('businesses')
              .update({ subscription_status: 'past_due' })
              .eq('id', business.id);

            await supabase
              .from('billing_events')
              .insert({
                business_id: business.id,
                stripe_customer_id: invoice.customer as string,
                stripe_subscription_id: subscriptionId,
                event_type: 'payment_failed',
                stripe_event_id: event.id,
                stripe_event_type: event.type,
              });

            // Send email notification
            try {
              await supabase.functions.invoke('send-email', {
                body: {
                  type: 'payment_failed',
                  to: business.email,
                  data: {
                    userName: business.owner_name,
                    updatePaymentUrl: `${APP_URL}/settings?tab=billing`,
                  },
                },
              });
            } catch (e) {
              console.error('Failed to send payment failed email:', e);
            }
          }
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        const { data: business } = await supabase
          .from('businesses')
          .select('id, email, owner_name')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (business && subscription.trial_end) {
          logStep('Trial ending soon', { businessId: business.id });

          try {
            await supabase.functions.invoke('send-email', {
              body: {
                type: 'trial_ending',
                to: business.email,
                data: {
                  userName: business.owner_name,
                  trialEndDate: new Date(subscription.trial_end * 1000).toLocaleDateString(),
                  billingUrl: `${APP_URL}/settings?tab=billing`,
                },
              },
            });
          } catch (e) {
            console.error('Failed to send trial ending email:', e);
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Webhook error:', errorMessage);
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});
