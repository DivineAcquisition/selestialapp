import { useState, useCallback } from 'react';
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

// Note: webhook_configs table does not exist yet - this is a placeholder
// for future implementation
export function useWebhookConfig() {
  const { business } = useBusiness();
  const [config, setConfig] = useState<WebhookConfig | null>(null);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConfig = useCallback(async () => {
    if (!business) return;
    // Placeholder - table doesn't exist yet
    setLoading(false);
  }, [business]);

  const regenerateKey = useCallback(async () => {
    // Placeholder
    console.log('regenerateKey not implemented - table does not exist');
  }, []);

  const regenerateSecret = useCallback(async () => {
    // Placeholder
    console.log('regenerateSecret not implemented - table does not exist');
  }, []);

  const toggleActive = useCallback(async () => {
    // Placeholder
    console.log('toggleActive not implemented - table does not exist');
  }, []);

  const getWebhookUrl = useCallback(() => {
    if (!config) return '';
    return `https://thbegonbonhswsbgszxi.supabase.co/functions/v1/webhook-receiver/${config.webhook_key}`;
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
