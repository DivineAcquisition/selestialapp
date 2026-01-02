import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import type { Tables } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;

interface BusinessContextType {
  business: Business | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateBusiness: (updates: Partial<Business>) => Promise<{ error: Error | null }>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusiness = useCallback(async () => {
    if (!user) {
      setBusiness(null);
      setLoading(false);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load business');
    } finally {
      setLoading(false);
    }
  }, [user]);

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
    fetchBusiness();
  }, [fetchBusiness]);

  return (
    <BusinessContext.Provider value={{ business, loading, error, refetch: fetchBusiness, updateBusiness }}>
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
