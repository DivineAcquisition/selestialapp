import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import type { Tables, Json } from '@/integrations/supabase/types';
import type { SequenceStep } from '@/types';

type DbSequenceTemplate = Tables<'sequence_templates'>;

export interface SequenceTemplate {
  id: string;
  industry: DbSequenceTemplate['industry'] | null;
  name: string;
  description: string | null;
  steps: SequenceStep[];
  times_used: number;
}

export function useSequenceTemplates() {
  const { business } = useBusiness();
  const [templates, setTemplates] = useState<SequenceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('sequence_templates')
        .select('*')
        .order('times_used', { ascending: false })
        .order('name');

      // Filter by industry (show universal + industry-specific)
      if (business?.industry) {
        query = query.or(`industry.eq.${business.industry},industry.is.null`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform the data to match our types
      const transformedTemplates: SequenceTemplate[] = (data || []).map(template => ({
        id: template.id,
        industry: template.industry,
        name: template.name,
        description: template.description,
        steps: (template.steps as unknown as SequenceStep[]) || [],
        times_used: template.times_used || 0,
      }));

      setTemplates(transformedTemplates);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [business?.industry]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const incrementUsageCount = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      await supabase
        .from('sequence_templates')
        .update({ times_used: (template.times_used || 0) + 1 })
        .eq('id', templateId);
    } catch (err) {
      console.error('Failed to update usage count:', err);
    }
  };

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    incrementUsageCount,
  };
}

// Helper to calculate total sequence duration
export function calculateSequenceDuration(steps: SequenceStep[]): string {
  let totalHours = 0;

  steps.forEach(step => {
    totalHours += (step.delay_days || 0) * 24;
    totalHours += (step.delay_hours || 0);
  });

  if (totalHours < 24) {
    return `${totalHours} hours`;
  } else if (totalHours < 168) {
    return `${Math.round(totalHours / 24)} days`;
  } else {
    return `${Math.round(totalHours / 168)} weeks`;
  }
}
