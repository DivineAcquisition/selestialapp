import { supabase } from '@/integrations/supabase/client';

const APP_URL = window.location.origin;

export async function sendWelcomeEmail(
  to: string,
  data: {
    userName: string;
    businessName: string;
  }
) {
  return supabase.functions.invoke('send-email', {
    body: {
      type: 'welcome',
      to,
      data: {
        ...data,
        loginUrl: APP_URL,
      },
    },
  });
}

export async function sendQuoteWonEmail(
  to: string,
  data: {
    userName: string;
    customerName: string;
    quoteAmount: string;
    serviceType: string;
  }
) {
  return supabase.functions.invoke('send-email', {
    body: {
      type: 'quote_won',
      to,
      data: {
        ...data,
        dashboardUrl: APP_URL,
      },
    },
  });
}

export async function sendQuoteLostEmail(
  to: string,
  data: {
    userName: string;
    customerName: string;
    quoteAmount: string;
    lostReason?: string;
  }
) {
  return supabase.functions.invoke('send-email', {
    body: {
      type: 'quote_lost',
      to,
      data: {
        ...data,
        dashboardUrl: APP_URL,
      },
    },
  });
}

export async function sendDailyDigestEmail(
  to: string,
  data: {
    userName: string;
    stats: {
      newQuotes: number;
      messagesSent: number;
      quotesWon: number;
      quotesLost: number;
      revenueWon: string;
    };
  }
) {
  return supabase.functions.invoke('send-email', {
    body: {
      type: 'daily_digest',
      to,
      data: {
        ...data,
        dashboardUrl: APP_URL,
      },
    },
  });
}
