-- ============================================================================
-- Selestial: simplify onboarding intake
-- ----------------------------------------------------------------------------
-- The signup wizard now collects business + branding only. Pricing setup
-- happens on the post-payment onboarding call. The wizard accepts an
-- optional pricing-doc upload (PDF/CSV/etc.) in lieu of typing prices in.
-- ============================================================================

ALTER TABLE public.onboarding_signups
  ALTER COLUMN services DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'onboarding_signups'
      AND column_name = 'business_type'
  ) THEN
    ALTER TABLE public.onboarding_signups
      ADD COLUMN business_type text
        CHECK (business_type IN ('residential', 'commercial', 'both'));
  END IF;
END $$;

ALTER TABLE public.onboarding_signups
  ADD COLUMN IF NOT EXISTS pricing_doc_url text,
  ADD COLUMN IF NOT EXISTS pricing_doc_filename text;

-- Storage bucket: `pricing-docs` (10 MB limit, PDFs / images / spreadsheets).
-- Created idempotently in 20260418_pricing_docs_bucket.sql.
