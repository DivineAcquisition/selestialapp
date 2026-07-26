-- =============================================================================
-- Selestial v2 — schema invariants
-- =============================================================================
-- The application relies on the database to enforce these. If any of them stop
-- holding, the corresponding safety property in the code silently disappears:
-- retried launches double-send, webhook retries double-count metrics, and a
-- concurrent import creates duplicate contacts instead of merging.
-- =============================================================================

do $$
declare
  v_user    uuid := gen_random_uuid();
  v_ws      uuid;
  v_contact uuid;
  v_camp    uuid;
  v_enroll  uuid;
  v_touch   uuid;
  v_msg     uuid;
  v_count   int;
begin
  insert into auth.users (id, email) values (v_user, 'invariants@test');
  insert into public.workspaces (name, slug) values ('Invariant Co', 'invariant-co')
    returning id into v_ws;
  insert into public.contacts (workspace_id, full_name, phone, email)
    values (v_ws, 'Jane Doe', '+15125550142', 'jane@example.com')
    returning id into v_contact;
  insert into public.campaigns (workspace_id, name) values (v_ws, 'Reactivation')
    returning id into v_camp;
  insert into public.campaign_touches
    (workspace_id, campaign_id, version, step_index, channel, body_template)
    values (v_ws, v_camp, 1, 0, 'sms', 'Hi {{first_name}}')
    returning id into v_touch;
  insert into public.campaign_enrollments (workspace_id, campaign_id, contact_id)
    values (v_ws, v_camp, v_contact)
    returning id into v_enroll;

  -- -------------------------------------------------------------------
  -- A contact cannot be duplicated within a workspace by phone or email.
  -- This is what makes concurrent imports merge instead of racing.
  -- -------------------------------------------------------------------
  begin
    insert into public.contacts (workspace_id, full_name, phone)
      values (v_ws, 'Jane Again', '+15125550142');
    raise exception 'FAIL: duplicate phone was accepted within a workspace';
  exception when unique_violation then null;
  end;

  begin
    insert into public.contacts (workspace_id, full_name, email)
      values (v_ws, 'Jane Again', 'JANE@example.com');
    raise exception 'FAIL: duplicate email was accepted (case-insensitively) within a workspace';
  exception when unique_violation then null;
  end;

  -- The same person in a different workspace is a different contact.
  declare
    v_other_ws uuid;
  begin
    insert into public.workspaces (name, slug) values ('Other Co', 'other-co')
      returning id into v_other_ws;
    insert into public.contacts (workspace_id, full_name, phone)
      values (v_other_ws, 'Jane Doe', '+15125550142');
  end;

  -- Two contacts with no phone and no email must both be allowed: the partial
  -- indexes must not collapse NULLs onto each other.
  insert into public.contacts (workspace_id, full_name) values (v_ws, 'No Details One');
  insert into public.contacts (workspace_id, full_name) values (v_ws, 'No Details Two');

  -- -------------------------------------------------------------------
  -- A retried launch cannot schedule the same touch twice.
  -- -------------------------------------------------------------------
  insert into public.outreach_messages
    (workspace_id, campaign_id, enrollment_id, contact_id, touch_id, step_index,
     channel, scheduled_for, idempotency_key)
    values (v_ws, v_camp, v_enroll, v_contact, v_touch, 0, 'sms', now(),
            v_camp || ':' || v_contact || ':v1:s0')
    returning id into v_msg;

  begin
    insert into public.outreach_messages
      (workspace_id, campaign_id, enrollment_id, contact_id, touch_id, step_index,
       channel, scheduled_for, idempotency_key)
      values (v_ws, v_camp, v_enroll, v_contact, v_touch, 0, 'sms', now(),
              v_camp || ':' || v_contact || ':v1:s0');
    raise exception 'FAIL: the same touch was scheduled twice for one contact';
  exception when unique_violation then null;
  end;

  -- A contact can only be enrolled in a campaign once.
  begin
    insert into public.campaign_enrollments (workspace_id, campaign_id, contact_id)
      values (v_ws, v_camp, v_contact);
    raise exception 'FAIL: duplicate enrollment was accepted';
  exception when unique_violation then null;
  end;

  -- -------------------------------------------------------------------
  -- A webhook retry cannot double-count a metric.
  -- -------------------------------------------------------------------
  insert into public.engagement_events
    (workspace_id, contact_id, campaign_id, event_type, channel, provider, provider_event_id)
    values (v_ws, v_contact, v_camp, 'message_delivered', 'email', 'resend', 'evt_abc');

  begin
    insert into public.engagement_events
      (workspace_id, contact_id, campaign_id, event_type, channel, provider, provider_event_id)
      values (v_ws, v_contact, v_camp, 'message_delivered', 'email', 'resend', 'evt_abc');
    raise exception 'FAIL: the same provider event was recorded twice';
  exception when unique_violation then null;
  end;

  -- Events without a provider id (our own clicks) must still be insertable repeatedly:
  -- one person clicking three times is three clicks.
  insert into public.engagement_events (workspace_id, contact_id, event_type)
    values (v_ws, v_contact, 'link_clicked'), (v_ws, v_contact, 'link_clicked');

  select count(*) into v_count
  from public.engagement_events
  where contact_id = v_contact and event_type = 'link_clicked';
  if v_count <> 2 then raise exception 'FAIL: repeat clicks were collapsed, got %', v_count; end if;

  -- -------------------------------------------------------------------
  -- A retried send cannot mint a second token for the same destination,
  -- which would split one contact's clicks across two rows.
  -- -------------------------------------------------------------------
  insert into public.tracked_links
    (token, workspace_id, contact_id, campaign_id, message_id, kind, destination_url)
    values ('tok_one', v_ws, v_contact, v_camp, v_msg, 'url', 'https://example.com/book');

  begin
    insert into public.tracked_links
      (token, workspace_id, contact_id, campaign_id, message_id, kind, destination_url)
      values ('tok_two', v_ws, v_contact, v_camp, v_msg, 'url', 'https://example.com/book');
    raise exception 'FAIL: a second token was minted for the same message and destination';
  exception when unique_violation then null;
  end;

  -- A different kind on the same message is a different link and must be allowed.
  insert into public.tracked_links
    (token, workspace_id, contact_id, campaign_id, message_id, kind)
    values ('tok_unsub', v_ws, v_contact, v_camp, v_msg, 'unsubscribe');

  -- -------------------------------------------------------------------
  -- Provisioning steps are unique per workspace, which is what makes
  -- "retry this step" idempotent rather than additive.
  -- -------------------------------------------------------------------
  insert into public.workspace_provisioning_steps (workspace_id, step_key, label)
    values (v_ws, 'create_location', 'Creating GoHighLevel sub-account');

  begin
    insert into public.workspace_provisioning_steps (workspace_id, step_key, label)
      values (v_ws, 'create_location', 'Creating GoHighLevel sub-account');
    raise exception 'FAIL: a duplicate provisioning step row was accepted';
  exception when unique_violation then null;
  end;

  -- Two workspaces cannot claim the same GHL sub-account.
  begin
    update public.workspaces set ghl_location_id = 'loc_shared' where id = v_ws;
    update public.workspaces set ghl_location_id = 'loc_shared' where slug = 'other-co';
    raise exception 'FAIL: two workspaces claimed the same GHL location';
  exception when unique_violation then null;
  end;

  -- A campaign cannot have two touches at the same step in the same version, but a
  -- regenerated version reuses the step numbers.
  begin
    insert into public.campaign_touches
      (workspace_id, campaign_id, version, step_index, channel, body_template)
      values (v_ws, v_camp, 1, 0, 'email', 'duplicate step');
    raise exception 'FAIL: duplicate step index within one sequence version';
  exception when unique_violation then null;
  end;

  insert into public.campaign_touches
    (workspace_id, campaign_id, version, step_index, channel, body_template)
    values (v_ws, v_camp, 2, 0, 'email', 'regenerated step 0');

  raise notice 'schema invariants: PASS';
end $$;

-- ---------------------------------------------------------------------------
-- Cascade behaviour: deleting a workspace must not orphan client data.
-- ---------------------------------------------------------------------------
do $$
declare
  v_ws      uuid;
  v_contact uuid;
  v_count   int;
begin
  insert into public.workspaces (name, slug) values ('Cascade Co', 'cascade-co')
    returning id into v_ws;
  insert into public.contacts (workspace_id, full_name) values (v_ws, 'Temp')
    returning id into v_contact;
  insert into public.engagement_events (workspace_id, contact_id, event_type)
    values (v_ws, v_contact, 'contact_imported');
  insert into public.workspace_activity (workspace_id, action, summary)
    values (v_ws, 'test', 'test');

  delete from public.workspaces where id = v_ws;

  select count(*) into v_count from public.contacts where workspace_id = v_ws;
  if v_count <> 0 then raise exception 'FAIL: % contacts orphaned', v_count; end if;

  select count(*) into v_count from public.engagement_events where workspace_id = v_ws;
  if v_count <> 0 then raise exception 'FAIL: % events orphaned', v_count; end if;

  select count(*) into v_count from public.workspace_activity where workspace_id = v_ws;
  if v_count <> 0 then raise exception 'FAIL: % activity rows orphaned', v_count; end if;

  raise notice 'cascade behaviour: PASS';
end $$;

-- ---------------------------------------------------------------------------
-- workspace_week_stats must count from the events table and respect its bounds.
-- ---------------------------------------------------------------------------
do $$
declare
  v_ws      uuid;
  v_contact uuid;
  v_other   uuid;
  v_start   timestamptz := date_trunc('day', now()) - interval '3 days';
  v_end     timestamptz := date_trunc('day', now()) + interval '4 days';
  v_row     record;
begin
  insert into public.workspaces (name, slug) values ('Stats Co', 'stats-co') returning id into v_ws;
  insert into public.contacts (workspace_id, full_name) values (v_ws, 'A') returning id into v_contact;
  insert into public.contacts (workspace_id, full_name) values (v_ws, 'B') returning id into v_other;

  insert into public.engagement_events (workspace_id, contact_id, event_type, channel, occurred_at)
  values
    (v_ws, v_contact, 'message_sent', 'sms',   now()),
    (v_ws, v_contact, 'message_sent', 'email', now()),
    (v_ws, v_other,   'message_sent', 'sms',   now()),
    (v_ws, v_contact, 'link_clicked', 'email', now()),
    (v_ws, v_contact, 'link_clicked', 'email', now()),
    (v_ws, v_other,   'link_clicked', 'email', now()),
    (v_ws, v_contact, 'reply_received', 'sms', now()),
    -- Outside the window: must not be counted.
    (v_ws, v_contact, 'message_sent', 'sms', now() - interval '30 days');

  select * into v_row from public.workspace_week_stats(v_ws, v_start, v_end);

  if v_row.sms_sent <> 2 then raise exception 'FAIL: sms_sent = %, expected 2', v_row.sms_sent; end if;
  if v_row.email_sent <> 1 then raise exception 'FAIL: email_sent = %, expected 1', v_row.email_sent; end if;
  if v_row.clicks <> 3 then raise exception 'FAIL: clicks = %, expected 3', v_row.clicks; end if;
  if v_row.unique_clickers <> 2 then
    raise exception 'FAIL: unique_clickers = %, expected 2', v_row.unique_clickers;
  end if;
  if v_row.replies <> 1 then raise exception 'FAIL: replies = %, expected 1', v_row.replies; end if;
  if v_row.bookings <> 0 then raise exception 'FAIL: bookings = %, expected 0', v_row.bookings; end if;

  raise notice 'workspace_week_stats: PASS';
end $$;
