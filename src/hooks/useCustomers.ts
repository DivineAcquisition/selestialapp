import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import type { Tables } from '@/integrations/supabase/types';

type Customer = Tables<'customers'>;

interface CustomerFilters {
  type?: string;
  search?: string;
  minHealth?: number;
  maxHealth?: number;
}

interface CustomerStats {
  total: number;
  recurring: number;
  atRisk: number;
  dormant: number;
}

export function useCustomers(filters: CustomerFilters = {}) {
  const { business } = useBusiness();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    recurring: 0,
    atRisk: 0,
    dormant: 0,
  });

  const fetchCustomers = useCallback(async () => {
    if (!business) return;

    try {
      let query = supabase
        .from('customers')
        .select('*')
        .eq('business_id', business.id)
        .order('last_service_at', { ascending: false, nullsFirst: false });

      if (filters.type && filters.type !== 'all') {
        query = query.eq('customer_type', filters.type);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters.minHealth !== undefined) {
        query = query.gte('health_score', filters.minHealth);
      }

      if (filters.maxHealth !== undefined) {
        query = query.lte('health_score', filters.maxHealth);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCustomers(data || []);

      // Calculate stats
      if (data) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        setStats({
          total: data.length,
          recurring: data.filter(c => c.is_recurring).length,
          atRisk: data.filter(c => (c.health_score || 100) <= 30).length,
          dormant: data.filter(c => 
            c.last_service_at && new Date(c.last_service_at) < thirtyDaysAgo
          ).length,
        });
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  }, [business, filters.type, filters.search, filters.minHealth, filters.maxHealth]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchCustomers();
    } catch (err) {
      console.error('Failed to update customer:', err);
      throw err;
    }
  }, [fetchCustomers]);

  return {
    customers,
    stats,
    loading,
    refetch: fetchCustomers,
    updateCustomer,
  };
}