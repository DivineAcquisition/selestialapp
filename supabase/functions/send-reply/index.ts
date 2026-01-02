import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendSMS } from '../_shared/twilio.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { to, from, content, quoteId, businessId } = await req.json();
    
    if (!to || !from || !content || !quoteId || !businessId) {
      throw new Error('Missing required fields: to, from, content, quoteId, businessId');
    }
    
    console.log(`Sending reply SMS from ${from} to ${to}`);
    
    // Verify business subscription is active
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('subscription_status')
      .eq('id', businessId)
      .single();
    
    if (bizError || !business) {
      throw new Error('Business not found');
    }
    
    if (!['active', 'trialing'].includes(business.subscription_status)) {
      throw new Error('Subscription inactive');
    }
    
    // Send SMS via Twilio
    const statusCallback = `${SUPABASE_URL}/functions/v1/sms-status-webhook`;
    
    const result = await sendSMS(to, from, content, statusCallback);
    
    if (!result.success) {
      console.error(`SMS send failed: ${result.error}`);
      throw new Error(result.error);
    }
    
    // Record the message in the database
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        quote_id: quoteId,
        business_id: businessId,
        channel: 'sms',
        to_address: to,
        from_address: from,
        content: content,
        status: 'sent',
        sent_at: new Date().toISOString(),
        external_id: result.data!.sid,
      });
    
    if (insertError) {
      console.error('Failed to record message:', insertError);
      // Don't fail the request, SMS was sent successfully
    }
    
    // Log activity
    await supabase.rpc('log_activity', {
      p_business_id: businessId,
      p_action: 'reply_sent',
      p_description: `Reply sent to customer`,
      p_quote_id: quoteId,
    });
    
    console.log(`Reply SMS sent successfully: ${result.data!.sid}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      messageSid: result.data!.sid 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Send reply error:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
