import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  stripe,
  createCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscription,
  resumeSubscription,
  updateSubscription,
} from '../_shared/stripe.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'https://app.selestial.io';
const STARTER_PRICE_ID = Deno.env.get('STRIPE_STARTER_PRICE_ID')!;
const GROWTH_PRICE_ID = Deno.env.get('STRIPE_GROWTH_PRICE_ID')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BILLING] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    logStep('User authenticated', { userId: user.id });

    // Get business
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (bizError || !business) {
      throw new Error('Business not found');
    }
    logStep('Business found', { businessId: business.id });

    const { action, ...params } = await req.json();
    logStep('Action received', { action });

    switch (action) {
      case 'create-checkout': {
        const { plan } = params;
        const priceId = plan === 'growth' ? GROWTH_PRICE_ID : STARTER_PRICE_ID;
        logStep('Creating checkout', { plan, priceId });

        // Create or get Stripe customer
        let customerId = business.stripe_customer_id;

        if (!customerId) {
          const customer = await createCustomer(
            business.email,
            business.owner_name,
            { business_id: business.id }
          );
          customerId = customer.id;
          logStep('Created Stripe customer', { customerId });

          // Save customer ID
          await supabase
            .from('businesses')
            .update({ stripe_customer_id: customerId })
            .eq('id', business.id);
        }

        // Calculate trial days remaining
        let trialDays = 0;
        if (business.trial_ends_at) {
          const trialEnd = new Date(business.trial_ends_at);
          const now = new Date();
          trialDays = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }
        logStep('Trial days calculated', { trialDays });

        // Create checkout session
        const session = await createCheckoutSession({
          customerId,
          priceId,
          successUrl: `${APP_URL}/settings?tab=billing&success=true`,
          cancelUrl: `${APP_URL}/settings?tab=billing&canceled=true`,
          trialDays: trialDays > 0 ? trialDays : undefined,
          metadata: {
            business_id: business.id,
            plan,
          },
        });
        logStep('Checkout session created', { sessionId: session.id });

        return new Response(JSON.stringify({
          success: true,
          url: session.url
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create-portal': {
        if (!business.stripe_customer_id) {
          throw new Error('No billing account found');
        }

        const session = await createBillingPortalSession(
          business.stripe_customer_id,
          `${APP_URL}/settings?tab=billing`
        );
        logStep('Portal session created', { sessionId: session.id });

        return new Response(JSON.stringify({
          success: true,
          url: session.url
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'cancel': {
        if (!business.stripe_subscription_id) {
          throw new Error('No active subscription');
        }

        await cancelSubscription(business.stripe_subscription_id, true);
        logStep('Subscription cancelled');

        // Update local status
        await supabase
          .from('businesses')
          .update({ cancel_at_period_end: true })
          .eq('id', business.id);

        // Log event
        await supabase
          .from('billing_events')
          .insert({
            business_id: business.id,
            stripe_customer_id: business.stripe_customer_id,
            stripe_subscription_id: business.stripe_subscription_id,
            event_type: 'subscription_cancel_scheduled',
          });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'resume': {
        if (!business.stripe_subscription_id) {
          throw new Error('No subscription to resume');
        }

        await resumeSubscription(business.stripe_subscription_id);
        logStep('Subscription resumed');

        // Update local status
        await supabase
          .from('businesses')
          .update({ cancel_at_period_end: false })
          .eq('id', business.id);

        // Log event
        await supabase
          .from('billing_events')
          .insert({
            business_id: business.id,
            stripe_customer_id: business.stripe_customer_id,
            stripe_subscription_id: business.stripe_subscription_id,
            event_type: 'subscription_resumed',
          });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'upgrade': {
        if (!business.stripe_subscription_id) {
          // No subscription yet, redirect to checkout
          if (!business.stripe_customer_id) {
            const customer = await createCustomer(
              business.email,
              business.owner_name,
              { business_id: business.id }
            );
            
            await supabase
              .from('businesses')
              .update({ stripe_customer_id: customer.id })
              .eq('id', business.id);
            
            business.stripe_customer_id = customer.id;
          }

          const session = await createCheckoutSession({
            customerId: business.stripe_customer_id,
            priceId: GROWTH_PRICE_ID,
            successUrl: `${APP_URL}/settings?tab=billing&success=true`,
            cancelUrl: `${APP_URL}/settings?tab=billing&canceled=true`,
            metadata: {
              business_id: business.id,
              plan: 'growth',
            },
          });
          logStep('Upgrade checkout created', { sessionId: session.id });

          return new Response(JSON.stringify({
            success: true,
            url: session.url
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update existing subscription
        await updateSubscription(business.stripe_subscription_id, GROWTH_PRICE_ID);
        logStep('Subscription upgraded to Growth');

        // Update local status
        await supabase
          .from('businesses')
          .update({
            subscription_plan: 'growth',
            quotes_limit: null,
            sequences_limit: null,
          })
          .eq('id', business.id);

        // Log event
        await supabase
          .from('billing_events')
          .insert({
            business_id: business.id,
            stripe_customer_id: business.stripe_customer_id,
            stripe_subscription_id: business.stripe_subscription_id,
            event_type: 'subscription_upgraded',
            event_data: { plan: 'growth' },
          });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'status': {
        return new Response(JSON.stringify({
          success: true,
          billing: {
            status: business.subscription_status,
            plan: business.subscription_plan,
            trialEndsAt: business.trial_ends_at,
            currentPeriodEnd: business.current_period_end,
            cancelAtPeriodEnd: business.cancel_at_period_end,
            quotesLimit: business.quotes_limit,
            sequencesLimit: business.sequences_limit,
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Billing error:', errorMessage);

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
