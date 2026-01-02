import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    const formData = await req.formData();
    
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const errorCode = formData.get('ErrorCode') as string | null;
    const errorMessage = formData.get('ErrorMessage') as string | null;
    
    console.log(`SMS status update: ${messageSid} -> ${messageStatus}`);
    
    if (!messageSid || !messageStatus) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    let status: string;
    switch (messageStatus) {
      case 'queued':
      case 'sending':
        status = 'sent';
        break;
      case 'sent':
        status = 'sent';
        break;
      case 'delivered':
        status = 'delivered';
        break;
      case 'undelivered':
      case 'failed':
        status = 'failed';
        break;
      default:
        status = messageStatus;
    }
    
    const updateData: Record<string, any> = { status };
    
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }
    
    if (status === 'failed') {
      updateData.failed_at = new Date().toISOString();
      updateData.error_message = errorMessage || `Error code: ${errorCode}`;
    }
    
    await supabase
      .from('messages')
      .update(updateData)
      .eq('external_id', messageSid);
    
    await supabase
      .from('message_queue')
      .update({ status })
      .eq('external_id', messageSid);
    
    console.log(`Updated message ${messageSid} to status: ${status}`);
    
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'application/xml' },
    });
    
  } catch (error) {
    console.error('SMS status webhook error:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
});
