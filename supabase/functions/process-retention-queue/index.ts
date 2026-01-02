import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendSMS(to: string, from: string, body: string, statusCallback?: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append('To', to);
  formData.append('From', from);
  formData.append('Body', body);
  if (statusCallback) {
    formData.append('StatusCallback', statusCallback);
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: data.message || 'SMS failed' };
  }
  
  return { success: true, data };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date().toISOString();
    const batchSize = 50;
    
    // Get pending retention messages
    const { data: messages, error: fetchError } = await supabase
      .from('retention_queue')
      .select(`
        *,
        customers!inner(name, phone, email),
        businesses!inner(subscription_status, twilio_phone_number)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(batchSize);
    
    if (fetchError) throw fetchError;
    
    if (!messages || messages.length === 0) {
      console.log('No pending retention messages');
      return new Response(JSON.stringify({
        success: true,
        ...results,
        duration_ms: Date.now() - startTime,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Processing ${messages.length} retention messages`);
    results.processed = messages.length;
    
    for (const message of messages) {
      try {
        // Check business subscription
        if (!['active', 'trialing'].includes(message.businesses.subscription_status)) {
          console.log(`Skipping message ${message.id}: subscription inactive`);
          await supabase
            .from('retention_queue')
            .update({ status: 'cancelled', error_message: 'Subscription inactive' })
            .eq('id', message.id);
          continue;
        }
        
        // Mark as processing
        await supabase
          .from('retention_queue')
          .update({ status: 'processing', attempts: message.attempts + 1 })
          .eq('id', message.id);
        
        const fromPhone = message.from_phone || message.businesses.twilio_phone_number;
        
        // Send based on channel
        if (message.channel === 'sms' && message.to_phone && fromPhone) {
          const statusCallback = `${SUPABASE_URL}/functions/v1/sms-status-webhook`;
          const smsResult = await sendSMS(
            message.to_phone,
            fromPhone,
            message.content,
            statusCallback
          );
          
          if (!smsResult.success) {
            throw new Error(smsResult.error);
          }
          
          console.log(`SMS sent to ${message.to_phone}, SID: ${smsResult.data?.sid}`);
          
          // Update as sent
          await supabase
            .from('retention_queue')
            .update({
              status: 'sent',
              sent_at: now,
              external_id: smsResult.data?.sid,
            })
            .eq('id', message.id);
          
          // Create retention message record
          await supabase
            .from('retention_messages')
            .insert({
              business_id: message.business_id,
              customer_id: message.customer_id,
              quote_id: message.quote_id,
              sequence_id: message.sequence_id,
              trigger_type: message.trigger_type,
              step_index: message.step_index,
              channel: message.channel,
              content: message.content,
              status: 'sent',
              sent_at: now,
            });
          
          // Update sequence stats
          if (message.sequence_id) {
            try {
              await supabase
                .from('retention_sequences')
                .update({ total_sent: (message as any).retention_sequences?.total_sent + 1 || 1 })
                .eq('id', message.sequence_id);
            } catch (e) {
              // Ignore stats update errors
            }
          }
          
          // Update review request if applicable
          if (message.metadata?.review_request_id) {
            await supabase
              .from('review_requests')
              .update({ 
                status: 'sent',
                sent_at: now,
                sent_via: 'sms',
              })
              .eq('id', message.metadata.review_request_id);
          }
          
          // Update customer last_contact_at
          await supabase
            .from('customers')
            .update({ last_contact_at: now })
            .eq('id', message.customer_id);
          
          // Log activity
          await supabase
            .from('activity_logs')
            .insert({
              business_id: message.business_id,
              action: message.trigger_type === 'review_request' ? 'review_request_sent' : 'retention_sent',
              description: `${message.trigger_type === 'review_request' ? 'Review request' : 'Retention message'} sent to ${message.customers.name}`,
              quote_id: message.quote_id,
            });
          
          results.sent++;
          
        } else {
          throw new Error(`Invalid channel or missing phone: channel=${message.channel}, to=${message.to_phone}, from=${fromPhone}`);
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to process message ${message.id}:`, errorMessage);
        results.errors.push(`${message.id}: ${errorMessage}`);
        
        await supabase
          .from('retention_queue')
          .update({
            status: 'failed',
            error_message: errorMessage,
          })
          .eq('id', message.id);
        
        results.failed++;
      }
    }
    
    console.log(`Retention queue processed: ${results.sent} sent, ${results.failed} failed`);
    
    return new Response(JSON.stringify({
      success: true,
      ...results,
      duration_ms: Date.now() - startTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Process retention queue error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...results,
      duration_ms: Date.now() - startTime,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
