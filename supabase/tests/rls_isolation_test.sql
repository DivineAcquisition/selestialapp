-- =============================================================================
-- Selestial v2 — workspace isolation test
-- =============================================================================
-- Proves the non-negotiable: a client member of workspace A can never read a
-- single row belonging to workspace B, on any v2 table. Run after applying the
-- shim and the three v2 migrations (see supabase/tests/shim.sql for the order).
--
-- Any failure raises an exception, so `psql -v ON_ERROR_STOP=1` exits non-zero.
-- =============================================================================

-- Supabase grants these by default; the stock-Postgres shim needs them explicitly.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

do $$
declare
  v_user_a  uuid := gen_random_uuid();
  v_user_b  uuid := gen_random_uuid();
  v_admin   uuid := gen_random_uuid();
  v_ws_a    uuid;
  v_ws_b    uuid;
  v_contact_a uuid;
  v_contact_b uuid;
  v_camp_a  uuid;
  v_camp_b  uuid;
  v_count   int;
begin
  insert into auth.users (id, email) values
    (v_user_a, 'a@client.test'),
    (v_user_b, 'b@client.test'),
    (v_admin,  'malik@selestial.io');

  insert into public.agency_admins (user_id, email) values (v_admin, 'malik@selestial.io');

  insert into public.workspaces (name, slug) values ('Alpha Cleaning', 'alpha') returning id into v_ws_a;
  insert into public.workspaces (name, slug) values ('Beta Cleaning',  'beta')  returning id into v_ws_b;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_ws_a, v_user_a, 'client_owner'), (v_ws_b, v_user_b, 'client_owner');

  insert into public.contacts (workspace_id, full_name, phone)
  values (v_ws_a, 'Alpha Customer', '+15125550001') returning id into v_contact_a;
  insert into public.contacts (workspace_id, full_name, phone)
  values (v_ws_b, 'Beta Customer', '+15125550002') returning id into v_contact_b;

  insert into public.campaigns (workspace_id, name) values (v_ws_a, 'Alpha Reactivation')
    returning id into v_camp_a;
  insert into public.campaigns (workspace_id, name) values (v_ws_b, 'Beta Reactivation')
    returning id into v_camp_b;

  insert into public.engagement_events (workspace_id, contact_id, campaign_id, event_type, channel)
  values (v_ws_a, v_contact_a, v_camp_a, 'message_sent', 'sms'),
         (v_ws_b, v_contact_b, v_camp_b, 'message_sent', 'sms');

  insert into public.workspace_activity (workspace_id, action, summary)
  values (v_ws_a, 'campaign.created', 'Created Alpha Reactivation'),
         (v_ws_b, 'campaign.created', 'Created Beta Reactivation');

  insert into public.tracked_links (token, workspace_id, contact_id, campaign_id, destination_url)
  values ('tok_alpha', v_ws_a, v_contact_a, v_camp_a, 'https://example.com/a'),
         ('tok_beta',  v_ws_b, v_contact_b, v_camp_b, 'https://example.com/b');

  -- ---------------------------------------------------------------------
  -- Client A sees only workspace A
  -- ---------------------------------------------------------------------
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', v_user_a::text, true);

  select count(*) into v_count from public.workspaces;
  if v_count <> 1 then raise exception 'client A saw % workspaces, expected 1', v_count; end if;

  select count(*) into v_count from public.contacts;
  if v_count <> 1 then raise exception 'client A saw % contacts, expected 1', v_count; end if;

  select count(*) into v_count from public.contacts where workspace_id = v_ws_b;
  if v_count <> 0 then raise exception 'LEAK: client A read workspace B contacts'; end if;

  select count(*) into v_count from public.campaigns;
  if v_count <> 1 then raise exception 'client A saw % campaigns, expected 1', v_count; end if;

  select count(*) into v_count from public.engagement_events;
  if v_count <> 1 then raise exception 'LEAK: client A saw % events, expected 1', v_count; end if;

  select count(*) into v_count from public.workspace_activity;
  if v_count <> 1 then raise exception 'LEAK: client A saw % activity rows, expected 1', v_count; end if;

  select count(*) into v_count from public.tracked_links;
  if v_count <> 1 then raise exception 'LEAK: client A saw % links, expected 1', v_count; end if;

  -- GHL tokens have no policies at all: invisible to every non-service role.
  select count(*) into v_count from public.ghl_oauth_tokens;
  if v_count <> 0 then raise exception 'LEAK: GHL tokens are readable by clients'; end if;

  -- A client cannot write into another workspace.
  begin
    update public.contacts set full_name = 'hijacked' where id = v_contact_b;
    if found then raise exception 'LEAK: client A updated a workspace B contact'; end if;
  exception when insufficient_privilege then null;
  end;

  -- ---------------------------------------------------------------------
  -- Client B sees only workspace B
  -- ---------------------------------------------------------------------
  perform set_config('request.jwt.claim.sub', v_user_b::text, true);

  select count(*) into v_count from public.contacts;
  if v_count <> 1 then raise exception 'client B saw % contacts, expected 1', v_count; end if;
  select count(*) into v_count from public.contacts where id = v_contact_a;
  if v_count <> 0 then raise exception 'LEAK: client B read workspace A contacts'; end if;

  -- ---------------------------------------------------------------------
  -- Agency admin sees everything
  -- ---------------------------------------------------------------------
  perform set_config('request.jwt.claim.sub', v_admin::text, true);

  select count(*) into v_count from public.workspaces;
  if v_count <> 2 then raise exception 'agency admin saw % workspaces, expected 2', v_count; end if;
  select count(*) into v_count from public.contacts;
  if v_count <> 2 then raise exception 'agency admin saw % contacts, expected 2', v_count; end if;
  select count(*) into v_count from public.inbound_webhooks;  -- admin-only table, empty but readable
  if v_count <> 0 then raise exception 'unexpected webhook rows'; end if;

  -- ---------------------------------------------------------------------
  -- Anonymous sees nothing
  -- ---------------------------------------------------------------------
  perform set_config('request.jwt.claim.sub', '', true);
  select count(*) into v_count from public.contacts;
  if v_count <> 0 then raise exception 'LEAK: anonymous session read % contacts', v_count; end if;

  reset role;
  raise notice 'workspace isolation: PASS';
end $$;

-- ---------------------------------------------------------------------------
-- Sub-account credentials: the status function is security definer, so it reads a
-- table the caller cannot. The membership check inside it is the only thing
-- standing between a client and another client's credential status.
-- ---------------------------------------------------------------------------
do $$
declare
  v_owner_a uuid := gen_random_uuid();
  v_owner_b uuid := gen_random_uuid();
  v_ws_a    uuid;
  v_ws_b    uuid;
  v_has     boolean;
  v_count   int;
begin
  insert into auth.users (id, email) values
    (v_owner_a, 'owner-a@cred.test'), (v_owner_b, 'owner-b@cred.test');

  insert into public.workspaces (name, slug, ghl_location_id)
    values ('Cred A', 'cred-a', 'loc_cred_a') returning id into v_ws_a;
  insert into public.workspaces (name, slug, ghl_location_id)
    values ('Cred B', 'cred-b', 'loc_cred_b') returning id into v_ws_b;

  insert into public.workspace_members (workspace_id, user_id, role)
    values (v_ws_a, v_owner_a, 'client_owner'), (v_ws_b, v_owner_b, 'client_owner');

  -- Only workspace B has a stored sub-account token.
  insert into public.ghl_oauth_tokens
    (scope_type, source, workspace_id, location_id, access_token, label)
    values ('location', 'pit', v_ws_b, 'loc_cred_b', 'pit-secret-value', 'B token');

  set local role authenticated;

  -- Owner A sees their own status.
  perform set_config('request.jwt.claim.sub', v_owner_a::text, true);
  select has_token into v_has from public.workspace_ghl_credential_status(v_ws_a);
  if v_has then raise exception 'FAIL: workspace A reported a token it does not have'; end if;

  -- Owner A must not be able to ask about workspace B.
  begin
    perform * from public.workspace_ghl_credential_status(v_ws_b);
    raise exception 'FAIL: owner A read credential status for workspace B';
  exception when insufficient_privilege then null;
  end;

  -- Owner B sees theirs, and the token value is still unreachable.
  perform set_config('request.jwt.claim.sub', v_owner_b::text, true);
  select has_token into v_has from public.workspace_ghl_credential_status(v_ws_b);
  if not v_has then raise exception 'FAIL: workspace B did not report its stored token'; end if;

  select count(*) into v_count from public.ghl_oauth_tokens;
  if v_count <> 0 then
    raise exception 'LEAK: a client session read % rows from ghl_oauth_tokens', v_count;
  end if;

  reset role;
  raise notice 'sub-account credential isolation: PASS';
end $$;

-- ---------------------------------------------------------------------------
-- Every v2 table must have RLS enabled. Catches a table added later without it.
-- ---------------------------------------------------------------------------
do $$
declare
  v_missing text;
begin
  select string_agg(c.relname, ', ')
    into v_missing
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and not c.relrowsecurity
    and c.relname in (
      'agency_admins', 'workspaces', 'workspace_members', 'workspace_invites',
      'workspace_provisioning_steps', 'integration_logs', 'ghl_oauth_tokens',
      'workspace_activity', 'sending_identities', 'contacts', 'contact_lists',
      'contact_list_members', 'import_rejects', 'contact_notes', 'saved_segments',
      'campaigns', 'campaign_attachments', 'campaign_touches', 'campaign_enrollments',
      'outreach_messages', 'tracked_links', 'engagement_events', 'inbound_webhooks'
    );

  if v_missing is not null then
    raise exception 'RLS not enabled on: %', v_missing;
  end if;
  raise notice 'RLS enabled on all v2 tables: PASS';
end $$;
