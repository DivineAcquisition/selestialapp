-- =============================================================================
-- Selestial v2 — Part 3: tokenized links, engagement events, webhook intake
-- =============================================================================
-- One events table. Every send, delivery, click, view, reply and booking is one
-- row here, and every dashboard number derives from it.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- tracked_links — one token per contact per message per destination
-- ---------------------------------------------------------------------------
create table if not exists public.tracked_links (
  id               uuid primary key default gen_random_uuid(),
  token            text not null unique,
  workspace_id     uuid not null references public.workspaces(id) on delete cascade,
  contact_id       uuid references public.contacts(id) on delete cascade,
  campaign_id      uuid references public.campaigns(id) on delete cascade,
  message_id       uuid references public.outreach_messages(id) on delete set null,
  touch_id         uuid references public.campaign_touches(id) on delete set null,

  kind             text not null default 'url',  -- url | attachment | unsubscribe
  destination_url  text,
  attachment_id    uuid references public.campaign_attachments(id) on delete cascade,
  label            text,

  click_count      int not null default 0,
  first_clicked_at timestamptz,
  last_clicked_at  timestamptz,
  expires_at       timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists tracked_links_contact_idx on public.tracked_links(contact_id);
create index if not exists tracked_links_campaign_idx on public.tracked_links(campaign_id);
create index if not exists tracked_links_message_idx on public.tracked_links(message_id);
create unique index if not exists tracked_links_dedupe_idx
  on public.tracked_links(message_id, kind, coalesce(destination_url, ''), coalesce(attachment_id::text, ''))
  where message_id is not null;

-- ---------------------------------------------------------------------------
-- engagement_events — the single source of truth for all metrics
-- ---------------------------------------------------------------------------
create table if not exists public.engagement_events (
  id                bigserial primary key,
  workspace_id      uuid not null references public.workspaces(id) on delete cascade,
  contact_id        uuid references public.contacts(id) on delete cascade,
  campaign_id       uuid references public.campaigns(id) on delete set null,
  message_id        uuid references public.outreach_messages(id) on delete set null,
  touch_id          uuid references public.campaign_touches(id) on delete set null,
  link_id           uuid references public.tracked_links(id) on delete set null,

  event_type        text not null,
  channel           outreach_channel,
  occurred_at       timestamptz not null default now(),
  metadata          jsonb not null default '{}'::jsonb,

  provider          text,
  provider_event_id text,

  created_at        timestamptz not null default now()
);

-- Idempotency for provider-delivered events (webhooks retry aggressively).
create unique index if not exists engagement_events_provider_uniq
  on public.engagement_events(provider, provider_event_id)
  where provider_event_id is not null;

create index if not exists engagement_events_ws_time_idx
  on public.engagement_events(workspace_id, occurred_at desc);
create index if not exists engagement_events_contact_time_idx
  on public.engagement_events(contact_id, occurred_at desc);
create index if not exists engagement_events_campaign_type_idx
  on public.engagement_events(campaign_id, event_type, occurred_at desc);
create index if not exists engagement_events_type_time_idx
  on public.engagement_events(event_type, occurred_at desc);

comment on table public.engagement_events is
  'Canonical event log. event_type is one of: message_scheduled, message_sent, '
  'message_delivered, message_failed, message_skipped, email_opened, link_clicked, '
  'attachment_viewed, attachment_view_duration, reply_received, booking_created, '
  'opted_out, email_bounced, email_complained, contact_imported, contact_merged, '
  'sequence_exited.';

-- ---------------------------------------------------------------------------
-- inbound_webhooks — raw intake + dead-letter queue
-- ---------------------------------------------------------------------------
create table if not exists public.inbound_webhooks (
  id                  uuid primary key default gen_random_uuid(),
  provider            text not null,        -- ghl | resend
  event_type          text,
  workspace_id        uuid references public.workspaces(id) on delete set null,
  signature_verified  boolean not null default false,
  status              text not null default 'received',  -- received | processed | failed | dead_letter | ignored
  attempts            int not null default 0,
  error               text,
  headers             jsonb not null default '{}'::jsonb,
  raw                 jsonb not null default '{}'::jsonb,
  dedupe_key          text,
  received_at         timestamptz not null default now(),
  processed_at        timestamptz,
  created_at          timestamptz not null default now()
);

create unique index if not exists inbound_webhooks_dedupe_idx
  on public.inbound_webhooks(provider, dedupe_key)
  where dedupe_key is not null;
create index if not exists inbound_webhooks_status_idx
  on public.inbound_webhooks(status, received_at desc);
create index if not exists inbound_webhooks_ws_idx
  on public.inbound_webhooks(workspace_id, received_at desc);

-- ---------------------------------------------------------------------------
-- Weekly rollup used by both dashboards. Derived entirely from the events
-- table so the numbers can never drift from the log.
-- ---------------------------------------------------------------------------
create or replace function public.workspace_week_stats(
  p_workspace_id uuid,
  p_start timestamptz,
  p_end   timestamptz
)
returns table (
  sms_sent            bigint,
  email_sent          bigint,
  scheduled           bigint,
  delivered           bigint,
  opens               bigint,
  clicks              bigint,
  unique_clickers     bigint,
  attachment_views    bigint,
  replies             bigint,
  bookings            bigint,
  opt_outs            bigint,
  failures            bigint
)
language sql
stable
security invoker
as $$
  select
    count(*) filter (where e.event_type = 'message_sent' and e.channel = 'sms'),
    count(*) filter (where e.event_type = 'message_sent' and e.channel = 'email'),
    count(*) filter (where e.event_type = 'message_scheduled'),
    count(*) filter (where e.event_type = 'message_delivered'),
    count(*) filter (where e.event_type = 'email_opened'),
    count(*) filter (where e.event_type = 'link_clicked'),
    count(distinct e.contact_id) filter (where e.event_type = 'link_clicked'),
    count(*) filter (where e.event_type = 'attachment_viewed'),
    count(*) filter (where e.event_type = 'reply_received'),
    count(*) filter (where e.event_type = 'booking_created'),
    count(*) filter (where e.event_type = 'opted_out'),
    count(*) filter (where e.event_type = 'message_failed')
  from public.engagement_events e
  where e.workspace_id = p_workspace_id
    and e.occurred_at >= p_start
    and e.occurred_at <  p_end;
$$;

grant execute on function public.workspace_week_stats(uuid, timestamptz, timestamptz) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.tracked_links      enable row level security;
alter table public.engagement_events  enable row level security;
alter table public.inbound_webhooks   enable row level security;

drop policy if exists tracked_links_select on public.tracked_links;
create policy tracked_links_select on public.tracked_links
  for select to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists engagement_events_select on public.engagement_events;
create policy engagement_events_select on public.engagement_events
  for select to authenticated
  using (public.is_workspace_member(workspace_id));

-- Dead-letter queue is an agency-admin debugging surface.
drop policy if exists inbound_webhooks_select on public.inbound_webhooks;
create policy inbound_webhooks_select on public.inbound_webhooks
  for select to authenticated
  using (public.is_agency_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket for campaign attachments. Private: files are only ever served
-- through the tokenized viewer route using a signed URL minted server-side.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('campaign-attachments', 'campaign-attachments', false)
on conflict (id) do nothing;

drop policy if exists "campaign attachments readable by workspace members"
  on storage.objects;
create policy "campaign attachments readable by workspace members"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'campaign-attachments'
    and public.is_workspace_member(nullif(split_part(name, '/', 1), '')::uuid)
  );

drop policy if exists "campaign attachments writable by workspace writers"
  on storage.objects;
create policy "campaign attachments writable by workspace writers"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'campaign-attachments'
    and public.can_write_workspace(nullif(split_part(name, '/', 1), '')::uuid)
  );
