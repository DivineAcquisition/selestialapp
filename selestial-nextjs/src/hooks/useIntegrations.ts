import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';

interface Integration {
  id: string;
  platform: string;
  status: string;
  account_name: string | null;
  last_sync_at: string | null;
  sync_error: string | null;
}

export function useIntegrations() {
  const { business } = useBusiness();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async () => {
    if (!business) return;

    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('business_id', business.id);

      if (error) throw error;
      setIntegrations((data || []).map(i => ({
        ...i,
        status: i.status ?? 'pending',
      })));
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const getIntegration = useCallback((platform: string) => {
    return integrations.find(i => i.platform === platform);
  }, [integrations]);

  const markAsConnected = useCallback(async (platform: string, accountName?: string) => {
    if (!business) return;

    try {
      const { error } = await supabase
        .from('integrations')
        .upsert({
          business_id: business.id,
          platform,
          status: 'connected',
          account_name: accountName || null,
          last_sync_at: new Date().toISOString(),
        }, { onConflict: 'business_id,platform' });

      if (error) throw error;
      await fetchIntegrations();
    } catch (err) {
      console.error('Failed to mark integration as connected:', err);
      throw err;
    }
  }, [business, fetchIntegrations]);

  const disconnectIntegration = useCallback(async (platform: string) => {
    if (!business) return;

    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('business_id', business.id)
        .eq('platform', platform);

      if (error) throw error;
      await fetchIntegrations();
    } catch (err) {
      console.error('Failed to disconnect integration:', err);
      throw err;
    }
  }, [business, fetchIntegrations]);

  return {
    integrations,
    loading,
    refetch: fetchIntegrations,
    getIntegration,
    markAsConnected,
    disconnectIntegration,
  };
}
