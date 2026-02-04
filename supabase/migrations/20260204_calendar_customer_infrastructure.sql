-- ============================================================================
-- Calendar & Customer Management Infrastructure
-- Complete Cleaning Business Booking System
-- ============================================================================

-- ============================================================================
-- CORE BOOKING TABLE
-- ============================================================================

-- Cleaning Bookings (main bookings table)
CREATE TABLE IF NOT EXISTS cleaning_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  booking_number TEXT NOT NULL,
  
  -- Customer Info
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  
  -- Service Details
  service_type TEXT NOT NULL DEFAULT 'standard',
  service_name TEXT,
  frequency_name TEXT DEFAULT 'one_time',
  
  -- Property Details
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 3,
  bathrooms DECIMAL(3,1) NOT NULL DEFAULT 2,
  square_feet INTEGER,
  property_type TEXT DEFAULT 'house',
  has_pets BOOLEAN DEFAULT false,
  pet_details TEXT,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME NOT NULL,
  scheduled_time_end TIME,
  estimated_duration_minutes INTEGER DEFAULT 120,
  
  -- Staff Assignment
  assigned_staff_ids UUID[] DEFAULT '{}',
  lead_staff_id UUID,
  
  -- Add-ons (stored as JSONB array)
  addons JSONB DEFAULT '[]',
  
  -- Pricing (in dollars for display)
  base_price DECIMAL(10,2) DEFAULT 0,
  addons_total DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_code TEXT,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  deposit_required BOOLEAN DEFAULT false,
  
  -- Payment
  payment_status TEXT DEFAULT 'pending',
  deposit_paid BOOLEAN DEFAULT false,
  deposit_paid_at TIMESTAMPTZ,
  paid_in_full_at TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Notes
  access_instructions TEXT,
  special_requests TEXT,
  internal_notes TEXT,
  
  -- Recurring
  is_recurring BOOLEAN DEFAULT false,
  recurring_parent_id UUID REFERENCES cleaning_bookings(id) ON DELETE SET NULL,
  recurring_schedule JSONB,
  
  -- Source
  source TEXT DEFAULT 'widget',
  
  -- Google Calendar sync
  google_event_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for cleaning_bookings
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_business 
  ON cleaning_bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_date 
  ON cleaning_bookings(business_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_status 
  ON cleaning_bookings(business_id, status);
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_customer 
  ON cleaning_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_number 
  ON cleaning_bookings(booking_number);

-- RLS for cleaning_bookings
ALTER TABLE cleaning_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their bookings"
  ON cleaning_bookings FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their bookings"
  ON cleaning_bookings FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- ============================================================================
-- AVAILABILITY SETTINGS
-- ============================================================================

-- Business Availability Settings
CREATE TABLE IF NOT EXISTS availability_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Booking Window
  min_advance_hours INTEGER DEFAULT 24,
  max_advance_days INTEGER DEFAULT 60,
  
  -- Buffer Times
  buffer_between_bookings INTEGER DEFAULT 30,
  
  -- Slots
  slot_duration_minutes INTEGER DEFAULT 30,
  slots_per_day_limit INTEGER,
  
  -- Service Area
  service_zip_codes TEXT[] DEFAULT '{}',
  service_radius_miles INTEGER,
  
  -- Business Hours (JSONB array of day configs)
  business_hours JSONB DEFAULT '[
    {"day_of_week": 0, "is_open": false, "open_time": "09:00", "close_time": "17:00"},
    {"day_of_week": 1, "is_open": true, "open_time": "08:00", "close_time": "17:00"},
    {"day_of_week": 2, "is_open": true, "open_time": "08:00", "close_time": "17:00"},
    {"day_of_week": 3, "is_open": true, "open_time": "08:00", "close_time": "17:00"},
    {"day_of_week": 4, "is_open": true, "open_time": "08:00", "close_time": "17:00"},
    {"day_of_week": 5, "is_open": true, "open_time": "08:00", "close_time": "17:00"},
    {"day_of_week": 6, "is_open": false, "open_time": "09:00", "close_time": "15:00"}
  ]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id)
);

-- RLS for availability_settings
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their availability settings"
  ON availability_settings FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their availability settings"
  ON availability_settings FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- ============================================================================
-- CLEANING SERVICES CONFIG
-- ============================================================================

-- Cleaning Services (configurable by business)
CREATE TABLE IF NOT EXISTS cleaning_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- standard, deep, move_in, move_out, etc.
  description TEXT,
  
  -- Pricing (in cents)
  base_price INTEGER NOT NULL DEFAULT 10000,
  price_per_bedroom INTEGER DEFAULT 2000,
  price_per_bathroom INTEGER DEFAULT 1500,
  price_per_sqft INTEGER,
  minimum_price INTEGER DEFAULT 8000,
  
  -- Duration
  base_duration_minutes INTEGER DEFAULT 90,
  duration_per_bedroom INTEGER DEFAULT 20,
  duration_per_bathroom INTEGER DEFAULT 15,
  
  -- Display
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cleaning Add-ons
CREATE TABLE IF NOT EXISTS cleaning_addons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in cents
  duration_minutes INTEGER DEFAULT 15,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_services_business 
  ON cleaning_services(business_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_addons_business 
  ON cleaning_addons(business_id);

-- RLS
ALTER TABLE cleaning_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their cleaning services"
  ON cleaning_services FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their cleaning services"
  ON cleaning_services FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view their cleaning addons"
  ON cleaning_addons FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their cleaning addons"
  ON cleaning_addons FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- ============================================================================
-- INTEGRATION CONNECTIONS
-- ============================================================================

-- Integration Connections Table (for Google Calendar, etc.)
CREATE TABLE IF NOT EXISTS integration_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  account_email TEXT,
  account_name TEXT,
  account_id TEXT,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, integration_type)
);

-- Calendar Blocked Times (for unavailable periods)
CREATE TABLE IF NOT EXISTS calendar_blocked_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Blocked',
  reason TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- iCal RRULE format
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Sync Log (for tracking syncs)
CREATE TABLE IF NOT EXISTS calendar_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'full', 'incremental', 'manual'
  status TEXT NOT NULL, -- 'started', 'completed', 'failed'
  events_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Customer Tags
CREATE TABLE IF NOT EXISTS customer_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, name)
);

-- Customer Tag Assignments
CREATE TABLE IF NOT EXISTS customer_tag_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, tag_id)
);

-- Customer Notes
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Communications Log
CREATE TABLE IF NOT EXISTS customer_communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- 'email', 'sms', 'call', 'in_person'
  direction TEXT NOT NULL, -- 'inbound', 'outbound'
  subject TEXT,
  content TEXT,
  status TEXT, -- 'sent', 'delivered', 'failed', 'read'
  sent_at TIMESTAMPTZ,
  sent_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Staff Assignments
CREATE TABLE IF NOT EXISTS booking_staff_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  staff_id UUID NOT NULL,
  is_lead BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'assigned', -- 'assigned', 'confirmed', 'declined'
  notes TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Members
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'cleaner', -- 'cleaner', 'lead', 'manager', 'admin'
  color TEXT DEFAULT '#6366f1', -- For calendar display
  is_active BOOLEAN DEFAULT true,
  hourly_rate INTEGER, -- in cents
  availability JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Availability (weekly recurring)
CREATE TABLE IF NOT EXISTS staff_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, day_of_week)
);

-- Staff Time Off
CREATE TABLE IF NOT EXISTS staff_time_off (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'denied'
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Lifetime Value Tracking
CREATE TABLE IF NOT EXISTS customer_ltv_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_revenue INTEGER DEFAULT 0, -- in cents
  total_jobs INTEGER DEFAULT 0,
  average_job_value INTEGER DEFAULT 0,
  health_score INTEGER DEFAULT 50,
  churn_probability DECIMAL(5,4),
  predicted_ltv INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, snapshot_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integration_connections_business 
  ON integration_connections(business_id);
CREATE INDEX IF NOT EXISTS idx_integration_connections_type 
  ON integration_connections(business_id, integration_type);
CREATE INDEX IF NOT EXISTS idx_calendar_blocked_business 
  ON calendar_blocked_times(business_id);
CREATE INDEX IF NOT EXISTS idx_calendar_blocked_times 
  ON calendar_blocked_times(business_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_customer_tags_business 
  ON customer_tags(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_customer 
  ON customer_tag_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer 
  ON customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer 
  ON customer_communications(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_members_business 
  ON staff_members(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_availability_staff 
  ON staff_availability(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_time_off_staff 
  ON staff_time_off(staff_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_customer_ltv_snapshots_customer 
  ON customer_ltv_snapshots(customer_id, snapshot_date DESC);

-- RLS Policies
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_ltv_snapshots ENABLE ROW LEVEL SECURITY;

-- Integration Connections RLS
CREATE POLICY "Users can view their business connections"
  ON integration_connections FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their business connections"
  ON integration_connections FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Calendar Blocked Times RLS
CREATE POLICY "Users can view their blocked times"
  ON calendar_blocked_times FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their blocked times"
  ON calendar_blocked_times FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Customer Tags RLS
CREATE POLICY "Users can view their tags"
  ON customer_tags FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their tags"
  ON customer_tags FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Customer Tag Assignments RLS
CREATE POLICY "Users can view tag assignments"
  ON customer_tag_assignments FOR SELECT
  USING (customer_id IN (
    SELECT c.id FROM customers c
    JOIN businesses b ON c.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage tag assignments"
  ON customer_tag_assignments FOR ALL
  USING (customer_id IN (
    SELECT c.id FROM customers c
    JOIN businesses b ON c.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- Customer Notes RLS
CREATE POLICY "Users can view customer notes"
  ON customer_notes FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage customer notes"
  ON customer_notes FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Customer Communications RLS
CREATE POLICY "Users can view communications"
  ON customer_communications FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage communications"
  ON customer_communications FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Staff Members RLS
CREATE POLICY "Users can view their staff"
  ON staff_members FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their staff"
  ON staff_members FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Staff Availability RLS
CREATE POLICY "Users can view staff availability"
  ON staff_availability FOR SELECT
  USING (staff_id IN (
    SELECT s.id FROM staff_members s
    JOIN businesses b ON s.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage staff availability"
  ON staff_availability FOR ALL
  USING (staff_id IN (
    SELECT s.id FROM staff_members s
    JOIN businesses b ON s.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- Staff Time Off RLS
CREATE POLICY "Users can view staff time off"
  ON staff_time_off FOR SELECT
  USING (staff_id IN (
    SELECT s.id FROM staff_members s
    JOIN businesses b ON s.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage staff time off"
  ON staff_time_off FOR ALL
  USING (staff_id IN (
    SELECT s.id FROM staff_members s
    JOIN businesses b ON s.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- Customer LTV Snapshots RLS
CREATE POLICY "Users can view LTV snapshots"
  ON customer_ltv_snapshots FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_integration_connections_updated_at
    BEFORE UPDATE ON integration_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_calendar_blocked_times_updated_at
    BEFORE UPDATE ON calendar_blocked_times
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_customer_tags_updated_at
    BEFORE UPDATE ON customer_tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_customer_notes_updated_at
    BEFORE UPDATE ON customer_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_staff_members_updated_at
    BEFORE UPDATE ON staff_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_cleaning_bookings_updated_at
    BEFORE UPDATE ON cleaning_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_availability_settings_updated_at
    BEFORE UPDATE ON availability_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_cleaning_services_updated_at
    BEFORE UPDATE ON cleaning_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_cleaning_addons_updated_at
    BEFORE UPDATE ON cleaning_addons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add helpful views

-- Customer with tags view
CREATE OR REPLACE VIEW customer_with_tags AS
SELECT 
  c.*,
  COALESCE(
    json_agg(
      json_build_object('id', t.id, 'name', t.name, 'color', t.color)
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'::json
  ) as tags
FROM customers c
LEFT JOIN customer_tag_assignments cta ON c.id = cta.customer_id
LEFT JOIN customer_tags t ON cta.tag_id = t.id
GROUP BY c.id;

-- Staff schedule view (for a given week)
CREATE OR REPLACE VIEW staff_weekly_schedule AS
SELECT 
  s.id as staff_id,
  s.first_name,
  s.last_name,
  s.color,
  sa.day_of_week,
  sa.start_time,
  sa.end_time,
  sa.is_available
FROM staff_members s
LEFT JOIN staff_availability sa ON s.id = sa.staff_id
WHERE s.is_active = true
ORDER BY s.first_name, sa.day_of_week;

-- Upcoming bookings view
CREATE OR REPLACE VIEW upcoming_bookings AS
SELECT 
  b.*,
  c.email as customer_email_lookup,
  c.phone as customer_phone_lookup
FROM cleaning_bookings b
LEFT JOIN customers c ON b.customer_id = c.id
WHERE b.scheduled_date >= CURRENT_DATE
  AND b.status NOT IN ('cancelled', 'completed')
ORDER BY b.scheduled_date, b.scheduled_time_start;

-- Today's bookings view
CREATE OR REPLACE VIEW todays_bookings AS
SELECT 
  b.*,
  array_agg(
    json_build_object(
      'id', s.id, 
      'first_name', s.first_name, 
      'last_name', s.last_name, 
      'color', s.color
    )
  ) FILTER (WHERE s.id IS NOT NULL) as assigned_staff
FROM cleaning_bookings b
LEFT JOIN staff_members s ON s.id = ANY(b.assigned_staff_ids)
WHERE b.scheduled_date = CURRENT_DATE
GROUP BY b.id
ORDER BY b.scheduled_time_start;

-- ============================================================================
-- ENABLE REALTIME FOR KEY TABLES
-- ============================================================================

-- Enable realtime for bookings (for live calendar updates)
ALTER PUBLICATION supabase_realtime ADD TABLE cleaning_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE staff_members;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_blocked_times;
