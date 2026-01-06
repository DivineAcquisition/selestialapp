"use client"

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useSmartReplies() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateReplies = useCallback(async (
    customerMessage: string,
    customerId?: string,
    quoteId?: string
  ): Promise<string[]> => {
    if (!customerMessage.trim()) return [];
    
    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const res = await fetch('/api/ai/smart-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerMessage, 
          customerId, 
          quoteId 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 429) {
          toast({
            title: 'AI limit reached',
            description: 'You\'ve used all your AI suggestions this month.',
            variant: 'destructive',
          });
        } else {
          throw new Error(data.error || 'Failed to generate replies');
        }
        return [];
      }

      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        return data.suggestions;
      }
      
      return [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate replies';
      setError(message);
      console.error('Smart replies error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { 
    loading, 
    suggestions, 
    error,
    generateReplies, 
    clearSuggestions 
  };
}
