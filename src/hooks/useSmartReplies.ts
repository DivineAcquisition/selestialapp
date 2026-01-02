import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SmartReplyResult {
  suggestions: string[];
  suggestion_id: string;
  tokens: {
    input: number;
    output: number;
  };
  generation_time_ms: number;
}

interface ConversationMessage {
  direction: 'inbound' | 'outbound';
  content: string;
}

export function useSmartReplies() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionId, setSuggestionId] = useState<string | null>(null);

  const generateReplies = useCallback(async (
    customerMessage: string,
    customerId?: string,
    quoteId?: string,
    conversationHistory?: ConversationMessage[]
  ): Promise<SmartReplyResult | null> => {
    setLoading(true);
    setSuggestions([]);
    setSuggestionId(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-smart-replies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            customer_message: customerMessage,
            customer_id: customerId,
            quote_id: quoteId,
            conversation_history: conversationHistory,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'AI limit reached',
            description: 'You\'ve used all your AI suggestions this month. Upgrade for more!',
            variant: 'destructive',
          });
        }
        throw new Error(result.error || 'Failed to generate replies');
      }

      setSuggestions(result.suggestions);
      setSuggestionId(result.suggestion_id);

      return result;
    } catch (err) {
      console.error('Smart reply error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordSelection = useCallback(async (
    selectedIndex: number,
    wasEdited: boolean = false,
    editedMessage?: string
  ) => {
    if (!suggestionId) return;

    try {
      await supabase
        .from('ai_suggestions')
        .update({
          suggestion_selected: selectedIndex,
          was_edited: wasEdited,
          edited_message: editedMessage,
          was_sent: true,
          sent_at: new Date().toISOString(),
        })
        .eq('id', suggestionId);
    } catch (err) {
      console.error('Failed to record selection:', err);
    }
  }, [suggestionId]);

  const provideFeedback = useCallback(async (
    feedback: 'helpful' | 'not_helpful' | 'offensive' | 'inaccurate'
  ) => {
    if (!suggestionId) return;

    try {
      await supabase
        .from('ai_suggestions')
        .update({ feedback })
        .eq('id', suggestionId);
      
      toast({ title: 'Thanks for your feedback!' });
    } catch (err) {
      console.error('Failed to record feedback:', err);
    }
  }, [suggestionId]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSuggestionId(null);
  }, []);

  return {
    loading,
    suggestions,
    suggestionId,
    generateReplies,
    recordSelection,
    provideFeedback,
    clearSuggestions,
  };
}
