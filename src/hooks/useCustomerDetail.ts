import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import type { Tables } from '@/integrations/supabase/types';

type Customer = Tables<'customers'>;
type Quote = Tables<'quotes'>;

interface CustomerActivity {
  id: string;
  created_at: string;
  action: string;
  description: string | null;
}

export function useCustomerDetail(customerId: string | null) {
  const { business } = useBusiness();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = useCallback(async () => {
    if (!business || !customerId) {
      setCustomer(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('business_id', business.id)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);

      const { data: quotesData } = await supabase
        .from('quotes')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      setQuotes(quotesData || []);

      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('id, created_at, action, description')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setActivities((activityData || []) as CustomerActivity[]);
    } catch (err) {
      console.error('Failed to fetch customer:', err);
    } finally {
      setLoading(false);
    }
  }, [business, customerId]);

  const updateNotes = useCallback(async (notes: string) => {
    if (!customerId) return;

    try {
      const { error } = await supabase
        .from('customers')
        .update({ notes })
        .eq('id', customerId);

      if (error) throw error;
      setCustomer(prev => prev ? { ...prev, notes } : null);
    } catch (err) {
      console.error('Failed to update notes:', err);
      throw err;
    }
  }, [customerId]);

  const updateCustomerType = useCallback(async (customer_type: string) => {
    if (!customerId) return;

    try {
      const { error } = await supabase
        .from('customers')
        .update({ customer_type })
        .eq('id', customerId);

      if (error) throw error;
      setCustomer(prev => prev ? { ...prev, customer_type } : null);
    } catch (err) {
      console.error('Failed to update customer type:', err);
      throw err;
    }
  }, [customerId]);

  const startRetentionSequence = useCallback(async (_sequenceId: string) => {
    if (!business || !customerId) return { error: new Error('Missing data') };

    try {
      await supabase.from('activity_logs').insert({
        business_id: business.id,
        action: 'retention_triggered_manual',
        description: 'Retention sequence manually started for customer',
      });

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to start sequence') };
    }
  }, [business, customerId]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return {
    customer,
    quotes,
    activities,
    loading,
    refetch: fetchCustomer,
    updateNotes,
    updateCustomerType,
    startRetentionSequence,
  };
}