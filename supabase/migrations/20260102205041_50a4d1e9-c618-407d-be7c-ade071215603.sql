-- ============================================
-- SEASONAL CAMPAIGNS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS seasonal_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  
  -- Campaign info
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL, -- seasonal, holiday, weather, slow_season, custom
  
  -- Targeting
  target_audience TEXT DEFAULT 'all', -- all, past_customers, dormant, recurring, one_time, at_risk
  target_customer_types TEXT[] DEFAULT '{}',
  min_days_since_service INTEGER,
  max_days_since_service INTEGER,
  exclude_recent_days INTEGER DEFAULT 7,
  
  -- Schedule
  start_date DATE,
  end_date DATE,
  send_time TIME DEFAULT '10:00:00',
  timezone TEXT DEFAULT 'America/New_York',
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  
  -- Message
  channel TEXT DEFAULT 'sms',
  sms_message TEXT,
  email_subject TEXT,
  email_body TEXT,
  
  -- Promotion
  has_promotion BOOLEAN DEFAULT false,
  promotion_type TEXT,
  promotion_value INTEGER,
  promotion_code TEXT,
  promotion_expires_days INTEGER,
  promotion_max_uses INTEGER,
  promotion_uses INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft',
  
  -- Stats
  total_targeted INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  
  -- Metadata
  template_id UUID,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_campaigns_business ON seasonal_campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON seasonal_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON seasonal_campaigns(start_date, end_date);

ALTER TABLE seasonal_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaigns"
  ON seasonal_campaigns FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- CAMPAIGN RECIPIENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  campaign_id UUID REFERENCES seasonal_campaigns(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  external_id TEXT,
  error_message TEXT,
  responded_at TIMESTAMPTZ,
  response_text TEXT,
  booked_at TIMESTAMPTZ,
  quote_id UUID REFERENCES quotes(id),
  revenue INTEGER,
  promo_code_used BOOLEAN DEFAULT false,
  promo_used_at TIMESTAMPTZ,
  
  UNIQUE(campaign_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_recipients_customer ON campaign_recipients(customer_id);

ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaign recipients"
  ON campaign_recipients FOR SELECT
  USING (campaign_id IN (
    SELECT id FROM seasonal_campaigns WHERE business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  ));

-- ============================================
-- CAMPAIGN TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  industry_slug TEXT,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL,
  season TEXT,
  month INTEGER,
  holiday TEXT,
  default_audience TEXT DEFAULT 'past_customers',
  default_min_days INTEGER,
  default_max_days INTEGER,
  sms_template TEXT NOT NULL,
  email_subject_template TEXT,
  email_body_template TEXT,
  suggested_promotion_type TEXT,
  suggested_promotion_value INTEGER,
  tags TEXT[] DEFAULT '{}',
  effectiveness_score INTEGER,
  times_used INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_campaign_templates_industry ON campaign_templates(industry_slug);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_type ON campaign_templates(campaign_type);

-- ============================================
-- PROMOTION CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS promotion_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES seasonal_campaigns(id) ON DELETE SET NULL,
  
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL,
  discount_value INTEGER NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  uses INTEGER DEFAULT 0,
  min_order_amount INTEGER,
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(business_id, code)
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_business ON promotion_codes(business_id);

ALTER TABLE promotion_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own promo codes"
  ON promotion_codes FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- UPDATE CUSTOMERS FOR CAMPAIGNS
-- ============================================

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS marketing_opted_out BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_opt_out_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_campaign_at TIMESTAMPTZ;

-- ============================================
-- SEED CAMPAIGN TEMPLATES
-- ============================================

INSERT INTO campaign_templates (industry_slug, name, description, campaign_type, holiday, sms_template, suggested_promotion_type, suggested_promotion_value, tags) VALUES
(NULL, 'New Year Fresh Start', 'January promotion for fresh start', 'holiday', 'new_year',
'Happy New Year, {{customer_first_name}}! 🎉 Start the year fresh with {{business_name}}. Book in January and save {{promotion_value}}% on your first service! Reply to schedule. - {{owner_first_name}}',
'percentage', 15, ARRAY['january', 'new_year']),

(NULL, 'Mother''s Day Gift', 'Gift of service for mom', 'holiday', 'mothers_day',
'{{customer_first_name}}, give Mom the gift of a clean home this Mother''s Day! 🌸 {{business_name}} gift certificates available. Reply for details.',
NULL, NULL, ARRAY['may', 'mothers_day']),

(NULL, 'Memorial Day Weekend', 'Memorial Day prep campaign', 'holiday', 'memorial_day',
'{{customer_first_name}}, Memorial Day weekend is coming! 🇺🇸 Get your home/yard ready for BBQs. {{business_name}} has openings this week - book now!',
'percentage', 10, ARRAY['may', 'memorial_day']),

(NULL, 'July 4th Ready', 'Independence Day prep', 'holiday', 'july_4th',
'{{customer_first_name}}, hosting for the 4th? 🎆 Let {{business_name}} help you get ready! Book before July 1st and enjoy {{promotion_value}}% off.',
'percentage', 15, ARRAY['july', 'independence_day']),

(NULL, 'Labor Day Special', 'End of summer campaign', 'holiday', 'labor_day',
'{{customer_first_name}}, Labor Day marks the end of summer! ☀️ Get one more project done before fall. {{business_name}} is offering {{promotion_value}}% off!',
'percentage', 15, ARRAY['september', 'labor_day']),

(NULL, 'Thanksgiving Prep', 'Pre-holiday prep', 'holiday', 'thanksgiving',
'{{customer_first_name}}, Thanksgiving is almost here! 🦃 Let {{business_name}} help you prep for guests. We''re booking up fast!',
NULL, NULL, ARRAY['november', 'thanksgiving']),

(NULL, 'Holiday Season Special', 'December holiday prep', 'holiday', 'christmas',
'{{customer_first_name}}, the holidays are here! 🎄 {{business_name}} can help your home shine for family gatherings. Book now!',
'percentage', 10, ARRAY['december', 'christmas']),

(NULL, 'Black Friday Deal', 'Black Friday promotion', 'holiday', 'black_friday',
'{{customer_first_name}}, BLACK FRIDAY DEAL! 🛍️ {{business_name}} is offering our biggest discount: {{promotion_value}}% off any service booked by Sunday!',
'percentage', 25, ARRAY['november', 'black_friday'])
ON CONFLICT DO NOTHING;

-- Industry-specific templates
INSERT INTO campaign_templates (industry_slug, name, description, campaign_type, season, month, sms_template, default_audience, default_min_days, suggested_promotion_type, suggested_promotion_value, tags) VALUES

-- Cleaning
('residential_cleaning', 'Spring Cleaning Season', 'Annual spring cleaning push', 'seasonal', 'spring', 3,
'{{customer_first_name}}, it''s SPRING CLEANING season! 🌷 Time to refresh your home. {{business_name}} has openings for deep cleans. Book now and save {{promotion_value}}%!',
'past_customers', 30, 'percentage', 15, ARRAY['spring', 'deep_clean']),

('residential_cleaning', 'Winter Slow Season', 'Slow season recurring offer', 'slow_season', 'winter', 1,
'{{customer_first_name}}, stuck inside this winter? 🥶 Let {{business_name}} keep your home cozy and clean! Sign up for recurring service and get your first clean {{promotion_value}}% off.',
'dormant', 60, 'percentage', 20, ARRAY['winter', 'slow_season']),

-- Lawn Care
('lawn_care', 'Spring Startup', 'Spring lawn care kickoff', 'seasonal', 'spring', 3,
'{{customer_first_name}}, spring is HERE! 🌱 Time to wake up your lawn. {{business_name}} is booking spring cleanups and first mows. Get on our schedule early!',
'past_customers', 90, NULL, NULL, ARRAY['spring', 'startup']),

('lawn_care', 'Fall Cleanup Booking', 'Fall leaf removal campaign', 'seasonal', 'fall', 9,
'{{customer_first_name}}, fall is coming! 🍂 Don''t let leaves bury your lawn. {{business_name}} is now booking fall cleanups. Secure your spot today!',
'past_customers', 30, NULL, NULL, ARRAY['fall', 'leaves']),

-- HVAC
('hvac', 'Spring AC Tune-Up', 'Pre-summer AC maintenance', 'seasonal', 'spring', 4,
'{{customer_first_name}}, summer is coming! ☀️ Is your AC ready? {{business_name}} recommends a tune-up before the heat hits. Book your maintenance now!',
'past_customers', 330, 'fixed', 25, ARRAY['spring', 'ac', 'tune_up']),

('hvac', 'Fall Heating Check', 'Pre-winter heating prep', 'seasonal', 'fall', 9,
'{{customer_first_name}}, fall is here - winter is next! 🍂 Time to make sure your heating system is ready. {{business_name}} is booking furnace tune-ups now.',
'past_customers', 330, 'fixed', 25, ARRAY['fall', 'heating', 'furnace']),

-- Pest Control
('pest_control', 'Spring Bug Season', 'Spring pest emergence', 'seasonal', 'spring', 3,
'{{customer_first_name}}, spring means BUGS are waking up! 🐜 Get ahead of ants, spiders, and other pests. {{business_name}} is booking preventive treatments now!',
'past_customers', 60, NULL, NULL, ARRAY['spring', 'ants', 'spiders']),

('pest_control', 'Fall Rodent Prevention', 'Pre-winter rodent campaign', 'seasonal', 'fall', 10,
'{{customer_first_name}}, as it gets cold, mice look for warm homes - like YOURS! 🐭 {{business_name}} can seal entry points and prevent rodent problems this winter.',
'past_customers', 90, NULL, NULL, ARRAY['fall', 'rodent', 'mice']),

-- Pool Service
('pool_service', 'Pool Opening Season', 'Spring pool opening push', 'seasonal', 'spring', 3,
'{{customer_first_name}}, pool season is almost here! 🏊☀️ {{business_name}} is booking pool openings now. Get your pool swim-ready before the rush!',
'past_customers', 150, NULL, NULL, ARRAY['spring', 'opening']),

('pool_service', 'Pool Closing Time', 'Fall winterization campaign', 'seasonal', 'fall', 10,
'{{customer_first_name}}, time to close the pool for winter! ❄️ Proper winterization prevents costly spring repairs. {{business_name}} is booking now!',
'past_customers', 30, NULL, NULL, ARRAY['fall', 'closing']),

-- Pressure Washing
('pressure_washing', 'Spring Curb Appeal', 'Post-winter cleanup', 'seasonal', 'spring', 3,
'{{customer_first_name}}, winter did a number on driveways and siding! 💦 {{business_name}} can make your property look NEW again. Reply for a free estimate!',
'past_customers', 300, 'percentage', 10, ARRAY['spring', 'curb_appeal']),

('pressure_washing', 'Winter Slow Season Deal', 'Off-season discount', 'slow_season', 'winter', 1,
'{{customer_first_name}}, winter is our slow season - YOUR opportunity! ❄️💦 Book pressure washing in Jan/Feb and save {{promotion_value}}%!',
'past_customers', 180, 'percentage', 25, ARRAY['winter', 'slow_season'])

ON CONFLICT DO NOTHING;