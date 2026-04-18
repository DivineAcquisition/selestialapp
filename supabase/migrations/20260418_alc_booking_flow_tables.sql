-- ============================================================================
-- Selestial: AlphaLuxClean-style booking flow tables
-- ----------------------------------------------------------------------------
-- Backs /book/[businessId]/(funnel)/* and the new
-- /api/booking/[businessId]/{validate-zip,lead,payment-intent,
--   confirm-payment,save-details,confirmation} endpoints.
-- Tenant-scoped via business_id with the existing
-- public.is_business_owner(uuid) RLS helper.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id              uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id              uuid REFERENCES public.customers(id),

  zip_code                 text NOT NULL,
  city                     text,
  state                    text,
  home_size_id             text,
  service_type             text NOT NULL,
  frequency                text,
  offer_type               text,
  offer_name               text,

  customer_name            text,
  customer_email           text,
  customer_phone           text,
  service_address          text,
  service_date             date,
  time_slot                text,
  special_instructions     text,

  base_price_cents         int  NOT NULL DEFAULT 0,
  promo_discount_cents     int  NOT NULL DEFAULT 0,
  deposit_cents            int  NOT NULL DEFAULT 0,
  balance_due_cents        int  NOT NULL DEFAULT 0,
  promo_code               text,

  stripe_payment_intent_id text UNIQUE,
  payment_status           text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'deposit_paid', 'paid', 'fully_paid', 'refunded', 'failed')),

  status                   text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'awaiting_payment', 'confirmed', 'scheduled', 'completed', 'canceled', 'no_show')),
  confirmed_at             timestamptz,
  completed_at             timestamptz,
  canceled_at              timestamptz,

  utms                     jsonb DEFAULT '{}'::jsonb,
  source                   text DEFAULT 'customer_web',
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_business_status_idx
  ON public.bookings (business_id, status);
CREATE INDEX IF NOT EXISTS bookings_business_service_date_idx
  ON public.bookings (business_id, service_date);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bookings tenant all" ON public.bookings;
CREATE POLICY "bookings tenant all" ON public.bookings
  FOR ALL
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));

CREATE TABLE IF NOT EXISTS public.partial_bookings (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id              uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  email                    text NOT NULL,
  first_name               text,
  last_name                text,
  phone                    text,
  zip_code                 text,
  city                     text,
  state                    text,
  home_size                text,
  service_type             text,
  frequency                text,
  preferred_date           text,
  preferred_time           text,
  base_price               numeric,
  last_step                text NOT NULL DEFAULT 'lead_captured',
  session_id               text,
  utms                     jsonb DEFAULT '{}'::jsonb,
  email_sent_1h            boolean DEFAULT false,
  email_sent_24h           boolean DEFAULT false,
  converted_booking_id     uuid REFERENCES public.bookings(id),
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  completed_at             timestamptz,
  UNIQUE (business_id, email)
);

CREATE INDEX IF NOT EXISTS partial_bookings_business_step_idx
  ON public.partial_bookings (business_id, last_step);

ALTER TABLE public.partial_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "partial_bookings tenant all" ON public.partial_bookings;
CREATE POLICY "partial_bookings tenant all" ON public.partial_bookings
  FOR ALL
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));
