-- Inbound leads from the "Want your own branded booking page?" form on the
-- public landing page (welcome page). Anyone (anon) can INSERT; reads are
-- service-role only.
CREATE TABLE IF NOT EXISTS public.booking_page_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  website text,
  service_area text,
  home_size_focus text,
  services_offered text,
  brand_color text,
  notes text,
  source text DEFAULT 'welcome_page_customization_form',
  user_agent text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS booking_page_requests_created_at_idx
  ON public.booking_page_requests (created_at DESC);

ALTER TABLE public.booking_page_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "booking_page_requests public insert" ON public.booking_page_requests;
CREATE POLICY "booking_page_requests public insert"
  ON public.booking_page_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT INSERT ON public.booking_page_requests TO anon, authenticated;
