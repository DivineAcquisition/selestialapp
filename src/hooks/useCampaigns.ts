import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';

export interface Campaign {
  id: string;
  created_at: string;
  updated_at: string;
  business_id: string;
  name: string;
  description: string | null;
  campaign_type: string;
  target_audience: string;
  target_customer_types: string[];
  min_days_since_service: number | null;
  max_days_since_service: number | null;
  exclude_recent_days: number | null;
  start_date: string | null;
  end_date: string | null;
  send_time: string | null;
  timezone: string;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  channel: string;
  sms_message: string | null;
  email_subject: string | null;
  email_body: string | null;
  has_promotion: boolean;
  promotion_type: string | null;
  promotion_value: number | null;
  promotion_code: string | null;
  promotion_expires_days: number | null;
  promotion_max_uses: number | null;
  promotion_uses: number;
  status: string;
  total_targeted: number;
  total_sent: number;
  total_delivered: number;
  total_responses: number;
  total_bookings: number;
  total_revenue: number;
  template_id: string | null;
  metadata: Record<string, unknown>;
}

export interface CampaignTemplate {
  id: string;
  created_at: string;
  industry_slug: string | null;
  name: string;
  description: string | null;
  campaign_type: string;
  season: string | null;
  month: number | null;
  holiday: string | null;
  default_audience: string;
  default_min_days: number | null;
  default_max_days: number | null;
  sms_template: string;
  email_subject_template: string | null;
  email_body_template: string | null;
  suggested_promotion_type: string | null;
  suggested_promotion_value: number | null;
  tags: string[];
  effectiveness_score: number | null;
  times_used: number;
}

export interface CampaignFormData {
  name: string;
  description?: string;
  campaign_type: string;
  target_audience: string;
  min_days_since_service?: number;
  max_days_since_service?: number;
  exclude_recent_days?: number;
  start_date?: string;
  end_date?: string;
  send_time?: string;
  channel: string;
  sms_message?: string;
  email_subject?: string;
  email_body?: string;
  has_promotion: boolean;
  promotion_type?: string;
  promotion_value?: number;
  promotion_code?: string;
  promotion_expires_days?: number;
}

export function useCampaigns() {
  const { toast } = useToast();
  const { business } = useBusiness();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    if (!business?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seasonal_campaigns')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns((data || []) as Campaign[]);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      toast({
        title: 'Failed to load campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [business?.id, toast]);

  const fetchTemplates = useCallback(async () => {
    if (!business) return;
    
    try {
      setTemplatesLoading(true);
      const { data, error } = await supabase
        .from('campaign_templates')
        .select('*')
        .or(`industry_slug.eq.${business.industry},industry_slug.is.null`)
        .order('effectiveness_score', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setTemplates((data || []) as CampaignTemplate[]);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setTemplatesLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const createCampaign = async (data: CampaignFormData): Promise<Campaign | null> => {
    if (!business?.id) return null;
    
    try {
      const { data: campaign, error } = await supabase
        .from('seasonal_campaigns')
        .insert({
          business_id: business.id,
          name: data.name,
          description: data.description || null,
          campaign_type: data.campaign_type,
          target_audience: data.target_audience,
          min_days_since_service: data.min_days_since_service || null,
          max_days_since_service: data.max_days_since_service || null,
          exclude_recent_days: data.exclude_recent_days || 7,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          send_time: data.send_time || '10:00:00',
          channel: data.channel,
          sms_message: data.sms_message || null,
          email_subject: data.email_subject || null,
          email_body: data.email_body || null,
          has_promotion: data.has_promotion,
          promotion_type: data.promotion_type || null,
          promotion_value: data.promotion_value || null,
          promotion_code: data.promotion_code || null,
          promotion_expires_days: data.promotion_expires_days || null,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: 'Campaign created',
        description: 'Your campaign has been saved as a draft.',
      });
      
      await fetchCampaigns();
      return campaign as Campaign;
    } catch (err) {
      console.error('Failed to create campaign:', err);
      toast({
        title: 'Failed to create campaign',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateCampaign = async (id: string, data: Partial<CampaignFormData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('seasonal_campaigns')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Campaign updated' });
      await fetchCampaigns();
      return true;
    } catch (err) {
      console.error('Failed to update campaign:', err);
      toast({
        title: 'Failed to update campaign',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteCampaign = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('seasonal_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Campaign deleted' });
      await fetchCampaigns();
      return true;
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      toast({
        title: 'Failed to delete campaign',
        variant: 'destructive',
      });
      return false;
    }
  };

  const scheduleCampaign = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('seasonal_campaigns')
        .update({ status: 'scheduled' })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Campaign scheduled',
        description: 'Your campaign will be sent at the scheduled time.',
      });
      await fetchCampaigns();
      return true;
    } catch (err) {
      console.error('Failed to schedule campaign:', err);
      toast({
        title: 'Failed to schedule campaign',
        variant: 'destructive',
      });
      return false;
    }
  };

  const pauseCampaign = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('seasonal_campaigns')
        .update({ status: 'paused' })
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Campaign paused' });
      await fetchCampaigns();
      return true;
    } catch (err) {
      console.error('Failed to pause campaign:', err);
      toast({
        title: 'Failed to pause campaign',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Stats summary
  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.total_sent, 0),
    totalResponses: campaigns.reduce((sum, c) => sum + c.total_responses, 0),
    totalBookings: campaigns.reduce((sum, c) => sum + c.total_bookings, 0),
    totalRevenue: campaigns.reduce((sum, c) => sum + c.total_revenue, 0),
  };

  return {
    campaigns,
    templates,
    loading,
    templatesLoading,
    stats,
    fetchCampaigns,
    fetchTemplates,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    scheduleCampaign,
    pauseCampaign,
  };
}
