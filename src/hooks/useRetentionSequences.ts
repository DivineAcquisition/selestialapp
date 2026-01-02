import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import type { Json } from '@/integrations/supabase/types';
  delay_days: number;
  delay_hours: number;
  channel: 'sms' | 'email';
  subject?: string;
  message: string;
  is_active: boolean;
}

export interface RetentionSequence {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_days: number;
  conditions: Record<string, unknown>;
  steps: RetentionStep[];
  is_active: boolean;
  is_default: boolean;
}

export const TRIGGER_TYPES = [
  { value: 'job_completed', label: 'After Job Completed', description: 'Send follow-ups after a job is marked complete' },
  { value: 'days_since_service', label: 'Days Since Last Service', description: 'Re-engage customers who haven\'t booked recently' },
  { value: 'recurring_due', label: 'Recurring Service Due', description: 'Remind recurring customers when service is due' },
  { value: 'dormant', label: 'Dormant Customer', description: 'Win back inactive customers' },
] as const;

export const DEFAULT_RETENTION_STEPS: RetentionStep[] = [
  {
    delay_days: 1,
    delay_hours: 0,
    channel: 'sms',
    message: "Hi {{customer_first_name}}, thanks for choosing {{business_name}}! We hope you're happy with the work. If you have any questions, just reply here. - {{owner_name}}",
    is_active: true,
  },
  {
    delay_days: 7,
    delay_hours: 0,
    channel: 'sms',
    message: "{{customer_first_name}}, how's everything working out? If you know anyone who needs {{service_type}}, we'd appreciate the referral! Reply REFER for $25 off your next service.",
    is_active: true,
  },
  {
    delay_days: 30,
    delay_hours: 0,
    channel: 'sms',
    message: "Hi {{customer_first_name}}, it's been a month since your last service. Ready to schedule your next appointment? Reply YES to book!",
    is_active: true,
  },
];

export function useRetentionSequences() {
  const { business } = useBusiness();
  const [sequences, setSequences] = useState<RetentionSequence[]>([]);
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
        .from('retention_sequences')
        .select('*')
        .eq('business_id', business.id)
        .order('is_default', { ascending: false })
        .order('name');

      if (fetchError) throw fetchError;
      
      // Transform the data to ensure steps is properly typed
      const transformedData = (data || []).map(seq => ({
        ...seq,
        steps: (seq.steps as unknown as RetentionStep[]) || [],
        conditions: (seq.conditions as Record<string, unknown>) || {},
      }));
      
      setSequences(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load retention sequences');
    } finally {
      setLoading(false);
    }
  }, [business]);

  const createSequence = async (sequence: Omit<RetentionSequence, 'id' | 'created_at'>) => {
    if (!business) return { data: null, error: new Error('No business') };

    try {
      const { data, error: insertError } = await supabase
        .from('retention_sequences')
        .insert([{
          business_id: business.id,
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.trigger_type,
          trigger_days: sequence.trigger_days,
          conditions: sequence.conditions as Json,
          steps: sequence.steps as unknown as Json,
          is_active: sequence.is_active,
          is_default: sequence.is_default,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchSequences();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to create') };
    }
  };

  const updateSequence = async (id: string, updates: Partial<RetentionSequence>) => {
    try {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.steps) {
        updateData.steps = updates.steps as unknown as Record<string, unknown>[];
      }
      
      const { data, error: updateError } = await supabase
        .from('retention_sequences')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchSequences();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to update') };
    }
  };

  const deleteSequence = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('retention_sequences')
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
    deleteSequence,
  };
}
