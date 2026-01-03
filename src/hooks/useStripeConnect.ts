import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';

interface ConnectStatus {
  connected: boolean;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsDue: string[];
  requirementsPastDue: string[];
}

interface BalanceInfo {
  available: { amount: number; currency: string }[];
  pending: { amount: number; currency: string }[];
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date: number;
  created: number;
}

export function useStripeConnect() {
  const { business, refetch: refetchBusiness } = useBusiness();
  const [status, setStatus] = useState<ConnectStatus>({
    connected: false,
    accountId: null,
    chargesEnabled: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
    requirementsDue: [],
    requirementsPastDue: [],
  });
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!business) return;

    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect', {
        body: { action: 'get-status' },
      });

      if (error) throw error;

      setStatus({
        connected: data.connected,
        accountId: data.account_id,
        chargesEnabled: data.charges_enabled || false,
        payoutsEnabled: data.payouts_enabled || false,
        detailsSubmitted: data.details_submitted || false,
        requirementsDue: data.requirements_due || [],
        requirementsPastDue: data.requirements_past_due || [],
      });

      if (data.connected && data.charges_enabled) {
        fetchBalance();
      }
    } catch (err) {
      console.error('Failed to fetch connect status:', err);
    } finally {
      setLoading(false);
    }
  }, [business]);

  const fetchBalance = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect', {
        body: { action: 'get-balance' },
      });

      if (error) throw error;

      setBalance(data.balance);
      setPayouts(data.recent_payouts || []);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const startOnboarding = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect', {
        body: { action: 'create-account' },
      });

      if (error) throw error;

      if (data.onboarding_url) {
        window.location.href = data.onboarding_url;
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }, []);

  const resumeOnboarding = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect', {
        body: { action: 'resume-onboarding' },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }, []);

  const openDashboard = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect', {
        body: { action: 'dashboard-link' },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect', {
        body: { action: 'disconnect' },
      });

      if (error) throw error;

      await fetchStatus();
      await refetchBusiness();

      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }, [fetchStatus, refetchBusiness]);

  const createPaymentLink = useCallback(async (quoteId: string, amount?: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: { quoteId, amount },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }, []);

  return {
    status,
    balance,
    payouts,
    loading,
    refetch: fetchStatus,
    startOnboarding,
    resumeOnboarding,
    openDashboard,
    disconnect,
    createPaymentLink,
  };
}
