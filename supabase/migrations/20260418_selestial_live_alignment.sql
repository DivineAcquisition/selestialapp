-- ============================================================================
-- 20260418 — Selestial live-database alignment
-- ----------------------------------------------------------------------------
-- Brings the live Supabase project (Selestial™ / thbegonbonhswsbgszxi) in line
-- with what the Next.js app actually calls. Two things in one file:
--
-- 1. RPCs the app calls but that did not exist (or had the wrong signature):
--      - log_activity(p_business_id, p_action, p_description, p_quote_id)
--      - mark_conversation_read(p_quote_id)
--      - copy_pricing_templates_to_business(p_business_id)
--
-- 2. Tenant-isolation RLS policies for 14 tables that had RLS enabled but no
--    policies, causing every authenticated query to silently return 0 rows.
--    All policies key off `is_business_owner(business_id)` which checks
--    `auth.uid() = businesses.user_id`.
--
-- This file mirrors what was applied to the live DB on 2026-04-18.
-- ============================================================================

-- ============================================================================
-- 1. RPCs
-- ============================================================================

DROP FUNCTION IF EXISTS public.log_activity(uuid, varchar, varchar, uuid, jsonb);

CREATE OR REPLACE FUNCTION public.log_activity(
  p_business_id uuid,
  p_action varchar,
  p_description text DEFAULT NULL,
  p_quote_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.activity_logs (
    business_id, user_id, action, description, entity_type, entity_id, details
  )
  VALUES (
    p_business_id,
    auth.uid(),
    p_action,
    p_description,
    CASE WHEN p_quote_id IS NOT NULL THEN 'quote' ELSE NULL END,
    p_quote_id,
    '{}'::jsonb
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_activity(uuid, varchar, text, uuid)
  TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_quote_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.inbound_messages
     SET is_processed = true,
         matched_at = COALESCE(matched_at, now())
   WHERE quote_id = p_quote_id
     AND COALESCE(is_processed, false) = false;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid)
  TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.copy_pricing_templates_to_business(p_business_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Stub. The app performs the actual template copy via direct table inserts
  -- (see /api/booking/[businessId]/pricing/config). This stub exists so the
  -- .rpc() call succeeds without "function does not exist" errors.
  PERFORM 1 WHERE p_business_id IS NOT NULL;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.copy_pricing_templates_to_business(uuid)
  TO anon, authenticated;

-- ============================================================================
-- 2. Tenant-isolation RLS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_business_owner(p_business_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = p_business_id AND b.user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_business_owner(uuid) TO anon, authenticated;

-- activity_logs
DROP POLICY IF EXISTS "activity_logs tenant select" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs tenant insert" ON public.activity_logs;
CREATE POLICY "activity_logs tenant select" ON public.activity_logs
  FOR SELECT USING (public.is_business_owner(business_id));
CREATE POLICY "activity_logs tenant insert" ON public.activity_logs
  FOR INSERT WITH CHECK (public.is_business_owner(business_id));

-- ai_suggestions
DROP POLICY IF EXISTS "ai_suggestions tenant all" ON public.ai_suggestions;
CREATE POLICY "ai_suggestions tenant all" ON public.ai_suggestions
  FOR ALL
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));

-- billing_events (server-side webhook writes; allow owner read)
DROP POLICY IF EXISTS "billing_events tenant select" ON public.billing_events;
CREATE POLICY "billing_events tenant select" ON public.billing_events
  FOR SELECT USING (business_id IS NULL OR public.is_business_owner(business_id));

-- business_metrics
DROP POLICY IF EXISTS "business_metrics tenant select" ON public.business_metrics;
CREATE POLICY "business_metrics tenant select" ON public.business_metrics
  FOR SELECT USING (public.is_business_owner(business_id));

-- campaign_recipients (scoped via parent campaign)
DROP POLICY IF EXISTS "campaign_recipients tenant all" ON public.campaign_recipients;
CREATE POLICY "campaign_recipients tenant all" ON public.campaign_recipients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.seasonal_campaigns c
      WHERE c.id = campaign_id AND public.is_business_owner(c.business_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.seasonal_campaigns c
      WHERE c.id = campaign_id AND public.is_business_owner(c.business_id)
    )
  );

-- inbound_messages
DROP POLICY IF EXISTS "inbound_messages tenant select" ON public.inbound_messages;
DROP POLICY IF EXISTS "inbound_messages tenant update" ON public.inbound_messages;
CREATE POLICY "inbound_messages tenant select" ON public.inbound_messages
  FOR SELECT USING (public.is_business_owner(business_id));
CREATE POLICY "inbound_messages tenant update" ON public.inbound_messages
  FOR UPDATE
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));

-- message_queue
DROP POLICY IF EXISTS "message_queue tenant all" ON public.message_queue;
CREATE POLICY "message_queue tenant all" ON public.message_queue
  FOR ALL
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));

-- performance_alerts
DROP POLICY IF EXISTS "performance_alerts tenant all" ON public.performance_alerts;
CREATE POLICY "performance_alerts tenant all" ON public.performance_alerts
  FOR ALL
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));

-- phone_numbers
DROP POLICY IF EXISTS "phone_numbers tenant all" ON public.phone_numbers;
CREATE POLICY "phone_numbers tenant all" ON public.phone_numbers
  FOR ALL
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));

-- retention_queue
DROP POLICY IF EXISTS "retention_queue tenant all" ON public.retention_queue;
CREATE POLICY "retention_queue tenant all" ON public.retention_queue
  FOR ALL
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));

-- retention_sequences
DROP POLICY IF EXISTS "retention_sequences tenant all" ON public.retention_sequences;
CREATE POLICY "retention_sequences tenant all" ON public.retention_sequences
  FOR ALL
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));

-- review_requests
DROP POLICY IF EXISTS "review_requests tenant all" ON public.review_requests;
CREATE POLICY "review_requests tenant all" ON public.review_requests
  FOR ALL
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));

-- seasonal_campaigns
DROP POLICY IF EXISTS "seasonal_campaigns tenant all" ON public.seasonal_campaigns;
CREATE POLICY "seasonal_campaigns tenant all" ON public.seasonal_campaigns
  FOR ALL
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));

-- stripe_connected_accounts
DROP POLICY IF EXISTS "stripe_connected_accounts tenant all" ON public.stripe_connected_accounts;
CREATE POLICY "stripe_connected_accounts tenant all" ON public.stripe_connected_accounts
  FOR ALL
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));

-- Harden update_updated_at search_path (security advisor warning).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS sig
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = 'update_updated_at'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', r.sig);
  END LOOP;
END $$;
