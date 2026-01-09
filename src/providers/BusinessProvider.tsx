"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import type { Tables } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;

interface BusinessContextType {
  business: Business | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateBusiness: (updates: Partial<Business>) => Promise<{ error: Error | null }>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user, initialized: authInitialized } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchBusiness = useCallback(async () => {
    // Don't fetch until auth is initialized
    if (!authInitialized) {
      return;
    }

    if (!user) {
      setBusiness(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }
      
      setBusiness(data);
      hasFetched.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load business');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [user, authInitialized]);

  const updateBusiness = async (updates: Partial<Business>) => {
    if (!business) return { error: new Error('No business to update') };

    try {
      const { error: updateError } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', business.id);

      if (updateError) throw updateError;

      setBusiness({ ...business, ...updates } as Business);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to update') };
    }
  };

  useEffect(() => {
    // Only fetch when auth is initialized
    if (authInitialized) {
      fetchBusiness();
    }
  }, [fetchBusiness, authInitialized]);

  return (
    <BusinessContext.Provider value={{ business, loading, initialized, error, refetch: fetchBusiness, updateBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
