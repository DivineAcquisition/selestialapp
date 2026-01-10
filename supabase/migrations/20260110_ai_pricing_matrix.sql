-- ============================================================================
-- AI PRICING MATRIX ENGINE FOR CLEANING COMPANIES
-- Comprehensive pricing configuration with full customization
-- ============================================================================

-- ============================================================================
-- 1. BASE PRICING CONFIGURATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Primary Pricing Method
  pricing_method TEXT NOT NULL DEFAULT 'bedroom_bathroom'
    CHECK (pricing_method IN ('bedroom_bathroom', 'sqft', 'sqft_tiered', 'flat_rate', 'hourly', 'room_count', 'hybrid')),
  
  -- Bedroom/Bathroom Method Settings
  base_price DECIMAL(10,2) DEFAULT 120.00,
  per_bedroom DECIMAL(10,2) DEFAULT 15.00,
  per_bathroom DECIMAL(10,2) DEFAULT 25.00,
  per_half_bath DECIMAL(10,2) DEFAULT 12.50,
  
  -- Square Footage Method Settings
  price_per_sqft DECIMAL(10,4) DEFAULT 0.10,
  sqft_minimum_charge DECIMAL(10,2) DEFAULT 100.00,
  
  -- Hourly Method Settings
  hourly_rate DECIMAL(10,2) DEFAULT 35.00,
  minimum_hours DECIMAL(4,2) DEFAULT 2.00,
  team_size_default INTEGER DEFAULT 1,
  
  -- Flat Rate by Home Size (JSONB for flexibility)
  flat_rates JSONB DEFAULT '{
    "studio": 90,
    "1br": 120,
    "2br": 160,
    "3br": 200,
    "4br": 260,
    "5br": 320,
    "6br_plus": 400
  }'::jsonb,
  
  -- General Settings
  minimum_charge DECIMAL(10,2) DEFAULT 100.00,
  currency TEXT DEFAULT 'USD',
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_included BOOLEAN DEFAULT false,
  
  -- Deposit Settings
  require_deposit BOOLEAN DEFAULT true,
  deposit_type TEXT DEFAULT 'percentage' CHECK (deposit_type IN ('percentage', 'flat', 'full')),
  deposit_value DECIMAL(10,2) DEFAULT 25,
  deposit_minimum DECIMAL(10,2) DEFAULT 25,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id)
);

-- ============================================================================
-- 2. SQUARE FOOTAGE TIERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_sqft_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  min_sqft INTEGER NOT NULL,
  max_sqft INTEGER, -- NULL means unlimited
  price_per_sqft DECIMAL(10,4) NOT NULL,
  service_type TEXT DEFAULT 'all', -- 'all', 'standard', 'deep', 'move_out', etc.
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default sqft tiers (global templates)
INSERT INTO cleaning_sqft_tiers (business_id, min_sqft, max_sqft, price_per_sqft, service_type, sort_order) VALUES
(NULL, 0, 1000, 0.15, 'all', 1),
(NULL, 1001, 2000, 0.12, 'all', 2),
(NULL, 2001, 3000, 0.10, 'all', 3),
(NULL, 3001, NULL, 0.08, 'all', 4)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. SERVICE TYPE MULTIPLIERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_service_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  service_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Multiplier applied to base price
  multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  
  -- Alternative: fixed price override per sqft
  fixed_price_per_sqft DECIMAL(10,4),
  
  -- Time estimate multiplier (for scheduling)
  time_multiplier DECIMAL(4,2) DEFAULT 1.00,
  
  -- Is this service available for booking?
  is_active BOOLEAN DEFAULT true,
  
  -- Require this as first-time clean?
  required_for_first_time BOOLEAN DEFAULT false,
  
  -- Icon and color for display
  icon TEXT,
  color TEXT,
  
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, service_type)
);

-- Insert default service type multipliers (global templates)
INSERT INTO cleaning_service_multipliers (business_id, service_type, display_name, description, multiplier, time_multiplier, required_for_first_time, icon, sort_order) VALUES
(NULL, 'standard', 'Standard Cleaning', 'Regular maintenance cleaning - dusting, vacuuming, mopping, bathroom & kitchen surfaces', 1.00, 1.00, false, 'sparkles', 1),
(NULL, 'deep', 'Deep Cleaning', 'Thorough top-to-bottom cleaning - inside cabinets, baseboards, detailed scrubbing', 1.50, 1.75, false, 'sprayCan', 2),
(NULL, 'initial', 'Initial Deep Clean', 'First-time comprehensive cleaning to establish baseline cleanliness', 1.50, 2.00, true, 'star', 3),
(NULL, 'move_in', 'Move-In Cleaning', 'Prepare your new home - inside appliances, closets, complete sanitization', 1.60, 1.80, false, 'home', 4),
(NULL, 'move_out', 'Move-Out Cleaning', 'Get your deposit back - thorough cleaning for property turnover', 1.75, 2.00, false, 'truck', 5),
(NULL, 'post_construction_rough', 'Post-Construction (Rough)', 'Heavy-duty cleaning during construction - debris removal, dust', 2.00, 2.50, false, 'hardHat', 6),
(NULL, 'post_construction_final', 'Post-Construction (Final)', 'Final detail cleaning after construction completion', 2.50, 3.00, false, 'checkCircle', 7),
(NULL, 'airbnb_turnover', 'Airbnb Turnover', 'Quick turnover cleaning between guests - linens, restock, sanitize', 1.20, 1.00, false, 'calendar', 8),
(NULL, 'spring_clean', 'Spring Cleaning', 'Seasonal deep cleaning - windows, baseboards, organizing', 1.40, 1.50, false, 'sun', 9),
(NULL, 'one_time', 'One-Time Cleaning', 'Single visit cleaning service', 1.25, 1.25, false, 'clock', 10)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. ENHANCED ADD-ON SERVICES TABLE
-- ============================================================================
-- Note: This extends the existing cleaning_addons table or creates if not exists
ALTER TABLE cleaning_addons ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'specialty';
ALTER TABLE cleaning_addons ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 15;
ALTER TABLE cleaning_addons ADD COLUMN IF NOT EXISTS available_service_types TEXT[] DEFAULT ARRAY['standard', 'deep'];

-- Insert comprehensive default add-ons (global templates)
INSERT INTO cleaning_addons (business_id, category, name, slug, description, price_type, price, unit_name, additional_minutes, icon, display_order) VALUES
-- Kitchen Add-ons
(NULL, 'kitchen', 'Inside Oven Deep Clean', 'inside_oven', 'Degrease and scrub inside oven, racks, and door', 'flat', 35.00, NULL, 30, 'fire', 1),
(NULL, 'kitchen', 'Inside Refrigerator', 'inside_fridge', 'Clean shelves, drawers, and sanitize interior', 'flat', 30.00, NULL, 25, 'refrigerator', 2),
(NULL, 'kitchen', 'Inside Dishwasher', 'inside_dishwasher', 'Clean interior, filter, and door edges', 'flat', 20.00, NULL, 15, 'droplet', 3),
(NULL, 'kitchen', 'Inside Microwave', 'inside_microwave', 'Steam clean and degrease interior', 'flat', 15.00, NULL, 10, 'zap', 4),
(NULL, 'kitchen', 'Inside Cabinets', 'inside_cabinets', 'Wipe down cabinet interiors', 'per_unit', 10.00, 'cabinet', 10, 'archive', 5),
(NULL, 'kitchen', 'Pantry Organization', 'pantry_organization', 'Organize and clean pantry shelves', 'flat', 50.00, NULL, 45, 'grid', 6),

-- Windows & Blinds
(NULL, 'windows', 'Interior Windows', 'interior_windows', 'Clean interior window glass and frames', 'per_unit', 7.00, 'window', 8, 'window', 10),
(NULL, 'windows', 'Exterior Windows', 'exterior_windows', 'Clean exterior window glass (accessible only)', 'per_unit', 12.00, 'window', 12, 'window', 11),
(NULL, 'windows', 'Blind Cleaning', 'blind_cleaning', 'Dust and wipe each blind slat', 'per_unit', 15.00, 'blind', 15, 'blinds', 12),
(NULL, 'windows', 'Window Tracks', 'window_tracks', 'Deep clean window tracks and sills', 'per_unit', 3.00, 'track', 5, 'minus', 13),

-- Detail/Specialty Cleaning
(NULL, 'specialty', 'Baseboards (Detailed)', 'baseboards', 'Hand wipe all baseboards', 'per_unit', 25.00, 'room', 15, 'minus', 20),
(NULL, 'specialty', 'Ceiling Fans', 'ceiling_fans', 'Dust and wipe ceiling fan blades', 'per_unit', 15.00, 'fan', 10, 'fan', 21),
(NULL, 'specialty', 'Light Fixtures', 'light_fixtures', 'Clean and dust light fixtures', 'per_unit', 20.00, 'fixture', 15, 'lightbulb', 22),
(NULL, 'specialty', 'Chandelier Cleaning', 'chandelier', 'Detailed cleaning of chandelier crystals', 'per_unit', 75.00, 'chandelier', 45, 'sparkles', 23),
(NULL, 'specialty', 'Wall Washing', 'wall_washing', 'Wash walls and remove marks', 'per_unit', 75.00, 'room', 45, 'square', 24),
(NULL, 'specialty', 'Door & Frame Cleaning', 'doors_frames', 'Clean all doors and door frames', 'flat', 35.00, NULL, 25, 'door', 25),
(NULL, 'specialty', 'Switch & Outlet Plates', 'switch_plates', 'Clean and sanitize all switch/outlet plates', 'flat', 20.00, NULL, 20, 'plug', 26),

-- Laundry & Linens
(NULL, 'laundry', 'Laundry (Wash/Dry/Fold)', 'laundry', 'Complete laundry service per load', 'per_unit', 20.00, 'load', 90, 'shirt', 30),
(NULL, 'laundry', 'Bed Making', 'bed_making', 'Make beds with existing linens', 'per_unit', 10.00, 'bed', 10, 'bedDouble', 31),
(NULL, 'laundry', 'Change Linens', 'change_linens', 'Strip and remake beds with fresh linens', 'per_unit', 20.00, 'bed', 15, 'bedDouble', 32),
(NULL, 'laundry', 'Ironing', 'ironing', 'Iron clothes and linens', 'per_unit', 25.00, 'hour', 60, 'iron', 33),

-- Floors
(NULL, 'floors', 'Carpet Spot Cleaning', 'carpet_spot', 'Treat and clean carpet stains', 'per_unit', 25.00, 'spot', 15, 'circle', 40),
(NULL, 'floors', 'Hardwood Polish', 'hardwood_polish', 'Polish and buff hardwood floors', 'per_sqft', 0.15, 'sqft', 30, 'square', 41),
(NULL, 'floors', 'Tile & Grout Cleaning', 'tile_grout', 'Deep clean tile and scrub grout lines', 'per_sqft', 0.50, 'sqft', 45, 'grid', 42),
(NULL, 'floors', 'Vacuum Only', 'vacuum_only', 'Vacuum all carpeted areas', 'flat', 25.00, NULL, 20, 'wind', 43),

-- Outdoor
(NULL, 'outdoor', 'Patio/Deck Cleaning', 'patio_deck', 'Sweep, clean, and organize patio or deck', 'flat', 75.00, NULL, 45, 'tree', 50),
(NULL, 'outdoor', 'Balcony Cleaning', 'balcony', 'Clean and organize balcony space', 'flat', 40.00, NULL, 25, 'sun', 51),
(NULL, 'outdoor', 'Garage Cleaning', 'garage', 'Sweep, organize, and clean garage floor', 'flat', 150.00, NULL, 90, 'warehouse', 52),
(NULL, 'outdoor', 'Outdoor Furniture', 'outdoor_furniture', 'Wipe down outdoor furniture', 'flat', 35.00, NULL, 25, 'chair', 53),

-- Pet Related
(NULL, 'specialty', 'Pet Area Deep Clean', 'pet_area', 'Deep clean pet feeding/sleeping areas', 'flat', 40.00, NULL, 30, 'dog', 60),
(NULL, 'specialty', 'Pet Hair Removal', 'pet_hair', 'Extra attention to pet hair on furniture', 'flat', 30.00, NULL, 25, 'scissors', 61),

-- Organization
(NULL, 'specialty', 'Organizing (per hour)', 'organizing', 'Professional organizing service', 'per_unit', 65.00, 'hour', 60, 'boxes', 70),
(NULL, 'specialty', 'Closet Organization', 'closet_organization', 'Organize and arrange closet', 'per_unit', 50.00, 'closet', 45, 'boxes', 71),

-- Misc
(NULL, 'specialty', 'Dish Washing', 'dishes', 'Hand wash dishes or load/unload dishwasher', 'flat', 15.00, NULL, 20, 'utensils', 80),
(NULL, 'specialty', 'Trash Removal', 'trash_removal', 'Empty all trash and replace liners', 'flat', 10.00, NULL, 10, 'trash', 81),
(NULL, 'specialty', 'Eco-Friendly Products', 'eco_upgrade', 'Use eco-friendly cleaning products', 'percentage', 0, NULL, 0, 'leaf', 82),
(NULL, 'specialty', 'Same-Day Rush', 'rush_fee', 'Priority scheduling for same-day service', 'percentage', 25, NULL, 0, 'zap', 90)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. FREQUENCY DISCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_frequency_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  frequency TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Discount as percentage (0.15 = 15% off)
  discount_percent DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  
  -- Or fixed discount amount
  discount_amount DECIMAL(10,2),
  
  -- Is baseline (no discount applied, typically 'one_time')
  is_baseline BOOLEAN DEFAULT false,
  
  -- Badge for display
  badge_text TEXT,
  
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, frequency)
);

-- Default frequency discounts (global templates)
INSERT INTO cleaning_frequency_discounts (business_id, frequency, display_name, description, discount_percent, is_baseline, badge_text, sort_order) VALUES
(NULL, 'one_time', 'One-Time', 'Single cleaning service', 0.00, true, NULL, 0),
(NULL, 'weekly', 'Weekly', 'Every week - best value', 0.20, false, 'Best Value', 1),
(NULL, 'biweekly', 'Every 2 Weeks', 'Every other week', 0.15, false, 'Most Popular', 2),
(NULL, 'monthly', 'Monthly', 'Once a month', 0.10, false, NULL, 3),
(NULL, 'quarterly', 'Quarterly', 'Every 3 months', 0.05, false, NULL, 4)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. CONDITION SURCHARGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_condition_surcharges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  surcharge_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Conditions (JSONB for flexibility)
  conditions JSONB DEFAULT '{}',
  
  -- Surcharge calculation type
  surcharge_calc_type TEXT NOT NULL DEFAULT 'percent'
    CHECK (surcharge_calc_type IN ('percent', 'flat', 'per_unit')),
  
  surcharge_value DECIMAL(10,2) NOT NULL,
  unit_label TEXT, -- 'pet', 'flight', etc.
  
  -- Max surcharge cap (optional)
  max_surcharge DECIMAL(10,2),
  
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default condition surcharges (global templates)
INSERT INTO cleaning_condition_surcharges (business_id, surcharge_type, name, description, conditions, surcharge_calc_type, surcharge_value, unit_label) VALUES
-- Pet surcharges
(NULL, 'pets', '1-2 Pets', 'Homes with 1-2 pets', '{"min_pets": 1, "max_pets": 2}', 'flat', 20.00, NULL),
(NULL, 'pets', '3+ Pets', 'Homes with 3 or more pets', '{"min_pets": 3}', 'flat', 40.00, NULL),
(NULL, 'pets', 'Heavy Shedding Pet', 'Extra cleaning for heavy shedders', '{"shedding": "heavy"}', 'percent', 10.00, NULL),

-- Last cleaned surcharges
(NULL, 'last_cleaned', 'Not Cleaned 1-3 Months', 'Home not professionally cleaned recently', '{"min_days": 30, "max_days": 90}', 'percent', 15.00, NULL),
(NULL, 'last_cleaned', 'Not Cleaned 3-6 Months', 'Home not cleaned in several months', '{"min_days": 90, "max_days": 180}', 'percent', 30.00, NULL),
(NULL, 'last_cleaned', 'Not Cleaned 6+ Months', 'Home not cleaned in over 6 months', '{"min_days": 180}', 'percent', 50.00, NULL),

-- Clutter surcharges
(NULL, 'clutter', 'Moderate Clutter', 'Additional time needed for cluttered spaces', '{"level": "moderate"}', 'flat', 35.00, NULL),
(NULL, 'clutter', 'Heavy Clutter', 'Significant clutter requiring extra work', '{"level": "heavy"}', 'percent', 25.00, NULL),

-- Structural surcharges
(NULL, 'stairs', 'Stairs per Flight', 'Additional charge per flight of stairs', '{"per_flight": true}', 'per_unit', 10.00, 'flight'),
(NULL, 'high_ceilings', 'High Ceilings', 'Ceilings above 10 feet', '{"height_ft": 10}', 'percent', 10.00, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. GEOGRAPHIC PRICING ZONES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_pricing_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  zone_name TEXT NOT NULL,
  zone_type TEXT NOT NULL DEFAULT 'zip'
    CHECK (zone_type IN ('zip', 'city', 'county', 'radius', 'custom')),
  
  -- Zone definition
  zip_codes TEXT[], -- For zip-based zones
  city_names TEXT[], -- For city-based zones
  radius_miles DECIMAL(6,2), -- For radius-based zones
  center_lat DECIMAL(10,8),
  center_lng DECIMAL(11,8),
  polygon_coords JSONB, -- For custom polygon zones
  
  -- Pricing adjustment
  adjustment_type TEXT NOT NULL DEFAULT 'percent'
    CHECK (adjustment_type IN ('percent', 'flat', 'multiplier')),
  
  adjustment_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  
  -- Travel fee
  travel_fee DECIMAL(10,2) DEFAULT 0.00,
  travel_fee_waive_above DECIMAL(10,2), -- Waive travel fee if order above this amount
  
  -- Minimum order for this zone
  minimum_order DECIMAL(10,2),
  
  -- Is service available in this zone?
  is_active BOOLEAN DEFAULT true,
  
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. TIME-BASED PRICING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_time_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  pricing_type TEXT NOT NULL
    CHECK (pricing_type IN ('rush', 'same_day', 'next_day', 'after_hours', 'weekend', 'holiday', 'early_bird')),
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Conditions
  conditions JSONB DEFAULT '{}',
  
  -- Premium/discount
  adjustment_type TEXT NOT NULL DEFAULT 'percent'
    CHECK (adjustment_type IN ('percent', 'flat')),
  adjustment_value DECIMAL(10,2) NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, pricing_type, name)
);

-- Default time-based pricing (global templates)
INSERT INTO cleaning_time_pricing (business_id, pricing_type, name, conditions, adjustment_type, adjustment_value, sort_order) VALUES
(NULL, 'same_day', 'Same-Day Service', '{"hours_notice": 4}', 'percent', 25.00, 1),
(NULL, 'next_day', 'Next-Day Service', '{"hours_notice": 24}', 'percent', 15.00, 2),
(NULL, 'rush', 'Rush Booking (48h)', '{"hours_notice": 48}', 'percent', 10.00, 3),
(NULL, 'after_hours', 'Evening Service', '{"start_time": "18:00", "end_time": "21:00"}', 'percent', 20.00, 4),
(NULL, 'weekend', 'Saturday Service', '{"days": ["saturday"]}', 'percent', 10.00, 5),
(NULL, 'weekend', 'Sunday Service', '{"days": ["sunday"]}', 'percent', 15.00, 6),
(NULL, 'holiday', 'Holiday Service', '{"is_holiday": true}', 'percent', 50.00, 7),
(NULL, 'early_bird', 'Early Bird Discount', '{"start_time": "07:00", "end_time": "09:00", "weekdays_only": true}', 'percent', -5.00, 8)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_cleaning_pricing_config_business ON cleaning_pricing_config(business_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_sqft_tiers_business ON cleaning_sqft_tiers(business_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_service_multipliers_business ON cleaning_service_multipliers(business_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_frequency_discounts_business ON cleaning_frequency_discounts(business_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_condition_surcharges_business ON cleaning_condition_surcharges(business_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_pricing_zones_business ON cleaning_pricing_zones(business_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_time_pricing_business ON cleaning_time_pricing(business_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE cleaning_pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_sqft_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_service_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_frequency_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_condition_surcharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_pricing_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_time_pricing ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (business owners)
CREATE POLICY "Users can manage own pricing config"
  ON cleaning_pricing_config FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own sqft tiers"
  ON cleaning_sqft_tiers FOR ALL
  USING (business_id IS NULL OR business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own service multipliers"
  ON cleaning_service_multipliers FOR ALL
  USING (business_id IS NULL OR business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own frequency discounts"
  ON cleaning_frequency_discounts FOR ALL
  USING (business_id IS NULL OR business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own condition surcharges"
  ON cleaning_condition_surcharges FOR ALL
  USING (business_id IS NULL OR business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own pricing zones"
  ON cleaning_pricing_zones FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own time pricing"
  ON cleaning_time_pricing FOR ALL
  USING (business_id IS NULL OR business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Public read policies (for booking widget)
CREATE POLICY "Public can view global sqft tiers"
  ON cleaning_sqft_tiers FOR SELECT
  USING (business_id IS NULL OR is_active = true);

CREATE POLICY "Public can view global service multipliers"
  ON cleaning_service_multipliers FOR SELECT
  USING (business_id IS NULL OR is_active = true);

CREATE POLICY "Public can view global frequency discounts"
  ON cleaning_frequency_discounts FOR SELECT
  USING (business_id IS NULL OR is_active = true);

CREATE POLICY "Public can view active condition surcharges"
  ON cleaning_condition_surcharges FOR SELECT
  USING (business_id IS NULL OR is_active = true);

CREATE POLICY "Public can view active pricing zones"
  ON cleaning_pricing_zones FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active time pricing"
  ON cleaning_time_pricing FOR SELECT
  USING (business_id IS NULL OR is_active = true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to initialize pricing config for new business
CREATE OR REPLACE FUNCTION initialize_business_pricing_config()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default pricing config for new business
  INSERT INTO cleaning_pricing_config (business_id)
  VALUES (NEW.id)
  ON CONFLICT (business_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create pricing config when business is created
DROP TRIGGER IF EXISTS create_business_pricing_config ON businesses;
CREATE TRIGGER create_business_pricing_config
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION initialize_business_pricing_config();

-- Function to copy global templates to business
CREATE OR REPLACE FUNCTION copy_pricing_templates_to_business(p_business_id UUID)
RETURNS void AS $$
BEGIN
  -- Copy service multipliers
  INSERT INTO cleaning_service_multipliers (business_id, service_type, display_name, description, multiplier, time_multiplier, required_for_first_time, icon, sort_order)
  SELECT p_business_id, service_type, display_name, description, multiplier, time_multiplier, required_for_first_time, icon, sort_order
  FROM cleaning_service_multipliers
  WHERE business_id IS NULL
  ON CONFLICT (business_id, service_type) DO NOTHING;
  
  -- Copy frequency discounts
  INSERT INTO cleaning_frequency_discounts (business_id, frequency, display_name, description, discount_percent, is_baseline, badge_text, sort_order)
  SELECT p_business_id, frequency, display_name, description, discount_percent, is_baseline, badge_text, sort_order
  FROM cleaning_frequency_discounts
  WHERE business_id IS NULL
  ON CONFLICT (business_id, frequency) DO NOTHING;
  
  -- Copy sqft tiers
  INSERT INTO cleaning_sqft_tiers (business_id, min_sqft, max_sqft, price_per_sqft, service_type, sort_order)
  SELECT p_business_id, min_sqft, max_sqft, price_per_sqft, service_type, sort_order
  FROM cleaning_sqft_tiers
  WHERE business_id IS NULL;
END;
$$ LANGUAGE plpgsql;
