import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';

export interface Metric {
  metric_key: string;
  metric_name: string;
  current_value: number;
  previous_value: number;
  change_pct: number;
  benchmark_avg: number;
  benchmark_good: number;
  benchmark_excellent: number;
  performance_level: 'poor' | 'average' | 'good' | 'excellent';
  display_format: 'number' | 'percentage' | 'currency' | 'duration';
  category: 'performance' | 'revenue' | 'retention' | 'engagement';
}

export interface PerformanceAlert {
  id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  metric_key: string | null;
  title: string;
  message: string;
  current_value: number | null;
  previous_value: number | null;
  is_read: boolean;
  is_dismissed: boolean;
  action_url: string | null;
  action_label: string | null;
  created_at: string;
}

export interface BusinessMetrics {
  id: string;
  period_type: string;
  period_start: string;
  period_end: string;
  quotes_created: number;
  quotes_won: number;
  quotes_lost: number;
  quote_win_rate: number;
  total_revenue: number;
  recurring_revenue: number;
  avg_job_value: number;
  avg_response_time_minutes: number;
  new_customers: number;
  repeat_customers: number;
  total_active_customers: number;
  customer_retention_rate: number;
  churn_rate: number;
  messages_sent: number;
  messages_received: number;
  reviews_received: number;
  avg_review_rating: number;
}

export interface IndustryBenchmark {
  id: string;
  industry_slug: string;
  metric_key: string;
  metric_name: string;
  metric_description: string;
  poor_threshold: number;
  average_value: number;
  good_threshold: number;
  excellent_threshold: number;
  higher_is_better: boolean;
  display_format: string;
  category: string;
  priority: number;
}

export function useAnalytics(periodType: 'weekly' | 'monthly' = 'monthly') {
  const { business } = useBusiness();
  const queryClient = useQueryClient();

  // Fetch benchmarks for the business's industry
  const { data: benchmarks } = useQuery({
    queryKey: ['industry-benchmarks', business?.industry],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase
        .from('industry_benchmarks')
        .select('*')
        .eq('industry_slug', business.industry)
        .order('priority');
      if (error) throw error;
      return data as IndustryBenchmark[];
    },
    enabled: !!business,
  });

  // Fetch historical metrics
  const { data: metricsHistory, isLoading: metricsLoading } = useQuery({
    queryKey: ['business-metrics', business?.id, periodType],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('business_id', business.id)
        .eq('period_type', periodType)
        .order('period_start', { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data as BusinessMetrics[]).reverse();
    },
    enabled: !!business,
  });

  // Fetch performance alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['performance-alerts', business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase
        .from('performance_alerts')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as PerformanceAlert[];
    },
    enabled: !!business,
  });

  // Calculate current metrics with benchmarks
  const currentMetrics: Metric[] = benchmarks?.map(benchmark => {
    const current = metricsHistory?.[metricsHistory.length - 1];
    const previous = metricsHistory?.[metricsHistory.length - 2];
    
    let currentValue = 0;
    let previousValue = 0;
    
    switch (benchmark.metric_key) {
      case 'quote_win_rate':
        currentValue = current?.quote_win_rate || 0;
        previousValue = previous?.quote_win_rate || 0;
        break;
      case 'customer_retention_rate':
        currentValue = current?.customer_retention_rate || 0;
        previousValue = previous?.customer_retention_rate || 0;
        break;
      case 'recurring_revenue_pct':
        currentValue = current?.total_revenue ? (current.recurring_revenue / current.total_revenue) * 100 : 0;
        previousValue = previous?.total_revenue ? (previous.recurring_revenue / previous.total_revenue) * 100 : 0;
        break;
      case 'response_time_minutes':
      case 'first_response_minutes':
        currentValue = current?.avg_response_time_minutes || 0;
        previousValue = previous?.avg_response_time_minutes || 0;
        break;
      case 'avg_job_value':
      case 'avg_ticket_value':
      case 'avg_project_value':
        currentValue = (current?.avg_job_value || 0) / 100;
        previousValue = (previous?.avg_job_value || 0) / 100;
        break;
      case 'churn_rate':
        currentValue = current?.churn_rate || 0;
        previousValue = previous?.churn_rate || 0;
        break;
      case 'review_rating':
        currentValue = current?.avg_review_rating || 0;
        previousValue = previous?.avg_review_rating || 0;
        break;
    }
    
    const changePct = previousValue > 0 
      ? ((currentValue - previousValue) / previousValue) * 100 
      : 0;
    
    let performanceLevel: 'poor' | 'average' | 'good' | 'excellent' = 'average';
    if (benchmark.higher_is_better) {
      if (currentValue >= benchmark.excellent_threshold) performanceLevel = 'excellent';
      else if (currentValue >= benchmark.good_threshold) performanceLevel = 'good';
      else if (currentValue >= benchmark.poor_threshold) performanceLevel = 'average';
      else performanceLevel = 'poor';
    } else {
      if (currentValue <= benchmark.excellent_threshold) performanceLevel = 'excellent';
      else if (currentValue <= benchmark.good_threshold) performanceLevel = 'good';
      else if (currentValue <= benchmark.average_value) performanceLevel = 'average';
      else performanceLevel = 'poor';
    }
    
    return {
      metric_key: benchmark.metric_key,
      metric_name: benchmark.metric_name,
      current_value: currentValue,
      previous_value: previousValue,
      change_pct: changePct,
      benchmark_avg: benchmark.average_value,
      benchmark_good: benchmark.good_threshold,
      benchmark_excellent: benchmark.excellent_threshold,
      performance_level: performanceLevel,
      display_format: benchmark.display_format as Metric['display_format'],
      category: benchmark.category as Metric['category'],
    };
  }) || [];

  // Dismiss alert mutation
  const dismissAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('performance_alerts')
        .update({ is_dismissed: true })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-alerts'] });
    },
  });

  return {
    benchmarks,
    metricsHistory,
    currentMetrics,
    alerts,
    isLoading: metricsLoading || alertsLoading,
    dismissAlert: dismissAlert.mutate,
  };
}

export function useMetricsSummary() {
  const { business } = useBusiness();

  return useQuery({
    queryKey: ['metrics-summary', business?.id],
    queryFn: async () => {
      if (!business) return null;
      
      // Get current month stats from quotes
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: quotes } = await supabase
        .from('quotes')
        .select('status, quote_amount, created_at')
        .eq('business_id', business.id)
        .gte('created_at', startOfMonth.toISOString());
      
      const { data: customers } = await supabase
        .from('customers')
        .select('id, is_recurring')
        .eq('business_id', business.id);
      
      const totalQuotes = quotes?.length || 0;
      const wonQuotes = quotes?.filter(q => q.status === 'won').length || 0;
      const winRate = totalQuotes > 0 ? (wonQuotes / totalQuotes) * 100 : 0;
      const totalRevenue = quotes?.filter(q => q.status === 'won')
        .reduce((sum, q) => sum + (q.quote_amount || 0), 0) || 0;
      const recurringCustomers = customers?.filter(c => c.is_recurring).length || 0;
      const totalCustomers = customers?.length || 0;
      
      return {
        totalQuotes,
        wonQuotes,
        winRate,
        totalRevenue,
        recurringCustomers,
        totalCustomers,
        recurringRate: totalCustomers > 0 ? (recurringCustomers / totalCustomers) * 100 : 0,
      };
    },
    enabled: !!business,
  });
}
