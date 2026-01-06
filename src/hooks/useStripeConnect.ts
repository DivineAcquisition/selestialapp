"use client"

import { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';

interface ConnectStatus {
  connected: boolean;
  status: string;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export function useStripeConnect() {
  const { business, refetch: refetchBusiness } = useBusiness();
  const [status, setStatus] = useState<ConnectStatus>({
    connected: false,
    status: 'not_connected',
    accountId: null,
    chargesEnabled: false,
    payoutsEnabled: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/stripe/connect/status');
      const data = await res.json();

      if (res.ok) {
        setStatus({
          connected: data.connected,
          status: data.status,
          accountId: data.accountId || null,
          chargesEnabled: data.chargesEnabled || false,
          payoutsEnabled: data.payoutsEnabled || false,
        });
      }
    } catch (err) {
      console.error('Failed to fetch connect status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (business) {
      fetchStatus();
    }
  }, [business, fetchStatus]);

  const startOnboarding = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return { error: null };
      } else {
        throw new Error(data.error || 'Failed to start onboarding');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const resumeOnboarding = useCallback(async () => {
    // Same as startOnboarding - it handles existing accounts
    return startOnboarding();
  }, [startOnboarding]);

  const openDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/stripe/connect/dashboard', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.url) {
        window.open(data.url, '_blank');
        return { error: null };
      } else {
        throw new Error(data.error || 'Failed to open dashboard');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      return { error: err };
    }
  }, []);

  const disconnect = useCallback(async () => {
    // Note: Disconnecting a Connect account typically requires
    // contacting Stripe support or using the dashboard
    // For now, we just reset the local status
    await fetchStatus();
    await refetchBusiness();
    return { error: null };
  }, [fetchStatus, refetchBusiness]);

  return {
    status,
    loading,
    refetch: fetchStatus,
    startOnboarding,
    resumeOnboarding,
    openDashboard,
    disconnect,
  };
}
