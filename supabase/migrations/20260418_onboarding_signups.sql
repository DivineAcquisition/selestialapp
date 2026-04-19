-- ============================================================================
-- Selestial: /offer onboarding signups
-- ----------------------------------------------------------------------------
-- Backs the 4-step onboarding flow at /offer/get-started.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.onboarding_signups (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  business_name            text NOT NULL,
  contact_name             text NOT NULL,
  email                    text NOT NULL,
  phone                    text,
  website                  text,
  service_area             text,

  logo_url                 text,
  brand_color              text DEFAULT '#7c3aed',
  tagline                  text,

  services                 jsonb NOT NULL DEFAULT '[]'::jsonb,
  base_pricing             jsonb DEFAULT '{}'::jsonb,
  recurring_discount_pct   int DEFAULT 10,
  deposit_percent          int DEFAULT 25,

  plan                     text DEFAULT 'starter'
    CHECK (plan IN ('starter', 'growth', 'scale')),
  offer_code               text,
  monthly_price_cents      int,

  status                   text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','queued','provisioning','ready','failed','cancelled')),
  ghl_location_id          text,
  ghl_provision_error      text,
  business_id              uuid REFERENCES public.businesses(id) ON DELETE SET NULL,

  notes                    text,
  utms                     jsonb DEFAULT '{}'::jsonb,
  source                   text DEFAULT 'offer_page',
  user_agent               text,
  ip_address               text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS onboarding_signups_status_idx
  ON public.onboarding_signups (status, created_at DESC);
CREATE INDEX IF NOT EXISTS onboarding_signups_email_idx
  ON public.onboarding_signups (email);

ALTER TABLE public.onboarding_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "onboarding_signups public insert" ON public.onboarding_signups;
CREATE POLICY "onboarding_signups public insert"
  ON public.onboarding_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT INSERT ON public.onboarding_signups TO anon, authenticated;
