import { supabase } from '@/integrations/supabase/client'
import { fromTable, callRpc } from '@/lib/supabase/utils'
import type {
  AnalyticsEvent,
  EventCategory,
  EventSource,
  DashboardSummary,
  DailyAggregate,
  RealtimeMetric,
  TimeSeriesData,
  MetricGranularity,
} from './types'

// ============================================================================
// ANALYTICS SERVICE
// Client-side analytics tracking and retrieval
// ============================================================================

class AnalyticsService {
  private sessionId: string
  private businessId: string | null = null
  private eventQueue: AnalyticsEvent[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private isInitialized = false

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize analytics with business context
   */
  init(businessId: string) {
    this.businessId = businessId
    this.isInitialized = true
    this.startFlushInterval()
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    // Flush remaining events
    this.flush()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private startFlushInterval() {
    // Flush events every 10 seconds
    this.flushInterval = setInterval(() => {
      this.flush()
    }, 10000)
  }

  // ============================================================================
  // EVENT TRACKING
  // ============================================================================

  /**
   * Track a generic event
   */
  track(
    eventName: string,
    category: EventCategory,
    eventData?: Record<string, unknown>,
    options?: { immediate?: boolean }
  ) {
    if (!this.businessId) {
      console.warn('Analytics not initialized with business ID')
      return
    }

    const event: AnalyticsEvent = {
      business_id: this.businessId,
      event_name: eventName,
      event_category: category,
      event_data: eventData,
      session_id: this.sessionId,
      source: 'web' as EventSource,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }

    if (options?.immediate) {
      this.sendEvent(event)
    } else {
      this.eventQueue.push(event)
    }
  }

  // ============================================================================
  // CONVENIENCE TRACKING METHODS
  // ============================================================================

  // Quote events
  trackQuoteCreated(quoteId: string, amount: number, serviceType: string) {
    this.track('quote_created', 'quote', { quote_id: quoteId, amount, service_type: serviceType })
  }

  trackQuoteViewed(quoteId: string) {
    this.track('quote_viewed', 'quote', { quote_id: quoteId })
  }

  trackQuoteWon(quoteId: string, amount: number) {
    this.track('quote_won', 'quote', { quote_id: quoteId, amount }, { immediate: true })
  }

  trackQuoteLost(quoteId: string, reason?: string) {
    this.track('quote_lost', 'quote', { quote_id: quoteId, reason }, { immediate: true })
  }

  // Message events
  trackMessageSent(messageId: string, channel: 'sms' | 'email', isAutomated: boolean) {
    this.track('message_sent', 'message', { message_id: messageId, channel, is_automated: isAutomated })
  }

  trackMessageReceived(messageId: string, channel: 'sms' | 'email') {
    this.track('message_received', 'message', { message_id: messageId, channel })
  }

  // Customer events
  trackCustomerCreated(customerId: string, customerType: string) {
    this.track('customer_created', 'customer', { customer_id: customerId, customer_type: customerType })
  }

  trackCustomerUpdated(customerId: string, changes: Record<string, unknown>) {
    this.track('customer_updated', 'customer', { customer_id: customerId, changes })
  }

  // Payment events
  trackPaymentLinkCreated(linkId: string, amount: number) {
    this.track('payment_link_created', 'payment', { link_id: linkId, amount })
  }

  trackPaymentReceived(paymentId: string, amount: number) {
    this.track('payment_received', 'payment', { payment_id: paymentId, amount }, { immediate: true })
  }

  // Booking events
  trackBookingCreated(bookingId: string, serviceType: string, amount: number) {
    this.track('booking_created', 'booking', { booking_id: bookingId, service_type: serviceType, amount })
  }

  trackBookingCompleted(bookingId: string) {
    this.track('booking_completed', 'booking', { booking_id: bookingId })
  }

  // Campaign events
  trackCampaignSent(campaignId: string, recipientCount: number) {
    this.track('campaign_sent', 'campaign', { campaign_id: campaignId, recipient_count: recipientCount })
  }

  // AI events
  trackAISuggestionGenerated(suggestionId: string, model: string, timeMs: number) {
    this.track('ai_suggestion_generated', 'ai', { suggestion_id: suggestionId, model, generation_time_ms: timeMs })
  }

  trackAISuggestionUsed(suggestionId: string, wasEdited: boolean) {
    this.track('ai_suggestion_used', 'ai', { suggestion_id: suggestionId, was_edited: wasEdited })
  }

  // User events
  trackPageView(page: string, referrer?: string) {
    this.track('page_view', 'user', { page, referrer })
  }

  trackFeatureUsed(featureName: string, metadata?: Record<string, unknown>) {
    this.track('feature_used', 'user', { feature: featureName, ...metadata })
  }

  // ============================================================================
  // FLUSH EVENTS TO API
  // ============================================================================

  private async flush() {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    try {
      await this.sendEvents(events)
    } catch (error) {
      console.error('Failed to flush analytics events:', error)
      // Put events back in queue for retry
      this.eventQueue = [...events, ...this.eventQueue]
    }
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [event] }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send event: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error)
    }
  }

  private async sendEvents(events: AnalyticsEvent[]) {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send events: ${response.statusText}`)
    }
  }

  // ============================================================================
  // DATA RETRIEVAL
  // ============================================================================

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(days: number = 30): Promise<DashboardSummary | null> {
    if (!this.businessId) return null

    try {
      const { data, error } = await callRpc(supabase, 'get_dashboard_summary', {
        p_business_id: this.businessId,
        p_days: days,
      })

      if (error) throw error
      return data as DashboardSummary
    } catch (error) {
      console.error('Failed to get dashboard summary:', error)
      return null
    }
  }

  /**
   * Get daily aggregates for a date range
   */
  async getDailyAggregates(startDate: string, endDate: string): Promise<DailyAggregate[]> {
    if (!this.businessId) return []

    try {
      const { data, error } = await fromTable(supabase, 'daily_aggregates')
        .select('*')
        .eq('business_id', this.businessId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (error) throw error
      return (data || []) as DailyAggregate[]
    } catch (error) {
      console.error('Failed to get daily aggregates:', error)
      return []
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealtimeMetrics(
    metricNames: string[],
    granularity: MetricGranularity = 'hour',
    hours: number = 24
  ): Promise<RealtimeMetric[]> {
    if (!this.businessId) return []

    const startTime = new Date()
    startTime.setHours(startTime.getHours() - hours)

    try {
      const { data, error } = await fromTable(supabase, 'realtime_metrics')
        .select('*')
        .eq('business_id', this.businessId)
        .eq('granularity', granularity)
        .in('metric_name', metricNames)
        .gte('time_bucket', startTime.toISOString())
        .order('time_bucket', { ascending: true })

      if (error) throw error
      return (data || []) as RealtimeMetric[]
    } catch (error) {
      console.error('Failed to get realtime metrics:', error)
      return []
    }
  }

  /**
   * Get time series data for a metric
   */
  async getTimeSeries(
    metricName: string,
    startDate: string,
    endDate: string
  ): Promise<TimeSeriesData | null> {
    if (!this.businessId) return null

    try {
      const aggregates = await this.getDailyAggregates(startDate, endDate)
      
      // Map metric name to aggregate field
      const metricField = this.getMetricField(metricName)
      if (!metricField) return null

      const data = aggregates.map(agg => ({
        timestamp: agg.date,
        value: (agg as unknown as Record<string, unknown>)[metricField] as number || 0,
      }))

      const total = data.reduce((sum, d) => sum + d.value, 0)
      const average = data.length > 0 ? total / data.length : 0

      return {
        metric_name: metricName,
        data,
        total,
        average,
      }
    } catch (error) {
      console.error('Failed to get time series:', error)
      return null
    }
  }

  private getMetricField(metricName: string): string | null {
    const metricMap: Record<string, string> = {
      'quotes_created': 'quotes_created',
      'quotes_won': 'quotes_won',
      'quotes_lost': 'quotes_lost',
      'quote_value': 'quote_value_total',
      'customers_new': 'customers_new',
      'messages_sent': 'messages_sent',
      'messages_received': 'messages_received',
      'payments_count': 'payments_count',
      'payments_volume': 'payments_volume',
      'bookings_created': 'bookings_created',
    }
    return metricMap[metricName] || null
  }

  /**
   * Get recent events
   */
  async getRecentEvents(category?: EventCategory, limit: number = 50): Promise<AnalyticsEvent[]> {
    if (!this.businessId) return []

    try {
      let query = fromTable(supabase, 'analytics_events')
        .select('*')
        .eq('business_id', this.businessId)
        .order('event_timestamp', { ascending: false })
        .limit(limit)

      if (category) {
        query = query.eq('event_category', category)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as AnalyticsEvent[]
    } catch (error) {
      console.error('Failed to get recent events:', error)
      return []
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsService()

// Export class for testing
export { AnalyticsService }
