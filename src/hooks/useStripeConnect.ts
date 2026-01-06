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
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!business) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/stripe/connect/status');
      const data = await res.json();

      if (res.ok) {
        setStatus({
          connected: data.connected || false,
          status: data.status || 'not_connected',
          accountId: data.accountId || null,
          chargesEnabled: data.chargesEnabled || false,
          payoutsEnabled: data.payoutsEnabled || false,
        });
      } else {
        console.error('Stripe status error:', data.error);
      }
    } catch (err) {
      console.error('Failed to fetch connect status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const startOnboarding = useCallback(async () => {
    try {
      setError(null);
      
      const res = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start onboarding');
      }

      if (data.url) {
        // Redirect to Stripe
        window.location.href = data.url;
        return { error: null };
      } else {
        throw new Error('No onboarding URL returned');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start onboarding';
      console.error('Onboarding error:', err);
      setError(errorMessage);
      return { error: err };
    }
  }, []);

  const resumeOnboarding = useCallback(async () => {
    return startOnboarding();
  }, [startOnboarding]);

  const openDashboard = useCallback(async () => {
    try {
      setError(null);
      
      const res = await fetch('/api/stripe/connect/dashboard', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to open dashboard');
      }

      if (data.url) {
        window.open(data.url, '_blank');
        return { error: null };
      } else {
        throw new Error('No dashboard URL returned');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open dashboard';
      console.error('Dashboard error:', err);
      setError(errorMessage);
      return { error: err };
    }
  }, []);

  const disconnect = useCallback(async () => {
    await fetchStatus();
    await refetchBusiness();
    return { error: null };
  }, [fetchStatus, refetchBusiness]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
    startOnboarding,
    resumeOnboarding,
    openDashboard,
    disconnect,
  };
}
