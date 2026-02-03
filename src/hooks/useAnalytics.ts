import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useBusiness } from '@/providers/BusinessProvider'
import { fromTable } from '@/lib/supabase/utils'
import type { 
  DashboardSummary, 
  DailyAggregate, 
  RealtimeMetric,
  TimeSeriesData,
  MetricTrend,
} from '@/lib/analytics/types'

// ============================================================================
// DASHBOARD ANALYTICS HOOK
// ============================================================================

export interface UseDashboardAnalyticsOptions {
  days?: number
  includeTrends?: boolean
  includeTimeSeries?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface UseDashboardAnalyticsReturn {
  summary: DashboardSummary | null
  trends: Record<string, MetricTrend> | null
  timeSeries: Record<string, TimeSeriesData> | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardAnalytics(
  options: UseDashboardAnalyticsOptions = {}
): UseDashboardAnalyticsReturn {
  const { 
    days = 30, 
    includeTrends = true, 
    includeTimeSeries = false,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { business } = useBusiness()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [trends, setTrends] = useState<Record<string, MetricTrend> | null>(null)
  const [timeSeries, setTimeSeries] = useState<Record<string, TimeSeriesData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!business) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        days: days.toString(),
        ...(includeTrends && { trends: 'true' }),
        ...(includeTimeSeries && { timeseries: 'true' }),
      })

      const response = await fetch(`/api/analytics/dashboard?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      
      setSummary(data.summary)
      if (includeTrends) setTrends(data.trends || null)
      if (includeTimeSeries) setTimeSeries(data.timeSeries || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [business, days, includeTrends, includeTimeSeries])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchData])

  return {
    summary,
    trends,
    timeSeries,
    loading,
    error,
    refetch: fetchData,
  }
}

// ============================================================================
// REAL-TIME METRICS HOOK
// ============================================================================

export interface UseRealtimeMetricsOptions {
  metrics: string[]
  granularity?: 'minute' | 'hour' | 'day'
  hours?: number
  realtime?: boolean
}

export interface UseRealtimeMetricsReturn {
  data: Record<string, RealtimeMetric[]>
  aggregates: Record<string, { total: number; average: number; min: number; max: number }>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRealtimeMetrics(
  options: UseRealtimeMetricsOptions
): UseRealtimeMetricsReturn {
  const { metrics, granularity = 'hour', hours = 24, realtime = false } = options
  
  const { business } = useBusiness()
  const [data, setData] = useState<Record<string, RealtimeMetric[]>>({})
  const [aggregates, setAggregates] = useState<Record<string, { total: number; average: number; min: number; max: number }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!business) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        metrics: metrics.join(','),
        granularity,
        hours: hours.toString(),
      })

      const response = await fetch(`/api/analytics/metrics?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }

      const result = await response.json()
      setData(result.metrics || {})
      setAggregates(result.aggregates || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }, [business, metrics.join(','), granularity, hours])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Subscribe to realtime updates
  useEffect(() => {
    if (!realtime || !business) return

    const channel = supabase
      .channel('realtime-metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'realtime_metrics',
          filter: `business_id=eq.${business.id}`,
        },
        () => {
          // Refetch on any change
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtime, business, fetchData])

  return {
    data,
    aggregates,
    loading,
    error,
    refetch: fetchData,
  }
}

// ============================================================================
// DAILY AGGREGATES HOOK
// ============================================================================

export interface UseDailyAggregatesOptions {
  startDate?: string
  endDate?: string
}

export interface UseDailyAggregatesReturn {
  data: DailyAggregate[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDailyAggregates(
  options: UseDailyAggregatesOptions = {}
): UseDailyAggregatesReturn {
  const { business } = useBusiness()
  const [data, setData] = useState<DailyAggregate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Default to last 30 days
  const endDate = options.endDate || new Date().toISOString().split('T')[0]
  const startDate = options.startDate || (() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })()

  const fetchData = useCallback(async () => {
    if (!business) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data: aggregates, error: fetchError } = await fromTable(supabase, 'daily_aggregates')
        .select('*')
        .eq('business_id', business.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (fetchError) throw fetchError

      setData((aggregates || []) as DailyAggregate[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch aggregates')
    } finally {
      setLoading(false)
    }
  }, [business, startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

// ============================================================================
// ANALYTICS EVENT TRACKING HOOK
// ============================================================================

export function useAnalyticsTracker() {
  const { business } = useBusiness()
  const isInitialized = useRef(false)

  useEffect(() => {
    if (business && !isInitialized.current) {
      // Dynamically import analytics service to avoid circular dependencies
      import('@/lib/analytics/analytics-service').then(({ analytics }) => {
        analytics.init(business.id)
        isInitialized.current = true
      })
    }

    return () => {
      if (isInitialized.current) {
        import('@/lib/analytics/analytics-service').then(({ analytics }) => {
          analytics.destroy()
          isInitialized.current = false
        })
      }
    }
  }, [business])

  const track = useCallback(async (
    eventName: string,
    category: string,
    eventData?: Record<string, unknown>
  ) => {
    const { analytics } = await import('@/lib/analytics/analytics-service')
    analytics.track(eventName, category as never, eventData)
  }, [])

  return { track }
}

// ============================================================================
// SYNC STATUS HOOK
// ============================================================================

export interface UseSyncStatusReturn {
  lastSync: Date | null
  status: 'idle' | 'syncing' | 'completed' | 'failed'
  pendingCount: number
  error: string | null
  triggerSync: () => Promise<void>
  isSyncing: boolean
}

export function useSyncStatus(): UseSyncStatusReturn {
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [status, setStatus] = useState<'idle' | 'syncing' | 'completed' | 'failed'>('idle')
  const [pendingCount, setPendingCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/sync')
      if (!response.ok) throw new Error('Failed to get sync status')
      
      const data = await response.json()
      setLastSync(data.lastSync ? new Date(data.lastSync) : null)
      setStatus(data.lastSyncStatus || 'idle')
      setPendingCount(data.pendingSync || 0)
      setError(data.error || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get sync status')
    }
  }, [])

  const triggerSync = useCallback(async () => {
    setIsSyncing(true)
    setStatus('syncing')
    
    try {
      const response = await fetch('/api/analytics/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType: 'all', days: 7 }),
      })

      if (!response.ok) throw new Error('Sync failed')

      setStatus('completed')
      await fetchStatus()
    } catch (err) {
      setStatus('failed')
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setIsSyncing(false)
    }
  }, [fetchStatus])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return {
    lastSync,
    status,
    pendingCount,
    error,
    triggerSync,
    isSyncing,
  }
}

// ============================================================================
// BACKWARD COMPATIBLE HOOKS (for existing analytics page)
// ============================================================================

export interface MetricsData {
  revenue: number
  bookings: number
  customers: number
  conversionRate: number
}

// Metric type for BenchmarkComparison component
export interface Metric {
  metric_key: string
  metric_name: string
  current_value: number
  previous_value?: number
  change_pct: number
  benchmark_avg: number
  benchmark_excellent: number
  performance_level: 'excellent' | 'good' | 'average' | 'poor'
  display_format: 'percentage' | 'currency' | 'duration' | 'number'
}

// PerformanceAlert type for InsightsPanel component
export interface PerformanceAlert {
  id: string
  severity: 'info' | 'success' | 'warning' | 'critical'
  title: string
  message: string
  action_label?: string
  action_url?: string
}

// BusinessMetrics type for PerformanceChart component
export interface BusinessMetrics {
  period_start: string
  period_end: string
  quote_win_rate: number
  total_revenue: number
  customer_retention_rate: number
  [key: string]: string | number // Allow additional metrics
}

export interface Alert {
  id: string
  type: 'info' | 'warning' | 'success'
  message: string
}

/**
 * Legacy useAnalytics hook for backward compatibility with existing analytics page
 */
export function useAnalytics(period: 'weekly' | 'monthly' = 'monthly') {
  const days = period === 'weekly' ? 7 : 30
  const { summary, loading } = useDashboardAnalytics({ days, includeTrends: true })
  
  const [alerts, setAlerts] = useState<Alert[]>([])

  const currentMetrics: MetricsData = {
    revenue: summary?.quotes.won_value || 0,
    bookings: summary?.quotes.won || 0,
    customers: summary?.customers.new || 0,
    conversionRate: summary?.quotes.conversion_rate || 0,
  }

  const metricsHistory: MetricsData[] = []

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  return {
    currentMetrics,
    metricsHistory,
    alerts,
    isLoading: loading,
    dismissAlert,
  }
}

/**
 * Legacy useMetricsSummary hook for backward compatibility
 */
export function useMetricsSummary() {
  const { summary, loading, error } = useDashboardAnalytics({ days: 30 })
  
  // Transform to legacy format expected by existing analytics page
  const legacyData = summary ? {
    totalRevenue: (summary.quotes.won_value || 0) * 100, // Convert to cents for backward compat
    totalCustomers: summary.customers.new + summary.customers.active,
    winRate: summary.quotes.conversion_rate || 0,
    recurringRate: 45, // Placeholder - would need recurring customer tracking
    ...summary,
  } : null
  
  return {
    data: legacyData,
    isLoading: loading,
    error,
  }
}
