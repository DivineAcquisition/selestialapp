-- ============================================================================
-- SELESTIAL INITIAL DATABASE SCHEMA
-- Run this first before other migrations
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES (linked to Supabase Auth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BUSINESSES
-- ============================================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  
  -- Business Details
  industry VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  
  -- Subscription
  subscription_status VARCHAR(50) DEFAULT 'trialing',
  subscription_plan VARCHAR(50) DEFAULT 'starter',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  stripe_account_id VARCHAR(100),
  
  -- Limits
  quotes_limit INTEGER DEFAULT 100,
  sequences_limit INTEGER DEFAULT 5,
  
  -- Settings
  default_sequence_id UUID,
  auto_start_sequence BOOLEAN DEFAULT TRUE,
  ai_enabled BOOLEAN DEFAULT TRUE,
  
  -- Notification Settings
  notify_email_won BOOLEAN DEFAULT TRUE,
  notify_email_lost BOOLEAN DEFAULT TRUE,
  notify_email_daily_digest BOOLEAN DEFAULT TRUE,
  notify_sms_enabled BOOLEAN DEFAULT FALSE,
  
  -- Widget Configuration (fallback storage)
  booking_widget_config JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_user ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);

-- ============================================================================
-- CUSTOMERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Contact Info
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'US',
  
  -- Customer Details
  source VARCHAR(50) DEFAULT 'manual',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Stats
  total_spent DECIMAL(12, 2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  last_service_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_business ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(business_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(business_id, phone);

-- ============================================================================
-- QUOTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  sequence_id UUID,
  
  -- Customer Info (denormalized for quick access)
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  
  -- Quote Details
  service_type VARCHAR(100),
  quote_amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'new',
  status_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Sequence Progress
  current_step_index INTEGER DEFAULT 0,
  next_message_at TIMESTAMP WITH TIME ZONE,
  
  -- Outcome
  won_at TIMESTAMP WITH TIME ZONE,
  lost_at TIMESTAMP WITH TIME ZONE,
  lost_reason TEXT,
  final_job_amount DECIMAL(12, 2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_business ON quotes(business_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(business_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_next_message ON quotes(next_message_at);

-- ============================================================================
-- SEQUENCES (Follow-up workflows)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Steps stored as JSONB
  steps JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sequences_business ON sequences(business_id);

-- ============================================================================
-- ACTIVITY LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- Activity
  action VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_business ON activity_logs(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_quote ON activity_logs(quote_id);

-- ============================================================================
-- MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Message Details
  channel VARCHAR(20) NOT NULL, -- 'sms', 'email'
  direction VARCHAR(20) NOT NULL, -- 'inbound', 'outbound'
  content TEXT NOT NULL,
  subject VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- External IDs
  external_id VARCHAR(100),
  
  -- Error tracking
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_business ON messages(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_quote ON messages(quote_id);
CREATE INDEX IF NOT EXISTS idx_messages_customer ON messages(customer_id);

-- ============================================================================
-- PAYMENT LINKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  
  -- Link Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Customer Info
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Payment
  stripe_payment_intent_id VARCHAR(100),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Expiry
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_links_business ON payment_links(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON payment_links(status);

-- ============================================================================
-- CLEANING BOOKING CONFIGURATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_booking_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  -- Operating Hours (JSONB for flexibility)
  operating_hours JSONB DEFAULT '{
    "mon": {"start": "08:00", "end": "17:00", "enabled": true},
    "tue": {"start": "08:00", "end": "17:00", "enabled": true},
    "wed": {"start": "08:00", "end": "17:00", "enabled": true},
    "thu": {"start": "08:00", "end": "17:00", "enabled": true},
    "fri": {"start": "08:00", "end": "17:00", "enabled": true},
    "sat": {"start": "09:00", "end": "14:00", "enabled": true},
    "sun": {"start": null, "end": null, "enabled": false}
  }',
  
  -- Blocked Dates
  blocked_dates TEXT[] DEFAULT '{}',
  
  -- Scheduling
  lead_time_hours INTEGER DEFAULT 24,
  max_advance_days INTEGER DEFAULT 60,
  slot_duration_minutes INTEGER DEFAULT 30,
  
  -- Deposit
  require_deposit BOOLEAN DEFAULT TRUE,
  deposit_type VARCHAR(20) DEFAULT 'percentage',
  deposit_value DECIMAL(10, 2) DEFAULT 25,
  deposit_minimum DECIMAL(10, 2) DEFAULT 25,
  
  -- Payment
  accept_cash BOOLEAN DEFAULT TRUE,
  accept_card BOOLEAN DEFAULT TRUE,
  
  -- Notifications
  send_confirmation_email BOOLEAN DEFAULT TRUE,
  send_confirmation_sms BOOLEAN DEFAULT TRUE,
  
  -- Styling
  primary_color VARCHAR(20) DEFAULT '#7c3aed',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CLEANING SERVICE TEMPLATES (Global defaults)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_service_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  
  -- Pricing defaults
  base_price DECIMAL(10, 2) DEFAULT 80,
  price_per_bedroom DECIMAL(10, 2) DEFAULT 25,
  price_per_bathroom DECIMAL(10, 2) DEFAULT 20,
  base_multiplier DECIMAL(4, 2) DEFAULT 1.0,
  pricing_method VARCHAR(30) DEFAULT 'bedroom_bathroom',
  
  -- Display
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default service templates
INSERT INTO cleaning_service_templates (name, slug, description, icon, base_price, price_per_bedroom, price_per_bathroom, base_multiplier, display_order)
VALUES 
  ('Standard Cleaning', 'standard', 'Regular maintenance cleaning', 'home', 80, 25, 20, 1.0, 1),
  ('Deep Cleaning', 'deep', 'Thorough top-to-bottom clean', 'sparkles', 120, 35, 30, 1.5, 2),
  ('Move In/Out', 'move', 'Complete clean for moving', 'truck', 150, 45, 35, 1.8, 3),
  ('Post-Construction', 'construction', 'Heavy duty construction cleanup', 'hammer', 200, 50, 40, 2.0, 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- CLEANING SERVICE TYPES (Per-business customization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  
  -- Pricing
  base_price DECIMAL(10, 2) DEFAULT 80,
  price_per_bedroom DECIMAL(10, 2) DEFAULT 25,
  price_per_bathroom DECIMAL(10, 2) DEFAULT 20,
  price_per_half_bath DECIMAL(10, 2) DEFAULT 10,
  price_per_sqft DECIMAL(10, 4) DEFAULT 0.10,
  base_multiplier DECIMAL(4, 2) DEFAULT 1.0,
  pricing_method VARCHAR(30) DEFAULT 'bedroom_bathroom',
  
  -- Time estimates
  hourly_rate DECIMAL(10, 2) DEFAULT 45,
  estimated_hours_base DECIMAL(4, 2) DEFAULT 2,
  hours_per_bedroom DECIMAL(4, 2) DEFAULT 0.5,
  hours_per_bathroom DECIMAL(4, 2) DEFAULT 0.5,
  min_duration_minutes INTEGER DEFAULT 60,
  max_duration_minutes INTEGER DEFAULT 480,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_service_types_business ON cleaning_service_types(business_id);

-- ============================================================================
-- CLEANING ADDON TEMPLATES (Global defaults)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_addon_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  
  -- Pricing
  price DECIMAL(10, 2) DEFAULT 25,
  price_type VARCHAR(20) DEFAULT 'flat',
  additional_minutes INTEGER DEFAULT 30,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default addon templates
INSERT INTO cleaning_addon_templates (name, slug, description, icon, price, price_type, additional_minutes, display_order)
VALUES 
  ('Inside Oven', 'oven', 'Deep clean inside your oven', 'flame', 35, 'flat', 30, 1),
  ('Inside Refrigerator', 'fridge', 'Clean and sanitize fridge interior', 'snowflake', 35, 'flat', 30, 2),
  ('Inside Cabinets', 'cabinets', 'Wipe down cabinet interiors', 'door', 45, 'flat', 45, 3),
  ('Laundry', 'laundry', 'Wash, dry, and fold laundry', 'shirt', 30, 'flat', 60, 4),
  ('Window Cleaning', 'windows', 'Interior window cleaning', 'grid', 25, 'per_unit', 15, 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- CLEANING ADDONS (Per-business)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  
  -- Pricing
  price DECIMAL(10, 2) DEFAULT 25,
  price_type VARCHAR(20) DEFAULT 'flat',
  unit_name VARCHAR(50),
  min_units INTEGER DEFAULT 1,
  max_units INTEGER DEFAULT 10,
  percentage DECIMAL(5, 2) DEFAULT 0,
  additional_minutes INTEGER DEFAULT 30,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_addons_business ON cleaning_addons(business_id);

-- ============================================================================
-- CLEANING FREQUENCIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_frequencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  
  -- Frequency
  interval_days INTEGER NOT NULL,
  
  -- Discount
  discount_type VARCHAR(20) DEFAULT 'percentage',
  discount_value DECIMAL(10, 2) DEFAULT 0,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, slug)
);

-- Insert default frequencies
INSERT INTO cleaning_frequencies (name, slug, interval_days, discount_type, discount_value, display_order)
VALUES 
  ('One-Time', 'one-time', 0, 'percentage', 0, 1),
  ('Weekly', 'weekly', 7, 'percentage', 20, 2),
  ('Bi-Weekly', 'biweekly', 14, 'percentage', 15, 3),
  ('Monthly', 'monthly', 30, 'percentage', 10, 4)
ON CONFLICT (business_id, slug) DO NOTHING;

-- ============================================================================
-- CLEANING PROPERTY PRESETS
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_property_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  
  name VARCHAR(100) NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(3, 1) NOT NULL,
  sqft INTEGER,
  
  -- Display
  active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  
  UNIQUE(business_id, bedrooms, bathrooms)
);

-- Insert default presets
INSERT INTO cleaning_property_presets (name, bedrooms, bathrooms, display_order)
VALUES 
  ('Studio', 0, 1, 1),
  ('1 Bed / 1 Bath', 1, 1, 2),
  ('2 Bed / 1 Bath', 2, 1, 3),
  ('2 Bed / 2 Bath', 2, 2, 4),
  ('3 Bed / 2 Bath', 3, 2, 5),
  ('4 Bed / 2.5 Bath', 4, 2.5, 6),
  ('5+ Bed', 5, 3, 7)
ON CONFLICT (business_id, bedrooms, bathrooms) DO NOTHING;

-- ============================================================================
-- CLEANING BOOKINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Booking Number
  booking_number VARCHAR(20) DEFAULT CONCAT('BK', SUBSTRING(gen_random_uuid()::text, 1, 8)),
  
  -- Service Details
  service_type_id UUID,
  service_name VARCHAR(100),
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  sqft INTEGER,
  
  -- Addons
  addons JSONB DEFAULT '[]',
  
  -- Frequency
  frequency_id UUID,
  frequency_name VARCHAR(100),
  frequency_discount DECIMAL(10, 2) DEFAULT 0,
  
  -- Pricing
  base_price DECIMAL(10, 2),
  addons_total DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT FALSE,
  deposit_paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Schedule
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  estimated_duration_minutes INTEGER,
  
  -- Customer Info (denormalized)
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  
  -- Additional
  access_instructions TEXT,
  has_pets BOOLEAN DEFAULT FALSE,
  pet_details TEXT,
  special_requests TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- Payment
  stripe_payment_intent_id VARCHAR(100),
  
  -- Source
  source VARCHAR(50) DEFAULT 'widget',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_business ON cleaning_bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON cleaning_bookings(business_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON cleaning_bookings(status);

-- ============================================================================
-- BOOKING WIDGET CONFIGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS booking_widget_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  config JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_booking_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_widget_configs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Businesses
CREATE POLICY "Users can view own business" ON businesses FOR SELECT USING (user_id = auth.uid() OR owner_id = auth.uid());
CREATE POLICY "Users can create own business" ON businesses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own business" ON businesses FOR UPDATE USING (user_id = auth.uid() OR owner_id = auth.uid());

-- Customers
CREATE POLICY "Users can manage own customers" ON customers FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

-- Quotes
CREATE POLICY "Users can manage own quotes" ON quotes FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

-- Sequences
CREATE POLICY "Users can manage own sequences" ON sequences FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

-- Activity Logs
CREATE POLICY "Users can view own activity" ON activity_logs FOR SELECT USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

-- Messages
CREATE POLICY "Users can manage own messages" ON messages FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

-- Payment Links
CREATE POLICY "Users can manage own payment links" ON payment_links FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

-- Cleaning Config
CREATE POLICY "Users can manage own booking config" ON cleaning_booking_config FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

-- Service Types
CREATE POLICY "Users can manage own service types" ON cleaning_service_types FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

-- Addons
CREATE POLICY "Users can manage own addons" ON cleaning_addons FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

-- Bookings - Business owners can manage
CREATE POLICY "Users can manage own bookings" ON cleaning_bookings FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

-- Bookings - Public can create (for widget)
CREATE POLICY "Public can create bookings" ON cleaning_bookings FOR INSERT WITH CHECK (true);

-- Widget Configs
CREATE POLICY "Users can manage own widget configs" ON booking_widget_configs FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

-- Public read policies for booking widget
CREATE POLICY "Public can read booking config" ON cleaning_booking_config FOR SELECT USING (true);
CREATE POLICY "Public can read service types" ON cleaning_service_types FOR SELECT USING (active = true);
CREATE POLICY "Public can read addons" ON cleaning_addons FOR SELECT USING (active = true);
CREATE POLICY "Public can read frequencies" ON cleaning_frequencies FOR SELECT USING (active = true);
CREATE POLICY "Public can read property presets" ON cleaning_property_presets FOR SELECT USING (active = true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Log activity function
CREATE OR REPLACE FUNCTION log_activity(
  p_business_id UUID,
  p_action VARCHAR(100),
  p_description TEXT,
  p_quote_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO activity_logs (business_id, action, description, quote_id, metadata)
  VALUES (p_business_id, p_action, p_description, p_quote_id, p_metadata)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
