import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';

export interface ThreadMessage {
  id: string;
  createdAt: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: string;
}

export function useMessageThread(quoteId: string | null) {
  const { business } = useBusiness();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!quoteId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      // Fetch outbound messages
      const { data: outbound, error: outError } = await supabase
        .from('messages')
        .select('id, created_at, content, status')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (outError) throw outError;

      // Fetch inbound messages
      const { data: inbound, error: inError } = await supabase
        .from('inbound_messages')
        .select('id, created_at, content, is_read')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (inError) throw inError;

      // Combine and sort
      const combined: ThreadMessage[] = [
        ...(outbound || []).map((m) => ({
          id: m.id,
          createdAt: m.created_at,
          content: m.content,
          direction: 'outbound' as const,
          status: m.status,
        })),
        ...(inbound || []).map((m) => ({
          id: m.id,
          createdAt: m.created_at,
          content: m.content,
          direction: 'inbound' as const,
          status: m.is_read ? 'read' : 'unread',
        })),
      ].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(combined);

      // Mark as read
      if (inbound && inbound.some(m => !m.is_read)) {
        await supabase.rpc('mark_conversation_read', { p_quote_id: quoteId });
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!quoteId) return;

    const channel = supabase
      .channel(`thread-${quoteId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `quote_id=eq.${quoteId}`,
        },
        () => fetchMessages()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
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

  // Send reply
  const sendReply = useCallback(async (content: string) => {
    if (!quoteId || !business || !content.trim()) return { error: 'Invalid input' };

    setSending(true);
    try {
      // Get quote for customer phone
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('customer_phone')
        .eq('id', quoteId)
        .single();

      if (quoteError || !quote) throw new Error('Quote not found');

      // Get business phone
      const { data: phone, error: phoneError } = await supabase
        .from('phone_numbers')
        .select('phone_number')
        .eq('business_id', business.id)
        .eq('status', 'active')
        .single();

      if (phoneError || !phone) throw new Error('No active phone number');

      // Send via Edge Function
      const { data, error } = await supabase.functions.invoke('send-reply', {
        body: {
          to: quote.customer_phone,
          from: phone.phone_number,
          content: content.trim(),
          quoteId,
          businessId: business.id,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Refresh messages
      await fetchMessages();

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Send failed' };
    } finally {
      setSending(false);
    }
  }, [quoteId, business, fetchMessages]);

  return {
    messages,
    loading,
    sending,
    sendReply,
    refetch: fetchMessages,
  };
}
