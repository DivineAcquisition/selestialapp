import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConversationMessage {
  id: string;
  created_at: string;
  content: string;
  direction: 'outbound' | 'inbound';
  status: string;
  channel: string;
}

export function useMessages(quoteId: string | null) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!quoteId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      // Fetch outbound messages (live schema: `body`, channel, status nullable)
      const { data: outbound } = await supabase
        .from('messages')
        .select('id, created_at, body, status, channel')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      // Fetch inbound messages
      const { data: inbound } = await supabase
        .from('inbound_messages')
        .select('id, created_at, content')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      const nowIso = new Date().toISOString();
      const combined: ConversationMessage[] = [
        ...(outbound || []).map((m) => ({
          id: m.id,
          created_at: m.created_at ?? nowIso,
          content: m.body ?? '',
          direction: 'outbound' as const,
          status: m.status ?? 'sent',
          channel: m.channel ?? 'sms',
        })),
        ...(inbound || []).map((m) => ({
          id: m.id,
          created_at: m.created_at ?? nowIso,
          content: m.content,
          direction: 'inbound' as const,
          status: 'received',
          channel: 'sms',
        })),
      ].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(combined);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!quoteId) return;

    const channel = supabase
      .channel(`messages-${quoteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `quote_id=eq.${quoteId}`,
        },
        () => fetchMessages()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inbound_messages',
          filter: `quote_id=eq.${quoteId}`,
        },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quoteId, fetchMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, refetch: fetchMessages };
}

// Queue stats hook
interface QueueStats {
  pending: number;
  sent: number;
  failed: number;
  scheduledNext: string | null;
}

export function useMessageQueue(businessId: string | undefined) {
  const [stats, setStats] = useState<QueueStats>({
    pending: 0,
    sent: 0,
    failed: 0,
    scheduledNext: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!businessId) return;

    try {
      const { count: pendingCount } = await supabase
        .from('message_queue')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('status', 'pending');

      const { count: sentCount } = await supabase
        .from('message_queue')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('status', 'sent');

      const { count: failedCount } = await supabase
        .from('message_queue')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('status', 'failed');

      const { data: next } = await supabase
        .from('message_queue')
        .select('scheduled_for')
        .eq('business_id', businessId)
        .eq('status', 'pending')
        .order('scheduled_for', { ascending: true })
        .limit(1)
        .maybeSingle();

      setStats({
        pending: pendingCount || 0,
        sent: sentCount || 0,
        failed: failedCount || 0,
        scheduledNext: next?.scheduled_for || null,
      });
    } catch (err) {
      console.error('Failed to fetch queue stats:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
