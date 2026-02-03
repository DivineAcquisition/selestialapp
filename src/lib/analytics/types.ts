// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export type EventCategory = 
  | 'quote'
  | 'customer'
  | 'message'
  | 'payment'
  | 'booking'
  | 'campaign'
  | 'sequence'
  | 'ai'
  | 'system'
  | 'user'

export type EventSource = 'web' | 'api' | 'webhook' | 'cron' | 'system'

export type MetricGranularity = 'minute' | 'hour' | 'day' | 'week' | 'month'

// ============================================================================
// EVENT DEFINITIONS
// ============================================================================

export interface AnalyticsEvent {
  id?: string
  business_id: string
  event_name: string
  event_category: EventCategory
  event_data?: Record<string, unknown>
  user_id?: string
  session_id?: string
  source?: EventSource
  source_ip?: string
  user_agent?: string
  event_timestamp?: string
}

// Pre-defined event types
export interface QuoteCreatedEvent {
  quote_id: string
  amount: number
  service_type: string
  customer_name?: string
}

export interface QuoteWonEvent {
  quote_id: string
  amount: number
  time_to_win_hours?: number
}

export interface QuoteLostEvent {
  quote_id: string
  reason?: string
  competitor?: string
}

export interface MessageSentEvent {
  message_id: string
  channel: 'sms' | 'email'
  recipient: string
  is_automated: boolean
}

export interface MessageReceivedEvent {
  message_id: string
  channel: 'sms' | 'email'
  sender: string
  response_time_minutes?: number
}

export interface PaymentReceivedEvent {
  payment_id: string
  amount: number
  payment_method: string
  quote_id?: string
}

export interface BookingCreatedEvent {
  booking_id: string
  service_type: string
  amount: number
  scheduled_date: string
}

export interface CustomerCreatedEvent {
  customer_id: string
  customer_type: string
  source?: string
}

export interface CampaignSentEvent {
  campaign_id: string
  campaign_name: string
  recipients_count: number
}

export interface AIGeneratedEvent {
  suggestion_id: string
  model: string
  generation_time_ms: number
  was_used: boolean
}

// ============================================================================
// METRIC TYPES
// ============================================================================

export interface RealtimeMetric {
  id: string
  business_id: string
  metric_name: string
  metric_category: string
  time_bucket: string
  granularity: MetricGranularity
  value_count: number
  value_sum: number
  value_avg: number
  value_min?: number
  value_max?: number
  dimensions?: Record<string, unknown>
}

export interface DailyAggregate {
  id: string
  business_id: string
  date: string
  
  // Quote metrics
  quotes_created: number
  quotes_won: number
  quotes_lost: number
  quotes_pending: number
  quote_value_total: number
  quote_value_won: number
  quote_conversion_rate: number
  
  // Customer metrics
  customers_new: number
  customers_active: number
  customers_at_risk: number
  customers_churned: number
  
  // Message metrics
  messages_sent: number
  messages_received: number
  messages_delivered: number
  messages_failed: number
  avg_response_time_minutes?: number
  
  // Payment metrics
  payments_count: number
  payments_volume: number
  payment_links_created: number
  payment_links_paid: number
  
  // Booking metrics
  bookings_created: number
  bookings_completed: number
  bookings_cancelled: number
  booking_revenue: number
  
  // Campaign metrics
  campaigns_sent: number
  campaign_messages: number
  campaign_responses: number
  campaign_conversions: number
  
  // Engagement metrics
  active_sequences: number
  sequence_completions: number
  ai_suggestions_generated: number
  ai_suggestions_used: number
  
  // Sync status
  synced_to_iceberg: boolean
  synced_at?: string
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardSummary {
  quotes: {
    total: number
    won: number
    lost: number
    value: number
    won_value: number
    conversion_rate: number
  }
  customers: {
    new: number
    active: number
    at_risk: number
  }
  messages: {
    sent: number
    received: number
  }
  payments: {
    count: number
    volume: number
  }
  period_days: number
}

export interface MetricTrend {
  metric_name?: string
  value?: number
  current_value?: number
  previous_value?: number
  change?: number
  change_percent?: number
  trend: 'up' | 'down' | 'stable'
}

export interface FunnelStep {
  step_name: string
  step_order: number
  entries: number
  exits: number
  conversions: number
  conversion_rate: number
  avg_time_seconds?: number
}

export interface FunnelData {
  funnel_name: string
  steps: FunnelStep[]
  total_conversion_rate: number
}

// ============================================================================
// CHART DATA TYPES
// ============================================================================

export interface TimeSeriesDataPoint {
  timestamp: string
  value: number
  label?: string
}

export interface TimeSeriesData {
  metric_name: string
  data: TimeSeriesDataPoint[]
  total: number
  average: number
}

export interface PieChartData {
  name: string
  value: number
  color?: string
}

export interface BarChartData {
  label: string
  value: number
  category?: string
}

// ============================================================================
// ICEBERG SYNC TYPES
// ============================================================================

export interface SyncJob {
  id: string
  sync_type: 'daily_aggregates' | 'events' | 'metrics'
  sync_status: 'pending' | 'running' | 'completed' | 'failed'
  data_start_date?: string
  data_end_date?: string
  records_synced: number
  bytes_written: number
  error_message?: string
  retry_count: number
  started_at?: string
  completed_at?: string
  created_at: string
}

// ============================================================================
// API TYPES
// ============================================================================

export interface TrackEventRequest {
  event_name: string
  event_category: EventCategory
  event_data?: Record<string, unknown>
  session_id?: string
}

export interface TrackEventResponse {
  success: boolean
  event_id?: string
  error?: string
}

export interface GetMetricsRequest {
  metric_names?: string[]
  start_date?: string
  end_date?: string
  granularity?: MetricGranularity
}

export interface GetDashboardRequest {
  days?: number
  include_trends?: boolean
  include_funnel?: boolean
}
