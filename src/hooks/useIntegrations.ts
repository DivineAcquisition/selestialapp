import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import type { Tables } from '@/integrations/supabase/types';

type Integration = Tables<'integrations'>;

export type { Integration };

export function useIntegrations() {
  const { business } = useBusiness();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async () => {
    if (!business) return;

    try {
      // Use business_profile_id lookup - need to find the business_profile for this user
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', business.user_id)
        .single();

      if (!profile) {
        setIntegrations([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('business_profile_id', profile.id);

      if (error) throw error;
      setIntegrations(data || []);
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
      // Get business profile
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', business.user_id)
        .single();

      if (!profile) throw new Error('No business profile found');

      const { error } = await supabase
        .from('integrations')
        .upsert({
          business_profile_id: profile.id,
          platform: platform as Integration['platform'],
          category: 'crm' as Integration['category'],
          status: 'connected',
          external_name: accountName || null,
          last_synced_at: new Date().toISOString(),
        }, { onConflict: 'business_profile_id,platform' });

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
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', business.user_id)
        .single();

      if (!profile) throw new Error('No business profile found');

      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('business_profile_id', profile.id)
        .eq('platform', platform as Integration['platform']);

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
