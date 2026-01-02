import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Quote = Tables<'quotes'>;
type QuoteInsert = TablesInsert<'quotes'>;
type QuoteUpdate = TablesUpdate<'quotes'>;

export function useQuotes() {
  const { business } = useBusiness();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    if (!business) {
      setQuotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('quotes')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setQuotes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }, [business]);

  const createQuote = async (quote: Omit<QuoteInsert, 'business_id'>) => {
    if (!business) return { data: null, error: new Error('No business') };

    try {
      const { data, error: insertError } = await supabase
        .from('quotes')
        .insert({ ...quote, business_id: business.id })
        .select()
        .single();

      if (insertError) throw insertError;

      // Log activity
      await supabase.rpc('log_activity', {
        p_business_id: business.id,
        p_action: 'quote_created',
        p_description: `New quote added for ${quote.customer_name}`,
        p_quote_id: data.id,
      });

      setQuotes(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to create') };
    }
  };

  const updateQuote = async (id: string, updates: QuoteUpdate) => {
    try {
      const { data, error: updateError } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setQuotes(prev => prev.map(q => q.id === id ? data : q));
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to update') };
    }
  };

  const updateQuoteStatus = async (
    id: string, 
    status: string, 
    additionalData?: { lost_reason?: string; final_job_amount?: number }
  ) => {
    if (!business) return { error: new Error('No business') };

    const now = new Date().toISOString();
    const updates: QuoteUpdate = {
      status,
      status_changed_at: now,
      ...(status === 'won' && { won_at: now }),
      ...(status === 'lost' && { lost_at: now }),
      ...additionalData,
    };

    const result = await updateQuote(id, updates);

    if (!result.error) {
      const quote = quotes.find(q => q.id === id);
      await supabase.rpc('log_activity', {
        p_business_id: business.id,
        p_action: `status_${status}`,
        p_description: `Quote marked as ${status}${quote ? ` - ${quote.customer_name}` : ''}`,
        p_quote_id: id,
      });
    }

    return result;
  };

  const deleteQuote = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setQuotes(prev => prev.filter(q => q.id !== id));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to delete') };
    }
  };

  // Subscribe to real-time changes
  useEffect(() => {
    if (!business) return;

    const channel = supabase
      .channel('quotes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotes',
          filter: `business_id=eq.${business.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setQuotes(prev => [payload.new as Quote, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setQuotes(prev => prev.map(q => q.id === (payload.new as Quote).id ? payload.new as Quote : q));
          } else if (payload.eventType === 'DELETE') {
            setQuotes(prev => prev.filter(q => q.id !== (payload.old as Quote).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [business]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return {
    quotes,
    loading,
    error,
    refetch: fetchQuotes,
    createQuote,
    updateQuote,
    updateQuoteStatus,
    deleteQuote,
  };
}
