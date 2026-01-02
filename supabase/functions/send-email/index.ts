import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { 
  getVerificationEmailHtml, 
  getVerificationEmailText,
  getPasswordResetEmailHtml,
  getPasswordResetEmailText,
  getWelcomeEmailHtml,
  getQuoteWonEmailHtml,
  getDailyDigestEmailHtml,
  getCustomerReplyEmailHtml,
  getCustomerReplyEmailText,
  getPaymentFailedEmailHtml,
  getPaymentFailedEmailText,
  getTrialEndingEmailHtml,
  getTrialEndingEmailText,
} from '../_shared/email-templates.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'Selestial <noreply@selestial.io>';
const REPLY_TO = 'support@selestial.io';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  type: string;
  to: string;
  data: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { type, to, data }: EmailRequest = await req.json();

    console.log(`Sending ${type} email to ${to}`);

    let subject: string;
    let html: string;
    let text: string | undefined;

    switch (type) {
      case 'verification':
        subject = 'Verify your email - Selestial';
        html = getVerificationEmailHtml({
          verificationUrl: data.verificationUrl as string,
          userName: data.userName as string | undefined,
        });
        text = getVerificationEmailText({
          verificationUrl: data.verificationUrl as string,
          userName: data.userName as string | undefined,
        });
        break;
        
      case 'password_reset':
        subject = 'Reset your password - Selestial';
        html = getPasswordResetEmailHtml({
          resetUrl: data.resetUrl as string,
          userName: data.userName as string | undefined,
        });
        text = getPasswordResetEmailText({
          resetUrl: data.resetUrl as string,
          userName: data.userName as string | undefined,
        });
        break;
        
      case 'welcome':
        subject = `Welcome to Selestial, ${data.userName}! 🎉`;
        html = getWelcomeEmailHtml({
          userName: data.userName as string,
          businessName: data.businessName as string,
          loginUrl: data.loginUrl as string,
        });
        break;
        
      case 'quote_won':
        subject = `🎉 Quote Won: ${data.customerName} - ${data.quoteAmount}`;
        html = getQuoteWonEmailHtml({
          userName: data.userName as string,
          customerName: data.customerName as string,
          quoteAmount: data.quoteAmount as string,
          serviceType: data.serviceType as string,
          dashboardUrl: data.dashboardUrl as string,
        });
        break;
        
      case 'daily_digest': {
        const stats = data.stats as {
          newQuotes: number;
          messagesSent: number;
          quotesWon: number;
          quotesLost: number;
          revenueWon: string;
        };
        subject = `Your Daily Digest - ${stats?.quotesWon || 0} quotes won`;
        html = getDailyDigestEmailHtml({
          userName: data.userName as string,
          stats,
          dashboardUrl: data.dashboardUrl as string,
        });
        break;
      }
        
      case 'customer_reply':
        subject = `📱 ${data.customerName} replied to your follow-up`;
        html = getCustomerReplyEmailHtml({
          userName: data.userName as string,
          customerName: data.customerName as string,
          customerPhone: data.customerPhone as string,
          message: data.message as string,
          dashboardUrl: data.dashboardUrl as string,
        });
        text = getCustomerReplyEmailText({
          userName: data.userName as string,
          customerName: data.customerName as string,
          customerPhone: data.customerPhone as string,
          message: data.message as string,
          dashboardUrl: data.dashboardUrl as string,
        });
        break;

      case 'payment_failed':
        subject = '⚠️ Payment Failed - Action Required';
        html = getPaymentFailedEmailHtml({
          userName: data.userName as string,
          updatePaymentUrl: data.updatePaymentUrl as string,
        });
        text = getPaymentFailedEmailText({
          userName: data.userName as string,
          updatePaymentUrl: data.updatePaymentUrl as string,
        });
        break;

      case 'trial_ending':
        subject = 'Your Selestial Trial is Ending Soon';
        html = getTrialEndingEmailHtml({
          userName: data.userName as string,
          trialEndDate: data.trialEndDate as string,
          billingUrl: data.billingUrl as string,
        });
        text = getTrialEndingEmailText({
          userName: data.userName as string,
          trialEndDate: data.trialEndDate as string,
          billingUrl: data.billingUrl as string,
        });
        break;
        
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        reply_to: REPLY_TO,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Resend API error:', errorData);
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    const result = await res.json();
    console.log(`Email sent successfully: ${result.id}`);

    return new Response(
      JSON.stringify({ success: true, id: result.id }), 
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Email send error:', errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
