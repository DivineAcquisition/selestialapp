import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'https://app.selestial.io';

serve(async (req) => {
  try {
    const formData = await req.formData();
    
    const messageSid = formData.get('MessageSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    
    console.log(`Inbound SMS from ${from} to ${to}: ${body?.slice(0, 50)}...`);
    
    if (!from || !to || !body) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: phoneNumber } = await supabase
      .from('phone_numbers')
      .select('business_id')
      .eq('phone_number', to)
      .eq('status', 'active')
      .single();
    
    if (!phoneNumber) {
      console.error('No business found for phone number:', to);
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'application/xml' },
      });
    }
    
    const { data: quote } = await supabase
      .from('quotes')
      .select('id, customer_name, status')
      .eq('business_id', phoneNumber.business_id)
      .eq('customer_phone', from)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    await supabase
      .from('inbound_messages')
      .insert({
        business_id: phoneNumber.business_id,
        quote_id: quote?.id || null,
        from_phone: from,
        to_phone: to,
        content: body,
        external_id: messageSid,
      });
    
    if (quote && quote.status === 'active') {
      await supabase
        .from('quotes')
        .update({
          status: 'paused',
          status_changed_at: new Date().toISOString(),
          sequence_paused_at: new Date().toISOString(),
        })
        .eq('id', quote.id);
      
      await supabase
        .from('message_queue')
        .update({ status: 'cancelled' })
        .eq('quote_id', quote.id)
        .eq('status', 'pending');
      
      console.log(`Paused sequence for quote ${quote.id} due to customer reply`);
    }
    
    const { data: business } = await supabase
      .from('businesses')
      .select('owner_name, email, notify_sms_response')
      .eq('id', phoneNumber.business_id)
      .single();
    
    if (business?.notify_sms_response) {
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'customer_reply',
          to: business.email,
          data: {
            userName: business.owner_name,
            customerName: quote?.customer_name || 'A customer',
            customerPhone: from,
            message: body,
            dashboardUrl: `${APP_URL}/quotes${quote ? `?id=${quote.id}` : ''}`,
          },
        },
      });
    }
    
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'application/xml' },
    });
    
  } catch (error) {
    console.error('SMS webhook error:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
});
