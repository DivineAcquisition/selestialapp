-- ============================================================================
-- USAGE TRACKING & BILLING SCHEMA
-- ============================================================================

-- SMS Usage Tracking
CREATE TABLE IF NOT EXISTS sms_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Message details
  message_id VARCHAR(100) UNIQUE,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  to_number VARCHAR(20) NOT NULL,
  from_number VARCHAR(20) NOT NULL,
  body TEXT,
  segments INTEGER DEFAULT 1,
  
  -- Costs
  twilio_cost DECIMAL(10, 6) DEFAULT 0,
  charged_amount DECIMAL(10, 4) DEFAULT 0,
  margin DECIMAL(10, 4) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'queued',
  error_code VARCHAR(20),
  error_message TEXT,
  
  -- Billing
  billed BOOLEAN DEFAULT FALSE,
  billed_at TIMESTAMP WITH TIME ZONE,
  invoice_id VARCHAR(100),
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sms_usage_business ON sms_usage(business_id);
CREATE INDEX IF NOT EXISTS idx_sms_usage_billed ON sms_usage(billed, business_id);
CREATE INDEX IF NOT EXISTS idx_sms_usage_sent ON sms_usage(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_usage_message ON sms_usage(message_id);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  payment_link_id UUID,
  
  -- Stripe details
  stripe_payment_intent_id VARCHAR(100) UNIQUE,
  stripe_charge_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  
  -- Customer info
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Amounts (all in cents)
  amount INTEGER NOT NULL,
  stripe_fee INTEGER DEFAULT 0,
  platform_fee INTEGER DEFAULT 0,
  net_amount INTEGER DEFAULT 0,
  
  -- Fee calculation
  platform_fee_percent DECIMAL(5, 4) DEFAULT 0.005,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'disputed')),
  
  -- Billing
  fee_collected BOOLEAN DEFAULT FALSE,
  fee_collected_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_tx_business ON payment_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_tx_stripe ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_created ON payment_transactions(created_at DESC);

-- Monthly Usage Summary
CREATE TABLE IF NOT EXISTS usage_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- SMS Usage
  sms_count INTEGER DEFAULT 0,
  sms_segments INTEGER DEFAULT 0,
  sms_cost DECIMAL(10, 2) DEFAULT 0,
  sms_charged DECIMAL(10, 2) DEFAULT 0,
  sms_margin DECIMAL(10, 2) DEFAULT 0,
  
  -- Payment Processing
  payments_count INTEGER DEFAULT 0,
  payments_volume DECIMAL(12, 2) DEFAULT 0,
  platform_fees DECIMAL(10, 2) DEFAULT 0,
  
  -- AI Usage
  ai_generations INTEGER DEFAULT 0,
  ai_cost DECIMAL(10, 2) DEFAULT 0,
  ai_charged DECIMAL(10, 2) DEFAULT 0,
  
  -- Totals
  total_usage_charges DECIMAL(10, 2) DEFAULT 0,
  
  -- Billing
  invoice_id VARCHAR(100),
  invoice_status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, period_start)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_usage_summary_business ON usage_summaries(business_id, period_start DESC);

-- Pricing Configuration
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- SMS Pricing
  sms_outbound_price DECIMAL(10, 6) DEFAULT 0.025,
  sms_inbound_price DECIMAL(10, 6) DEFAULT 0.01,
  sms_cost_outbound DECIMAL(10, 6) DEFAULT 0.0079,
  sms_cost_inbound DECIMAL(10, 6) DEFAULT 0.0075,
  
  -- MMS Pricing
  mms_outbound_price DECIMAL(10, 6) DEFAULT 0.05,
  mms_cost_outbound DECIMAL(10, 6) DEFAULT 0.02,
  
  -- Payment Processing
  platform_fee_percent DECIMAL(5, 4) DEFAULT 0.005,
  min_platform_fee INTEGER DEFAULT 0,
  max_platform_fee INTEGER DEFAULT 0,
  
  -- AI Credits
  ai_price_per_credit DECIMAL(10, 4) DEFAULT 0.10,
  ai_cost_per_credit DECIMAL(10, 4) DEFAULT 0.02,
  
  -- Plan Inclusions
  free_sms_per_month INTEGER DEFAULT 0,
  starter_sms_per_month INTEGER DEFAULT 100,
  pro_sms_per_month INTEGER DEFAULT 500,
  
  free_ai_per_month INTEGER DEFAULT 10,
  starter_ai_per_month INTEGER DEFAULT 50,
  pro_ai_per_month INTEGER DEFAULT 200,
  
  -- Active
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing if not exists
INSERT INTO pricing_config (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM pricing_config LIMIT 1);

-- RLS Policies
ALTER TABLE sms_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_summaries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own SMS usage" ON sms_usage;
DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can view own usage summaries" ON usage_summaries;

CREATE POLICY "Users can view own SMS usage"
  ON sms_usage FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can view own usage summaries"
  ON usage_summaries FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ));
