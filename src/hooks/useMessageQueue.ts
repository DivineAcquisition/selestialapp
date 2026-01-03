import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';

interface QueueStats {
  pending: number;
  sent: number;
  failed: number;
  scheduledNext: string | null;
}

export function useMessageQueue() {
  const { business } = useBusiness();
  const [stats, setStats] = useState<QueueStats>({
    pending: 0,
    sent: 0,
    failed: 0,
    scheduledNext: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!business) {
      setLoading(false);
      return;
    }

    try {
      // Get pending count
      const { count: pendingCount } = await supabase
        .from('message_queue')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .eq('status', 'pending');

      // Get sent count (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: sentCount } = await supabase
        .from('message_queue')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .eq('status', 'sent')
        .gte('sent_at', twentyFourHoursAgo);

      // Get failed count
      const { count: failedCount } = await supabase
        .from('message_queue')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .eq('status', 'failed');

      // Get next scheduled message
      const { data: nextMessage } = await supabase
        .from('message_queue')
        .select('scheduled_for')
        .eq('business_id', business.id)
        .eq('status', 'pending')
        .order('scheduled_for', { ascending: true })
        .limit(1)
        .single();

      setStats({
        pending: pendingCount || 0,
        sent: sentCount || 0,
        failed: failedCount || 0,
        scheduledNext: nextMessage?.scheduled_for || null,
      });
    } catch (error) {
      console.error('Failed to fetch message queue stats:', error);
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription
    if (!business) return;

    const channel = supabase
      .channel('message_queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_queue',
          filter: `business_id=eq.${business.id}`,
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [business, fetchStats]);

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
}
