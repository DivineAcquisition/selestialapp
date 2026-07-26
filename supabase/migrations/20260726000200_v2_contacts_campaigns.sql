-- =============================================================================
-- Selestial v2 — Part 2: contacts, lists/imports, campaigns, sequence, messages
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type contact_status as enum ('active', 'opted_out', 'do_not_contact', 'booked', 'bounced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type outreach_channel as enum ('sms', 'email');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_kind as enum ('reactivation', 'winback', 'referral', 'review');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_state as enum
    ('draft', 'generating', 'ready', 'launching', 'active', 'paused', 'completed', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type enrollment_state as enum ('active', 'completed', 'exited', 'suppressed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type outreach_message_state as enum
    ('scheduled', 'sending', 'sent', 'delivered', 'failed', 'skipped', 'canceled');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- contacts — the case-file subject
-- ---------------------------------------------------------------------------
create table if not exists public.contacts (
  id                    uuid primary key default gen_random_uuid(),
  workspace_id          uuid not null references public.workspaces(id) on delete cascade,

  first_name            text,
  last_name             text,
  full_name             text,
  email                 text,
  phone                 text,          -- E.164
  phone_raw             text,

  address               text,
  city                  text,
  state                 text,
  postal_code           text,
  timezone              text,

  -- service history
  last_service_date     date,
  service_type          text,
  lifetime_value_cents  bigint,
  source_list_id        uuid,          -- FK added after contact_lists exists
  imported_notes        text,
  custom_fields         jsonb not null default '{}'::jsonb,

  -- status + compliance
  status                contact_status not null default 'active',
  opted_out_at          timestamptz,
  opted_out_channel     text,
  opted_out_reason      text,
  do_not_contact        boolean not null default false,
  booked_at             timestamptz,
  email_bounced_at      timestamptz,

  -- engagement
  engagement_score      int not null default 0,
  engagement_tier       text not null default 'cold',
  last_engagement_at    timestamptz,
  last_contacted_at     timestamptz,

  -- case file
  ai_summary            text,
  ai_summary_updated_at timestamptz,
  ai_summary_stale      boolean not null default true,

  -- mirror
  ghl_contact_id        text,
  ghl_synced_at         timestamptz,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create unique index if not exists contacts_ws_phone_uniq
  on public.contacts(workspace_id, phone) where phone is not null;
create unique index if not exists contacts_ws_email_uniq
  on public.contacts(workspace_id, lower(email)) where email is not null;
create index if not exists contacts_ws_status_idx on public.contacts(workspace_id, status);
create index if not exists contacts_ws_score_idx on public.contacts(workspace_id, engagement_score desc);
create index if not exists contacts_ghl_idx on public.contacts(ghl_contact_id) where ghl_contact_id is not null;
create index if not exists contacts_summary_stale_idx
  on public.contacts(workspace_id) where ai_summary_stale;

drop trigger if exists contacts_touch_updated_at on public.contacts;
create trigger contacts_touch_updated_at
  before update on public.contacts
  for each row execute function public.v2_touch_updated_at();

-- ---------------------------------------------------------------------------
-- contact_lists — one uploaded list, always attached to exactly one campaign
-- ---------------------------------------------------------------------------
create table if not exists public.contact_lists (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references public.workspaces(id) on delete cascade,
  campaign_id      uuid,                 -- FK added after campaigns exists
  name             text not null,
  source_filename  text,
  status           text not null default 'importing',  -- importing | ready | failed
  column_mapping   jsonb not null default '{}'::jsonb,
  stats            jsonb not null default '{}'::jsonb, -- {rows, imported, merged, rejected}
  imported_by      uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists contact_lists_ws_idx on public.contact_lists(workspace_id, created_at desc);

drop trigger if exists contact_lists_touch_updated_at on public.contact_lists;
create trigger contact_lists_touch_updated_at
  before update on public.contact_lists
  for each row execute function public.v2_touch_updated_at();

alter table public.contacts
  drop constraint if exists contacts_source_list_fk;
alter table public.contacts
  add constraint contacts_source_list_fk
  foreign key (source_list_id) references public.contact_lists(id) on delete set null;

create table if not exists public.contact_list_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  list_id       uuid not null references public.contact_lists(id) on delete cascade,
  contact_id    uuid not null references public.contacts(id) on delete cascade,
  was_merged    boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (list_id, contact_id)
);

create index if not exists contact_list_members_contact_idx
  on public.contact_list_members(contact_id);

create table if not exists public.import_rejects (
  id            bigserial primary key,
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  list_id       uuid not null references public.contact_lists(id) on delete cascade,
  row_number    int,
  reason        text not null,
  raw           jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists import_rejects_list_idx on public.import_rejects(list_id);

-- ---------------------------------------------------------------------------
-- contact_notes — freeform + system-written
-- ---------------------------------------------------------------------------
create table if not exists public.contact_notes (
  id            bigserial primary key,
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  contact_id    uuid not null references public.contacts(id) on delete cascade,
  kind          text not null default 'user',   -- user | system
  body          text not null,
  author_id     uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists contact_notes_contact_idx
  on public.contact_notes(contact_id, created_at desc);

-- ---------------------------------------------------------------------------
-- saved_segments
-- ---------------------------------------------------------------------------
create table if not exists public.saved_segments (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  name          text not null,
  filters       jsonb not null default '{}'::jsonb,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists saved_segments_ws_idx on public.saved_segments(workspace_id);

-- ---------------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------------
create table if not exists public.campaigns (
  id                  uuid primary key default gen_random_uuid(),
  workspace_id        uuid not null references public.workspaces(id) on delete cascade,
  name                text not null,
  kind                campaign_kind not null default 'reactivation',
  status              campaign_state not null default 'draft',
  channel_mix         text not null default 'both' check (channel_mix in ('sms', 'email', 'both')),

  -- schedule settings
  send_window_start   int not null default 9    check (send_window_start between 0 and 23),
  send_window_end     int not null default 19   check (send_window_end between 1 and 24),
  send_days           int[] not null default '{1,2,3,4,5}',  -- ISO day-of-week, 1 = Monday
  daily_cap           int not null default 250,
  drip_spacing_hours  int not null default 72,

  -- generation
  sequence_version    int not null default 0,
  generation_meta     jsonb not null default '{}'::jsonb,  -- model, prompt_version, angle
  generation_error    text,
  offer               text,
  booking_url         text,

  launched_at         timestamptz,
  completed_at        timestamptz,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists campaigns_ws_status_idx on public.campaigns(workspace_id, status);

drop trigger if exists campaigns_touch_updated_at on public.campaigns;
create trigger campaigns_touch_updated_at
  before update on public.campaigns
  for each row execute function public.v2_touch_updated_at();

alter table public.contact_lists
  drop constraint if exists contact_lists_campaign_fk;
alter table public.contact_lists
  add constraint contact_lists_campaign_fk
  foreign key (campaign_id) references public.campaigns(id) on delete set null;

-- ---------------------------------------------------------------------------
-- campaign_attachments — tokenized-only assets
-- ---------------------------------------------------------------------------
create table if not exists public.campaign_attachments (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  campaign_id   uuid references public.campaigns(id) on delete cascade,
  name          text not null,
  description   text,
  storage_path  text not null,
  mime_type     text,
  size_bytes    bigint,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists campaign_attachments_ws_idx
  on public.campaign_attachments(workspace_id, campaign_id);

-- ---------------------------------------------------------------------------
-- campaign_touches — the generated sequence skeleton (versioned)
-- ---------------------------------------------------------------------------
create table if not exists public.campaign_touches (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references public.workspaces(id) on delete cascade,
  campaign_id      uuid not null references public.campaigns(id) on delete cascade,
  version          int not null default 1,
  step_index       int not null,
  channel          outreach_channel not null,
  delay_hours      int not null default 0,     -- offset from enrollment
  angle            text,                        -- what this touch is trying to do
  subject_template text,
  body_template    text not null,
  link_kind        text,                        -- booking | offer | attachment | null
  attachment_id    uuid references public.campaign_attachments(id) on delete set null,
  include_optout   boolean not null default false,
  generated_by     jsonb not null default '{}'::jsonb,  -- model, prompt_version
  created_at       timestamptz not null default now(),
  unique (campaign_id, version, step_index)
);

create index if not exists campaign_touches_campaign_idx
  on public.campaign_touches(campaign_id, version, step_index);

-- ---------------------------------------------------------------------------
-- campaign_enrollments
-- ---------------------------------------------------------------------------
create table if not exists public.campaign_enrollments (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references public.workspaces(id) on delete cascade,
  campaign_id      uuid not null references public.campaigns(id) on delete cascade,
  contact_id       uuid not null references public.contacts(id) on delete cascade,
  status           enrollment_state not null default 'active',
  current_step     int not null default -1,
  sequence_version int not null default 1,
  enrolled_at      timestamptz not null default now(),
  exited_at        timestamptz,
  exit_reason      text,
  unique (campaign_id, contact_id)
);

create index if not exists campaign_enrollments_status_idx
  on public.campaign_enrollments(campaign_id, status);
create index if not exists campaign_enrollments_contact_idx
  on public.campaign_enrollments(contact_id);

-- ---------------------------------------------------------------------------
-- outreach_messages — the queue AND the permanent record of what was sent
-- ---------------------------------------------------------------------------
create table if not exists public.outreach_messages (
  id                   uuid primary key default gen_random_uuid(),
  workspace_id         uuid not null references public.workspaces(id) on delete cascade,
  campaign_id          uuid not null references public.campaigns(id) on delete cascade,
  enrollment_id        uuid not null references public.campaign_enrollments(id) on delete cascade,
  contact_id           uuid not null references public.contacts(id) on delete cascade,
  touch_id             uuid references public.campaign_touches(id) on delete set null,

  step_index           int not null,
  channel              outreach_channel not null,
  status               outreach_message_state not null default 'scheduled',

  scheduled_for        timestamptz not null,
  sent_at              timestamptz,
  delivered_at         timestamptz,
  failed_at            timestamptz,

  -- exactly what went out
  subject              text,
  body                 text,
  to_address           text,
  from_address         text,
  template_version     int not null default 1,
  render_meta          jsonb not null default '{}'::jsonb,  -- model, personalized, prompt_version

  provider             text,             -- ghl | resend
  provider_message_id  text,
  attempts             int not null default 0,
  locked_at            timestamptz,
  lock_token           text,
  error                text,
  skip_reason          text,
  idempotency_key      text not null unique,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists outreach_messages_due_idx
  on public.outreach_messages(status, scheduled_for)
  where status = 'scheduled';
create index if not exists outreach_messages_ws_created_idx
  on public.outreach_messages(workspace_id, created_at desc);
create index if not exists outreach_messages_contact_idx
  on public.outreach_messages(contact_id, created_at desc);
create index if not exists outreach_messages_campaign_idx
  on public.outreach_messages(campaign_id, status);
create index if not exists outreach_messages_provider_idx
  on public.outreach_messages(provider, provider_message_id)
  where provider_message_id is not null;

drop trigger if exists outreach_messages_touch_updated_at on public.outreach_messages;
create trigger outreach_messages_touch_updated_at
  before update on public.outreach_messages
  for each row execute function public.v2_touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — read for members, writes go through the service role (server actions
-- and route handlers), except the few surfaces clients legitimately edit.
-- ---------------------------------------------------------------------------
alter table public.contacts              enable row level security;
alter table public.contact_lists         enable row level security;
alter table public.contact_list_members  enable row level security;
alter table public.import_rejects        enable row level security;
alter table public.contact_notes         enable row level security;
alter table public.saved_segments        enable row level security;
alter table public.campaigns             enable row level security;
alter table public.campaign_attachments  enable row level security;
alter table public.campaign_touches      enable row level security;
alter table public.campaign_enrollments  enable row level security;
alter table public.outreach_messages     enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'contacts', 'contact_lists', 'contact_list_members', 'import_rejects',
    'contact_notes', 'saved_segments', 'campaigns', 'campaign_attachments',
    'campaign_touches', 'campaign_enrollments', 'outreach_messages'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_workspace_member(workspace_id))',
      t || '_select', t
    );
  end loop;
end $$;

-- Client-editable surfaces
drop policy if exists contacts_update on public.contacts;
create policy contacts_update on public.contacts
  for update to authenticated
  using (public.can_write_workspace(workspace_id))
  with check (public.can_write_workspace(workspace_id));

drop policy if exists contact_notes_insert on public.contact_notes;
create policy contact_notes_insert on public.contact_notes
  for insert to authenticated
  with check (public.is_workspace_member(workspace_id) and kind = 'user');

drop policy if exists saved_segments_write on public.saved_segments;
create policy saved_segments_write on public.saved_segments
  for all to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
