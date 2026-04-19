-- ============================================================================
-- Selestial: collapse onboarding to a single $297/mo plan + add Stripe fields
-- ============================================================================

ALTER TABLE public.onboarding_signups
  DROP CONSTRAINT IF EXISTS onboarding_signups_plan_check;

ALTER TABLE public.onboarding_signups
  ALTER COLUMN plan SET DEFAULT 'standard';

ALTER TABLE public.onboarding_signups
  ADD COLUMN IF NOT EXISTS stripe_customer_id        text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id    text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id  text,
  ADD COLUMN IF NOT EXISTS payment_status            text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'requires_payment', 'processing', 'paid', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS paid_at                   timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_call_at        timestamptz;

CREATE INDEX IF NOT EXISTS onboarding_signups_stripe_customer_idx
  ON public.onboarding_signups (stripe_customer_id);
CREATE INDEX IF NOT EXISTS onboarding_signups_stripe_subscription_idx
  ON public.onboarding_signups (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS onboarding_signups_payment_status_idx
  ON public.onboarding_signups (payment_status, created_at DESC);
