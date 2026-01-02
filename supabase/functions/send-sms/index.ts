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
    
    const { queueId } = await req.json();
    
    if (!queueId) {
      throw new Error('Queue ID required');
    }
    
    console.log(`Processing message queue: ${queueId}`);
    
    const { data: message, error: fetchError } = await supabase
      .from('message_queue')
      .select('*')
      .eq('id', queueId)
      .single();
    
    if (fetchError || !message) {
      throw new Error('Message not found');
    }
    
    if (message.status !== 'pending' && message.status !== 'processing') {
      throw new Error(`Invalid message status: ${message.status}`);
    }
    
    await supabase
      .from('message_queue')
      .update({ 
        status: 'processing',
        attempts: message.attempts + 1,
        last_attempt_at: new Date().toISOString(),
      })
      .eq('id', queueId);
    
    const statusCallback = `${SUPABASE_URL}/functions/v1/sms-status-webhook`;
    
    const result = await sendSMS(
      message.to_phone,
      message.from_phone,
      message.content,
      statusCallback
    );
    
    if (!result.success) {
      const shouldRetry = message.attempts < message.max_attempts;
      
      await supabase
        .from('message_queue')
        .update({
          status: shouldRetry ? 'pending' : 'failed',
          error_message: result.error,
          next_retry_at: shouldRetry 
            ? new Date(Date.now() + Math.pow(2, message.attempts) * 60000).toISOString()
            : null,
        })
        .eq('id', queueId);
      
      console.error(`SMS send failed: ${result.error}`);
      throw new Error(result.error);
    }
    
    await supabase
      .from('message_queue')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        external_id: result.data!.sid,
      })
      .eq('id', queueId);
    
    await supabase
      .from('messages')
      .insert({
        quote_id: message.quote_id,
        business_id: message.business_id,
        sequence_id: message.sequence_id,
        step_id: message.metadata?.step_id,
        channel: message.channel,
        to_address: message.to_phone,
        from_address: message.from_phone,
        content: message.content,
        status: 'sent',
        sent_at: new Date().toISOString(),
        external_id: result.data!.sid,
      });
    
    await supabase.rpc('advance_to_next_step', {
      p_quote_id: message.quote_id,
    });
    
    console.log(`SMS sent successfully: ${result.data!.sid}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      messageSid: result.data!.sid 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Send SMS error:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
