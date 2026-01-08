-- ============================================================================
-- CLEANING BOOKING & DYNAMIC PRICING MATRIX SCHEMA
-- ============================================================================

-- ============================================================================
-- SERVICE TYPES
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Service definition
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  
  -- Base pricing
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Calculation method
  pricing_method VARCHAR(20) DEFAULT 'bedroom_bathroom' 
    CHECK (pricing_method IN ('bedroom_bathroom', 'sqft', 'flat_rate', 'hourly')),
  
  -- For bedroom/bathroom pricing
  price_per_bedroom DECIMAL(10, 2) DEFAULT 25,
  price_per_bathroom DECIMAL(10, 2) DEFAULT 20,
  price_per_half_bath DECIMAL(10, 2) DEFAULT 10,
  
  -- For sqft pricing
  price_per_sqft DECIMAL(10, 4) DEFAULT 0.10,
  sqft_minimum INTEGER DEFAULT 500,
  sqft_tiers JSONB DEFAULT '[]',
  
  -- For hourly pricing
  hourly_rate DECIMAL(10, 2) DEFAULT 45,
  estimated_hours_base DECIMAL(4, 2) DEFAULT 2,
  hours_per_bedroom DECIMAL(4, 2) DEFAULT 0.5,
  hours_per_bathroom DECIMAL(4, 2) DEFAULT 0.5,
  
  -- Time estimates
  min_duration_minutes INTEGER DEFAULT 60,
  max_duration_minutes INTEGER DEFAULT 180,
  
  -- Multiplier
  base_multiplier DECIMAL(4, 2) DEFAULT 1.0,
  
  -- Display
  icon VARCHAR(50),
  color VARCHAR(20),
  popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default service types template
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

-- Insert default templates
INSERT INTO cleaning_service_templates (name, slug, description, base_price, pricing_method, price_per_bedroom, price_per_bathroom, base_multiplier, icon, color, display_order) VALUES
('Standard Clean', 'standard', 'Regular maintenance cleaning. Dusting, vacuuming, mopping, bathroom & kitchen surfaces.', 80, 'bedroom_bathroom', 25, 20, 1.0, 'sparkles', 'blue', 1),
('Deep Clean', 'deep', 'Thorough top-to-bottom cleaning. Inside cabinets, baseboards, detailed scrubbing.', 120, 'bedroom_bathroom', 35, 30, 1.5, 'sprayCan', 'violet', 2),
('Move-In/Move-Out', 'move', 'Complete cleaning for empty homes. Inside appliances, closets, garage sweep.', 150, 'bedroom_bathroom', 45, 40, 2.0, 'truck', 'emerald', 3),
('Post-Construction', 'construction', 'Heavy-duty cleaning after renovation. Dust removal, debris, detailed surfaces.', 200, 'bedroom_bathroom', 55, 50, 2.5, 'hardHat', 'amber', 4),
('Airbnb Turnover', 'airbnb', 'Quick turnover cleaning between guests. Linens, restock, sanitize.', 90, 'bedroom_bathroom', 30, 25, 1.2, 'home', 'pink', 5)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ADD-ONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Add-on definition
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  
  -- Pricing
  price_type VARCHAR(20) DEFAULT 'flat' 
    CHECK (price_type IN ('flat', 'per_unit', 'per_sqft', 'percentage')),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- For per-unit pricing
  unit_name VARCHAR(50),
  min_units INTEGER DEFAULT 1,
  max_units INTEGER DEFAULT 10,
  
  -- For percentage pricing
  percentage DECIMAL(5, 2) DEFAULT 0,
  
  -- Time estimate
  additional_minutes INTEGER DEFAULT 15,
  
  -- Compatibility
  available_for_services UUID[] DEFAULT '{}',
  
  -- Display
  icon VARCHAR(50),
  popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default add-ons template
CREATE TABLE IF NOT EXISTS cleaning_addon_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  price_type VARCHAR(20),
  price DECIMAL(10, 2),
  unit_name VARCHAR(50),
  additional_minutes INTEGER,
  icon VARCHAR(50),
  display_order INTEGER
);

INSERT INTO cleaning_addon_templates (name, slug, description, price_type, price, unit_name, additional_minutes, icon, display_order) VALUES
('Inside Refrigerator', 'fridge', 'Deep clean inside fridge, shelves, drawers', 'flat', 35, NULL, 30, 'refrigerator', 1),
('Inside Oven', 'oven', 'Deep clean inside oven, racks, stovetop', 'flat', 35, NULL, 30, 'fire', 2),
('Inside Cabinets', 'cabinets', 'Wipe down inside all cabinets', 'flat', 50, NULL, 45, 'archive', 3),
('Interior Windows', 'windows', 'Clean interior window glass', 'per_unit', 8, 'window', 10, 'window', 4),
('Laundry (Wash & Fold)', 'laundry', 'Wash, dry, and fold clothes', 'per_unit', 25, 'load', 45, 'shirt', 5),
('Dishes', 'dishes', 'Hand wash or load dishwasher', 'flat', 20, NULL, 20, 'utensils', 6),
('Baseboards (Detailed)', 'baseboards', 'Hand wipe all baseboards', 'flat', 40, NULL, 30, 'minus', 7),
('Ceiling Fans', 'fans', 'Dust and wipe ceiling fans', 'per_unit', 10, 'fan', 10, 'fan', 8),
('Blinds (Detailed)', 'blinds', 'Wipe each slat', 'per_unit', 15, 'window', 15, 'blinds', 9),
('Garage Sweep', 'garage', 'Sweep and organize garage', 'flat', 45, NULL, 30, 'warehouse', 10),
('Patio/Balcony', 'patio', 'Sweep and wipe outdoor area', 'flat', 30, NULL, 20, 'tree', 11),
('Green/Eco Products', 'eco', 'Use eco-friendly cleaning products', 'percentage', 0, NULL, 0, 'leaf', 12)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FREQUENCY DISCOUNTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_frequencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Frequency definition
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(30) NOT NULL,
  description TEXT,
  
  -- Interval
  interval_days INTEGER NOT NULL,
  
  -- Discount
  discount_type VARCHAR(20) DEFAULT 'percentage' 
    CHECK (discount_type IN ('percentage', 'flat')),
  discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Display
  badge_text VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default frequencies (global templates)
INSERT INTO cleaning_frequencies (business_id, name, slug, description, interval_days, discount_type, discount_value, badge_text, display_order)
SELECT NULL, 'One-Time', 'onetime', 'Single cleaning service', 0, 'percentage', 0, NULL, 1 WHERE NOT EXISTS (SELECT 1 FROM cleaning_frequencies WHERE slug = 'onetime' AND business_id IS NULL);

INSERT INTO cleaning_frequencies (business_id, name, slug, description, interval_days, discount_type, discount_value, badge_text, display_order)
SELECT NULL, 'Weekly', 'weekly', 'Every week', 7, 'percentage', 20, 'Best Value', 2 WHERE NOT EXISTS (SELECT 1 FROM cleaning_frequencies WHERE slug = 'weekly' AND business_id IS NULL);

INSERT INTO cleaning_frequencies (business_id, name, slug, description, interval_days, discount_type, discount_value, badge_text, display_order)
SELECT NULL, 'Bi-Weekly', 'biweekly', 'Every 2 weeks', 14, 'percentage', 15, 'Most Popular', 3 WHERE NOT EXISTS (SELECT 1 FROM cleaning_frequencies WHERE slug = 'biweekly' AND business_id IS NULL);

INSERT INTO cleaning_frequencies (business_id, name, slug, description, interval_days, discount_type, discount_value, badge_text, display_order)
SELECT NULL, 'Monthly', 'monthly', 'Once a month', 30, 'percentage', 10, NULL, 4 WHERE NOT EXISTS (SELECT 1 FROM cleaning_frequencies WHERE slug = 'monthly' AND business_id IS NULL);

-- ============================================================================
-- PROPERTY SIZE PRESETS
-- ============================================================================
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

-- Default presets (global templates)
INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, 'Studio', 0, 1, 500, 1 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = 'Studio' AND business_id IS NULL);

INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, '1 Bed / 1 Bath', 1, 1, 750, 2 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = '1 Bed / 1 Bath' AND business_id IS NULL);

INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, '2 Bed / 1 Bath', 2, 1, 1000, 3 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = '2 Bed / 1 Bath' AND business_id IS NULL);

INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, '2 Bed / 2 Bath', 2, 2, 1200, 4 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = '2 Bed / 2 Bath' AND business_id IS NULL);

INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, '3 Bed / 2 Bath', 3, 2, 1600, 5 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = '3 Bed / 2 Bath' AND business_id IS NULL);

INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, '3 Bed / 2.5 Bath', 3, 2.5, 1900, 6 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = '3 Bed / 2.5 Bath' AND business_id IS NULL);

INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, '4 Bed / 2.5 Bath', 4, 2.5, 2200, 7 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = '4 Bed / 2.5 Bath' AND business_id IS NULL);

INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, '4 Bed / 3 Bath', 4, 3, 2600, 8 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = '4 Bed / 3 Bath' AND business_id IS NULL);

INSERT INTO cleaning_property_presets (business_id, name, bedrooms, bathrooms, sqft_estimate, display_order)
SELECT NULL, '5+ Bed / 3+ Bath', 5, 3.5, 3200, 9 WHERE NOT EXISTS (SELECT 1 FROM cleaning_property_presets WHERE name = '5+ Bed / 3+ Bath' AND business_id IS NULL);

-- ============================================================================
-- SERVICE AREAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Zone definition
  name VARCHAR(100) NOT NULL,
  zip_codes TEXT[],
  
  -- Pricing adjustment
  adjustment_type VARCHAR(20) DEFAULT 'percentage' 
    CHECK (adjustment_type IN ('percentage', 'flat')),
  adjustment_value DECIMAL(10, 2) DEFAULT 0,
  
  -- Travel fee
  travel_fee DECIMAL(10, 2) DEFAULT 0,
  
  -- Availability
  available BOOLEAN DEFAULT TRUE,
  min_booking_hours INTEGER DEFAULT 0,
  
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BOOKING CONFIGURATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_booking_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  -- Deposit settings
  require_deposit BOOLEAN DEFAULT TRUE,
  deposit_type VARCHAR(20) DEFAULT 'percentage' 
    CHECK (deposit_type IN ('percentage', 'flat', 'full')),
  deposit_value DECIMAL(10, 2) DEFAULT 25,
  deposit_minimum DECIMAL(10, 2) DEFAULT 25,
  
  -- Payment settings
  accept_cash BOOLEAN DEFAULT TRUE,
  accept_card BOOLEAN DEFAULT TRUE,
  collect_payment_at VARCHAR(20) DEFAULT 'booking' 
    CHECK (collect_payment_at IN ('booking', 'completion', 'either')),
  
  -- Scheduling
  lead_time_hours INTEGER DEFAULT 24,
  max_advance_days INTEGER DEFAULT 60,
  slot_duration_minutes INTEGER DEFAULT 30,
  
  -- Operating hours
  operating_hours JSONB DEFAULT '{
    "mon": {"start": "08:00", "end": "17:00", "enabled": true},
    "tue": {"start": "08:00", "end": "17:00", "enabled": true},
    "wed": {"start": "08:00", "end": "17:00", "enabled": true},
    "thu": {"start": "08:00", "end": "17:00", "enabled": true},
    "fri": {"start": "08:00", "end": "17:00", "enabled": true},
    "sat": {"start": "09:00", "end": "14:00", "enabled": true},
    "sun": {"start": null, "end": null, "enabled": false}
  }',
  
  -- Blocked dates
  blocked_dates DATE[] DEFAULT '{}',
  
  -- Form fields
  require_phone BOOLEAN DEFAULT TRUE,
  require_address BOOLEAN DEFAULT TRUE,
  require_access_instructions BOOLEAN DEFAULT FALSE,
  custom_fields JSONB DEFAULT '[]',
  
  -- Notifications
  send_confirmation_email BOOLEAN DEFAULT TRUE,
  send_confirmation_sms BOOLEAN DEFAULT TRUE,
  send_reminder_24h BOOLEAN DEFAULT TRUE,
  send_reminder_2h BOOLEAN DEFAULT TRUE,
  
  -- Widget appearance
  primary_color VARCHAR(20) DEFAULT '#7c3aed',
  logo_url TEXT,
  custom_css TEXT,
  
  -- Terms
  terms_url TEXT,
  cancellation_policy TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BOOKINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Reference
  booking_number VARCHAR(20) UNIQUE,
  
  -- Service details
  service_type_id UUID REFERENCES cleaning_service_types(id),
  service_name VARCHAR(100),
  
  -- Property details
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  sqft INTEGER,
  property_type VARCHAR(50),
  
  -- Add-ons
  addons JSONB DEFAULT '[]',
  
  -- Frequency
  frequency_id UUID REFERENCES cleaning_frequencies(id),
  frequency_name VARCHAR(50),
  frequency_discount DECIMAL(10, 2) DEFAULT 0,
  
  -- Pricing breakdown
  base_price DECIMAL(10, 2) NOT NULL,
  addons_total DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  
  -- Deposit
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT FALSE,
  deposit_paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME NOT NULL,
  scheduled_time_end TIME,
  estimated_duration_minutes INTEGER,
  
  -- Customer info
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  
  -- Access
  access_instructions TEXT,
  has_pets BOOLEAN DEFAULT FALSE,
  pet_details TEXT,
  special_requests TEXT,
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'
  )),
  
  -- Assignment
  assigned_to UUID,
  assigned_team TEXT[],
  
  -- Stripe
  stripe_payment_intent_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  
  -- Source tracking
  source VARCHAR(50) DEFAULT 'widget',
  referral_code VARCHAR(50),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Recurring
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_parent_id UUID REFERENCES cleaning_bookings(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT
);

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

-- Create trigger for booking number
DROP TRIGGER IF EXISTS set_cleaning_booking_number ON cleaning_bookings;
CREATE TRIGGER set_cleaning_booking_number
  BEFORE INSERT ON cleaning_bookings
  FOR EACH ROW
  WHEN (NEW.booking_number IS NULL)
  EXECUTE FUNCTION generate_cleaning_booking_number();

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_business ON cleaning_bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_customer ON cleaning_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_date ON cleaning_bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_status ON cleaning_bookings(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_bookings_number ON cleaning_bookings(booking_number);

CREATE INDEX IF NOT EXISTS idx_cleaning_service_types_business ON cleaning_service_types(business_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_addons_business ON cleaning_addons(business_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_frequencies_business ON cleaning_frequencies(business_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE cleaning_service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_frequencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_property_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_booking_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_bookings ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
DROP POLICY IF EXISTS "Users can manage own service types" ON cleaning_service_types;
CREATE POLICY "Users can manage own service types"
  ON cleaning_service_types FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own addons" ON cleaning_addons;
CREATE POLICY "Users can manage own addons"
  ON cleaning_addons FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own frequencies" ON cleaning_frequencies;
CREATE POLICY "Users can manage own frequencies"
  ON cleaning_frequencies FOR ALL
  USING (business_id IS NULL OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own property presets" ON cleaning_property_presets;
CREATE POLICY "Users can manage own property presets"
  ON cleaning_property_presets FOR ALL
  USING (business_id IS NULL OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own service areas" ON cleaning_service_areas;
CREATE POLICY "Users can manage own service areas"
  ON cleaning_service_areas FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own booking config" ON cleaning_booking_config;
CREATE POLICY "Users can manage own booking config"
  ON cleaning_booking_config FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own bookings" ON cleaning_bookings;
CREATE POLICY "Users can manage own bookings"
  ON cleaning_bookings FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Public read policies for widget
DROP POLICY IF EXISTS "Public can view active service types" ON cleaning_service_types;
CREATE POLICY "Public can view active service types"
  ON cleaning_service_types FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Public can view active addons" ON cleaning_addons;
CREATE POLICY "Public can view active addons"
  ON cleaning_addons FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Public can view active frequencies" ON cleaning_frequencies;
CREATE POLICY "Public can view active frequencies"
  ON cleaning_frequencies FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Public can view active property presets" ON cleaning_property_presets;
CREATE POLICY "Public can view active property presets"
  ON cleaning_property_presets FOR SELECT
  USING (active = true);

-- Allow public to create bookings
DROP POLICY IF EXISTS "Public can create bookings" ON cleaning_bookings;
CREATE POLICY "Public can create bookings"
  ON cleaning_bookings FOR INSERT
  WITH CHECK (true);
