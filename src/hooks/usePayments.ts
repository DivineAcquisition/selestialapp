/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import type { Tables } from '@/integrations/supabase/types';

type Payment = Tables<'payments'>;

interface PaymentWithQuote extends Payment {
  quotes?: {
    customer_name: string;
    service_type: string;
  } | null;
}

interface PaymentStats {
  totalReceived: number;
  totalPending: number;
  totalRefunded: number;
  count: number;
}

export function usePayments() {
  const { business } = useBusiness();
  const [payments, setPayments] = useState<PaymentWithQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!business) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select(`
          *,
          quotes (
            customer_name,
            service_type
          )
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPayments(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!business) return;

    const channel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `business_id=eq.${business.id}`,
        },
        () => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [business, fetchPayments]);

  const getPaymentStats = useCallback((): PaymentStats => {
    const stats = payments.reduce(
      (acc, payment) => {
        const refundedAmount = (payment as any).refunded_amount || 0;
        if (payment.status === 'succeeded') {
          acc.totalReceived += payment.amount - refundedAmount;
        } else if (payment.status === 'pending') {
          acc.totalPending += payment.amount;
        }
        if (refundedAmount) {
          acc.totalRefunded += refundedAmount;
        }
        acc.count++;
        return acc;
      },
      { totalReceived: 0, totalPending: 0, totalRefunded: 0, count: 0 }
    );

    return {
      totalReceived: stats.totalReceived / 100,
      totalPending: stats.totalPending / 100,
      totalRefunded: stats.totalRefunded / 100,
      count: stats.count,
    };
  }, [payments]);

  const getPaymentByQuoteId = useCallback(
    (quoteId: string) => {
      return payments.find((p) => p.quote_id === quoteId);
    },
    [payments]
  );

  const [creating, setCreating] = useState(false);

  const createPaymentLink = async (quoteId: string) => {
    setCreating(true);
    try {
      const res = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      return data.paymentLink;
    } catch (err) {
      console.error('Create payment link error:', err);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return {
    payments,
    loading,
    error,
    creating,
    refetch: fetchPayments,
    getPaymentStats,
    getPaymentByQuoteId,
    createPaymentLink,
  };
}
