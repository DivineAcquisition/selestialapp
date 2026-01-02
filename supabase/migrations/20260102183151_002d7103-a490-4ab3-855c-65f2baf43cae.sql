-- Drop existing customers table and recreate with correct schema
DROP TABLE IF EXISTS customers CASCADE;

-- ============================================
-- CUSTOMERS TABLE (Foundation for retention)
-- ============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  
  customer_type TEXT DEFAULT 'one_time',
  tags TEXT[] DEFAULT '{}',
  
  first_service_at TIMESTAMPTZ,
  last_service_at TIMESTAMPTZ,
  next_service_at TIMESTAMPTZ,
  total_jobs INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  average_job_value INTEGER DEFAULT 0,
  
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  recurring_service_type TEXT,
  recurring_amount INTEGER,
  
  health_score INTEGER DEFAULT 100,
  last_contact_at TIMESTAMPTZ,
  last_response_at TIMESTAMPTZ,
  
  referred_by_customer_id UUID REFERENCES customers(id),
  referral_count INTEGER DEFAULT 0,
  
  external_id TEXT,
  external_source TEXT,
  
  notes TEXT,
  
  UNIQUE(business_id, phone)
);

CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_external ON customers(external_source, external_id);
CREATE INDEX idx_customers_health ON customers(health_score);
CREATE INDEX idx_customers_last_service ON customers(last_service_at);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- LINK QUOTES TO CUSTOMERS
-- ============================================

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS job_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS job_scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS job_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS external_job_id TEXT;

CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_job_status ON quotes(job_status);