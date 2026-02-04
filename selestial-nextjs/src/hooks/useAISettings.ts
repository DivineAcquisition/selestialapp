import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';

export interface AISettings {
  smart_replies_enabled: boolean;
  tone: string;
  emoji_usage: string;
  response_length: string;
  custom_instructions: string | null;
  suggest_upsells: boolean;
  include_pricing: boolean;
  monthly_suggestion_limit: number;
  suggestions_used_this_month: number;
}

const defaultSettings: AISettings = {
  smart_replies_enabled: true,
  tone: 'friendly',
  emoji_usage: 'moderate',
  response_length: 'concise',
  custom_instructions: null,
  suggest_upsells: true,
  include_pricing: true,
  monthly_suggestion_limit: 500,
  suggestions_used_this_month: 0,
};

export function useAISettings() {
  const { toast } = useToast();
  const { business } = useBusiness();
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!business?.id) return;

    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('business_id', business.id)
        .single();

      if (data) {
        setSettings({
          smart_replies_enabled: data.smart_replies_enabled ?? defaultSettings.smart_replies_enabled,
          tone: data.tone ?? defaultSettings.tone,
          emoji_usage: data.emoji_usage ?? defaultSettings.emoji_usage,
          response_length: data.response_length ?? defaultSettings.response_length,
          custom_instructions: data.custom_instructions ?? defaultSettings.custom_instructions,
          suggest_upsells: data.suggest_upsells ?? defaultSettings.suggest_upsells,
          include_pricing: data.include_pricing ?? defaultSettings.include_pricing,
          monthly_suggestion_limit: data.monthly_suggestion_limit ?? defaultSettings.monthly_suggestion_limit,
          suggestions_used_this_month: data.suggestions_used_this_month ?? defaultSettings.suggestions_used_this_month,
        });
      }
    } catch (err) {
      // Settings might not exist yet
      console.log('No AI settings found, using defaults');
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<AISettings>) => {
    if (!business?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_settings')
        .upsert({
          business_id: business.id,
          ...settings,
          ...updates,
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...updates }));
      toast({ title: 'AI settings saved!' });
    } catch (err) {
      console.error('Failed to save AI settings:', err);
      toast({ 
        title: 'Failed to save settings', 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  }, [business?.id, settings, toast]);

  const usagePercent = settings.monthly_suggestion_limit > 0
    ? (settings.suggestions_used_this_month / settings.monthly_suggestion_limit) * 100
    : 0;

  return {
    settings,
    loading,
    saving,
    updateSettings,
    usagePercent,
    refetch: fetchSettings,
  };
}
