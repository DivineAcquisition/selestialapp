import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Sequence = Tables<'sequences'>;
type SequenceInsert = TablesInsert<'sequences'>;
type SequenceUpdate = TablesUpdate<'sequences'>;

export function useSequences() {
  const { business } = useBusiness();
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSequences = useCallback(async () => {
    if (!business) {
      setSequences([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('sequences')
        .select('*')
        .eq('business_id', business.id)
        .order('is_default', { ascending: false })
        .order('name');

      if (fetchError) throw fetchError;
      setSequences(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sequences');
    } finally {
      setLoading(false);
    }
  }, [business]);

  const createSequence = async (sequence: Omit<SequenceInsert, 'business_id'>) => {
    if (!business) return { data: null, error: new Error('No business') };

    try {
      const { data, error: insertError } = await supabase
        .from('sequences')
        .insert({ ...sequence, business_id: business.id })
        .select()
        .single();

      if (insertError) throw insertError;

      setSequences(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to create') };
    }
  };

  const updateSequence = async (id: string, updates: SequenceUpdate) => {
    try {
      const { data, error: updateError } = await supabase
        .from('sequences')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSequences(prev => prev.map(s => s.id === id ? data : s));
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to update') };
    }
  };

  const setDefaultSequence = async (id: string) => {
    if (!business) return { error: new Error('No business') };

    try {
      // Remove default from all sequences
      await supabase
        .from('sequences')
        .update({ is_default: false })
        .eq('business_id', business.id);

      // Set new default
      const { error: updateError } = await supabase
        .from('sequences')
        .update({ is_default: true })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update business default
      await supabase
        .from('businesses')
        .update({ default_sequence_id: id })
        .eq('id', business.id);

      setSequences(prev => prev.map(s => ({
        ...s,
        is_default: s.id === id,
      })));

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to set default') };
    }
  };

  const deleteSequence = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('sequences')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSequences(prev => prev.filter(s => s.id !== id));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to delete') };
    }
  };

  useEffect(() => {
    fetchSequences();
  }, [fetchSequences]);

  return {
    sequences,
    loading,
    error,
    refetch: fetchSequences,
    createSequence,
    updateSequence,
    setDefaultSequence,
    deleteSequence,
  };
}
