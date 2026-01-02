import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';

interface WebhookConfig {
  id: string;
  webhook_key: string;
  webhook_secret: string;
  require_signature: boolean;
  is_active: boolean;
  last_event_at: string | null;
  total_events_received: number;
  total_events_processed: number;
  total_events_failed: number;
  requests_today: number;
  daily_limit: number;
}

interface WebhookEvent {
  id: string;
  created_at: string;
  event_type: string;
  status: string;
  error_message: string | null;
  result_type: string | null;
}

export function useWebhookConfig() {
  const { business } = useBusiness();
  const [config, setConfig] = useState<WebhookConfig | null>(null);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    if (!business) return;

    try {
      const { data, error } = await supabase
        .from('webhook_configs')
        .select('*')
        .eq('business_id', business.id)
        .maybeSingle();

      if (error) throw error;

      setConfig(data);

      // Fetch recent events
      const { data: eventsData } = await supabase
        .from('webhook_events')
        .select('id, created_at, event_type, status, error_message, result_type')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setEvents(eventsData || []);
    } catch (err) {
      console.error('Failed to fetch webhook config:', err);
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const regenerateKey = useCallback(async () => {
    if (!config) return;

    try {
      const newKey = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const { error } = await supabase
        .from('webhook_configs')
        .update({ webhook_key: newKey })
        .eq('id', config.id);

      if (error) throw error;

      await fetchConfig();
    } catch (err) {
      console.error('Failed to regenerate key:', err);
      throw err;
    }
  }, [config, fetchConfig]);

  const regenerateSecret = useCallback(async () => {
    if (!config) return;

    try {
      const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const { error } = await supabase
        .from('webhook_configs')
        .update({ webhook_secret: newSecret })
        .eq('id', config.id);

      if (error) throw error;

      await fetchConfig();
    } catch (err) {
      console.error('Failed to regenerate secret:', err);
      throw err;
    }
  }, [config, fetchConfig]);

  const toggleActive = useCallback(async () => {
    if (!config) return;

    try {
      const { error } = await supabase
        .from('webhook_configs')
        .update({ is_active: !config.is_active })
        .eq('id', config.id);

      if (error) throw error;

      await fetchConfig();
    } catch (err) {
      console.error('Failed to toggle active:', err);
      throw err;
    }
  }, [config, fetchConfig]);

  const getWebhookUrl = useCallback(() => {
    if (!config) return '';
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/webhook-receiver/${config.webhook_key}`;
  }, [config]);

  return {
    config,
    events,
    loading,
    refetch: fetchConfig,
    regenerateKey,
    regenerateSecret,
    toggleActive,
    getWebhookUrl,
  };
}
