-- ============================================================================
-- PART 1: CORE TABLES (Run this first)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- BUSINESSES (Core tenant table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Business info
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  website VARCHAR(255),
  industry VARCHAR(100) DEFAULT 'home_services',
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  
  -- Branding
  company_logo_url TEXT,
  company_color VARCHAR(20) DEFAULT '#7c3aed',
  
  -- Business hours
  business_hours_enabled BOOLEAN DEFAULT TRUE,
  business_hours_start VARCHAR(10) DEFAULT '08:00',
  business_hours_end VARCHAR(10) DEFAULT '17:00',
  business_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  
  -- Quote settings
  send_quote_email BOOLEAN DEFAULT TRUE,
  send_quote_sms BOOLEAN DEFAULT TRUE,
  quote_email_subject VARCHAR(500),
  quote_email_message TEXT,
  quote_sms_message TEXT,
  
  -- Auto sequences
  auto_start_sequence BOOLEAN DEFAULT FALSE,
  default_sequence_id UUID,
  
  -- Payment settings
  accept_online_payments BOOLEAN DEFAULT FALSE,
  auto_send_payment_link BOOLEAN DEFAULT FALSE,
  deposit_percent INTEGER DEFAULT 25,
  payment_due_days INTEGER DEFAULT 7,
  
  -- Stripe Connect
  stripe_connect_enabled BOOLEAN DEFAULT FALSE,
  stripe_connect_account_id VARCHAR(100),
  
  -- Review settings
  auto_request_reviews BOOLEAN DEFAULT FALSE,
  review_request_delay_days INTEGER DEFAULT 3,
  review_request_message TEXT,
  default_review_platform VARCHAR(50) DEFAULT 'google',
  google_review_link TEXT,
  facebook_review_link TEXT,
  yelp_review_link TEXT,
  
  -- Notification preferences
  notify_email_won BOOLEAN DEFAULT TRUE,
  notify_email_lost BOOLEAN DEFAULT TRUE,
  notify_email_daily_digest BOOLEAN DEFAULT TRUE,
  notify_sms_response BOOLEAN DEFAULT TRUE,
  
  -- Twilio integration
  twilio_phone_number VARCHAR(20),
  twilio_phone_sid VARCHAR(50),
  
  -- Subscription - using TEXT instead of ENUM for flexibility
  subscription_status TEXT DEFAULT 'trialing',
  subscription_plan VARCHAR(50),
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Limits
  quotes_limit INTEGER,
  sequences_limit INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_stripe_customer ON businesses(stripe_customer_id);

-- ============================================================================
-- CUSTOMERS (CRM)
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Contact info
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  
  -- Customer type/segment
  customer_type VARCHAR(50) DEFAULT 'residential',
  tags TEXT[] DEFAULT '{}',
  
  -- Service history
  first_service_at TIMESTAMP WITH TIME ZONE,
  last_service_at TIMESTAMP WITH TIME ZONE,
  next_service_at TIMESTAMP WITH TIME ZONE,
  total_jobs INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  average_job_value DECIMAL(10, 2) DEFAULT 0,
  
  -- Recurring
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(50),
  recurring_service_type VARCHAR(100),
  recurring_amount DECIMAL(10, 2),
  
  -- Health & engagement
  health_score INTEGER DEFAULT 100,
  last_contact_at TIMESTAMP WITH TIME ZONE,
  last_response_at TIMESTAMP WITH TIME ZONE,
  last_campaign_at TIMESTAMP WITH TIME ZONE,
  
  -- Marketing
  marketing_opted_out BOOLEAN DEFAULT FALSE,
  marketing_opt_out_at TIMESTAMP WITH TIME ZONE,
  
  -- Referrals
  referred_by_customer_id UUID REFERENCES customers(id),
  referral_count INTEGER DEFAULT 0,
  
  -- External integrations
  external_id VARCHAR(255),
  external_source VARCHAR(50),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ============================================================================
-- QUOTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Customer info (denormalized)
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  
  -- Quote details
  service_type VARCHAR(100) NOT NULL,
  description TEXT,
  quote_amount DECIMAL(12, 2) NOT NULL,
  
  -- Status
  status VARCHAR(30) DEFAULT 'new',
  status_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Win/Loss tracking
  won_at TIMESTAMP WITH TIME ZONE,
  lost_at TIMESTAMP WITH TIME ZONE,
  lost_reason TEXT,
  final_job_amount DECIMAL(12, 2),
  
  -- Job tracking
  job_status VARCHAR(30),
  job_scheduled_at TIMESTAMP WITH TIME ZONE,
  job_completed_at TIMESTAMP WITH TIME ZONE,
  external_job_id VARCHAR(100),
  
  -- Payment tracking
  deposit_required BOOLEAN DEFAULT FALSE,
  deposit_amount DECIMAL(10, 2),
  deposit_paid BOOLEAN DEFAULT FALSE,
  payment_status VARCHAR(30),
  payment_link_url TEXT,
  payment_id VARCHAR(100),
  paid_amount DECIMAL(10, 2),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Notification status
  email_status VARCHAR(30),
  email_sent_at TIMESTAMP WITH TIME ZONE,
  sms_status VARCHAR(30),
  sms_sent_at TIMESTAMP WITH TIME ZONE,
  notification_error TEXT,
  
  -- Sequence tracking
  sequence_id UUID,
  current_step_index INTEGER DEFAULT 0,
  sequence_started_at TIMESTAMP WITH TIME ZONE,
  sequence_paused_at TIMESTAMP WITH TIME ZONE,
  sequence_completed_at TIMESTAMP WITH TIME ZONE,
  next_message_at TIMESTAMP WITH TIME ZONE,
  
  -- Messaging
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_direction VARCHAR(10),
  last_message_preview TEXT,
  unread_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_business_id ON quotes(business_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);

-- ============================================================================
-- MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  direction VARCHAR(10) NOT NULL,
  channel VARCHAR(20) DEFAULT 'sms',
  from_number VARCHAR(20),
  to_number VARCHAR(20),
  body TEXT NOT NULL,
  
  status VARCHAR(30) DEFAULT 'queued',
  error_code VARCHAR(20),
  error_message TEXT,
  
  external_id VARCHAR(100),
  
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  ai_suggested BOOLEAN DEFAULT FALSE,
  ai_suggestion_id UUID,
  
  sequence_step_id UUID,
  is_automated BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_business ON messages(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_quote ON messages(quote_id, created_at DESC);

-- ============================================================================
-- SEQUENCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  respect_business_hours BOOLEAN DEFAULT TRUE,
  stop_on_response BOOLEAN DEFAULT TRUE,
  stop_on_won BOOLEAN DEFAULT TRUE,
  
  total_enrolled INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sequences_business ON sequences(business_id);

-- ============================================================================
-- SEQUENCE STEPS
-- ============================================================================
CREATE TABLE IF NOT EXISTS sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  
  step_index INTEGER NOT NULL,
  step_type VARCHAR(30) DEFAULT 'sms',
  
  delay_minutes INTEGER DEFAULT 0,
  delay_days INTEGER DEFAULT 0,
  
  subject VARCHAR(500),
  message_template TEXT NOT NULL,
  
  use_ai_personalization BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sequence_steps_sequence ON sequence_steps(sequence_id, step_index);

-- ============================================================================
-- PAYMENT LINKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  short_id VARCHAR(20) UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  
  status VARCHAR(30) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  
  stripe_payment_intent_id VARCHAR(100),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_links_business ON payment_links(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_short ON payment_links(short_id);

-- ============================================================================
-- AI SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  smart_replies_enabled BOOLEAN DEFAULT TRUE,
  suggest_upsells BOOLEAN DEFAULT FALSE,
  include_pricing BOOLEAN DEFAULT FALSE,
  
  tone VARCHAR(30) DEFAULT 'professional',
  response_length VARCHAR(20) DEFAULT 'medium',
  emoji_usage VARCHAR(20) DEFAULT 'minimal',
  
  custom_instructions TEXT,
  
  monthly_suggestion_limit INTEGER DEFAULT 100,
  suggestions_used_this_month INTEGER DEFAULT 0,
  limit_reset_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENABLE RLS ON CORE TABLES
-- ============================================================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can access own business" ON businesses;
CREATE POLICY "Users can access own business" ON businesses
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can access own customers" ON customers;
CREATE POLICY "Users can access own customers" ON customers
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own quotes" ON quotes;
CREATE POLICY "Users can access own quotes" ON quotes
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own messages" ON messages;
CREATE POLICY "Users can access own messages" ON messages
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own sequences" ON sequences;
CREATE POLICY "Users can access own sequences" ON sequences
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own sequence steps" ON sequence_steps;
CREATE POLICY "Users can access own sequence steps" ON sequence_steps
  FOR ALL USING (sequence_id IN (
    SELECT id FROM sequences WHERE business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  ));

DROP POLICY IF EXISTS "Users can access own payment links" ON payment_links;
CREATE POLICY "Users can access own payment links" ON payment_links
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own ai settings" ON ai_settings;
CREATE POLICY "Users can access own ai settings" ON ai_settings
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================================================
-- DONE! Core tables created.
-- ============================================================================
