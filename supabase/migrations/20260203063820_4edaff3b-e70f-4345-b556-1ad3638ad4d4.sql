-- Add missing columns to businesses table
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS send_quote_email BOOLEAN DEFAULT true;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS send_quote_sms BOOLEAN DEFAULT true;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS quote_email_subject VARCHAR(255) DEFAULT 'Your Quote from {{business_name}}';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS quote_email_message TEXT DEFAULT 'Thank you for your interest! Please find your quote attached.';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS quote_sms_message TEXT DEFAULT 'Hi {{customer_name}}, your quote for {{service_type}} is ready! Check your email for details. - {{business_name}}';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS company_color VARCHAR(7) DEFAULT '#3B82F6';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS google_review_link TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS auto_send_payment_link BOOLEAN DEFAULT false;

-- Add missing columns to ai_settings table
ALTER TABLE public.ai_settings ADD COLUMN IF NOT EXISTS emoji_usage VARCHAR(20) DEFAULT 'minimal';
ALTER TABLE public.ai_settings ADD COLUMN IF NOT EXISTS response_length VARCHAR(20) DEFAULT 'medium';
ALTER TABLE public.ai_settings ADD COLUMN IF NOT EXISTS suggest_upsells BOOLEAN DEFAULT false;
ALTER TABLE public.ai_settings ADD COLUMN IF NOT EXISTS include_pricing BOOLEAN DEFAULT false;
ALTER TABLE public.ai_settings ADD COLUMN IF NOT EXISTS monthly_suggestion_limit INTEGER DEFAULT 100;
ALTER TABLE public.ai_settings ADD COLUMN IF NOT EXISTS suggestions_used_this_month INTEGER DEFAULT 0;