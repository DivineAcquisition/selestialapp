-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BUSINESSES TABLE
-- ============================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Link to auth.users
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Business info
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'other',
  website TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  
  -- Twilio config
  twilio_phone_number TEXT,
  twilio_phone_sid TEXT,
  
  -- Settings
  default_sequence_id UUID,
  auto_start_sequence BOOLEAN NOT NULL DEFAULT true,
  business_hours_enabled BOOLEAN NOT NULL DEFAULT true,
  business_hours_start TIME NOT NULL DEFAULT '08:00',
  business_hours_end TIME NOT NULL DEFAULT '18:00',
  business_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}',
  
  -- Notifications
  notify_email_won BOOLEAN NOT NULL DEFAULT true,
  notify_email_lost BOOLEAN NOT NULL DEFAULT false,
  notify_email_daily_digest BOOLEAN NOT NULL DEFAULT true,
  notify_sms_response BOOLEAN NOT NULL DEFAULT true,
  
  -- Subscription (Stripe)
  stripe_customer_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trialing',
  subscription_plan TEXT DEFAULT 'starter',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  current_period_end TIMESTAMPTZ,
  
  UNIQUE(user_id)
);

-- ============================================
-- SEQUENCES TABLE
-- ============================================
CREATE TABLE sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  -- Steps stored as JSONB
  steps JSONB NOT NULL DEFAULT '[]'
);

-- ============================================
-- QUOTES TABLE
-- ============================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  sequence_id UUID REFERENCES sequences(id) ON DELETE SET NULL,
  
  -- Customer info
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  -- Quote details
  service_type TEXT NOT NULL,
  quote_amount INTEGER NOT NULL,
  description TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'new',
  status_changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Sequence tracking
  sequence_started_at TIMESTAMPTZ,
  sequence_paused_at TIMESTAMPTZ,
  sequence_completed_at TIMESTAMPTZ,
  current_step_index INTEGER NOT NULL DEFAULT 0,
  next_message_at TIMESTAMPTZ,
  
  -- Outcome
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason TEXT,
  final_job_amount INTEGER
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  sequence_id UUID REFERENCES sequences(id) ON DELETE SET NULL,
  step_id TEXT,
  
  -- Message details
  channel TEXT NOT NULL,
  to_address TEXT NOT NULL,
  from_address TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- External tracking
  external_id TEXT
);

-- ============================================
-- ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_sequences_business_id ON sequences(business_id);
CREATE INDEX idx_quotes_business_id ON quotes(business_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_messages_quote_id ON messages(quote_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_scheduled_for ON messages(scheduled_for);
CREATE INDEX idx_activity_logs_business_id ON activity_logs(business_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sequences_updated_at
  BEFORE UPDATE ON sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Businesses: Users can only access their own business
CREATE POLICY "Users can view own business"
  ON businesses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business"
  ON businesses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business"
  ON businesses FOR DELETE
  USING (auth.uid() = user_id);

-- Sequences: Users can access sequences for their business
CREATE POLICY "Users can view own sequences"
  ON sequences FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own sequences"
  ON sequences FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own sequences"
  ON sequences FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own sequences"
  ON sequences FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Quotes: Users can access quotes for their business
CREATE POLICY "Users can view own quotes"
  ON quotes FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own quotes"
  ON quotes FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own quotes"
  ON quotes FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own quotes"
  ON quotes FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Messages: Users can access messages for their business
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Activity Logs: Users can view logs for their business
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create default sequence for new business
CREATE OR REPLACE FUNCTION create_default_sequence(p_business_id UUID)
RETURNS UUID AS $$
DECLARE
  v_sequence_id UUID;
BEGIN
  INSERT INTO sequences (business_id, name, description, is_active, is_default, steps)
  VALUES (
    p_business_id,
    'Standard Follow-Up',
    '5-touch sequence over 14 days',
    true,
    true,
    '[
      {"id": "s1", "order": 0, "delay_days": 0, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, this is {{owner_name}} from {{business_name}}. Thanks for letting us quote your {{service_type}} project! Let me know if you have any questions.", "is_active": true},
      {"id": "s2", "order": 1, "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "Hey {{customer_first_name}}, just checking in on that quote for {{quote_amount}}. Ready to get started? We can usually schedule within a few days!", "is_active": true},
      {"id": "s3", "order": 2, "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, wanted to follow up on your {{service_type}} quote. Any questions I can help with?", "is_active": true},
      {"id": "s4", "order": 3, "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, still thinking it over? No pressure - just want to make sure you have everything you need. Reply anytime!", "is_active": true},
      {"id": "s5", "order": 4, "delay_days": 14, "delay_hours": 0, "channel": "sms", "message": "Last check-in on your {{service_type}} quote! If now isnt the right time, totally understand. Well be here whenever youre ready. - {{owner_name}}", "is_active": true}
    ]'::jsonb
  )
  RETURNING id INTO v_sequence_id;
  
  -- Update business with default sequence
  UPDATE businesses SET default_sequence_id = v_sequence_id WHERE id = p_business_id;
  
  RETURN v_sequence_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_business_id UUID,
  p_action TEXT,
  p_description TEXT,
  p_quote_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_logs (business_id, quote_id, action, description, metadata)
  VALUES (p_business_id, p_quote_id, p_action, p_description, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;