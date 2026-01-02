-- ============================================
-- RETENTION QUEUE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS retention_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  sequence_id UUID REFERENCES retention_sequences(id) ON DELETE CASCADE,
  
  step_index INTEGER NOT NULL DEFAULT 0,
  
  channel TEXT NOT NULL DEFAULT 'sms',
  to_phone TEXT,
  to_email TEXT,
  from_phone TEXT,
  content TEXT NOT NULL,
  subject TEXT,
  
  scheduled_for TIMESTAMPTZ NOT NULL,
  
  status TEXT DEFAULT 'pending',
  
  attempts INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  external_id TEXT,
  error_message TEXT,
  
  trigger_type TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_retention_queue_pending ON retention_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_retention_queue_customer ON retention_queue(customer_id);
CREATE INDEX IF NOT EXISTS idx_retention_queue_business ON retention_queue(business_id);

ALTER TABLE retention_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own retention queue"
  ON retention_queue FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- REVIEW REQUESTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  
  platform TEXT NOT NULL,
  review_link TEXT NOT NULL,
  
  sent_at TIMESTAMPTZ,
  sent_via TEXT,
  
  clicked_at TIMESTAMPTZ,
  click_count INTEGER DEFAULT 0,
  
  review_received BOOLEAN DEFAULT false,
  review_rating INTEGER,
  review_received_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_review_requests_business ON review_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_customer ON review_requests(customer_id);

ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own review requests"
  ON review_requests FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- BUSINESS REVIEW SETTINGS
-- ============================================

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS google_review_link TEXT,
ADD COLUMN IF NOT EXISTS yelp_review_link TEXT,
ADD COLUMN IF NOT EXISTS facebook_review_link TEXT,
ADD COLUMN IF NOT EXISTS default_review_platform TEXT DEFAULT 'google',
ADD COLUMN IF NOT EXISTS auto_request_reviews BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS review_request_delay_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS review_request_message TEXT DEFAULT 'Hi {{customer_first_name}}, thank you for choosing {{business_name}}! If you were happy with our service, we''d really appreciate a quick review: {{review_link}} - {{owner_first_name}}';

-- ============================================
-- ADD STATS COLUMNS TO RETENTION_SEQUENCES
-- ============================================

ALTER TABLE retention_sequences
ADD COLUMN IF NOT EXISTS trigger_delay_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trigger_delay_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS times_triggered INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_responses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;

-- ============================================
-- REENGAGEMENT CAMPAIGNS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS reengagement_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  
  days_inactive INTEGER NOT NULL DEFAULT 30,
  customer_types TEXT[] DEFAULT '{}',
  min_lifetime_value INTEGER,
  max_health_score INTEGER DEFAULT 50,
  
  channel TEXT DEFAULT 'sms',
  message TEXT NOT NULL,
  subject TEXT,
  
  offer_type TEXT,
  offer_value INTEGER,
  offer_code TEXT,
  offer_expires_days INTEGER,
  
  status TEXT DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  total_targeted INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  total_rebooked INTEGER DEFAULT 0
);

ALTER TABLE reengagement_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaigns"
  ON reengagement_campaigns FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));