-- Add missing tables and columns

-- Performance Alerts table
CREATE TABLE IF NOT EXISTS public.performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'info', -- info, warning, critical, success
  metric_key VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  current_value NUMERIC,
  previous_value NUMERIC,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  action_url TEXT,
  action_label VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts" ON public.performance_alerts
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Add missing columns to customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

-- Add missing columns to businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS quotes_limit INTEGER DEFAULT 50;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS sequences_limit INTEGER DEFAULT 3;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Add missing columns to quotes for conversation tracking
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS last_message_preview TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS last_message_direction VARCHAR(10);

-- Add industry_slug column to industry_benchmarks for lookup compatibility
ALTER TABLE public.industry_benchmarks ADD COLUMN IF NOT EXISTS industry_slug VARCHAR(50);

-- Update industry_slug from industry enum
UPDATE public.industry_benchmarks SET industry_slug = industry::text WHERE industry_slug IS NULL;

-- Add proper columns to industry_benchmarks for compatibility
ALTER TABLE public.industry_benchmarks ADD COLUMN IF NOT EXISTS metric_key VARCHAR(100);
ALTER TABLE public.industry_benchmarks ADD COLUMN IF NOT EXISTS metric_name VARCHAR(255);
ALTER TABLE public.industry_benchmarks ADD COLUMN IF NOT EXISTS metric_description TEXT;
ALTER TABLE public.industry_benchmarks ADD COLUMN IF NOT EXISTS poor_threshold NUMERIC;
ALTER TABLE public.industry_benchmarks ADD COLUMN IF NOT EXISTS good_threshold NUMERIC;
ALTER TABLE public.industry_benchmarks ADD COLUMN IF NOT EXISTS excellent_threshold NUMERIC;
ALTER TABLE public.industry_benchmarks ADD COLUMN IF NOT EXISTS higher_is_better BOOLEAN DEFAULT true;
ALTER TABLE public.industry_benchmarks ADD COLUMN IF NOT EXISTS display_format VARCHAR(50);
ALTER TABLE public.industry_benchmarks ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE public.industry_benchmarks ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Add period_start, period_end to business_metrics
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS period_start DATE;
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS period_end DATE;
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS quote_win_rate NUMERIC(5,2);
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS total_revenue INTEGER DEFAULT 0;
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS recurring_revenue INTEGER DEFAULT 0;
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS avg_job_value INTEGER DEFAULT 0;
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS new_customers INTEGER DEFAULT 0;
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS repeat_customers INTEGER DEFAULT 0;
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS total_active_customers INTEGER DEFAULT 0;
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS customer_retention_rate NUMERIC(5,2);
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS churn_rate NUMERIC(5,2);
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS messages_received INTEGER DEFAULT 0;
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS reviews_received INTEGER DEFAULT 0;
ALTER TABLE public.business_metrics ADD COLUMN IF NOT EXISTS avg_review_rating NUMERIC(3,2);

-- Index for performance_alerts
CREATE INDEX IF NOT EXISTS idx_performance_alerts_business ON public.performance_alerts(business_id, is_dismissed);