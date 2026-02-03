import { useMemo } from 'react';
import { useQuotes } from './useQuotes';

export function useDashboardStats() {
  const { quotes, loading } = useQuotes();

  const stats = useMemo(() => {
    const activeQuotes = quotes.filter(q => ['new', 'following_up'].includes(q.status)).length;
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const wonThisMonth = quotes.filter(q => 
      q.status === 'won' && 
      q.won_at && 
      new Date(q.won_at) >= startOfMonth
    );
    
    const wonAmount = wonThisMonth.reduce((sum, q) => 
      sum + (q.final_job_amount || q.quote_amount || 0), 0
    );
    
    const closedQuotes = quotes.filter(q => ['won', 'lost'].includes(q.status));
    const conversionRate = closedQuotes.length > 0
      ? Math.round((quotes.filter(q => q.status === 'won').length / closedQuotes.length) * 100)
      : 0;

    return {
      activeQuotes,
      wonAmount,
      wonCount: wonThisMonth.length,
      conversionRate,
      revenueRecovered: wonAmount,
    };
  }, [quotes]);

  return { stats, loading };
}