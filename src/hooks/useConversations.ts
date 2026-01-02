import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';

export interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageDirection: 'inbound' | 'outbound' | null;
  unreadCount: number;
  status: string;
  quoteAmount: number;
}

export function useConversations() {
  const { business } = useBusiness();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchConversations = useCallback(async () => {
    if (!business) return;

    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('business_id', business.id)
        .not('last_message_at', 'is', null)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const mapped: Conversation[] = (data || []).map((q) => ({
        id: q.id,
        customerName: q.customer_name,
        customerPhone: q.customer_phone,
        lastMessageAt: q.last_message_at,
        lastMessagePreview: q.last_message_preview,
        lastMessageDirection: q.last_message_direction as 'inbound' | 'outbound' | null,
        unreadCount: q.unread_count || 0,
        status: q.status,
        quoteAmount: q.quote_amount,
      }));

      setConversations(mapped);
      setTotalUnread(mapped.reduce((sum, c) => sum + c.unreadCount, 0));
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [business]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time subscription for updates
  useEffect(() => {
    if (!business) return;

    const channel = supabase
      .channel('inbox-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inbound_messages',
          filter: `business_id=eq.${business.id}`,
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `business_id=eq.${business.id}`,
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quotes',
          filter: `business_id=eq.${business.id}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [business, fetchConversations]);

  return {
    conversations,
    loading,
    totalUnread,
    refetch: fetchConversations,
  };
}
