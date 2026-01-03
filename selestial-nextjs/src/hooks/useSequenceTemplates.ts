import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SequenceTemplate, TemplateType, SequenceStep } from '@/types';
import { useBusiness } from '@/contexts/BusinessContext';

export function useSequenceTemplates(templateType?: TemplateType) {
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
        .order('is_default', { ascending: false })
        .order('name');

      // Filter by type if specified
      if (templateType) {
        query = query.eq('template_type', templateType);
      }

      // Filter by industry (show universal + industry-specific)
      if (business?.industry) {
        query = query.or(`industry_slug.eq.${business.industry},industry_slug.is.null`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform the data to match our types
      const transformedTemplates: SequenceTemplate[] = (data || []).map(template => ({
        id: template.id,
        industry_slug: template.industry_slug,
        name: template.name,
        description: template.description,
        template_type: template.template_type as TemplateType,
        trigger_type: template.trigger_type,
        trigger_delay_days: template.trigger_delay_days || 0,
        steps: (template.steps as unknown as SequenceStep[]) || [],
        is_default: template.is_default || false,
        is_premium: template.is_premium || false,
        usage_count: template.usage_count || 0,
      }));

      setTemplates(transformedTemplates);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [business?.industry, templateType]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const incrementUsageCount = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      await supabase
        .from('sequence_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
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
