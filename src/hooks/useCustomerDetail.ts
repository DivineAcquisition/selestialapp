import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';

interface CustomerDetail {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  customer_type: string;
  tags: string[];
  first_service_at: string | null;
  last_service_at: string | null;
  next_service_at: string | null;
  total_jobs: number;
  total_spent: number;
  average_job_value: number;
  is_recurring: boolean;
  recurring_frequency: string | null;
  recurring_service_type: string | null;
  recurring_amount: number | null;
  health_score: number;
  last_contact_at: string | null;
  last_response_at: string | null;
  referral_count: number;
  notes: string | null;
  external_id: string | null;
  external_source: string | null;
}

interface CustomerQuote {
  id: string;
  created_at: string;
  customer_name: string;
  service_type: string;
  quote_amount: number;
  status: string;
  job_status: string | null;
  job_completed_at: string | null;
}

interface CustomerActivity {
  id: string;
  created_at: string;
  action: string;
  description: string;
}

export function useCustomerDetail(customerId: string | null) {
  const { business } = useBusiness();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [quotes, setQuotes] = useState<CustomerQuote[]>([]);
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
      
      // Fetch customer details
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('business_id', business.id)
        .single();

      if (customerError) throw customerError;
      setCustomer({
        ...customerData,
        customer_type: customerData.customer_type ?? 'residential',
        tags: customerData.tags ?? [],
        total_jobs: customerData.total_jobs ?? 0,
        total_spent: customerData.total_spent ?? 0,
        average_job_value: customerData.average_job_value ?? 0,
        is_recurring: customerData.is_recurring ?? false,
        health_score: customerData.health_score ?? 100,
        referral_count: customerData.referral_count ?? 0,
      });

      // Fetch related quotes
      const { data: quotesData } = await supabase
        .from('quotes')
        .select('id, created_at, customer_name, service_type, quote_amount, status, job_status, job_completed_at')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      setQuotes(quotesData || []);

      // Fetch activity logs related to this customer's quotes.
      // Live schema stores related ids in entity_id (with entity_type='quote').
      const quoteIds = (quotesData || []).map((q) => q.id);
      let activityData: CustomerActivity[] = [];
      if (quoteIds.length > 0) {
        const { data } = await supabase
          .from('activity_logs')
          .select('id, created_at, action, description')
          .eq('business_id', business.id)
          .eq('entity_type', 'quote')
          .in('entity_id', quoteIds)
          .order('created_at', { ascending: false })
          .limit(20);

        activityData = (data || []).map((a) => ({
          id: a.id,
          created_at: a.created_at ?? new Date().toISOString(),
          action: a.action,
          description: a.description ?? a.action,
        }));
      }

      setActivities(activityData);
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

  const startRetentionSequence = useCallback(async (sequenceId: string) => {
    if (!business || !customerId) return { error: new Error('Missing data') };

    try {
      // Log activity that retention sequence was manually triggered
      await supabase
        .from('activity_logs')
        .insert({
          business_id: business.id,
          action: 'retention_triggered_manual',
          description: `Retention sequence manually started for customer`,
        });

      // In a full implementation, this would queue messages from the sequence
      // For now, just return success
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
