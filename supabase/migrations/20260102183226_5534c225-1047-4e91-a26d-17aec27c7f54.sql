-- ============================================
-- WEBHOOK CONFIGURATION
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  webhook_key TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  webhook_secret TEXT DEFAULT encode(gen_random_bytes(32), 'hex'),
  require_signature BOOLEAN DEFAULT false,
  
  requests_today INTEGER DEFAULT 0,
  requests_reset_at DATE DEFAULT CURRENT_DATE,
  daily_limit INTEGER DEFAULT 1000,
  
  is_active BOOLEAN DEFAULT true,
  last_event_at TIMESTAMPTZ,
  
  total_events_received INTEGER DEFAULT 0,
  total_events_processed INTEGER DEFAULT 0,
  total_events_failed INTEGER DEFAULT 0
);

ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own webhook config"
  ON webhook_configs FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own webhook config"
  ON webhook_configs FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Auto-create webhook config when business is created
CREATE OR REPLACE FUNCTION create_webhook_config_for_business()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO webhook_configs (business_id)
  VALUES (NEW.id)
  ON CONFLICT (business_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_webhook_config ON businesses;
CREATE TRIGGER trigger_create_webhook_config
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION create_webhook_config_for_business();

-- Create webhook configs for existing businesses
INSERT INTO webhook_configs (business_id)
SELECT id FROM businesses
ON CONFLICT (business_id) DO NOTHING;

-- ============================================
-- WEBHOOK EVENTS LOG
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  
  status TEXT DEFAULT 'received',
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  
  result_type TEXT,
  result_id UUID,
  
  source_ip TEXT,
  user_agent TEXT,
  
  idempotency_key TEXT,
  
  UNIQUE(business_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_business ON webhook_events(business_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own webhook events"
  ON webhook_events FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- CONNECTED INTEGRATIONS TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  
  platform TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  account_name TEXT,
  account_id TEXT,
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  
  settings JSONB DEFAULT '{}',
  
  UNIQUE(business_id, platform)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own integrations"
  ON integrations FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- RETENTION SEQUENCES
-- ============================================

CREATE TABLE IF NOT EXISTS retention_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  
  trigger_type TEXT NOT NULL,
  trigger_days INTEGER DEFAULT 0,
  
  conditions JSONB DEFAULT '{}',
  steps JSONB NOT NULL DEFAULT '[]',
  
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_retention_sequences_business ON retention_sequences(business_id);
CREATE INDEX IF NOT EXISTS idx_retention_sequences_trigger ON retention_sequences(trigger_type);

ALTER TABLE retention_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own retention sequences"
  ON retention_sequences FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- RETENTION MESSAGES SENT
-- ============================================

CREATE TABLE IF NOT EXISTS retention_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  sequence_id UUID REFERENCES retention_sequences(id) ON DELETE SET NULL,
  
  trigger_type TEXT NOT NULL,
  step_index INTEGER DEFAULT 0,
  channel TEXT DEFAULT 'sms',
  content TEXT NOT NULL,
  
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  external_id TEXT,
  error_message TEXT,
  
  response_received BOOLEAN DEFAULT false,
  response_at TIMESTAMPTZ,
  booked_new_job BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_retention_messages_business ON retention_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_retention_messages_customer ON retention_messages(customer_id);

ALTER TABLE retention_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own retention messages"
  ON retention_messages FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));