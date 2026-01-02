-- Add notification settings to businesses
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS send_quote_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS send_quote_sms BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS quote_email_subject TEXT DEFAULT 'Your Quote from {{business_name}}',
ADD COLUMN IF NOT EXISTS quote_email_message TEXT,
ADD COLUMN IF NOT EXISTS quote_sms_message TEXT DEFAULT 'Hi {{customer_first_name}}, thanks for requesting a quote from {{business_name}}! We''ve sent the details to your email. Questions? Reply here or call {{business_phone}}. - {{owner_first_name}}',
ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
ADD COLUMN IF NOT EXISTS company_color TEXT DEFAULT '#4F46E5';

-- Add notification tracking to quotes
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_status TEXT,
ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sms_status TEXT,
ADD COLUMN IF NOT EXISTS notification_error TEXT;

-- Index for tracking
CREATE INDEX IF NOT EXISTS idx_quotes_email_status ON quotes(email_status);
CREATE INDEX IF NOT EXISTS idx_quotes_sms_status ON quotes(sms_status);