-- Drop existing payments table that has wrong structure
DROP TABLE IF EXISTS payments CASCADE;

-- ============================================
-- CONNECTED STRIPE ACCOUNTS
-- ============================================

CREATE TABLE stripe_connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  stripe_account_id TEXT NOT NULL UNIQUE,
  
  status TEXT DEFAULT 'pending',
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  details_submitted BOOLEAN DEFAULT false,
  
  business_type TEXT,
  country TEXT,
  default_currency TEXT DEFAULT 'usd',
  
  card_payments_enabled BOOLEAN DEFAULT false,
  transfers_enabled BOOLEAN DEFAULT false,
  
  requirements_due JSONB DEFAULT '[]',
  requirements_past_due JSONB DEFAULT '[]',
  
  onboarded_at TIMESTAMPTZ,
  last_webhook_at TIMESTAMPTZ
);

CREATE INDEX idx_stripe_accounts_business ON stripe_connected_accounts(business_id);
CREATE INDEX idx_stripe_accounts_stripe_id ON stripe_connected_accounts(stripe_account_id);

ALTER TABLE stripe_connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connected account"
  ON stripe_connected_accounts FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE TRIGGER update_stripe_connected_accounts_updated_at
  BEFORE UPDATE ON stripe_connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PAYMENTS (with correct structure)
-- ============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  stripe_account_id TEXT NOT NULL,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  platform_fee INTEGER DEFAULT 0,
  net_amount INTEGER NOT NULL,
  
  status TEXT DEFAULT 'pending',
  
  payment_method_type TEXT,
  card_brand TEXT,
  card_last4 TEXT,
  
  customer_email TEXT,
  customer_name TEXT,
  
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  
  failure_code TEXT,
  failure_message TEXT,
  
  description TEXT,
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_payments_business ON payments(business_id);
CREATE INDEX idx_payments_quote ON payments(quote_id);
CREATE INDEX idx_payments_status ON payments(status);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PAYMENT LINKS
-- ============================================

CREATE TABLE payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  
  stripe_payment_link_id TEXT,
  stripe_checkout_url TEXT NOT NULL,
  
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  description TEXT,
  
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ
);

CREATE INDEX idx_payment_links_business ON payment_links(business_id);
CREATE INDEX idx_payment_links_quote ON payment_links(quote_id);

ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own payment links"
  ON payment_links FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- UPDATE QUOTES TABLE
-- ============================================

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS payment_id UUID,
ADD COLUMN IF NOT EXISTS payment_link_url TEXT,
ADD COLUMN IF NOT EXISTS paid_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_amount INTEGER,
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false;

-- ============================================
-- UPDATE BUSINESSES TABLE
-- ============================================

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS stripe_connect_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT,
ADD COLUMN IF NOT EXISTS accept_online_payments BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_send_payment_link BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_due_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS deposit_percent INTEGER DEFAULT 0;