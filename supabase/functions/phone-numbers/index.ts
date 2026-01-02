import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  getAvailablePhoneNumbers, 
  purchasePhoneNumber, 
  releasePhoneNumber 
} from '../_shared/twilio.ts';

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
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (bizError || !business) {
      throw new Error('Business not found');
    }

    const { action, ...params } = await req.json();
    
    console.log(`Phone numbers action: ${action}`, params);

    switch (action) {
      case 'search': {
        const { areaCode } = params;
        const result = await getAvailablePhoneNumbers(areaCode);
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          numbers: result.data 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'purchase': {
        const { data: existingPhone } = await supabase
          .from('phone_numbers')
          .select('*')
          .eq('business_id', business.id)
          .eq('status', 'active')
          .single();
        
        if (existingPhone) {
          throw new Error('Business already has an active phone number');
        }
        
        const { phoneNumber } = params;
        
        const smsWebhookUrl = `${SUPABASE_URL}/functions/v1/sms-webhook`;
        
        const result = await purchasePhoneNumber(phoneNumber, smsWebhookUrl);
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        const { data: savedPhone, error: saveError } = await supabase
          .from('phone_numbers')
          .insert({
            business_id: business.id,
            phone_number: result.data!.phone_number,
            phone_sid: result.data!.sid,
            friendly_name: result.data!.friendly_name,
            sms_enabled: result.data!.capabilities?.sms ?? true,
            mms_enabled: result.data!.capabilities?.mms ?? false,
            voice_enabled: result.data!.capabilities?.voice ?? false,
          })
          .select()
          .single();
        
        if (saveError) {
          await releasePhoneNumber(result.data!.sid);
          throw new Error('Failed to save phone number');
        }
        
        await supabase
          .from('businesses')
          .update({
            twilio_phone_number: result.data!.phone_number,
            twilio_phone_sid: result.data!.sid,
          })
          .eq('id', business.id);
        
        console.log(`Phone number ${result.data!.phone_number} purchased for business ${business.id}`);
        
        return new Response(JSON.stringify({ 
          success: true, 
          phone: savedPhone 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'release': {
        const { data: phone } = await supabase
          .from('phone_numbers')
          .select('*')
          .eq('business_id', business.id)
          .eq('status', 'active')
          .single();
        
        if (!phone) {
          throw new Error('No active phone number found');
        }
        
        const result = await releasePhoneNumber(phone.phone_sid);
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        await supabase
          .from('phone_numbers')
          .update({ status: 'released' })
          .eq('id', phone.id);
        
        await supabase
          .from('businesses')
          .update({
            twilio_phone_number: null,
            twilio_phone_sid: null,
          })
          .eq('id', business.id);
        
        console.log(`Phone number ${phone.phone_number} released for business ${business.id}`);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error('Phone numbers error:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
