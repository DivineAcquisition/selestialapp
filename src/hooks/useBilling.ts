import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';

export function useBilling() {
  const { business, refetch: refetchBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);

  const createCheckout = useCallback(async (plan: 'starter' | 'growth') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing', {
        body: { action: 'create-checkout', plan },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  const openPortal = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing', {
        body: { action: 'create-portal' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Redirect to Stripe portal
      window.location.href = data.url;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  const cancelSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing', {
        body: { action: 'cancel' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      await refetchBusiness();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Cancel failed') };
    } finally {
      setLoading(false);
    }
  }, [refetchBusiness]);

  const resumeSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing', {
        body: { action: 'resume' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      await refetchBusiness();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Resume failed') };
    } finally {
      setLoading(false);
    }
  }, [refetchBusiness]);

  const upgrade = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing', {
        body: { action: 'upgrade' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      if (data.url) {
        // Redirect to checkout
        window.location.href = data.url;
      } else {
        // Upgraded in place
        await refetchBusiness();
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Upgrade failed') };
    } finally {
      setLoading(false);
    }
  }, [refetchBusiness]);

  // Computed properties
  const isTrialing = business?.subscription_status === 'trialing';
  const isActive = business?.subscription_status === 'active';
  const isPastDue = business?.subscription_status === 'past_due';
  const isCanceled = business?.subscription_status === 'canceled';
  const willCancel = business?.cancel_at_period_end === true;

  const trialDaysRemaining = business?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(business.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    loading,
    isTrialing,
    isActive,
    isPastDue,
    isCanceled,
    willCancel,
    trialDaysRemaining,
    plan: business?.subscription_plan || 'starter',
    currentPeriodEnd: business?.current_period_end,
    createCheckout,
    openPortal,
    cancelSubscription,
    resumeSubscription,
    upgrade,
  };
}
