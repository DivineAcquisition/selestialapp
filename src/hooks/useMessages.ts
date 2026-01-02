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
      // Fetch outbound messages
      const { data: outbound } = await supabase
        .from('messages')
        .select('id, created_at, content, status, channel')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      // Fetch inbound messages
      const { data: inbound } = await supabase
        .from('inbound_messages')
        .select('id, created_at, content')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      // Combine and sort
      const combined: ConversationMessage[] = [
        ...(outbound || []).map(m => ({
          ...m,
          direction: 'outbound' as const,
        })),
        ...(inbound || []).map(m => ({
          ...m,
          direction: 'inbound' as const,
          status: 'received',
          channel: 'sms',
        })),
      ].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
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
