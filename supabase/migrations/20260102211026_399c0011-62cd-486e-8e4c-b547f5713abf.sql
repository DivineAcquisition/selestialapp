-- ============================================
-- INDUSTRY BENCHMARKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  industry_slug TEXT NOT NULL,
  
  metric_key TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_description TEXT,
  metric_unit TEXT,
  
  poor_threshold DECIMAL(10,2),
  average_value DECIMAL(10,2),
  good_threshold DECIMAL(10,2),
  excellent_threshold DECIMAL(10,2),
  
  higher_is_better BOOLEAN DEFAULT true,
  display_format TEXT DEFAULT 'number',
  decimal_places INTEGER DEFAULT 1,
  category TEXT DEFAULT 'performance',
  priority INTEGER DEFAULT 0,
  
  UNIQUE(industry_slug, metric_key)
);

CREATE INDEX IF NOT EXISTS idx_benchmarks_industry ON industry_benchmarks(industry_slug);

-- ============================================
-- BUSINESS METRICS SNAPSHOT TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  
  period_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  quotes_created INTEGER DEFAULT 0,
  quotes_won INTEGER DEFAULT 0,
  quotes_lost INTEGER DEFAULT 0,
  quote_win_rate DECIMAL(5,2),
  
  total_revenue INTEGER DEFAULT 0,
  recurring_revenue INTEGER DEFAULT 0,
  one_time_revenue INTEGER DEFAULT 0,
  avg_job_value INTEGER DEFAULT 0,
  
  avg_response_time_minutes INTEGER,
  first_response_under_1hr INTEGER DEFAULT 0,
  first_response_total INTEGER DEFAULT 0,
  
  new_customers INTEGER DEFAULT 0,
  repeat_customers INTEGER DEFAULT 0,
  churned_customers INTEGER DEFAULT 0,
  total_active_customers INTEGER DEFAULT 0,
  
  customer_retention_rate DECIMAL(5,2),
  churn_rate DECIMAL(5,2),
  
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2),
  reviews_received INTEGER DEFAULT 0,
  avg_review_rating DECIMAL(3,2),
  
  campaign_messages_sent INTEGER DEFAULT 0,
  campaign_responses INTEGER DEFAULT 0,
  campaign_bookings INTEGER DEFAULT 0,
  
  UNIQUE(business_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_metrics_business ON business_metrics(business_id);
CREATE INDEX IF NOT EXISTS idx_metrics_period ON business_metrics(period_type, period_start);

ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics"
  ON business_metrics FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- BUSINESS GOALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS business_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  
  metric_key TEXT NOT NULL,
  goal_name TEXT NOT NULL,
  
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  
  period_type TEXT DEFAULT 'monthly',
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  
  status TEXT DEFAULT 'active',
  achieved_at TIMESTAMPTZ,
  progress_pct DECIMAL(5,2) DEFAULT 0,
  
  UNIQUE(business_id, metric_key, starts_at)
);

ALTER TABLE business_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON business_goals FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- PERFORMANCE ALERTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  metric_key TEXT,
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  current_value DECIMAL(10,2),
  previous_value DECIMAL(10,2),
  threshold_value DECIMAL(10,2),
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  
  action_url TEXT,
  action_label TEXT
);

CREATE INDEX IF NOT EXISTS idx_alerts_business ON performance_alerts(business_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON performance_alerts(business_id, is_read) WHERE is_read = false;

ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts"
  ON performance_alerts FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- SEED INDUSTRY BENCHMARKS
-- ============================================

INSERT INTO industry_benchmarks (industry_slug, metric_key, metric_name, metric_description, metric_unit, poor_threshold, average_value, good_threshold, excellent_threshold, higher_is_better, display_format, category, priority) VALUES
-- Residential Cleaning
('residential_cleaning', 'quote_win_rate', 'Quote Win Rate', 'Percentage of quotes that convert to jobs', 'percentage', 20, 35, 45, 55, true, 'percentage', 'performance', 1),
('residential_cleaning', 'customer_retention_rate', 'Customer Retention', 'Percentage of recurring customers retained', 'percentage', 70, 85, 90, 95, true, 'percentage', 'retention', 2),
('residential_cleaning', 'recurring_revenue_pct', 'Recurring Revenue %', 'Revenue from recurring vs one-time', 'percentage', 40, 60, 75, 85, true, 'percentage', 'revenue', 3),
('residential_cleaning', 'response_time_minutes', 'Avg Response Time', 'Time to first response', 'minutes', 240, 120, 60, 30, false, 'duration', 'performance', 4),
('residential_cleaning', 'avg_job_value', 'Average Job Value', 'Average revenue per job', 'currency', 100, 150, 200, 275, true, 'currency', 'revenue', 5),
-- HVAC
('hvac', 'quote_win_rate', 'Quote Win Rate', 'Percentage of quotes that convert', 'percentage', 15, 28, 38, 50, true, 'percentage', 'performance', 1),
('hvac', 'first_response_minutes', 'First Response Time', 'Time to contact new leads', 'minutes', 120, 45, 20, 10, false, 'duration', 'performance', 2),
('hvac', 'same_day_booking_rate', 'Same-Day Booking Rate', 'Urgent requests booked same day', 'percentage', 50, 70, 85, 95, true, 'percentage', 'performance', 3),
('hvac', 'maintenance_plan_rate', 'Maintenance Plan Conversion', 'Customers on annual plans', 'percentage', 10, 25, 40, 55, true, 'percentage', 'retention', 4),
('hvac', 'avg_ticket_value', 'Average Ticket Value', 'Average revenue per call', 'currency', 200, 450, 700, 1200, true, 'currency', 'revenue', 5),
-- Plumbing
('plumbing', 'quote_win_rate', 'Quote Win Rate', 'Percentage of quotes converted', 'percentage', 20, 35, 45, 55, true, 'percentage', 'performance', 1),
('plumbing', 'first_response_minutes', 'First Response Time', 'Time to contact emergency leads', 'minutes', 60, 20, 10, 5, false, 'duration', 'performance', 2),
('plumbing', 'avg_ticket_value', 'Average Ticket Value', 'Average revenue per job', 'currency', 150, 350, 550, 800, true, 'currency', 'revenue', 3),
-- Lawn Care
('lawn_care', 'quote_win_rate', 'Quote Win Rate', 'Percentage of quotes converted', 'percentage', 25, 40, 50, 60, true, 'percentage', 'performance', 1),
('lawn_care', 'customer_retention_rate', 'Season Retention', 'Customers retained season-over-season', 'percentage', 60, 75, 85, 92, true, 'percentage', 'retention', 2),
('lawn_care', 'recurring_revenue_pct', 'Recurring Revenue %', 'Revenue from contracts', 'percentage', 50, 70, 80, 90, true, 'percentage', 'revenue', 3),
-- Pest Control
('pest_control', 'quote_win_rate', 'Quote Win Rate', 'Percentage of quotes converted', 'percentage', 25, 40, 50, 65, true, 'percentage', 'performance', 1),
('pest_control', 'quarterly_plan_rate', 'Prevention Plan Rate', 'One-time to plan conversion', 'percentage', 15, 30, 45, 60, true, 'percentage', 'retention', 2),
-- Painting
('painting', 'quote_win_rate', 'Quote Win Rate', 'Percentage of estimates closed', 'percentage', 15, 28, 38, 50, true, 'percentage', 'performance', 1),
('painting', 'response_time_minutes', 'Response Time', 'Time to contact leads', 'minutes', 480, 240, 120, 60, false, 'duration', 'performance', 2),
('painting', 'avg_project_value', 'Average Project Value', 'Average revenue per job', 'currency', 1500, 3500, 6000, 10000, true, 'currency', 'revenue', 3)
ON CONFLICT (industry_slug, metric_key) DO NOTHING;