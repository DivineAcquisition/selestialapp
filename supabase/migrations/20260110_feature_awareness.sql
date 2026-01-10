-- ============================================
-- FEATURE FLAGS & CONFIGURATION STATUS
-- Platform-Wide Feature Awareness System
-- ============================================

-- Master feature registry for each business
CREATE TABLE IF NOT EXISTS business_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Feature identifier
  feature_key TEXT NOT NULL,
  
  -- Status
  is_enabled BOOLEAN DEFAULT false,
  is_configured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true, -- Based on plan
  
  -- Configuration completeness (0-100)
  config_progress INTEGER DEFAULT 0,
  
  -- Last configuration check
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Configuration errors/warnings
  config_errors JSONB DEFAULT '[]'::jsonb,
  config_warnings JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  enabled_at TIMESTAMPTZ,
  enabled_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, feature_key)
);

-- Integration connections status
CREATE TABLE IF NOT EXISTS business_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Integration identifier
  integration_key TEXT NOT NULL,
  -- Options: 'stripe', 'twilio', 'google_calendar', 'google_oauth', 'sendgrid', 'mailgun', 'zapier', 'quickbooks'
  
  -- Connection status
  is_connected BOOLEAN DEFAULT false,
  connection_status TEXT DEFAULT 'not_connected',
  -- Options: 'not_connected', 'pending', 'connected', 'error', 'expired', 'revoked'
  
  -- Credentials (encrypted reference, not actual keys)
  credentials_ref TEXT,
  
  -- Connection metadata
  connected_at TIMESTAMPTZ,
  connected_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  
  -- Last health check
  last_health_check TIMESTAMPTZ,
  health_status TEXT DEFAULT 'unknown',
  -- Options: 'unknown', 'healthy', 'degraded', 'failing'
  
  -- Error tracking
  last_error TEXT,
  last_error_at TIMESTAMPTZ,
  error_count INTEGER DEFAULT 0,
  
  -- Scopes/permissions granted
  granted_scopes TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, integration_key)
);

-- Configuration items tracking
CREATE TABLE IF NOT EXISTS business_config_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Config category
  category TEXT NOT NULL,
  -- Options: 'business_profile', 'services', 'pricing', 'staff', 'availability', 
  --          'booking_widget', 'payment', 'notifications', 'branding'
  
  -- Config item
  config_key TEXT NOT NULL,
  
  -- Status
  is_configured BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT true,
  
  -- Value summary (for quick checks, not full data)
  config_summary JSONB,
  
  -- Validation
  last_validated_at TIMESTAMPTZ,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, category, config_key)
);

-- Feature dependencies mapping (static reference table)
CREATE TABLE IF NOT EXISTS feature_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The feature that has dependencies
  feature_key TEXT NOT NULL,
  
  -- What it depends on
  dependency_type TEXT NOT NULL,
  -- Options: 'feature', 'integration', 'config', 'plan'
  
  dependency_key TEXT NOT NULL,
  
  -- Is this a hard requirement or soft (warning only)?
  is_required BOOLEAN DEFAULT true,
  
  -- Human-readable requirement
  requirement_label TEXT,
  
  -- Order for display
  sort_order INTEGER DEFAULT 0,
  
  UNIQUE(feature_key, dependency_type, dependency_key)
);

-- Pre-populate feature dependencies
INSERT INTO feature_dependencies (feature_key, dependency_type, dependency_key, is_required, requirement_label) VALUES
-- Booking Widget dependencies
('booking_widget', 'config', 'services', true, 'At least one service must be configured'),
('booking_widget', 'config', 'pricing', true, 'Pricing must be configured'),
('booking_widget', 'config', 'availability', true, 'Availability hours must be set'),
('booking_widget', 'config', 'business_profile', true, 'Business profile must be complete'),
('booking_widget', 'integration', 'stripe', false, 'Connect Stripe for online payments'),

-- Payment Links dependencies
('payment_links', 'integration', 'stripe', true, 'Stripe must be connected'),
('payment_links', 'config', 'business_profile', true, 'Business profile must be complete'),

-- Sequences/Automation dependencies
('sequences', 'integration', 'twilio', false, 'Connect Twilio for SMS messages'),
('sequences', 'integration', 'sendgrid', false, 'Connect SendGrid for emails'),
('sequences', 'config', 'notifications', true, 'Notification templates must be configured'),

-- Calendar dependencies
('calendar', 'config', 'availability', true, 'Availability hours must be set'),
('calendar', 'config', 'staff', false, 'Add staff for team scheduling'),
('calendar', 'integration', 'google_calendar', false, 'Connect Google Calendar for sync'),

-- Invoices dependencies
('invoices', 'integration', 'stripe', true, 'Stripe must be connected for payments'),
('invoices', 'config', 'business_profile', true, 'Business profile must be complete'),

-- Staff Management dependencies
('staff_management', 'feature', 'calendar', true, 'Calendar must be enabled'),

-- Pricing Engine dependencies
('pricing_engine', 'config', 'services', true, 'At least one service must be configured'),

-- SMS Notifications dependencies
('sms_notifications', 'integration', 'twilio', true, 'Twilio must be connected'),
('sms_notifications', 'config', 'notifications', true, 'SMS templates must be configured'),

-- Email Notifications dependencies  
('email_notifications', 'integration', 'sendgrid', false, 'Connect SendGrid for custom emails'),
('email_notifications', 'config', 'notifications', true, 'Email templates must be configured'),

-- Google Calendar Sync dependencies
('google_calendar_sync', 'integration', 'google_calendar', true, 'Google Calendar must be connected'),
('google_calendar_sync', 'feature', 'calendar', true, 'Calendar feature must be enabled')
ON CONFLICT DO NOTHING;

-- Onboarding/Setup progress tracking
CREATE TABLE IF NOT EXISTS business_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Overall progress
  overall_progress INTEGER DEFAULT 0, -- 0-100
  is_complete BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  -- Step completion
  steps_completed JSONB DEFAULT '{}'::jsonb,
  -- Example: {"business_profile": true, "first_service": true, "pricing": false, ...}
  
  -- Current step
  current_step TEXT DEFAULT 'business_profile',
  
  -- Skipped steps (user chose to skip)
  skipped_steps TEXT[] DEFAULT '{}',
  
  -- Time tracking
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_features_lookup ON business_features(business_id, feature_key);
CREATE INDEX IF NOT EXISTS idx_business_integrations_lookup ON business_integrations(business_id, integration_key);
CREATE INDEX IF NOT EXISTS idx_business_config_lookup ON business_config_items(business_id, category);
CREATE INDEX IF NOT EXISTS idx_feature_dependencies_lookup ON feature_dependencies(feature_key);
CREATE INDEX IF NOT EXISTS idx_business_onboarding_lookup ON business_onboarding(business_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_feature_awareness_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_business_features_updated_at ON business_features;
CREATE TRIGGER update_business_features_updated_at
  BEFORE UPDATE ON business_features
  FOR EACH ROW EXECUTE FUNCTION update_feature_awareness_updated_at();

DROP TRIGGER IF EXISTS update_business_integrations_updated_at ON business_integrations;
CREATE TRIGGER update_business_integrations_updated_at
  BEFORE UPDATE ON business_integrations
  FOR EACH ROW EXECUTE FUNCTION update_feature_awareness_updated_at();

DROP TRIGGER IF EXISTS update_business_config_items_updated_at ON business_config_items;
CREATE TRIGGER update_business_config_items_updated_at
  BEFORE UPDATE ON business_config_items
  FOR EACH ROW EXECUTE FUNCTION update_feature_awareness_updated_at();

-- Row Level Security
ALTER TABLE business_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_config_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_onboarding ENABLE ROW LEVEL SECURITY;

-- Business features policies
CREATE POLICY "Users can view their business features"
  ON business_features FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their business features"
  ON business_features FOR INSERT
  WITH CHECK (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their business features"
  ON business_features FOR UPDATE
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their business features"
  ON business_features FOR DELETE
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Business integrations policies
CREATE POLICY "Users can view their business integrations"
  ON business_integrations FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their business integrations"
  ON business_integrations FOR INSERT
  WITH CHECK (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their business integrations"
  ON business_integrations FOR UPDATE
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their business integrations"
  ON business_integrations FOR DELETE
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Business config items policies
CREATE POLICY "Users can view their business config items"
  ON business_config_items FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their business config items"
  ON business_config_items FOR INSERT
  WITH CHECK (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their business config items"
  ON business_config_items FOR UPDATE
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their business config items"
  ON business_config_items FOR DELETE
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Business onboarding policies
CREATE POLICY "Users can view their business onboarding"
  ON business_onboarding FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their business onboarding"
  ON business_onboarding FOR INSERT
  WITH CHECK (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their business onboarding"
  ON business_onboarding FOR UPDATE
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Feature dependencies is a read-only reference table
CREATE POLICY "Anyone can read feature dependencies"
  ON feature_dependencies FOR SELECT
  USING (true);

-- Function to initialize feature awareness for a new business
CREATE OR REPLACE FUNCTION initialize_business_feature_awareness()
RETURNS TRIGGER AS $$
BEGIN
  -- Create onboarding record
  INSERT INTO business_onboarding (business_id)
  VALUES (NEW.id)
  ON CONFLICT (business_id) DO NOTHING;
  
  -- Initialize default features
  INSERT INTO business_features (business_id, feature_key, is_enabled, is_available)
  VALUES 
    (NEW.id, 'booking_widget', false, true),
    (NEW.id, 'payment_links', false, true),
    (NEW.id, 'sequences', false, true),
    (NEW.id, 'calendar', false, true),
    (NEW.id, 'invoices', false, true),
    (NEW.id, 'staff_management', false, true),
    (NEW.id, 'pricing_engine', false, true),
    (NEW.id, 'sms_notifications', false, true),
    (NEW.id, 'email_notifications', true, true),
    (NEW.id, 'google_calendar_sync', false, true),
    (NEW.id, 'customer_portal', false, true),
    (NEW.id, 'reports', true, true),
    (NEW.id, 'api_access', false, true)
  ON CONFLICT (business_id, feature_key) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize feature awareness when business is created
DROP TRIGGER IF EXISTS init_business_feature_awareness ON businesses;
CREATE TRIGGER init_business_feature_awareness
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION initialize_business_feature_awareness();

-- Function to check and update config status
CREATE OR REPLACE FUNCTION update_config_status(
  p_business_id UUID,
  p_category TEXT,
  p_config_key TEXT,
  p_is_configured BOOLEAN,
  p_config_summary JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO business_config_items (business_id, category, config_key, is_configured, config_summary, last_validated_at)
  VALUES (p_business_id, p_category, p_config_key, p_is_configured, p_config_summary, NOW())
  ON CONFLICT (business_id, category, config_key) 
  DO UPDATE SET 
    is_configured = p_is_configured,
    config_summary = COALESCE(p_config_summary, business_config_items.config_summary),
    last_validated_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update integration status
CREATE OR REPLACE FUNCTION update_integration_status(
  p_business_id UUID,
  p_integration_key TEXT,
  p_is_connected BOOLEAN,
  p_connection_status TEXT DEFAULT 'not_connected',
  p_health_status TEXT DEFAULT 'unknown',
  p_last_error TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO business_integrations (business_id, integration_key, is_connected, connection_status, health_status, last_error, last_health_check)
  VALUES (p_business_id, p_integration_key, p_is_connected, p_connection_status, p_health_status, p_last_error, NOW())
  ON CONFLICT (business_id, integration_key) 
  DO UPDATE SET 
    is_connected = p_is_connected,
    connection_status = p_connection_status,
    health_status = p_health_status,
    last_error = CASE WHEN p_last_error IS NOT NULL THEN p_last_error ELSE business_integrations.last_error END,
    last_error_at = CASE WHEN p_last_error IS NOT NULL THEN NOW() ELSE business_integrations.last_error_at END,
    error_count = CASE WHEN p_last_error IS NOT NULL THEN business_integrations.error_count + 1 ELSE business_integrations.error_count END,
    last_health_check = NOW(),
    connected_at = CASE WHEN p_is_connected AND NOT business_integrations.is_connected THEN NOW() ELSE business_integrations.connected_at END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
