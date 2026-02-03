import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SmartReplyResult {
  suggestions: string[];
  suggestion_id: string;
  generation_time_ms: number;
}

export function useSmartReplies() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionId, setSuggestionId] = useState<string | null>(null);

  const generateReplies = useCallback(async (
    customerMessage: string,
    customerId?: string,
    quoteId?: string,
    conversationHistory?: unknown[]
  ): Promise<SmartReplyResult | null> => {
    setLoading(true);
    setSuggestions([]);
    setSuggestionId(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-smart-replies', {
        body: {
          customer_message: customerMessage,
          customer_id: customerId,
          quote_id: quoteId,
          conversation_history: conversationHistory,
        },
      });

      if (error) {
        toast({
          title: 'AI error',
          description: 'Failed to generate replies',
          variant: 'destructive',
        });
        return null;
      }

      setSuggestions(data.suggestions);
      setSuggestionId(data.suggestion_id);

      return data;
    } catch (err) {
      console.error('Smart reply error:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate AI replies',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
          was_edited: wasEdited,
          edited_content: editedMessage,
          was_used: true,
        })
        .eq('id', suggestionId);
    } catch (err) {
      console.error('Failed to record selection:', err);
    }
  }, [suggestionId]);

  const provideFeedback = useCallback(async (
    feedback: 'helpful' | 'not_helpful'
  ) => {
    if (!suggestionId) return;

    try {
      // Just log it since there's no feedback column
      console.log('Feedback recorded:', feedback, 'for suggestion:', suggestionId);
      toast({ title: 'Thanks for your feedback!' });
    } catch (err) {
      console.error('Failed to record feedback:', err);
    }
  }, [suggestionId, toast]);

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
