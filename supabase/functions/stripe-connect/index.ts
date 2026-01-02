import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  createConnectAccount,
  createAccountLink,
  createLoginLink,
  getAccount,
  getAccountBalance,
  getPayouts,
} from '../_shared/stripe-connect.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const logStep = (step: string, details?: Record<string, unknown>) => {
    console.log(`[STRIPE-CONNECT] ${step}`, details ? JSON.stringify(details) : '');
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
      logStep('Auth failed', { error: authError?.message });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (bizError || !business) {
      return new Response(JSON.stringify({ error: 'Business not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action } = await req.json();
    logStep('Processing action', { action, businessId: business.id });

    switch (action) {
      case 'create-account': {
        const { data: existing } = await supabase
          .from('stripe_connected_accounts')
          .select('*')
          .eq('business_id', business.id)
          .single();

        if (existing?.charges_enabled) {
          return new Response(JSON.stringify({
            success: true,
            already_connected: true,
            account_id: existing.stripe_account_id,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let accountId = existing?.stripe_account_id;
        let onboardingUrl: string;

        if (accountId) {
          onboardingUrl = await createAccountLink(accountId);
        } else {
          const result = await createConnectAccount(
            business.id,
            business.email,
            business.name
          );
          accountId = result.accountId;
          onboardingUrl = result.accountLink;

          await supabase
            .from('stripe_connected_accounts')
            .insert({
              business_id: business.id,
              stripe_account_id: accountId,
              status: 'pending',
            });

          await supabase
            .from('businesses')
            .update({ stripe_connect_account_id: accountId })
            .eq('id', business.id);
        }

        logStep('Account created/resumed', { accountId });

        return new Response(JSON.stringify({
          success: true,
          account_id: accountId,
          onboarding_url: onboardingUrl,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-status': {
        const { data: connectedAccount } = await supabase
          .from('stripe_connected_accounts')
          .select('*')
          .eq('business_id', business.id)
          .single();

        if (!connectedAccount) {
          return new Response(JSON.stringify({
            success: true,
            connected: false,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          const account = await getAccount(connectedAccount.stripe_account_id);
          
          await supabase
            .from('stripe_connected_accounts')
            .update({
              charges_enabled: account.charges_enabled,
              payouts_enabled: account.payouts_enabled,
              details_submitted: account.details_submitted,
              status: account.charges_enabled ? 'active' : 'pending',
              requirements_due: account.requirements?.currently_due || [],
              requirements_past_due: account.requirements?.past_due || [],
              default_currency: account.default_currency,
              country: account.country,
              last_webhook_at: new Date().toISOString(),
            })
            .eq('id', connectedAccount.id);

          await supabase
            .from('businesses')
            .update({
              stripe_connect_enabled: account.charges_enabled,
              accept_online_payments: account.charges_enabled,
            })
            .eq('id', business.id);

          return new Response(JSON.stringify({
            success: true,
            connected: true,
            account_id: connectedAccount.stripe_account_id,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            requirements_due: account.requirements?.currently_due || [],
            requirements_past_due: account.requirements?.past_due || [],
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (stripeError) {
          return new Response(JSON.stringify({
            success: true,
            connected: true,
            account_id: connectedAccount.stripe_account_id,
            ...connectedAccount,
            stripe_error: stripeError instanceof Error ? stripeError.message : 'Unknown error',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'dashboard-link': {
        const { data: connectedAccount } = await supabase
          .from('stripe_connected_accounts')
          .select('stripe_account_id')
          .eq('business_id', business.id)
          .single();

        if (!connectedAccount) {
          return new Response(JSON.stringify({ error: 'Not connected' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const loginUrl = await createLoginLink(connectedAccount.stripe_account_id);

        return new Response(JSON.stringify({
          success: true,
          url: loginUrl,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'resume-onboarding': {
        const { data: connectedAccount } = await supabase
          .from('stripe_connected_accounts')
          .select('stripe_account_id')
          .eq('business_id', business.id)
          .single();

        if (!connectedAccount) {
          return new Response(JSON.stringify({ error: 'Not connected' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const onboardingUrl = await createAccountLink(
          connectedAccount.stripe_account_id,
          'account_onboarding'
        );

        return new Response(JSON.stringify({
          success: true,
          url: onboardingUrl,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-balance': {
        const { data: connectedAccount } = await supabase
          .from('stripe_connected_accounts')
          .select('stripe_account_id, charges_enabled')
          .eq('business_id', business.id)
          .single();

        if (!connectedAccount?.charges_enabled) {
          return new Response(JSON.stringify({ error: 'Payments not enabled' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const balance = await getAccountBalance(connectedAccount.stripe_account_id);
        const payouts = await getPayouts(connectedAccount.stripe_account_id, 5);

        return new Response(JSON.stringify({
          success: true,
          balance: {
            available: balance.available,
            pending: balance.pending,
          },
          recent_payouts: payouts.map(p => ({
            id: p.id,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            arrival_date: p.arrival_date,
            created: p.created,
          })),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'disconnect': {
        const { data: connectedAccount } = await supabase
          .from('stripe_connected_accounts')
          .select('stripe_account_id')
          .eq('business_id', business.id)
          .single();

        if (connectedAccount) {
          await supabase
            .from('stripe_connected_accounts')
            .delete()
            .eq('business_id', business.id);

          await supabase
            .from('businesses')
            .update({
              stripe_connect_enabled: false,
              stripe_connect_account_id: null,
              accept_online_payments: false,
            })
            .eq('id', business.id);
        }

        return new Response(JSON.stringify({
          success: true,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Stripe Connect error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
