-- Add missing columns to various tables

-- Add missing columns to customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_type VARCHAR(50) DEFAULT 'prospect';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS first_service_at TIMESTAMPTZ;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_service_at TIMESTAMPTZ;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS next_service_at TIMESTAMPTZ;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS lifetime_value INTEGER DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS jobs_completed INTEGER DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS avg_job_value INTEGER DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS opted_out BOOLEAN DEFAULT false;

-- Add missing columns to quotes
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS job_status VARCHAR(50);
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS final_job_amount INTEGER;

-- Add missing columns to activity_logs
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS description TEXT;

-- Add average_value to industry_benchmarks (for IndustryBenchmark interface)
ALTER TABLE public.industry_benchmarks ADD COLUMN IF NOT EXISTS average_value NUMERIC;

-- Add missing columns to seasonal_campaigns
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS target_customer_types TEXT[];
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS min_days_since_service INTEGER;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS max_days_since_service INTEGER;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS exclude_recent_days INTEGER;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS channel VARCHAR(20) DEFAULT 'both';
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS send_time TIME;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS send_timezone VARCHAR(50);
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS sms_message TEXT;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS email_body TEXT;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS include_unsubscribe BOOLEAN DEFAULT true;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS include_opt_out_sms BOOLEAN DEFAULT true;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS industry VARCHAR(50);
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS season VARCHAR(20);
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS month INTEGER;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS holiday VARCHAR(50);
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS preview_text VARCHAR(255);
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS cta_text VARCHAR(100);
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS cta_url TEXT;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS avg_open_rate NUMERIC(5,2);
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS avg_click_rate NUMERIC(5,2);
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS avg_conversion_rate NUMERIC(5,2);
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS opens_count INTEGER DEFAULT 0;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0;
ALTER TABLE public.seasonal_campaigns ADD COLUMN IF NOT EXISTS unsubscribed_count INTEGER DEFAULT 0;

-- Add missing columns to campaign_templates
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS industry_slug VARCHAR(50);
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS season VARCHAR(20);
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS month INTEGER;
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS holiday VARCHAR(50);
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS preview_text VARCHAR(255);
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS cta_text VARCHAR(100);
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS cta_url TEXT;
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS target_customer_types TEXT[];
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS avg_open_rate NUMERIC(5,2);
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS avg_click_rate NUMERIC(5,2);
ALTER TABLE public.campaign_templates ADD COLUMN IF NOT EXISTS avg_conversion_rate NUMERIC(5,2);