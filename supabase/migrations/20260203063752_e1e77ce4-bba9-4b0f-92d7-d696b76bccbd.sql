-- =============================================
-- SELESTIAL DATABASE SCHEMA - COMPLETE BUILD
-- =============================================

-- Drop existing enums if they exist (for clean rebuild)
DO $$ BEGIN
  DROP TYPE IF EXISTS public.industry_type CASCADE;
  DROP TYPE IF EXISTS public.quote_status CASCADE;
  DROP TYPE IF EXISTS public.message_channel CASCADE;
  DROP TYPE IF EXISTS public.message_status CASCADE;
  DROP TYPE IF EXISTS public.subscription_status CASCADE;
  DROP TYPE IF EXISTS public.urgency_level CASCADE;
  DROP TYPE IF EXISTS public.cycle_type CASCADE;
  DROP TYPE IF EXISTS public.app_role CASCADE;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE public.industry_type AS ENUM (
  'hvac', 'plumbing', 'electrical', 'roofing', 'landscaping', 
  'painting', 'flooring', 'pest_control', 'cleaning', 'auto_repair',
  'pool_service', 'tree_service', 'fencing', 'concrete', 'garage_doors',
  'handyman', 'pressure_washing', 'other'
);

CREATE TYPE public.quote_status AS ENUM (
  'new', 'following_up', 'won', 'lost', 'expired'
);

CREATE TYPE public.message_channel AS ENUM (
  'sms', 'email', 'both'
);

CREATE TYPE public.message_status AS ENUM (
  'pending', 'sent', 'delivered', 'failed', 'read'
);

CREATE TYPE public.subscription_status AS ENUM (
  'trial', 'active', 'past_due', 'canceled', 'paused'
);

CREATE TYPE public.urgency_level AS ENUM (
  'low', 'medium', 'high', 'urgent'
);

CREATE TYPE public.cycle_type AS ENUM (
  'monthly', 'quarterly', 'annually'
);

CREATE TYPE public.app_role AS ENUM (
  'admin', 'moderator', 'user'
);

-- =============================================
-- CORE TABLES
-- =============================================

-- Businesses (Primary tenant table)
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  industry public.industry_type DEFAULT 'other',
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  
  -- Twilio Configuration
  twilio_phone_number VARCHAR(20),
  twilio_account_sid VARCHAR(100),
  twilio_auth_token VARCHAR(100),
  
  -- Stripe Configuration
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  stripe_connect_account_id VARCHAR(100),
  
  -- Subscription
  subscription_status public.subscription_status DEFAULT 'trial',
  subscription_plan VARCHAR(50) DEFAULT 'starter',
  trial_ends_at TIMESTAMPTZ,
  
  -- Business Hours (JSONB for flexibility)
  business_hours JSONB DEFAULT '{"monday":{"open":"09:00","close":"17:00"},"tuesday":{"open":"09:00","close":"17:00"},"wednesday":{"open":"09:00","close":"17:00"},"thursday":{"open":"09:00","close":"17:00"},"friday":{"open":"09:00","close":"17:00"},"saturday":null,"sunday":null}'::jsonb,
  
  -- Notification Settings
  notify_new_quote BOOLEAN DEFAULT true,
  notify_quote_won BOOLEAN DEFAULT true,
  notify_quote_lost BOOLEAN DEFAULT true,
  notify_new_message BOOLEAN DEFAULT true,
  notification_email VARCHAR(255),
  notification_phone VARCHAR(20),
  
  -- Settings
  auto_reply_enabled BOOLEAN DEFAULT true,
  review_request_enabled BOOLEAN DEFAULT true,
  default_follow_up_days INTEGER DEFAULT 3,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  
  -- Metrics
  total_quotes INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0, -- stored in cents
  quotes_won INTEGER DEFAULT 0,
  quotes_lost INTEGER DEFAULT 0,
  
  -- Health scoring
  health_score INTEGER DEFAULT 100,
  last_contact_at TIMESTAMPTZ,
  preferred_channel public.message_channel DEFAULT 'sms',
  
  -- Tags and notes
  tags TEXT[],
  notes TEXT,
  
  -- External integrations
  external_id VARCHAR(255),
  source VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sequences (Automated follow-up sequences)
CREATE TABLE public.sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Steps stored as JSONB array
  steps JSONB DEFAULT '[]'::jsonb,
  
  -- Stats
  total_enrolled INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quotes
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  sequence_id UUID REFERENCES public.sequences(id) ON DELETE SET NULL,
  
  -- Customer info (denormalized for quick access)
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  
  -- Quote details
  service_type VARCHAR(255),
  description TEXT,
  quote_amount INTEGER, -- stored in cents
  urgency public.urgency_level DEFAULT 'medium',
  
  -- Status tracking
  status public.quote_status DEFAULT 'new',
  current_step INTEGER DEFAULT 0,
  
  -- Timestamps
  next_message_at TIMESTAMPTZ,
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason TEXT,
  expired_at TIMESTAMPTZ,
  
  -- Communication tracking
  email_sent_at TIMESTAMPTZ,
  email_status public.message_status,
  sms_sent_at TIMESTAMPTZ,
  sms_status public.message_status,
  
  -- Payment tracking
  payment_link_url TEXT,
  payment_link_id VARCHAR(255),
  payment_status VARCHAR(50),
  paid_at TIMESTAMPTZ,
  paid_amount INTEGER, -- stored in cents
  
  -- Conversation
  conversation_summary TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  
  -- Source
  source VARCHAR(100) DEFAULT 'manual',
  external_id VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- MESSAGING TABLES
-- =============================================

-- Messages (sent messages history)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  
  channel public.message_channel NOT NULL,
  direction VARCHAR(10) DEFAULT 'outbound', -- 'inbound' or 'outbound'
  
  content TEXT NOT NULL,
  subject VARCHAR(255), -- for emails
  
  status public.message_status DEFAULT 'pending',
  
  -- External IDs
  twilio_sid VARCHAR(100),
  resend_id VARCHAR(100),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Message Queue (scheduled outbound messages)
CREATE TABLE public.message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES public.sequences(id) ON DELETE SET NULL,
  
  channel public.message_channel NOT NULL,
  content TEXT NOT NULL,
  subject VARCHAR(255),
  
  step_number INTEGER DEFAULT 0,
  scheduled_for TIMESTAMPTZ NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, sent, failed, cancelled
  
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Inbound Messages (customer replies)
CREATE TABLE public.inbound_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  
  from_number VARCHAR(20),
  to_number VARCHAR(20),
  content TEXT NOT NULL,
  
  -- Twilio webhook data
  twilio_sid VARCHAR(100),
  twilio_status VARCHAR(50),
  
  -- Processing
  is_processed BOOLEAN DEFAULT false,
  matched_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phone Numbers
CREATE TABLE public.phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  friendly_name VARCHAR(255),
  
  -- Twilio data
  twilio_sid VARCHAR(100),
  capabilities JSONB DEFAULT '{"sms":true,"voice":false,"mms":true}'::jsonb,
  
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- AI TABLES
-- =============================================

-- AI Settings
CREATE TABLE public.ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Tone settings
  tone VARCHAR(50) DEFAULT 'professional', -- professional, friendly, casual
  formality_level INTEGER DEFAULT 5, -- 1-10
  
  -- Features
  smart_replies_enabled BOOLEAN DEFAULT true,
  auto_summarize_enabled BOOLEAN DEFAULT true,
  sentiment_analysis_enabled BOOLEAN DEFAULT true,
  
  -- Custom instructions
  custom_instructions TEXT,
  business_context TEXT,
  
  -- Usage tracking
  tokens_used_today INTEGER DEFAULT 0,
  tokens_used_month INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT now(),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Suggestions (history of AI suggestions)
CREATE TABLE public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  
  suggestion_type VARCHAR(50) NOT NULL, -- smart_reply, follow_up, summary
  content TEXT NOT NULL,
  
  was_used BOOLEAN DEFAULT false,
  was_edited BOOLEAN DEFAULT false,
  edited_content TEXT,
  
  tokens_used INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Prompt Templates (industry-specific)
CREATE TABLE public.ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry public.industry_type,
  template_type VARCHAR(50) NOT NULL, -- system, follow_up, closing, etc
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- MARKETING TABLES
-- =============================================

-- Seasonal Campaigns
CREATE TABLE public.seasonal_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) DEFAULT 'seasonal', -- seasonal, promotional, re-engagement
  
  -- Content
  sms_content TEXT,
  email_subject VARCHAR(255),
  email_content TEXT,
  
  -- Targeting
  target_audience JSONB DEFAULT '{}'::jsonb,
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Stats
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  converted_count INTEGER DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, sending, completed, cancelled
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign Recipients
CREATE TABLE public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.seasonal_campaigns(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, converted, failed
  
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign Templates
CREATE TABLE public.campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry public.industry_type,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50),
  
  sms_template TEXT,
  email_subject_template VARCHAR(255),
  email_template TEXT,
  
  -- Recommended timing
  recommended_month INTEGER, -- 1-12
  recommended_season VARCHAR(20), -- spring, summer, fall, winter
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ANALYTICS TABLES
-- =============================================

-- Business Metrics (daily/weekly snapshots)
CREATE TABLE public.business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  
  metric_date DATE NOT NULL,
  period_type VARCHAR(10) DEFAULT 'daily', -- daily, weekly, monthly
  
  -- Quote metrics
  quotes_created INTEGER DEFAULT 0,
  quotes_won INTEGER DEFAULT 0,
  quotes_lost INTEGER DEFAULT 0,
  quotes_expired INTEGER DEFAULT 0,
  
  -- Revenue
  revenue_quoted INTEGER DEFAULT 0, -- cents
  revenue_won INTEGER DEFAULT 0, -- cents
  
  -- Messaging
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,
  
  -- Response rates
  response_rate NUMERIC(5,2),
  avg_response_time_minutes INTEGER,
  
  -- Conversion
  conversion_rate NUMERIC(5,2),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(business_id, metric_date, period_type)
);

-- Industry Benchmarks
CREATE TABLE public.industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry public.industry_type NOT NULL,
  
  -- Benchmark metrics
  avg_conversion_rate NUMERIC(5,2),
  avg_response_time_minutes INTEGER,
  avg_quote_value INTEGER, -- cents
  avg_close_time_days INTEGER,
  
  -- Percentiles
  top_10_conversion_rate NUMERIC(5,2),
  top_25_conversion_rate NUMERIC(5,2),
  
  -- Seasonal adjustments
  season VARCHAR(20), -- spring, summer, fall, winter, or null for annual
  
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(industry, season)
);

-- =============================================
-- REVIEWS TABLE
-- =============================================

CREATE TABLE public.review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  
  -- Request details
  sent_via public.message_channel,
  sent_at TIMESTAMPTZ,
  
  -- Response tracking
  clicked_at TIMESTAMPTZ,
  review_submitted_at TIMESTAMPTZ,
  review_platform VARCHAR(50), -- google, yelp, facebook, etc
  review_rating INTEGER, -- 1-5
  
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, clicked, reviewed, expired
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PAYMENT TABLES
-- =============================================

-- Billing Events (Stripe webhooks)
CREATE TABLE public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  
  data JSONB NOT NULL,
  
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payment Links
CREATE TABLE public.payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  
  stripe_payment_link_id VARCHAR(255),
  url TEXT NOT NULL,
  
  amount INTEGER NOT NULL, -- cents
  currency VARCHAR(3) DEFAULT 'usd',
  
  status VARCHAR(20) DEFAULT 'active', -- active, completed, expired
  
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe Connected Accounts (for payouts)
CREATE TABLE public.stripe_connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  stripe_account_id VARCHAR(255) NOT NULL,
  
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  details_submitted BOOLEAN DEFAULT false,
  
  onboarding_completed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- REFERENCE TABLES
-- =============================================

-- Industries (reference data)
CREATE TABLE public.industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code public.industry_type NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Default settings for this industry
  default_follow_up_days INTEGER DEFAULT 3,
  typical_quote_range_min INTEGER, -- cents
  typical_quote_range_max INTEGER, -- cents
  
  -- Seasonality
  peak_seasons TEXT[], -- e.g., ['summer', 'spring']
  
  icon VARCHAR(50),
  color VARCHAR(7), -- hex color
  
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0
);

-- Industry Service Types
CREATE TABLE public.industry_service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry public.industry_type NOT NULL,
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  typical_price_min INTEGER, -- cents
  typical_price_max INTEGER, -- cents
  
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0
);

-- Sequence Templates
CREATE TABLE public.sequence_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry public.industry_type,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Stats from usage
  avg_conversion_rate NUMERIC(5,2),
  times_used INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RETENTION TABLES
-- =============================================

-- Retention Sequences
CREATE TABLE public.retention_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL, -- after_job_complete, time_based, seasonal
  
  -- For time-based triggers
  trigger_days_after INTEGER,
  
  -- For seasonal triggers
  trigger_month INTEGER,
  trigger_day INTEGER,
  
  cycle public.cycle_type DEFAULT 'annually',
  
  steps JSONB DEFAULT '[]'::jsonb,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Retention Queue
CREATE TABLE public.retention_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  retention_sequence_id UUID REFERENCES public.retention_sequences(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  
  current_step INTEGER DEFAULT 0,
  scheduled_for TIMESTAMPTZ NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, sent, completed, cancelled
  
  last_sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ADMIN TABLES
-- =============================================

-- User Roles (for admin access)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, role)
);

-- Activity Logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- quote, customer, sequence, etc
  entity_id UUID,
  
  details JSONB DEFAULT '{}'::jsonb,
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

-- Businesses
CREATE INDEX idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX idx_businesses_subscription_status ON public.businesses(subscription_status);

-- Customers
CREATE INDEX idx_customers_business_id ON public.customers(business_id);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_email ON public.customers(email);

-- Quotes
CREATE INDEX idx_quotes_business_id ON public.quotes(business_id);
CREATE INDEX idx_quotes_customer_id ON public.quotes(customer_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_created_at ON public.quotes(created_at DESC);
CREATE INDEX idx_quotes_next_message_at ON public.quotes(next_message_at) WHERE next_message_at IS NOT NULL;

-- Sequences
CREATE INDEX idx_sequences_business_id ON public.sequences(business_id);
CREATE INDEX idx_sequences_is_default ON public.sequences(business_id, is_default) WHERE is_default = true;

-- Messages
CREATE INDEX idx_messages_business_id ON public.messages(business_id);
CREATE INDEX idx_messages_quote_id ON public.messages(quote_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Message Queue
CREATE INDEX idx_message_queue_business_id ON public.message_queue(business_id);
CREATE INDEX idx_message_queue_scheduled ON public.message_queue(scheduled_for) WHERE status = 'pending';

-- Inbound Messages
CREATE INDEX idx_inbound_messages_business_id ON public.inbound_messages(business_id);
CREATE INDEX idx_inbound_messages_from_number ON public.inbound_messages(from_number);

-- AI
CREATE INDEX idx_ai_suggestions_business_id ON public.ai_suggestions(business_id);
CREATE INDEX idx_ai_suggestions_quote_id ON public.ai_suggestions(quote_id);

-- Campaigns
CREATE INDEX idx_seasonal_campaigns_business_id ON public.seasonal_campaigns(business_id);
CREATE INDEX idx_campaign_recipients_campaign_id ON public.campaign_recipients(campaign_id);

-- Metrics
CREATE INDEX idx_business_metrics_business_date ON public.business_metrics(business_id, metric_date DESC);

-- Activity
CREATE INDEX idx_activity_logs_business_id ON public.activity_logs(business_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbound_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Helper function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Businesses
CREATE POLICY "Users can manage own business" ON public.businesses
  FOR ALL USING (auth.uid() = user_id);

-- Customers  
CREATE POLICY "Users can manage own customers" ON public.customers
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Sequences
CREATE POLICY "Users can manage own sequences" ON public.sequences
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Quotes
CREATE POLICY "Users can manage own quotes" ON public.quotes
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Messages
CREATE POLICY "Users can manage own messages" ON public.messages
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Message Queue
CREATE POLICY "Users can manage own message queue" ON public.message_queue
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Inbound Messages
CREATE POLICY "Users can manage own inbound messages" ON public.inbound_messages
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Phone Numbers
CREATE POLICY "Users can manage own phone numbers" ON public.phone_numbers
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- AI Settings
CREATE POLICY "Users can manage own AI settings" ON public.ai_settings
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- AI Suggestions
CREATE POLICY "Users can manage own AI suggestions" ON public.ai_suggestions
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- AI Prompt Templates (public read, admin write)
CREATE POLICY "Anyone can read AI prompt templates" ON public.ai_prompt_templates
  FOR SELECT USING (true);

-- Seasonal Campaigns
CREATE POLICY "Users can manage own campaigns" ON public.seasonal_campaigns
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Campaign Recipients
CREATE POLICY "Users can manage own campaign recipients" ON public.campaign_recipients
  FOR ALL USING (campaign_id IN (
    SELECT id FROM public.seasonal_campaigns 
    WHERE business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  ));

-- Campaign Templates (public read)
CREATE POLICY "Anyone can read campaign templates" ON public.campaign_templates
  FOR SELECT USING (true);

-- Business Metrics
CREATE POLICY "Users can view own metrics" ON public.business_metrics
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Industry Benchmarks (public read)
CREATE POLICY "Anyone can read industry benchmarks" ON public.industry_benchmarks
  FOR SELECT USING (true);

-- Review Requests
CREATE POLICY "Users can manage own review requests" ON public.review_requests
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Billing Events
CREATE POLICY "Users can view own billing events" ON public.billing_events
  FOR SELECT USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Payment Links
CREATE POLICY "Users can manage own payment links" ON public.payment_links
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Stripe Connected Accounts
CREATE POLICY "Users can manage own Stripe account" ON public.stripe_connected_accounts
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Industries (public read)
CREATE POLICY "Anyone can read industries" ON public.industries
  FOR SELECT USING (true);

-- Industry Service Types (public read)
CREATE POLICY "Anyone can read service types" ON public.industry_service_types
  FOR SELECT USING (true);

-- Sequence Templates (public read)
CREATE POLICY "Anyone can read sequence templates" ON public.sequence_templates
  FOR SELECT USING (true);

-- Retention Sequences
CREATE POLICY "Users can manage own retention sequences" ON public.retention_sequences
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Retention Queue
CREATE POLICY "Users can manage own retention queue" ON public.retention_queue
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- User Roles (restricted)
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Activity Logs
CREATE POLICY "Users can view own activity" ON public.activity_logs
  FOR SELECT USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert activity" ON public.activity_logs
  FOR INSERT WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at trigger function (already exists, but ensure it's there)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_sequences_updated_at BEFORE UPDATE ON public.sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_seasonal_campaigns_updated_at BEFORE UPDATE ON public.seasonal_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_phone_numbers_updated_at BEFORE UPDATE ON public.phone_numbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_retention_sequences_updated_at BEFORE UPDATE ON public.retention_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_stripe_connected_accounts_updated_at BEFORE UPDATE ON public.stripe_connected_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- DATABASE FUNCTIONS
-- =============================================

-- Log activity function
CREATE OR REPLACE FUNCTION public.log_activity(
  p_business_id UUID,
  p_action VARCHAR,
  p_entity_type VARCHAR DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (business_id, user_id, action, entity_type, entity_id, details)
  VALUES (p_business_id, auth.uid(), p_action, p_entity_type, p_entity_id, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Create default sequence for new business
CREATE OR REPLACE FUNCTION public.create_default_sequence(p_business_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sequence_id UUID;
BEGIN
  INSERT INTO public.sequences (
    business_id,
    name,
    description,
    is_active,
    is_default,
    steps
  ) VALUES (
    p_business_id,
    'Default Follow-Up Sequence',
    'Automated follow-up sequence for new quotes',
    true,
    true,
    '[
      {"step": 1, "delay_days": 0, "delay_hours": 1, "channel": "sms", "template": "Hi {{customer_name}}, thanks for your interest in {{service_type}}! I''ll get back to you with a quote shortly. - {{business_name}}"},
      {"step": 2, "delay_days": 1, "delay_hours": 0, "channel": "sms", "template": "Hi {{customer_name}}, just following up on your {{service_type}} quote. Any questions? Happy to help! - {{business_name}}"},
      {"step": 3, "delay_days": 3, "delay_hours": 0, "channel": "sms", "template": "Hi {{customer_name}}, wanted to check in about your {{service_type}} project. Ready to get started? - {{business_name}}"},
      {"step": 4, "delay_days": 7, "delay_hours": 0, "channel": "sms", "template": "Hi {{customer_name}}, this is my last follow-up about your {{service_type}} quote. Let me know if you''d like to move forward! - {{business_name}}"}
    ]'::jsonb
  )
  RETURNING id INTO v_sequence_id;
  
  RETURN v_sequence_id;
END;
$$;

-- System health check function
CREATE OR REPLACE FUNCTION public.system_health_check(p_business_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_business RECORD;
  v_customer_count INTEGER;
  v_quote_count INTEGER;
  v_sequence_count INTEGER;
  v_message_count INTEGER;
  v_ai_configured BOOLEAN;
  v_campaign_count INTEGER;
BEGIN
  -- Get business info
  SELECT * INTO v_business FROM public.businesses WHERE id = p_business_id;
  
  -- Get counts
  SELECT COUNT(*) INTO v_customer_count FROM public.customers WHERE business_id = p_business_id;
  SELECT COUNT(*) INTO v_quote_count FROM public.quotes WHERE business_id = p_business_id;
  SELECT COUNT(*) INTO v_sequence_count FROM public.sequences WHERE business_id = p_business_id;
  SELECT COUNT(*) INTO v_message_count FROM public.messages WHERE business_id = p_business_id;
  SELECT EXISTS(SELECT 1 FROM public.ai_settings WHERE business_id = p_business_id) INTO v_ai_configured;
  SELECT COUNT(*) INTO v_campaign_count FROM public.seasonal_campaigns WHERE business_id = p_business_id;
  
  v_result := jsonb_build_object(
    'business', jsonb_build_object(
      'exists', v_business IS NOT NULL,
      'name', COALESCE(v_business.name, ''),
      'industry', COALESCE(v_business.industry::text, 'other'),
      'subscription', COALESCE(v_business.subscription_plan, 'trial')
    ),
    'customers', jsonb_build_object('count', v_customer_count, 'has_data', v_customer_count > 0),
    'quotes', jsonb_build_object('count', v_quote_count, 'has_data', v_quote_count > 0),
    'sequences', jsonb_build_object('count', v_sequence_count, 'has_data', v_sequence_count > 0),
    'messages', jsonb_build_object('count', v_message_count, 'has_data', v_message_count > 0),
    'ai_settings', jsonb_build_object('configured', v_ai_configured),
    'campaigns', jsonb_build_object('count', v_campaign_count),
    'status', CASE WHEN v_business IS NOT NULL THEN 'healthy' ELSE 'error' END,
    'checked_at', now()
  );
  
  RETURN v_result;
END;
$$;

-- Verify database schema function
CREATE OR REPLACE FUNCTION public.verify_database_schema()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tables JSONB := '{}'::jsonb;
  v_expected_tables TEXT[] := ARRAY[
    'businesses', 'customers', 'sequences', 'quotes',
    'messages', 'message_queue', 'inbound_messages', 'phone_numbers',
    'ai_settings', 'ai_suggestions', 'ai_prompt_templates',
    'seasonal_campaigns', 'campaign_recipients', 'campaign_templates',
    'business_metrics', 'industry_benchmarks', 'review_requests',
    'billing_events', 'payment_links', 'stripe_connected_accounts',
    'industries', 'industry_service_types', 'sequence_templates',
    'retention_sequences', 'retention_queue', 'user_roles', 'activity_logs'
  ];
  v_table TEXT;
  v_exists BOOLEAN;
  v_missing_count INTEGER := 0;
BEGIN
  FOREACH v_table IN ARRAY v_expected_tables LOOP
    SELECT EXISTS(
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = v_table
    ) INTO v_exists;
    
    v_tables := v_tables || jsonb_build_object(v_table, v_exists);
    
    IF NOT v_exists THEN
      v_missing_count := v_missing_count + 1;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'tables', v_tables,
    'total_expected', array_length(v_expected_tables, 1),
    'missing_count', v_missing_count,
    'all_present', v_missing_count = 0
  );
END;
$$;

-- Seed test data function
CREATE OR REPLACE FUNCTION public.seed_test_data(p_business_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_ids UUID[];
  v_sequence_id UUID;
  v_customer_id UUID;
  v_i INTEGER;
BEGIN
  -- Create test customers
  FOR v_i IN 1..5 LOOP
    INSERT INTO public.customers (
      business_id, name, phone, email, total_quotes, total_revenue
    ) VALUES (
      p_business_id,
      'Test Customer ' || v_i,
      '+1555000' || LPAD(v_i::text, 4, '0'),
      'customer' || v_i || '@test.com',
      v_i,
      v_i * 50000 -- cents
    )
    RETURNING id INTO v_customer_id;
    
    v_customer_ids := array_append(v_customer_ids, v_customer_id);
  END LOOP;
  
  -- Create default sequence if none exists
  SELECT id INTO v_sequence_id FROM public.sequences 
  WHERE business_id = p_business_id AND is_default = true;
  
  IF v_sequence_id IS NULL THEN
    v_sequence_id := public.create_default_sequence(p_business_id);
  END IF;
  
  -- Create test quotes
  FOR v_i IN 1..3 LOOP
    INSERT INTO public.quotes (
      business_id,
      customer_id,
      sequence_id,
      customer_name,
      customer_phone,
      customer_email,
      service_type,
      quote_amount,
      status
    ) VALUES (
      p_business_id,
      v_customer_ids[v_i],
      v_sequence_id,
      'Test Customer ' || v_i,
      '+1555000' || LPAD(v_i::text, 4, '0'),
      'customer' || v_i || '@test.com',
      'Test Service',
      v_i * 25000,
      CASE 
        WHEN v_i = 1 THEN 'new'::quote_status
        WHEN v_i = 2 THEN 'following_up'::quote_status
        ELSE 'won'::quote_status
      END
    );
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'created', jsonb_build_object(
      'customers', array_length(v_customer_ids, 1),
      'quotes', 3,
      'sequences', 1
    )
  );
END;
$$;