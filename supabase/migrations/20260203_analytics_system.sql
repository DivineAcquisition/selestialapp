-- ============================================================================
-- SELESTIAL ANALYTICS SYSTEM
-- Real-time analytics tables for dashboards and event tracking
-- ============================================================================

-- ============================================================================
-- ANALYTICS EVENTS (Real-time event log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Event identification
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL, -- 'quote', 'customer', 'message', 'payment', 'booking', 'campaign', 'system'
  
  -- Event data
  event_data JSONB DEFAULT '{}',
  
  -- Context
  user_id UUID,
  session_id VARCHAR(100),
  
  -- Source tracking
  source VARCHAR(50), -- 'web', 'api', 'webhook', 'cron', 'system'
  source_ip INET,
  user_agent TEXT,
  
  -- Timing
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Partitioning helper
  event_date DATE DEFAULT CURRENT_DATE
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analytics_events_business ON analytics_events(business_id, event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name, event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category, event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_date ON analytics_events(event_date DESC);

-- ============================================================================
-- REAL-TIME METRICS (Aggregated metrics updated in real-time)
-- ============================================================================
CREATE TABLE IF NOT EXISTS realtime_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Metric identification
  metric_name VARCHAR(100) NOT NULL,
  metric_category VARCHAR(50) NOT NULL,
  
  -- Time bucket
  time_bucket TIMESTAMP WITH TIME ZONE NOT NULL, -- e.g., hourly buckets
  granularity VARCHAR(20) DEFAULT 'hour', -- 'minute', 'hour', 'day', 'week', 'month'
  
  -- Metric values
  value_count BIGINT DEFAULT 0,
  value_sum DECIMAL(20, 4) DEFAULT 0,
  value_avg DECIMAL(20, 4) DEFAULT 0,
  value_min DECIMAL(20, 4),
  value_max DECIMAL(20, 4),
  
  -- Additional dimensions
  dimensions JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint for upserts
  UNIQUE(business_id, metric_name, time_bucket, granularity)
);

CREATE INDEX IF NOT EXISTS idx_realtime_metrics_business ON realtime_metrics(business_id, time_bucket DESC);
CREATE INDEX IF NOT EXISTS idx_realtime_metrics_name ON realtime_metrics(metric_name, time_bucket DESC);

-- ============================================================================
-- DAILY AGGREGATES (Daily rollups for historical analysis)
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Date
  date DATE NOT NULL,
  
  -- Quote metrics
  quotes_created INTEGER DEFAULT 0,
  quotes_won INTEGER DEFAULT 0,
  quotes_lost INTEGER DEFAULT 0,
  quotes_pending INTEGER DEFAULT 0,
  quote_value_total DECIMAL(12, 2) DEFAULT 0,
  quote_value_won DECIMAL(12, 2) DEFAULT 0,
  quote_conversion_rate DECIMAL(5, 4) DEFAULT 0,
  
  -- Customer metrics
  customers_new INTEGER DEFAULT 0,
  customers_active INTEGER DEFAULT 0,
  customers_at_risk INTEGER DEFAULT 0,
  customers_churned INTEGER DEFAULT 0,
  
  -- Message metrics
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER,
  
  -- Payment metrics
  payments_count INTEGER DEFAULT 0,
  payments_volume DECIMAL(12, 2) DEFAULT 0,
  payment_links_created INTEGER DEFAULT 0,
  payment_links_paid INTEGER DEFAULT 0,
  
  -- Booking metrics
  bookings_created INTEGER DEFAULT 0,
  bookings_completed INTEGER DEFAULT 0,
  bookings_cancelled INTEGER DEFAULT 0,
  booking_revenue DECIMAL(12, 2) DEFAULT 0,
  
  -- Campaign metrics
  campaigns_sent INTEGER DEFAULT 0,
  campaign_messages INTEGER DEFAULT 0,
  campaign_responses INTEGER DEFAULT 0,
  campaign_conversions INTEGER DEFAULT 0,
  
  -- Engagement metrics
  active_sequences INTEGER DEFAULT 0,
  sequence_completions INTEGER DEFAULT 0,
  ai_suggestions_generated INTEGER DEFAULT 0,
  ai_suggestions_used INTEGER DEFAULT 0,
  
  -- Sync status
  synced_to_iceberg BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_aggregates_business ON daily_aggregates(business_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_aggregates_sync ON daily_aggregates(synced_to_iceberg) WHERE synced_to_iceberg = FALSE;

-- ============================================================================
-- FUNNEL METRICS (Conversion funnel tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS funnel_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Funnel identification
  funnel_name VARCHAR(100) NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  step_order INTEGER NOT NULL,
  
  -- Time period
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metrics
  entries INTEGER DEFAULT 0,
  exits INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 4) DEFAULT 0,
  avg_time_in_step_seconds INTEGER,
  
  -- Dimensions
  dimensions JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, funnel_name, step_name, period_start)
);

CREATE INDEX IF NOT EXISTS idx_funnel_metrics_business ON funnel_metrics(business_id, funnel_name, period_start DESC);

-- ============================================================================
-- ANALYTICS SYNC LOG (Track syncs to Iceberg)
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Sync details
  sync_type VARCHAR(50) NOT NULL, -- 'daily_aggregates', 'events', 'metrics'
  sync_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  
  -- Time range
  data_start_date DATE,
  data_end_date DATE,
  
  -- Stats
  records_synced INTEGER DEFAULT 0,
  bytes_written BIGINT DEFAULT 0,
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_log_status ON analytics_sync_log(sync_status, created_at DESC);

-- ============================================================================
-- DASHBOARD CACHE (Cached dashboard data for fast loading)
-- ============================================================================
CREATE TABLE IF NOT EXISTS dashboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Cache identification
  cache_key VARCHAR(100) NOT NULL,
  
  -- Cached data
  data JSONB NOT NULL,
  
  -- Validity
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, cache_key)
);

CREATE INDEX IF NOT EXISTS idx_dashboard_cache_business ON dashboard_cache(business_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_dashboard_cache_expires ON dashboard_cache(expires_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to log analytics event
CREATE OR REPLACE FUNCTION log_analytics_event(
  p_business_id UUID,
  p_event_name VARCHAR(100),
  p_event_category VARCHAR(50),
  p_event_data JSONB DEFAULT '{}',
  p_source VARCHAR(50) DEFAULT 'system'
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO analytics_events (business_id, event_name, event_category, event_data, source)
  VALUES (p_business_id, p_event_name, p_event_category, p_event_data, p_source)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment realtime metric
CREATE OR REPLACE FUNCTION increment_metric(
  p_business_id UUID,
  p_metric_name VARCHAR(100),
  p_metric_category VARCHAR(50),
  p_value DECIMAL DEFAULT 1,
  p_granularity VARCHAR(20) DEFAULT 'hour'
) RETURNS VOID AS $$
DECLARE
  v_time_bucket TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate time bucket based on granularity
  CASE p_granularity
    WHEN 'minute' THEN
      v_time_bucket := date_trunc('minute', NOW());
    WHEN 'hour' THEN
      v_time_bucket := date_trunc('hour', NOW());
    WHEN 'day' THEN
      v_time_bucket := date_trunc('day', NOW());
    ELSE
      v_time_bucket := date_trunc('hour', NOW());
  END CASE;
  
  -- Upsert the metric
  INSERT INTO realtime_metrics (business_id, metric_name, metric_category, time_bucket, granularity, value_count, value_sum)
  VALUES (p_business_id, p_metric_name, p_metric_category, v_time_bucket, p_granularity, 1, p_value)
  ON CONFLICT (business_id, metric_name, time_bucket, granularity)
  DO UPDATE SET
    value_count = realtime_metrics.value_count + 1,
    value_sum = realtime_metrics.value_sum + p_value,
    value_avg = (realtime_metrics.value_sum + p_value) / (realtime_metrics.value_count + 1),
    value_min = LEAST(COALESCE(realtime_metrics.value_min, p_value), p_value),
    value_max = GREATEST(COALESCE(realtime_metrics.value_max, p_value), p_value),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate daily aggregates
CREATE OR REPLACE FUNCTION calculate_daily_aggregates(
  p_business_id UUID,
  p_date DATE DEFAULT CURRENT_DATE - 1
) RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_aggregates (business_id, date, 
    quotes_created, quotes_won, quotes_lost, quote_value_total, quote_value_won,
    customers_new, messages_sent, messages_received,
    payments_count, payments_volume
  )
  SELECT 
    p_business_id,
    p_date,
    -- Quote metrics
    COALESCE((SELECT COUNT(*) FROM quotes WHERE business_id = p_business_id AND DATE(created_at) = p_date), 0),
    COALESCE((SELECT COUNT(*) FROM quotes WHERE business_id = p_business_id AND DATE(won_at) = p_date), 0),
    COALESCE((SELECT COUNT(*) FROM quotes WHERE business_id = p_business_id AND DATE(lost_at) = p_date), 0),
    COALESCE((SELECT SUM(quote_amount) FROM quotes WHERE business_id = p_business_id AND DATE(created_at) = p_date), 0),
    COALESCE((SELECT SUM(final_job_amount) FROM quotes WHERE business_id = p_business_id AND DATE(won_at) = p_date), 0),
    -- Customer metrics
    COALESCE((SELECT COUNT(*) FROM customers WHERE business_id = p_business_id AND DATE(created_at) = p_date), 0),
    -- Message metrics
    COALESCE((SELECT COUNT(*) FROM messages WHERE business_id = p_business_id AND direction = 'outbound' AND DATE(created_at) = p_date), 0),
    COALESCE((SELECT COUNT(*) FROM messages WHERE business_id = p_business_id AND direction = 'inbound' AND DATE(created_at) = p_date), 0),
    -- Payment metrics
    COALESCE((SELECT COUNT(*) FROM payment_links WHERE business_id = p_business_id AND DATE(paid_at) = p_date), 0),
    COALESCE((SELECT SUM(amount) / 100.0 FROM payment_links WHERE business_id = p_business_id AND DATE(paid_at) = p_date), 0)
  ON CONFLICT (business_id, date)
  DO UPDATE SET
    quotes_created = EXCLUDED.quotes_created,
    quotes_won = EXCLUDED.quotes_won,
    quotes_lost = EXCLUDED.quotes_lost,
    quote_value_total = EXCLUDED.quote_value_total,
    quote_value_won = EXCLUDED.quote_value_won,
    customers_new = EXCLUDED.customers_new,
    messages_sent = EXCLUDED.messages_sent,
    messages_received = EXCLUDED.messages_received,
    payments_count = EXCLUDED.payments_count,
    payments_volume = EXCLUDED.payments_volume,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get dashboard summary
CREATE OR REPLACE FUNCTION get_dashboard_summary(
  p_business_id UUID,
  p_days INTEGER DEFAULT 30
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'quotes', jsonb_build_object(
      'total', COALESCE(SUM(quotes_created), 0),
      'won', COALESCE(SUM(quotes_won), 0),
      'lost', COALESCE(SUM(quotes_lost), 0),
      'value', COALESCE(SUM(quote_value_total), 0),
      'won_value', COALESCE(SUM(quote_value_won), 0),
      'conversion_rate', CASE WHEN SUM(quotes_created) > 0 
        THEN ROUND((SUM(quotes_won)::DECIMAL / SUM(quotes_created)) * 100, 1)
        ELSE 0 END
    ),
    'customers', jsonb_build_object(
      'new', COALESCE(SUM(customers_new), 0),
      'active', COALESCE(SUM(customers_active), 0),
      'at_risk', COALESCE(SUM(customers_at_risk), 0)
    ),
    'messages', jsonb_build_object(
      'sent', COALESCE(SUM(messages_sent), 0),
      'received', COALESCE(SUM(messages_received), 0)
    ),
    'payments', jsonb_build_object(
      'count', COALESCE(SUM(payments_count), 0),
      'volume', COALESCE(SUM(payments_volume), 0)
    ),
    'period_days', p_days
  ) INTO v_result
  FROM daily_aggregates
  WHERE business_id = p_business_id
    AND date >= CURRENT_DATE - p_days;
  
  RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR AUTO EVENT LOGGING
-- ============================================================================

-- Trigger to log quote events
CREATE OR REPLACE FUNCTION trigger_log_quote_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_analytics_event(
      NEW.business_id,
      'quote_created',
      'quote',
      jsonb_build_object('quote_id', NEW.id, 'amount', NEW.quote_amount, 'service_type', NEW.service_type)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM log_analytics_event(
        NEW.business_id,
        'quote_status_changed',
        'quote',
        jsonb_build_object('quote_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
      );
      
      -- Log specific status events
      IF NEW.status = 'won' THEN
        PERFORM log_analytics_event(NEW.business_id, 'quote_won', 'quote', jsonb_build_object('quote_id', NEW.id, 'amount', NEW.final_job_amount));
        PERFORM increment_metric(NEW.business_id, 'quotes_won', 'quote', COALESCE(NEW.final_job_amount, NEW.quote_amount));
      ELSIF NEW.status = 'lost' THEN
        PERFORM log_analytics_event(NEW.business_id, 'quote_lost', 'quote', jsonb_build_object('quote_id', NEW.id, 'reason', NEW.lost_reason));
        PERFORM increment_metric(NEW.business_id, 'quotes_lost', 'quote', 1);
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quotes_analytics_trigger ON quotes;
CREATE TRIGGER quotes_analytics_trigger
  AFTER INSERT OR UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_quote_event();

-- Trigger to log message events
CREATE OR REPLACE FUNCTION trigger_log_message_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_analytics_event(
      NEW.business_id,
      CASE WHEN NEW.direction = 'outbound' THEN 'message_sent' ELSE 'message_received' END,
      'message',
      jsonb_build_object('message_id', NEW.id, 'channel', NEW.channel, 'direction', NEW.direction)
    );
    
    PERFORM increment_metric(
      NEW.business_id,
      CASE WHEN NEW.direction = 'outbound' THEN 'messages_sent' ELSE 'messages_received' END,
      'message',
      1
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS messages_analytics_trigger ON messages;
CREATE TRIGGER messages_analytics_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_message_event();

-- Trigger to log customer events
CREATE OR REPLACE FUNCTION trigger_log_customer_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_analytics_event(
      NEW.business_id,
      'customer_created',
      'customer',
      jsonb_build_object('customer_id', NEW.id, 'customer_type', NEW.customer_type)
    );
    
    PERFORM increment_metric(NEW.business_id, 'customers_new', 'customer', 1);
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log customer type changes
    IF OLD.customer_type IS DISTINCT FROM NEW.customer_type THEN
      PERFORM log_analytics_event(
        NEW.business_id,
        'customer_type_changed',
        'customer',
        jsonb_build_object('customer_id', NEW.id, 'old_type', OLD.customer_type, 'new_type', NEW.customer_type)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_analytics_trigger ON customers;
CREATE TRIGGER customers_analytics_trigger
  AFTER INSERT OR UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_customer_event();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_cache ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can access own analytics events" ON analytics_events;
CREATE POLICY "Users can access own analytics events" ON analytics_events
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own realtime metrics" ON realtime_metrics;
CREATE POLICY "Users can access own realtime metrics" ON realtime_metrics
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own daily aggregates" ON daily_aggregates;
CREATE POLICY "Users can access own daily aggregates" ON daily_aggregates
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own funnel metrics" ON funnel_metrics;
CREATE POLICY "Users can access own funnel metrics" ON funnel_metrics
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own dashboard cache" ON dashboard_cache;
CREATE POLICY "Users can access own dashboard cache" ON dashboard_cache
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE realtime_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_aggregates;
