-- Add billing fields to businesses if not present
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quotes_limit INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS sequences_limit INTEGER DEFAULT 3;

-- Index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_businesses_stripe_customer ON businesses(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_businesses_stripe_subscription ON businesses(stripe_subscription_id);

-- Billing events table for audit
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  
  -- Stripe event info
  stripe_event_id TEXT,
  stripe_event_type TEXT
);

-- Indexes for billing events
CREATE INDEX IF NOT EXISTS idx_billing_events_business ON billing_events(business_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_event ON billing_events(stripe_event_id);

-- RLS for billing events
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own billing events"
  ON billing_events FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));