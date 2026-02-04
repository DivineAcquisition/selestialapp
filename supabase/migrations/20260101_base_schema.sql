-- ============================================================================
-- SELESTIAL BASE SCHEMA
-- Core tables for the Selestial SaaS platform
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'support', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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
  
  -- Subscription
  subscription_status VARCHAR(20) DEFAULT 'trialing',
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

-- Index for user lookup
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_health ON customers(health_score);

-- ============================================================================
-- QUOTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Customer info (denormalized for quotes without customer record)
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotes_business_id ON quotes(business_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_phone ON quotes(customer_phone);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_next_message ON quotes(next_message_at) WHERE next_message_at IS NOT NULL;

-- ============================================================================
-- ACTIVITY LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  
  action VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_business ON activity_logs(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_quote ON activity_logs(quote_id);

-- ============================================================================
-- MESSAGES (SMS/Email threads)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Message content
  direction VARCHAR(10) NOT NULL, -- 'inbound' or 'outbound'
  channel VARCHAR(20) DEFAULT 'sms', -- 'sms', 'email', 'whatsapp'
  from_number VARCHAR(20),
  to_number VARCHAR(20),
  body TEXT NOT NULL,
  
  -- Status
  status VARCHAR(30) DEFAULT 'queued',
  error_code VARCHAR(20),
  error_message TEXT,
  
  -- External tracking
  external_id VARCHAR(100),
  
  -- Delivery timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- AI suggestions
  ai_suggested BOOLEAN DEFAULT FALSE,
  ai_suggestion_id UUID,
  
  -- Sequence tracking
  sequence_step_id UUID,
  is_automated BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_business ON messages(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_quote ON messages(quote_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_customer ON messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_external ON messages(external_id);

-- ============================================================================
-- SEQUENCES (Follow-up automation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Settings
  respect_business_hours BOOLEAN DEFAULT TRUE,
  stop_on_response BOOLEAN DEFAULT TRUE,
  stop_on_won BOOLEAN DEFAULT TRUE,
  
  -- Stats
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
  step_type VARCHAR(30) DEFAULT 'sms', -- 'sms', 'email', 'wait'
  
  -- Delay
  delay_minutes INTEGER DEFAULT 0,
  delay_days INTEGER DEFAULT 0,
  
  -- Content
  subject VARCHAR(500),
  message_template TEXT NOT NULL,
  
  -- AI
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
  
  -- Link details
  short_id VARCHAR(20) UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  description TEXT,
  
  -- Customer info
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment tracking
  stripe_payment_intent_id VARCHAR(100),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Notification
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_links_business ON payment_links(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_short ON payment_links(short_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_quote ON payment_links(quote_id);

-- ============================================================================
-- AI SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  -- Feature toggles
  smart_replies_enabled BOOLEAN DEFAULT TRUE,
  suggest_upsells BOOLEAN DEFAULT FALSE,
  include_pricing BOOLEAN DEFAULT FALSE,
  
  -- Response style
  tone VARCHAR(30) DEFAULT 'professional',
  response_length VARCHAR(20) DEFAULT 'medium',
  emoji_usage VARCHAR(20) DEFAULT 'minimal',
  
  -- Custom instructions
  custom_instructions TEXT,
  
  -- Usage limits
  monthly_suggestion_limit INTEGER DEFAULT 100,
  suggestions_used_this_month INTEGER DEFAULT 0,
  limit_reset_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AI SUGGESTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  
  -- Input
  customer_message TEXT NOT NULL,
  context_data JSONB,
  
  -- Output
  suggestions JSONB NOT NULL,
  
  -- Usage tracking
  suggestion_selected INTEGER,
  was_sent BOOLEAN DEFAULT FALSE,
  was_edited BOOLEAN DEFAULT FALSE,
  edited_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Feedback
  feedback VARCHAR(20),
  
  -- Performance
  model_used VARCHAR(50),
  generation_time_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_business ON ai_suggestions(business_id, created_at DESC);

-- ============================================================================
-- CAMPAIGNS
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) DEFAULT 'promotional',
  
  -- Target audience
  target_filter JSONB DEFAULT '{}',
  target_count INTEGER DEFAULT 0,
  
  -- Content
  message_template TEXT NOT NULL,
  
  -- Schedule
  status VARCHAR(30) DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_business ON campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- ============================================================================
-- BILLING EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  event_type VARCHAR(100) NOT NULL,
  stripe_event_id VARCHAR(100),
  stripe_event_type VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  
  event_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_events_business ON billing_events(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe ON billing_events(stripe_event_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_business_id UUID,
  p_action VARCHAR(100),
  p_description TEXT,
  p_quote_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO activity_logs (business_id, quote_id, action, description, metadata)
  VALUES (p_business_id, p_quote_id, p_action, p_description, p_metadata)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS businesses_updated_at ON businesses;
CREATE TRIGGER businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS quotes_updated_at ON quotes;
CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS sequences_updated_at ON sequences;
CREATE TRIGGER sequences_updated_at BEFORE UPDATE ON sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS ai_settings_updated_at ON ai_settings;
CREATE TRIGGER ai_settings_updated_at BEFORE UPDATE ON ai_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Businesses: Users can only access their own business
DROP POLICY IF EXISTS "Users can access own business" ON businesses;
CREATE POLICY "Users can access own business" ON businesses
  FOR ALL USING (user_id = auth.uid());

-- Customers: Users can access customers of their business
DROP POLICY IF EXISTS "Users can access own customers" ON customers;
CREATE POLICY "Users can access own customers" ON customers
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Quotes: Users can access quotes of their business
DROP POLICY IF EXISTS "Users can access own quotes" ON quotes;
CREATE POLICY "Users can access own quotes" ON quotes
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Activity logs: Users can access logs of their business
DROP POLICY IF EXISTS "Users can access own logs" ON activity_logs;
CREATE POLICY "Users can access own logs" ON activity_logs
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Messages: Users can access messages of their business
DROP POLICY IF EXISTS "Users can access own messages" ON messages;
CREATE POLICY "Users can access own messages" ON messages
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Sequences: Users can access sequences of their business
DROP POLICY IF EXISTS "Users can access own sequences" ON sequences;
CREATE POLICY "Users can access own sequences" ON sequences
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Sequence steps: Users can access steps of their sequences
DROP POLICY IF EXISTS "Users can access own sequence steps" ON sequence_steps;
CREATE POLICY "Users can access own sequence steps" ON sequence_steps
  FOR ALL USING (sequence_id IN (
    SELECT id FROM sequences WHERE business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  ));

-- Payment links: Users can access their own payment links
DROP POLICY IF EXISTS "Users can access own payment links" ON payment_links;
CREATE POLICY "Users can access own payment links" ON payment_links
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Public can view payment links by short_id (for payment page)
DROP POLICY IF EXISTS "Public can view payment links" ON payment_links;
CREATE POLICY "Public can view payment links" ON payment_links
  FOR SELECT USING (true);

-- AI settings: Users can access their own AI settings
DROP POLICY IF EXISTS "Users can access own ai settings" ON ai_settings;
CREATE POLICY "Users can access own ai settings" ON ai_settings
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- AI suggestions: Users can access their own AI suggestions
DROP POLICY IF EXISTS "Users can access own ai suggestions" ON ai_suggestions;
CREATE POLICY "Users can access own ai suggestions" ON ai_suggestions
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Campaigns: Users can access their own campaigns
DROP POLICY IF EXISTS "Users can access own campaigns" ON campaigns;
CREATE POLICY "Users can access own campaigns" ON campaigns
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Billing events: Users can access their own billing events
DROP POLICY IF EXISTS "Users can access own billing events" ON billing_events;
CREATE POLICY "Users can access own billing events" ON billing_events
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================
-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
