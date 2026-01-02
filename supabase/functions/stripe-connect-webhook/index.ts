import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { constructWebhookEvent, getCheckoutSession } from '../_shared/stripe-connect.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_CONNECT_WEBHOOK_SECRET = Deno.env.get('STRIPE_CONNECT_WEBHOOK_SECRET') || '';

serve(async (req) => {
  const logStep = (step: string, details?: Record<string, unknown>) => {
    console.log(`[STRIPE-CONNECT-WEBHOOK] ${step}`, details ? JSON.stringify(details) : '');
  };

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    const body = await req.text();
    
    let event;
    try {
      event = constructWebhookEvent(body, signature, STRIPE_CONNECT_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    logStep('Processing webhook', { type: event.type });

    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as any;
        
        await supabase
          .from('stripe_connected_accounts')
          .update({
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            status: account.charges_enabled ? 'active' : 'pending',
            requirements_due: account.requirements?.currently_due || [],
            requirements_past_due: account.requirements?.past_due || [],
            onboarded_at: account.charges_enabled ? new Date().toISOString() : null,
            last_webhook_at: new Date().toISOString(),
          })
          .eq('stripe_account_id', account.id);

        const { data: connectedAccount } = await supabase
          .from('stripe_connected_accounts')
          .select('business_id')
          .eq('stripe_account_id', account.id)
          .single();

        if (connectedAccount) {
          await supabase
            .from('businesses')
            .update({
              stripe_connect_enabled: account.charges_enabled,
              accept_online_payments: account.charges_enabled,
            })
            .eq('id', connectedAccount.business_id);
        }
        
        logStep('Account updated', { accountId: account.id, chargesEnabled: account.charges_enabled });
        break;
      }

      case 'account.application.deauthorized': {
        const account = event.data.object as any;
        
        await supabase
          .from('stripe_connected_accounts')
          .update({
            status: 'disabled',
            charges_enabled: false,
            payouts_enabled: false,
          })
          .eq('stripe_account_id', account.id);

        const { data: connectedAccount } = await supabase
          .from('stripe_connected_accounts')
          .select('business_id')
          .eq('stripe_account_id', account.id)
          .single();

        if (connectedAccount) {
          await supabase
            .from('businesses')
            .update({
              stripe_connect_enabled: false,
              accept_online_payments: false,
            })
            .eq('id', connectedAccount.business_id);
        }
        
        logStep('Account deauthorized', { accountId: account.id });
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        if (session.payment_status === 'paid') {
          const fullSession = await getCheckoutSession(session.id);
          
          const quoteId = session.metadata?.quote_id;
          const businessId = session.metadata?.business_id;
          
          if (!quoteId || !businessId) {
            logStep('No quote_id or business_id in metadata');
            break;
          }

          const receiptUrl = (fullSession.payment_intent as any)?.charges?.data?.[0]?.receipt_url;

          await supabase
            .from('payments')
            .update({
              status: 'succeeded',
              stripe_payment_intent_id: session.payment_intent,
              customer_email: session.customer_details?.email,
              customer_name: session.customer_details?.name,
              paid_at: new Date().toISOString(),
              receipt_url: receiptUrl,
            })
            .eq('stripe_checkout_session_id', session.id);

          await supabase
            .from('quotes')
            .update({
              payment_status: 'paid',
              paid_amount: session.amount_total,
              paid_at: new Date().toISOString(),
            })
            .eq('id', quoteId);

          await supabase
            .from('payment_links')
            .update({ status: 'completed' })
            .eq('quote_id', quoteId);

          logStep('Checkout completed', { quoteId, amount: session.amount_total });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        
        await supabase
          .from('payments')
          .update({
            status: 'succeeded',
            payment_method_type: paymentIntent.payment_method_types?.[0],
            paid_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        
        logStep('Payment intent succeeded', { paymentIntentId: paymentIntent.id });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            failure_code: paymentIntent.last_payment_error?.code,
            failure_message: paymentIntent.last_payment_error?.message,
            failed_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        const { data: payment } = await supabase
          .from('payments')
          .select('quote_id')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (payment?.quote_id) {
          await supabase
            .from('quotes')
            .update({ payment_status: 'unpaid' })
            .eq('id', payment.quote_id);
        }
        
        logStep('Payment failed', { paymentIntentId: paymentIntent.id });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as any;
        
        await supabase
          .from('payments')
          .update({
            status: charge.amount_refunded === charge.amount ? 'refunded' : 'partially_refunded',
            refunded_at: new Date().toISOString(),
          })
          .eq('stripe_charge_id', charge.id);

        const { data: payment } = await supabase
          .from('payments')
          .select('quote_id')
          .eq('stripe_charge_id', charge.id)
          .single();

        if (payment?.quote_id) {
          await supabase
            .from('quotes')
            .update({
              payment_status: charge.amount_refunded === charge.amount ? 'refunded' : 'partially_paid',
            })
            .eq('id', payment.quote_id);
        }
        
        logStep('Charge refunded', { chargeId: charge.id });
        break;
      }

      default:
        logStep('Unhandled event type', { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook handler failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
