-- ============================================================================
-- SELESTIAL COMPLETE DATABASE SCHEMA
-- Combined from all migrations for fresh Supabase setup
-- 
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 1: BASE SCHEMA - Core Tables
-- ============================================================================

-- ENUMS
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
CREATE INDEX IF NOT EXISTS idx_customers_health ON customers(health_score);

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
CREATE INDEX IF NOT EXISTS idx_messages_customer ON messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_external ON messages(external_id);

-- ============================================================================
-- INBOUND MESSAGES (for webhook processing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS inbound_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  from_number VARCHAR(20) NOT NULL,
  to_number VARCHAR(20) NOT NULL,
  body TEXT,
  
  external_id VARCHAR(100),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inbound_messages_from ON inbound_messages(from_number);

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
CREATE INDEX IF NOT EXISTS idx_payment_links_quote ON payment_links(quote_id);

-- ============================================================================
-- PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  payment_link_id UUID REFERENCES payment_links(id) ON DELETE SET NULL,
  
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(30) DEFAULT 'pending',
  
  stripe_payment_intent_id VARCHAR(100),
  stripe_charge_id VARCHAR(100),
  
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_business ON payments(business_id);

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
-- AI SUGGESTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  
  customer_message TEXT NOT NULL,
  context_data JSONB,
  
  suggestions JSONB NOT NULL,
  
  suggestion_selected INTEGER,
  was_sent BOOLEAN DEFAULT FALSE,
  was_edited BOOLEAN DEFAULT FALSE,
  edited_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  feedback VARCHAR(20),
  
  model_used VARCHAR(50),
  generation_time_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_business ON ai_suggestions(business_id, created_at DESC);

-- ============================================================================
-- AI PROMPT TEMPLATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  response_guidance TEXT,
  trigger_keywords TEXT[],
  example_responses TEXT[],
  industry_slug VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CAMPAIGNS
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) DEFAULT 'promotional',
  
  target_filter JSONB DEFAULT '{}',
  target_count INTEGER DEFAULT 0,
  
  message_template TEXT NOT NULL,
  
  status VARCHAR(30) DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
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
-- PROFILES (for support tickets)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SUPPORT TICKETS
-- ============================================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(30) DEFAULT 'open',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BOOKING WIDGET CONFIGS (legacy)
-- ============================================================================
CREATE TABLE IF NOT EXISTS booking_widget_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PART 2: BOOKING & CLEANING SYSTEM
-- ============================================================================

-- Service Types
CREATE TABLE IF NOT EXISTS cleaning_service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  pricing_method VARCHAR(20) DEFAULT 'bedroom_bathroom' 
    CHECK (pricing_method IN ('bedroom_bathroom', 'sqft', 'flat_rate', 'hourly')),
  
  price_per_bedroom DECIMAL(10, 2) DEFAULT 25,
  price_per_bathroom DECIMAL(10, 2) DEFAULT 20,
  price_per_half_bath DECIMAL(10, 2) DEFAULT 10,
  
  price_per_sqft DECIMAL(10, 4) DEFAULT 0.10,
  sqft_minimum INTEGER DEFAULT 500,
  sqft_tiers JSONB DEFAULT '[]',
  
  hourly_rate DECIMAL(10, 2) DEFAULT 45,
  estimated_hours_base DECIMAL(4, 2) DEFAULT 2,
  hours_per_bedroom DECIMAL(4, 2) DEFAULT 0.5,
  hours_per_bathroom DECIMAL(4, 2) DEFAULT 0.5,
  
  min_duration_minutes INTEGER DEFAULT 60,
  max_duration_minutes INTEGER DEFAULT 180,
  
  base_multiplier DECIMAL(4, 2) DEFAULT 1.0,
  
  icon VARCHAR(50),
  color VARCHAR(20),
  popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cleaning_service_types_business ON cleaning_service_types(business_id);

-- Service Templates (global)
CREATE TABLE IF NOT EXISTS cleaning_service_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2),
  pricing_method VARCHAR(20),
  price_per_bedroom DECIMAL(10, 2),
  price_per_bathroom DECIMAL(10, 2),
  base_multiplier DECIMAL(4, 2),
  icon VARCHAR(50),
  color VARCHAR(20),
  display_order INTEGER
);

INSERT INTO cleaning_service_templates (name, slug, description, base_price, pricing_method, price_per_bedroom, price_per_bathroom, base_multiplier, icon, color, display_order) VALUES
('Standard Clean', 'standard', 'Regular maintenance cleaning', 80, 'bedroom_bathroom', 25, 20, 1.0, 'sparkles', 'blue', 1),
('Deep Clean', 'deep', 'Thorough top-to-bottom cleaning', 120, 'bedroom_bathroom', 35, 30, 1.5, 'sprayCan', 'violet', 2),
('Move-In/Move-Out', 'move', 'Complete cleaning for empty homes', 150, 'bedroom_bathroom', 45, 40, 2.0, 'truck', 'emerald', 3),
('Post-Construction', 'construction', 'Heavy-duty cleaning after renovation', 200, 'bedroom_bathroom', 55, 50, 2.5, 'hardHat', 'amber', 4),
('Airbnb Turnover', 'airbnb', 'Quick turnover cleaning', 90, 'bedroom_bathroom', 30, 25, 1.2, 'home', 'pink', 5)
ON CONFLICT DO NOTHING;

-- Add-ons
CREATE TABLE IF NOT EXISTS cleaning_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'specialty',
  
  price_type VARCHAR(20) DEFAULT 'flat' 
    CHECK (price_type IN ('flat', 'per_unit', 'per_sqft', 'percentage')),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  unit_name VARCHAR(50),
  min_units INTEGER DEFAULT 1,
  max_units INTEGER DEFAULT 10,
  
  percentage DECIMAL(5, 2) DEFAULT 0,
  
  additional_minutes INTEGER DEFAULT 15,
  estimated_minutes INTEGER DEFAULT 15,
  
  available_for_services UUID[] DEFAULT '{}',
  available_service_types TEXT[] DEFAULT ARRAY['standard', 'deep'],
  
  icon VARCHAR(50),
  popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cleaning_addons_business ON cleaning_addons(business_id);

-- Frequencies
CREATE TABLE IF NOT EXISTS cleaning_frequencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(30) NOT NULL,
  description TEXT,
  
  interval_days INTEGER NOT NULL,
  
  discount_type VARCHAR(20) DEFAULT 'percentage' 
    CHECK (discount_type IN ('percentage', 'flat')),
  discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  badge_text VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cleaning_frequencies_business ON cleaning_frequencies(business_id);

INSERT INTO cleaning_frequencies (business_id, name, slug, description, interval_days, discount_type, discount_value, badge_text, display_order)
SELECT NULL, 'One-Time', 'onetime', 'Single cleaning service', 0, 'percentage', 0, NULL, 1 WHERE NOT EXISTS (SELECT 1 FROM cleaning_frequencies WHERE slug = 'onetime' AND business_id IS NULL);

INSERT INTO cleaning_frequencies (business_id, name, slug, description, interval_days, discount_type, discount_value, badge_text, display_order)
SELECT NULL, 'Weekly', 'weekly', 'Every week', 7, 'percentage', 20, 'Best Value', 2 WHERE NOT EXISTS (SELECT 1 FROM cleaning_frequencies WHERE slug = 'weekly' AND business_id IS NULL);

INSERT INTO cleaning_frequencies (business_id, name, slug, description, interval_days, discount_type, discount_value, badge_text, display_order)
SELECT NULL, 'Bi-Weekly', 'biweekly', 'Every 2 weeks', 14, 'percentage', 15, 'Most Popular', 3 WHERE NOT EXISTS (SELECT 1 FROM cleaning_frequencies WHERE slug = 'biweekly' AND business_id IS NULL);

INSERT INTO cleaning_frequencies (business_id, name, slug, description, interval_days, discount_type, discount_value, badge_text, display_order)
SELECT NULL, 'Monthly', 'monthly', 'Once a month', 30, 'percentage', 10, NULL, 4 WHERE NOT EXISTS (SELECT 1 FROM cleaning_frequencies WHERE slug = 'monthly' AND business_id IS NULL);

-- Property Presets
CREATE TABLE IF NOT EXISTS cleaning_property_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms DECIMAL(3, 1) NOT NULL DEFAULT 1,
  sqft_estimate INTEGER,
  
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, 'Studio', 0, 1, 500, 1 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = 'Studio' AND business_id IS NULL);

INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, '1 Bed / 1 Bath', 1, 1, 750, 2 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = '1 Bed / 1 Bath' AND business_id IS NULL);

INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, '2 Bed / 2 Bath', 2, 2, 1200, 4 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = '2 Bed / 2 Bath' AND business_id IS NULL);

INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, '3 Bed / 2 Bath', 3, 2, 1600, 5 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = '3 Bed / 2 Bath' AND business_id IS NULL);

-- Booking Config
CREATE TABLE IF NOT EXISTS cleaning_booking_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  require_deposit BOOLEAN DEFAULT TRUE,
  deposit_type VARCHAR(20) DEFAULT 'percentage' 
    CHECK (deposit_type IN ('percentage', 'flat', 'full')),
  deposit_value DECIMAL(10, 2) DEFAULT 25,
  deposit_minimum DECIMAL(10, 2) DEFAULT 25,
  
  accept_cash BOOLEAN DEFAULT TRUE,
  accept_card BOOLEAN DEFAULT TRUE,
  collect_payment_at VARCHAR(20) DEFAULT 'booking' 
    CHECK (collect_payment_at IN ('booking', 'completion', 'either')),
  
  lead_time_hours INTEGER DEFAULT 24,
  max_advance_days INTEGER DEFAULT 60,
  slot_duration_minutes INTEGER DEFAULT 30,
  
  operating_hours JSONB DEFAULT '{
    "mon": {"start": "08:00", "end": "17:00", "enabled": true},
    "tue": {"start": "08:00", "end": "17:00", "enabled": true},
    "wed": {"start": "08:00", "end": "17:00", "enabled": true},
    "thu": {"start": "08:00", "end": "17:00", "enabled": true},
    "fri": {"start": "08:00", "end": "17:00", "enabled": true},
    "sat": {"start": "09:00", "end": "14:00", "enabled": true},
    "sun": {"start": null, "end": null, "enabled": false}
  }',
  
  blocked_dates DATE[] DEFAULT '{}',
  
  require_phone BOOLEAN DEFAULT TRUE,
  require_address BOOLEAN DEFAULT TRUE,
  require_access_instructions BOOLEAN DEFAULT FALSE,
  custom_fields JSONB DEFAULT '[]',
  
  send_confirmation_email BOOLEAN DEFAULT TRUE,
  send_confirmation_sms BOOLEAN DEFAULT TRUE,
  send_reminder_24h BOOLEAN DEFAULT TRUE,
  send_reminder_2h BOOLEAN DEFAULT TRUE,
  
  primary_color VARCHAR(20) DEFAULT '#7c3aed',
  logo_url TEXT,
  custom_css TEXT,
  
  terms_url TEXT,
  cancellation_policy TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS cleaning_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  booking_number VARCHAR(20) UNIQUE,
  
  service_type_id UUID REFERENCES cleaning_service_types(id),
  service_name VARCHAR(100),
  
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  sqft INTEGER,
  property_type VARCHAR(50),
  
  addons JSONB DEFAULT '[]',
  
  frequency_id UUID REFERENCES cleaning_frequencies(id),
  frequency_name VARCHAR(50),
  frequency_discount DECIMAL(10, 2) DEFAULT 0,
  
  base_price DECIMAL(10, 2) NOT NULL,
  addons_total DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT FALSE,
  deposit_paid_at TIMESTAMP WITH TIME ZONE,
  
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME NOT NULL,
  scheduled_time_end TIME,
  estimated_duration_minutes INTEGER,
  
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  
  access_instructions TEXT,
  has_pets BOOLEAN DEFAULT FALSE,
  pet_details TEXT,
  special_requests TEXT,
  
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'
  )),
  
  assigned_to UUID,
  assigned_team TEXT[],
  
  stripe_payment_intent_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  
  source VARCHAR(50) DEFAULT 'widget',
  referral_code VARCHAR(50),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_parent_id UUID REFERENCES cleaning_bookings(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_business ON cleaning_bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_customer ON cleaning_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_date ON cleaning_bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_status ON cleaning_bookings(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_number ON cleaning_bookings(booking_number);

-- Generate booking number function
CREATE OR REPLACE FUNCTION generate_cleaning_booking_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(booking_number FROM 10 FOR 4) AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM cleaning_bookings
  WHERE booking_number LIKE 'CLN-' || year_part || '-%'
    AND business_id = NEW.business_id;
  
  NEW.booking_number := 'CLN-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_cleaning_booking_number ON cleaning_bookings;
CREATE TRIGGER set_cleaning_booking_number
  BEFORE INSERT ON cleaning_bookings
  FOR EACH ROW
  WHEN (NEW.booking_number IS NULL)
  EXECUTE FUNCTION generate_cleaning_booking_number();

-- ============================================================================
-- PART 3: WIDGET CUSTOMIZATION TABLES
-- ============================================================================

-- Service Areas
CREATE TABLE IF NOT EXISTS cleaning_service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  
  zone_type VARCHAR(20) DEFAULT 'zip' CHECK (zone_type IN ('zip', 'radius', 'polygon', 'city', 'county')),
  
  zip_codes TEXT[] DEFAULT '{}',
  
  center_lat DECIMAL(10, 7),
  center_lng DECIMAL(10, 7),
  radius_miles DECIMAL(5, 2),
  
  polygon_geojson JSONB,
  
  cities TEXT[] DEFAULT '{}',
  counties TEXT[] DEFAULT '{}',
  state VARCHAR(2),
  
  price_adjustment_type VARCHAR(20) DEFAULT 'none' 
    CHECK (price_adjustment_type IN ('none', 'percentage', 'flat', 'multiplier')),
  price_adjustment_value DECIMAL(10, 2) DEFAULT 0,
  
  minimum_order DECIMAL(10, 2) DEFAULT 0,
  
  travel_fee DECIMAL(10, 2) DEFAULT 0,
  travel_fee_waive_above DECIMAL(10, 2),
  
  available BOOLEAN DEFAULT TRUE,
  available_days TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri','sat'],
  lead_time_hours INTEGER,
  max_bookings_per_day INTEGER,
  
  custom_hours JSONB,
  
  display_order INTEGER DEFAULT 0,
  color VARCHAR(20),
  show_on_map BOOLEAN DEFAULT TRUE,
  
  area_message TEXT,
  travel_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_service_areas_business ON cleaning_service_areas(business_id);

-- Pricing Models
CREATE TABLE IF NOT EXISTS cleaning_pricing_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  primary_method VARCHAR(30) DEFAULT 'bedroom_bathroom' CHECK (primary_method IN (
    'bedroom_bathroom', 'sqft', 'sqft_tiered', 'flat_rate', 'hourly', 'room_count', 'hybrid'
  )),
  
  bed_bath_config JSONB DEFAULT '{"base_price": 80, "price_per_bedroom": 25, "price_per_bathroom": 20}',
  sqft_config JSONB DEFAULT '{"price_per_sqft": 0.10, "minimum_sqft": 500, "maximum_sqft": 10000}',
  sqft_tiers JSONB DEFAULT '[]',
  flat_rate_config JSONB DEFAULT '{}',
  hourly_config JSONB DEFAULT '{"base_hourly_rate": 45, "minimum_hours": 2}',
  room_count_config JSONB DEFAULT '{}',
  hybrid_config JSONB DEFAULT '{}',
  service_multipliers JSONB DEFAULT '{"standard": 1.0, "deep": 1.5, "move": 2.0}',
  day_pricing JSONB DEFAULT '{"enabled": false}',
  time_pricing JSONB DEFAULT '{"enabled": false}',
  rush_pricing JSONB DEFAULT '{"enabled": false}',
  
  minimum_order DECIMAL(10, 2) DEFAULT 75,
  minimum_order_message TEXT DEFAULT 'Minimum order of $75 required',
  
  round_to_nearest INTEGER DEFAULT 5,
  
  tax_rate DECIMAL(5, 4) DEFAULT 0,
  tax_included BOOLEAN DEFAULT FALSE,
  tax_label VARCHAR(50) DEFAULT 'Sales Tax',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotions
CREATE TABLE IF NOT EXISTS cleaning_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  internal_notes TEXT,
  
  promo_type VARCHAR(30) DEFAULT 'banner' CHECK (promo_type IN (
    'banner', 'badge', 'popup', 'inline', 'countdown', 'seasonal_pricing', 'flash_sale'
  )),
  
  active BOOLEAN DEFAULT FALSE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  display_schedule JSONB DEFAULT '{"all_day": true}',
  banner_config JSONB DEFAULT '{}',
  
  headline TEXT,
  subheadline TEXT,
  description TEXT,
  cta_text VARCHAR(100),
  cta_link VARCHAR(255),
  
  rich_content JSONB DEFAULT '{}',
  countdown_config JSONB DEFAULT '{}',
  
  has_pricing_impact BOOLEAN DEFAULT FALSE,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'flat', 'fixed_price')),
  discount_value DECIMAL(10, 2),
  discount_conditions JSONB DEFAULT '{}',
  
  promo_code VARCHAR(50),
  promo_code_case_sensitive BOOLEAN DEFAULT FALSE,
  
  max_uses INTEGER,
  max_uses_per_customer INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  
  badge_config JSONB DEFAULT '{}',
  targeting JSONB DEFAULT '{}',
  
  priority INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_promotions_business ON cleaning_promotions(business_id);

-- Widget Branding
CREATE TABLE IF NOT EXISTS cleaning_widget_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  colors JSONB DEFAULT '{"primary": "#7c3aed"}',
  typography JSONB DEFAULT '{"font_family": "Inter, system-ui, sans-serif"}',
  layout JSONB DEFAULT '{}',
  branding_assets JSONB DEFAULT '{}',
  buttons JSONB DEFAULT '{}',
  inputs JSONB DEFAULT '{}',
  cards JSONB DEFAULT '{}',
  animations JSONB DEFAULT '{"enabled": true}',
  custom_css TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Widget Copy
CREATE TABLE IF NOT EXISTS cleaning_widget_copy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  step_content JSONB DEFAULT '{}',
  buttons JSONB DEFAULT '{}',
  labels JSONB DEFAULT '{}',
  placeholders JSONB DEFAULT '{}',
  price_summary JSONB DEFAULT '{}',
  messages JSONB DEFAULT '{}',
  trust_signals JSONB DEFAULT '{}',
  policies JSONB DEFAULT '{}',
  footer JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Widget Settings
CREATE TABLE IF NOT EXISTS cleaning_widget_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  steps JSONB DEFAULT '{}',
  required_fields JSONB DEFAULT '{}',
  property_input JSONB DEFAULT '{}',
  scheduling JSONB DEFAULT '{}',
  addon_display JSONB DEFAULT '{}',
  frequency_display JSONB DEFAULT '{}',
  payment JSONB DEFAULT '{}',
  promo_codes JSONB DEFAULT '{}',
  progress JSONB DEFAULT '{}',
  mobile JSONB DEFAULT '{}',
  accessibility JSONB DEFAULT '{}',
  tracking JSONB DEFAULT '{}',
  embed JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PART 4: USAGE TRACKING & BILLING
-- ============================================================================

-- SMS Usage
CREATE TABLE IF NOT EXISTS sms_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  message_id VARCHAR(100) UNIQUE,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  to_number VARCHAR(20) NOT NULL,
  from_number VARCHAR(20) NOT NULL,
  body TEXT,
  segments INTEGER DEFAULT 1,
  
  twilio_cost DECIMAL(10, 6) DEFAULT 0,
  charged_amount DECIMAL(10, 4) DEFAULT 0,
  margin DECIMAL(10, 4) DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'queued',
  error_code VARCHAR(20),
  error_message TEXT,
  
  billed BOOLEAN DEFAULT FALSE,
  billed_at TIMESTAMP WITH TIME ZONE,
  invoice_id VARCHAR(100),
  
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_usage_business ON sms_usage(business_id);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  payment_link_id UUID,
  
  stripe_payment_intent_id VARCHAR(100) UNIQUE,
  stripe_charge_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  
  amount INTEGER NOT NULL,
  stripe_fee INTEGER DEFAULT 0,
  platform_fee INTEGER DEFAULT 0,
  net_amount INTEGER DEFAULT 0,
  
  platform_fee_percent DECIMAL(5, 4) DEFAULT 0.005,
  
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'disputed')),
  
  fee_collected BOOLEAN DEFAULT FALSE,
  fee_collected_at TIMESTAMP WITH TIME ZONE,
  
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_tx_business ON payment_transactions(business_id);

-- Usage Summaries
CREATE TABLE IF NOT EXISTS usage_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  sms_count INTEGER DEFAULT 0,
  sms_segments INTEGER DEFAULT 0,
  sms_cost DECIMAL(10, 2) DEFAULT 0,
  sms_charged DECIMAL(10, 2) DEFAULT 0,
  sms_margin DECIMAL(10, 2) DEFAULT 0,
  
  payments_count INTEGER DEFAULT 0,
  payments_volume DECIMAL(12, 2) DEFAULT 0,
  platform_fees DECIMAL(10, 2) DEFAULT 0,
  
  ai_generations INTEGER DEFAULT 0,
  ai_cost DECIMAL(10, 2) DEFAULT 0,
  ai_charged DECIMAL(10, 2) DEFAULT 0,
  
  total_usage_charges DECIMAL(10, 2) DEFAULT 0,
  
  invoice_id VARCHAR(100),
  invoice_status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, period_start)
);

-- Pricing Config (global)
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  sms_outbound_price DECIMAL(10, 6) DEFAULT 0.025,
  sms_inbound_price DECIMAL(10, 6) DEFAULT 0.01,
  sms_cost_outbound DECIMAL(10, 6) DEFAULT 0.0079,
  sms_cost_inbound DECIMAL(10, 6) DEFAULT 0.0075,
  
  mms_outbound_price DECIMAL(10, 6) DEFAULT 0.05,
  mms_cost_outbound DECIMAL(10, 6) DEFAULT 0.02,
  
  platform_fee_percent DECIMAL(5, 4) DEFAULT 0.005,
  min_platform_fee INTEGER DEFAULT 0,
  max_platform_fee INTEGER DEFAULT 0,
  
  ai_price_per_credit DECIMAL(10, 4) DEFAULT 0.10,
  ai_cost_per_credit DECIMAL(10, 4) DEFAULT 0.02,
  
  free_sms_per_month INTEGER DEFAULT 0,
  starter_sms_per_month INTEGER DEFAULT 100,
  pro_sms_per_month INTEGER DEFAULT 500,
  
  free_ai_per_month INTEGER DEFAULT 10,
  starter_ai_per_month INTEGER DEFAULT 50,
  pro_ai_per_month INTEGER DEFAULT 200,
  
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO pricing_config (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM pricing_config LIMIT 1);

-- ============================================================================
-- PART 5: FEATURE AWARENESS SYSTEM
-- ============================================================================

-- Business Features
CREATE TABLE IF NOT EXISTS business_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  feature_key TEXT NOT NULL,
  
  is_enabled BOOLEAN DEFAULT false,
  is_configured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  
  config_progress INTEGER DEFAULT 0,
  
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  
  config_errors JSONB DEFAULT '[]'::jsonb,
  config_warnings JSONB DEFAULT '[]'::jsonb,
  
  enabled_at TIMESTAMPTZ,
  enabled_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, feature_key)
);

-- Business Integrations
CREATE TABLE IF NOT EXISTS business_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  integration_key TEXT NOT NULL,
  
  is_connected BOOLEAN DEFAULT false,
  connection_status TEXT DEFAULT 'not_connected',
  
  credentials_ref TEXT,
  
  connected_at TIMESTAMPTZ,
  connected_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  
  last_health_check TIMESTAMPTZ,
  health_status TEXT DEFAULT 'unknown',
  
  last_error TEXT,
  last_error_at TIMESTAMPTZ,
  error_count INTEGER DEFAULT 0,
  
  granted_scopes TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, integration_key)
);

-- Business Config Items
CREATE TABLE IF NOT EXISTS business_config_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  category TEXT NOT NULL,
  config_key TEXT NOT NULL,
  
  is_configured BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT true,
  
  config_summary JSONB,
  
  last_validated_at TIMESTAMPTZ,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, category, config_key)
);

-- Feature Dependencies
CREATE TABLE IF NOT EXISTS feature_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  feature_key TEXT NOT NULL,
  dependency_type TEXT NOT NULL,
  dependency_key TEXT NOT NULL,
  is_required BOOLEAN DEFAULT true,
  requirement_label TEXT,
  sort_order INTEGER DEFAULT 0,
  
  UNIQUE(feature_key, dependency_type, dependency_key)
);

INSERT INTO feature_dependencies (feature_key, dependency_type, dependency_key, is_required, requirement_label) VALUES
('booking_widget', 'config', 'services', true, 'At least one service must be configured'),
('booking_widget', 'config', 'pricing', true, 'Pricing must be configured'),
('booking_widget', 'integration', 'stripe', false, 'Connect Stripe for online payments'),
('payment_links', 'integration', 'stripe', true, 'Stripe must be connected'),
('sequences', 'integration', 'twilio', false, 'Connect Twilio for SMS messages'),
('sms_notifications', 'integration', 'twilio', true, 'Twilio must be connected')
ON CONFLICT DO NOTHING;

-- Business Onboarding
CREATE TABLE IF NOT EXISTS business_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  overall_progress INTEGER DEFAULT 0,
  is_complete BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  steps_completed JSONB DEFAULT '{}'::jsonb,
  current_step TEXT DEFAULT 'business_profile',
  skipped_steps TEXT[] DEFAULT '{}',
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id)
);

CREATE INDEX IF NOT EXISTS idx_business_features_lookup ON business_features(business_id, feature_key);
CREATE INDEX IF NOT EXISTS idx_business_integrations_lookup ON business_integrations(business_id, integration_key);

-- ============================================================================
-- PART 6: ANALYTICS SYSTEM
-- ============================================================================

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  
  user_id UUID,
  session_id VARCHAR(100),
  
  source VARCHAR(50),
  source_ip INET,
  user_agent TEXT,
  
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_business ON analytics_events(business_id, event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name, event_timestamp DESC);

-- Realtime Metrics
CREATE TABLE IF NOT EXISTS realtime_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  metric_name VARCHAR(100) NOT NULL,
  metric_category VARCHAR(50) NOT NULL,
  
  time_bucket TIMESTAMP WITH TIME ZONE NOT NULL,
  granularity VARCHAR(20) DEFAULT 'hour',
  
  value_count BIGINT DEFAULT 0,
  value_sum DECIMAL(20, 4) DEFAULT 0,
  value_avg DECIMAL(20, 4) DEFAULT 0,
  value_min DECIMAL(20, 4),
  value_max DECIMAL(20, 4),
  
  dimensions JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, metric_name, time_bucket, granularity)
);

CREATE INDEX IF NOT EXISTS idx_realtime_metrics_business ON realtime_metrics(business_id, time_bucket DESC);

-- Daily Aggregates
CREATE TABLE IF NOT EXISTS daily_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  
  quotes_created INTEGER DEFAULT 0,
  quotes_won INTEGER DEFAULT 0,
  quotes_lost INTEGER DEFAULT 0,
  quotes_pending INTEGER DEFAULT 0,
  quote_value_total DECIMAL(12, 2) DEFAULT 0,
  quote_value_won DECIMAL(12, 2) DEFAULT 0,
  quote_conversion_rate DECIMAL(5, 4) DEFAULT 0,
  
  customers_new INTEGER DEFAULT 0,
  customers_active INTEGER DEFAULT 0,
  customers_at_risk INTEGER DEFAULT 0,
  customers_churned INTEGER DEFAULT 0,
  
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER,
  
  payments_count INTEGER DEFAULT 0,
  payments_volume DECIMAL(12, 2) DEFAULT 0,
  payment_links_created INTEGER DEFAULT 0,
  payment_links_paid INTEGER DEFAULT 0,
  
  bookings_created INTEGER DEFAULT 0,
  bookings_completed INTEGER DEFAULT 0,
  bookings_cancelled INTEGER DEFAULT 0,
  booking_revenue DECIMAL(12, 2) DEFAULT 0,
  
  campaigns_sent INTEGER DEFAULT 0,
  campaign_messages INTEGER DEFAULT 0,
  campaign_responses INTEGER DEFAULT 0,
  campaign_conversions INTEGER DEFAULT 0,
  
  active_sequences INTEGER DEFAULT 0,
  sequence_completions INTEGER DEFAULT 0,
  ai_suggestions_generated INTEGER DEFAULT 0,
  ai_suggestions_used INTEGER DEFAULT 0,
  
  synced_to_iceberg BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_aggregates_business ON daily_aggregates(business_id, date DESC);

-- Funnel Metrics
CREATE TABLE IF NOT EXISTS funnel_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  funnel_name VARCHAR(100) NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  step_order INTEGER NOT NULL,
  
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  entries INTEGER DEFAULT 0,
  exits INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 4) DEFAULT 0,
  avg_time_in_step_seconds INTEGER,
  
  dimensions JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, funnel_name, step_name, period_start)
);

-- Analytics Sync Log
CREATE TABLE IF NOT EXISTS analytics_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  sync_type VARCHAR(50) NOT NULL,
  sync_status VARCHAR(20) DEFAULT 'pending',
  
  data_start_date DATE,
  data_end_date DATE,
  
  records_synced INTEGER DEFAULT 0,
  bytes_written BIGINT DEFAULT 0,
  
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Cache
CREATE TABLE IF NOT EXISTS dashboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  cache_key VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, cache_key)
);

-- ============================================================================
-- PART 7: HELPER FUNCTIONS
-- ============================================================================

-- Log Activity
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

-- Update Timestamps
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

-- Analytics Functions
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
  CASE p_granularity
    WHEN 'minute' THEN v_time_bucket := date_trunc('minute', NOW());
    WHEN 'hour' THEN v_time_bucket := date_trunc('hour', NOW());
    WHEN 'day' THEN v_time_bucket := date_trunc('day', NOW());
    ELSE v_time_bucket := date_trunc('hour', NOW());
  END CASE;
  
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
    COALESCE((SELECT COUNT(*) FROM quotes WHERE business_id = p_business_id AND DATE(created_at) = p_date), 0),
    COALESCE((SELECT COUNT(*) FROM quotes WHERE business_id = p_business_id AND DATE(won_at) = p_date), 0),
    COALESCE((SELECT COUNT(*) FROM quotes WHERE business_id = p_business_id AND DATE(lost_at) = p_date), 0),
    COALESCE((SELECT SUM(quote_amount) FROM quotes WHERE business_id = p_business_id AND DATE(created_at) = p_date), 0),
    COALESCE((SELECT SUM(final_job_amount) FROM quotes WHERE business_id = p_business_id AND DATE(won_at) = p_date), 0),
    COALESCE((SELECT COUNT(*) FROM customers WHERE business_id = p_business_id AND DATE(created_at) = p_date), 0),
    COALESCE((SELECT COUNT(*) FROM messages WHERE business_id = p_business_id AND direction = 'outbound' AND DATE(created_at) = p_date), 0),
    COALESCE((SELECT COUNT(*) FROM messages WHERE business_id = p_business_id AND direction = 'inbound' AND DATE(created_at) = p_date), 0),
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

-- Initialize Feature Awareness
CREATE OR REPLACE FUNCTION initialize_business_feature_awareness()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO business_onboarding (business_id)
  VALUES (NEW.id)
  ON CONFLICT (business_id) DO NOTHING;
  
  INSERT INTO business_features (business_id, feature_key, is_enabled, is_available)
  VALUES 
    (NEW.id, 'booking_widget', false, true),
    (NEW.id, 'payment_links', false, true),
    (NEW.id, 'sequences', false, true),
    (NEW.id, 'calendar', false, true),
    (NEW.id, 'sms_notifications', false, true),
    (NEW.id, 'email_notifications', true, true),
    (NEW.id, 'reports', true, true)
  ON CONFLICT (business_id, feature_key) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS init_business_feature_awareness ON businesses;
CREATE TRIGGER init_business_feature_awareness
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION initialize_business_feature_awareness();

-- ============================================================================
-- PART 8: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
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
ALTER TABLE cleaning_service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_frequencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_property_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_booking_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_pricing_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_widget_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_widget_copy ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_widget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_config_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_cache ENABLE ROW LEVEL SECURITY;

-- Core Policies
DROP POLICY IF EXISTS "Users can access own business" ON businesses;
CREATE POLICY "Users can access own business" ON businesses
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can access own customers" ON customers;
CREATE POLICY "Users can access own customers" ON customers
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own quotes" ON quotes;
CREATE POLICY "Users can access own quotes" ON quotes
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own logs" ON activity_logs;
CREATE POLICY "Users can access own logs" ON activity_logs
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

DROP POLICY IF EXISTS "Public can view payment links" ON payment_links;
CREATE POLICY "Public can view payment links" ON payment_links
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can access own ai settings" ON ai_settings;
CREATE POLICY "Users can access own ai settings" ON ai_settings
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own ai suggestions" ON ai_suggestions;
CREATE POLICY "Users can access own ai suggestions" ON ai_suggestions
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own campaigns" ON campaigns;
CREATE POLICY "Users can access own campaigns" ON campaigns
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own billing events" ON billing_events;
CREATE POLICY "Users can access own billing events" ON billing_events
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Cleaning/Booking Policies
DROP POLICY IF EXISTS "Users can manage own service types" ON cleaning_service_types;
CREATE POLICY "Users can manage own service types" ON cleaning_service_types
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view active service types" ON cleaning_service_types;
CREATE POLICY "Public can view active service types" ON cleaning_service_types
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Users can manage own addons" ON cleaning_addons;
CREATE POLICY "Users can manage own addons" ON cleaning_addons
  FOR ALL USING (business_id IS NULL OR business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view active addons" ON cleaning_addons;
CREATE POLICY "Public can view active addons" ON cleaning_addons
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Users can manage own frequencies" ON cleaning_frequencies;
CREATE POLICY "Users can manage own frequencies" ON cleaning_frequencies
  FOR ALL USING (business_id IS NULL OR business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view active frequencies" ON cleaning_frequencies;
CREATE POLICY "Public can view active frequencies" ON cleaning_frequencies
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Users can manage own bookings" ON cleaning_bookings;
CREATE POLICY "Users can manage own bookings" ON cleaning_bookings
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can create bookings" ON cleaning_bookings;
CREATE POLICY "Public can create bookings" ON cleaning_bookings
  FOR INSERT WITH CHECK (true);

-- Feature Awareness Policies
DROP POLICY IF EXISTS "Users can view their business features" ON business_features;
CREATE POLICY "Users can view their business features" ON business_features
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their business integrations" ON business_integrations;
CREATE POLICY "Users can view their business integrations" ON business_integrations
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their business config items" ON business_config_items;
CREATE POLICY "Users can view their business config items" ON business_config_items
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their business onboarding" ON business_onboarding;
CREATE POLICY "Users can view their business onboarding" ON business_onboarding
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can read feature dependencies" ON feature_dependencies;
CREATE POLICY "Anyone can read feature dependencies" ON feature_dependencies
  FOR SELECT USING (true);

-- Analytics Policies
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
-- PART 9: ENABLE REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE realtime_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_aggregates;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your Selestial database is now ready.
-- 
-- Next steps:
-- 1. Add your environment variables (.env.local)
-- 2. Connect Stripe for payments
-- 3. Connect Twilio for SMS
-- 4. Configure your first business
-- ============================================================================
