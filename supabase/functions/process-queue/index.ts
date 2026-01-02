import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    
    const now = new Date().toISOString();
    const batchSize = 50;
    
    console.log(`Processing message queue at ${now}`);
    
    const { data: messages, error: fetchError } = await supabase
      .from('message_queue')
      .select('id, business_id, quote_id')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(batchSize);
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!messages || messages.length === 0) {
      console.log('No messages to process');
      return new Response(JSON.stringify({ 
        success: true, 
        processed: 0,
        message: 'No messages to process' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Processing ${messages.length} messages`);
    
    const results = await Promise.allSettled(
      messages.map(async (message) => {
        const response = await supabase.functions.invoke('send-sms', {
          body: { queueId: message.id },
        });
        
        return {
          id: message.id,
          success: !response.error,
          error: response.error?.message,
        };
      })
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.success).length;
    const failed = results.length - successful;
    
    const { data: retryMessages } = await supabase
      .from('message_queue')
      .select('id')
      .eq('status', 'pending')
      .not('next_retry_at', 'is', null)
      .lte('next_retry_at', now)
      .limit(batchSize);
    
    if (retryMessages && retryMessages.length > 0) {
      console.log(`Processing ${retryMessages.length} retry messages`);
      await Promise.allSettled(
        retryMessages.map(async (message) => {
          await supabase.functions.invoke('send-sms', {
            body: { queueId: message.id },
          });
        })
      );
    }
    
    console.log(`Processed: ${messages.length}, Successful: ${successful}, Failed: ${failed}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      processed: messages.length,
      successful,
      failed,
      retries: retryMessages?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Process queue error:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
