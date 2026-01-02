import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createCheckoutSession, calculatePlatformFee } from '../_shared/stripe-connect.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'https://selestial.app';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentLinkRequest {
  quoteId: string;
  amount?: number;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const logStep = (step: string, details?: Record<string, unknown>) => {
    console.log(`[CREATE-PAYMENT-LINK] ${step}`, details ? JSON.stringify(details) : '');
  };

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const authHeader = req.headers.get('Authorization')?.split(' ')[1];
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { quoteId, amount, description }: CreatePaymentLinkRequest = await req.json();

    if (!quoteId) {
      return new Response(JSON.stringify({ error: 'Quote ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep('Creating payment link', { quoteId });

    // Get quote with business
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      return new Response(JSON.stringify({ error: 'Quote not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', quote.business_id)
      .single();

    if (!business) {
      return new Response(JSON.stringify({ error: 'Business not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify ownership
    const { data: userBusiness } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (userBusiness?.id !== quote.business_id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if payments enabled
    if (!business.accept_online_payments || !business.stripe_connect_account_id) {
      return new Response(JSON.stringify({ error: 'Online payments not enabled' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get connected account status
    const { data: connectedAccount } = await supabase
      .from('stripe_connected_accounts')
      .select('*')
      .eq('business_id', quote.business_id)
      .single();

    if (!connectedAccount?.charges_enabled) {
      return new Response(JSON.stringify({ error: 'Stripe account not ready' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate amount
    const paymentAmount = amount || quote.quote_amount;
    const platformFee = calculatePlatformFee(paymentAmount);

    logStep('Creating checkout session', { paymentAmount, platformFee });

    // Create checkout session
    const { sessionId, url } = await createCheckoutSession({
      stripeAccountId: connectedAccount.stripe_account_id,
      amount: paymentAmount,
      customerEmail: quote.customer_email || undefined,
      customerName: quote.customer_name,
      description: description || `${quote.service_type || 'Service'} - ${quote.customer_name}`,
      quoteId: quote.id,
      businessId: quote.business_id,
      businessName: business.name,
      successUrl: `${APP_URL}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${APP_URL}/pay/cancelled?quote_id=${quote.id}`,
      metadata: {
        customer_phone: quote.customer_phone,
      },
    });

    // Create payment record
    const { data: payment } = await supabase
      .from('payments')
      .insert({
        business_id: quote.business_id,
        quote_id: quote.id,
        customer_id: quote.customer_id,
        stripe_account_id: connectedAccount.stripe_account_id,
        stripe_checkout_session_id: sessionId,
        amount: paymentAmount,
        platform_fee: platformFee,
        net_amount: paymentAmount - platformFee,
        status: 'pending',
        customer_email: quote.customer_email,
        customer_name: quote.customer_name,
        description: description || quote.service_type,
      })
      .select()
      .single();

    // Create payment link record
    await supabase
      .from('payment_links')
      .insert({
        business_id: quote.business_id,
        quote_id: quote.id,
        stripe_checkout_url: url,
        amount: paymentAmount,
        description: quote.service_type,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

    // Update quote
    await supabase
      .from('quotes')
      .update({
        payment_link_url: url,
        payment_id: payment?.id,
        payment_status: 'pending',
      })
      .eq('id', quote.id);

    logStep('Payment link created', { sessionId, paymentId: payment?.id });

    return new Response(JSON.stringify({
      success: true,
      payment_url: url,
      session_id: sessionId,
      payment_id: payment?.id,
      amount: paymentAmount,
      platform_fee: platformFee,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Create payment link error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
