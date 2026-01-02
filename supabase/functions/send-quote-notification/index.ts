import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendSMS } from '../_shared/twilio.ts';
import { getQuoteEmailHtml, getQuoteEmailText, type QuoteEmailData } from '../_shared/quote-email-template.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  quoteId: string;
  sendEmail?: boolean;
  sendSms?: boolean;
}

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const results = {
    email: { sent: false, error: null as string | null },
    sms: { sent: false, error: null as string | null },
  };

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { quoteId, sendEmail = true, sendSms = true }: NotificationRequest = await req.json();

    if (!quoteId) {
      throw new Error('Quote ID required');
    }

    console.log(`Processing notifications for quote: ${quoteId}`);

    // Get quote with business info
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        businesses (
          id,
          name,
          owner_name,
          email,
          phone,
          send_quote_email,
          send_quote_sms,
          quote_email_subject,
          quote_email_message,
          quote_sms_message,
          company_logo_url,
          company_color
        )
      `)
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      console.error('Quote not found:', quoteError);
      throw new Error('Quote not found');
    }

    const business = quote.businesses;
    const customerFirstName = quote.customer_name.split(' ')[0];
    const ownerFirstName = business.owner_name.split(' ')[0];

    console.log(`Quote for ${quote.customer_name}, Business: ${business.name}`);

    // Get business phone number for SMS
    const { data: phoneNumber } = await supabase
      .from('phone_numbers')
      .select('phone_number')
      .eq('business_id', business.id)
      .eq('status', 'active')
      .single();

    // ===== SEND EMAIL =====
    if (sendEmail && business.send_quote_email && quote.customer_email) {
      console.log(`Sending email to ${quote.customer_email}`);
      try {
        // Replace merge fields in subject
        let subject = business.quote_email_subject || 'Your Quote from {{business_name}}';
        subject = subject
          .replace(/\{\{business_name\}\}/g, business.name)
          .replace(/\{\{customer_name\}\}/g, quote.customer_name)
          .replace(/\{\{customer_first_name\}\}/g, customerFirstName)
          .replace(/\{\{service_type\}\}/g, quote.service_type || 'Service');

        // Prepare email data
        const emailData: QuoteEmailData = {
          businessName: business.name,
          businessPhone: business.phone,
          businessEmail: business.email,
          ownerName: business.owner_name,
          companyColor: business.company_color || '#4F46E5',
          companyLogoUrl: business.company_logo_url,
          customerName: quote.customer_name,
          customerFirstName,
          customerEmail: quote.customer_email,
          quoteAmount: quote.quote_amount,
          serviceType: quote.service_type || 'Service',
          description: quote.description,
          personalMessage: business.quote_email_message,
        };

        // Send via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${business.name} <onboarding@resend.dev>`,
            reply_to: business.email,
            to: quote.customer_email,
            subject,
            html: getQuoteEmailHtml(emailData),
            text: getQuoteEmailText(emailData),
          }),
        });

        const emailResult = await emailResponse.json();
        console.log('Email response:', emailResult);

        if (!emailResponse.ok) {
          throw new Error(emailResult.message || 'Email send failed');
        }

        results.email.sent = true;

        // Update quote
        await supabase
          .from('quotes')
          .update({
            email_sent_at: new Date().toISOString(),
            email_status: 'sent',
          })
          .eq('id', quoteId);

        // Log activity
        await supabase.rpc('log_activity', {
          p_business_id: business.id,
          p_action: 'quote_email_sent',
          p_description: `Quote email sent to ${quote.customer_name}`,
          p_quote_id: quoteId,
        });

        console.log('Email sent successfully');

      } catch (emailError) {
        console.error('Email error:', emailError);
        results.email.error = emailError instanceof Error ? emailError.message : 'Email failed';
        
        await supabase
          .from('quotes')
          .update({
            email_status: 'failed',
            notification_error: results.email.error,
          })
          .eq('id', quoteId);
      }
    } else {
      console.log('Skipping email:', { 
        sendEmail, 
        businessEnabled: business.send_quote_email, 
        hasEmail: !!quote.customer_email 
      });
    }

    // ===== SEND SMS =====
    if (sendSms && business.send_quote_sms && phoneNumber && quote.customer_phone) {
      console.log(`Sending SMS to ${quote.customer_phone}`);
      try {
        // Build SMS message with merge fields
        let smsContent = business.quote_sms_message || 
          'Hi {{customer_first_name}}, thanks for requesting a quote from {{business_name}}! We\'ve sent the details to your email. Questions? Reply here or call {{business_phone}}. - {{owner_first_name}}';

        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(quote.quote_amount / 100);

        smsContent = smsContent
          .replace(/\{\{customer_name\}\}/g, quote.customer_name)
          .replace(/\{\{customer_first_name\}\}/g, customerFirstName)
          .replace(/\{\{business_name\}\}/g, business.name)
          .replace(/\{\{owner_name\}\}/g, business.owner_name)
          .replace(/\{\{owner_first_name\}\}/g, ownerFirstName)
          .replace(/\{\{business_phone\}\}/g, formatPhoneDisplay(business.phone))
          .replace(/\{\{quote_amount\}\}/g, formattedAmount)
          .replace(/\{\{service_type\}\}/g, quote.service_type || 'service');

        // Send via Twilio
        const smsResult = await sendSMS(
          quote.customer_phone,
          phoneNumber.phone_number,
          smsContent,
          `${SUPABASE_URL}/functions/v1/sms-status-webhook`
        );

        if (!smsResult.success) {
          throw new Error(smsResult.error);
        }

        results.sms.sent = true;

        // Update quote
        await supabase
          .from('quotes')
          .update({
            sms_sent_at: new Date().toISOString(),
            sms_status: 'sent',
          })
          .eq('id', quoteId);

        // Create message record
        await supabase
          .from('messages')
          .insert({
            quote_id: quoteId,
            business_id: business.id,
            channel: 'sms',
            to_address: quote.customer_phone,
            from_address: phoneNumber.phone_number,
            content: smsContent,
            status: 'sent',
            sent_at: new Date().toISOString(),
            external_id: smsResult.data?.sid,
          });

        // Log activity
        await supabase.rpc('log_activity', {
          p_business_id: business.id,
          p_action: 'quote_sms_sent',
          p_description: `Quote SMS sent to ${quote.customer_name}`,
          p_quote_id: quoteId,
        });

        console.log('SMS sent successfully');

      } catch (smsError) {
        console.error('SMS error:', smsError);
        results.sms.error = smsError instanceof Error ? smsError.message : 'SMS failed';
        
        await supabase
          .from('quotes')
          .update({
            sms_status: 'failed',
            notification_error: results.sms.error,
          })
          .eq('id', quoteId);
      }
    } else {
      console.log('Skipping SMS:', { 
        sendSms, 
        businessEnabled: business.send_quote_sms, 
        hasPhoneNumber: !!phoneNumber,
        hasCustomerPhone: !!quote.customer_phone
      });
    }

    console.log('Notification results:', results);

    return new Response(JSON.stringify({
      success: true,
      ...results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Send quote notification error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...results,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
