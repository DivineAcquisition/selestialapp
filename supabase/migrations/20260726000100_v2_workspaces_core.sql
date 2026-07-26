-- =============================================================================
-- Selestial v2 — Part 1: workspaces, membership, RLS primitives, GHL plumbing
-- =============================================================================
-- Additive only. No v1 table is dropped or altered. Every v2 table lives in
-- `public` under a name that is not already in use by the v1 schema.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type workspace_status as enum ('onboarding', 'active', 'paused', 'churned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type workspace_role as enum ('agency_admin', 'client_owner', 'client_staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type provisioning_status as enum ('pending', 'running', 'succeeded', 'failed', 'skipped');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- agency_admins — global operator allowlist (Malik's view)
-- ---------------------------------------------------------------------------
create table if not exists public.agency_admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- workspaces — one workspace = one client = one GHL sub-account
-- ---------------------------------------------------------------------------
create table if not exists public.workspaces (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text not null unique,
  status              workspace_status not null default 'onboarding',

  -- GHL sub-account linkage
  ghl_location_id     text unique,
  ghl_metadata        jsonb not null default '{}'::jsonb,
  ghl_custom_fields   jsonb not null default '{}'::jsonb,  -- our field key -> GHL field id
  ghl_connected_at    timestamptz,

  -- Business profile (feeds message generation)
  owner_name          text,
  email               text,
  phone               text,
  website             text,
  timezone            text not null default 'America/Chicago',
  service_area        text,
  service_types       text[] not null default '{}',
  business_profile    jsonb not null default '{}'::jsonb,  -- tone, positioning, offer, notes

  -- Compliance / sending
  physical_address    text,
  booking_url         text,

  -- Light white-labeling
  logo_url            text,
  primary_color       text default '#6428F9',

  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists workspaces_status_idx on public.workspaces(status);

-- ---------------------------------------------------------------------------
-- workspace_members
-- ---------------------------------------------------------------------------
create table if not exists public.workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          workspace_role not null default 'client_staff',
  created_at    timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index if not exists workspace_members_user_idx on public.workspace_members(user_id);

-- ---------------------------------------------------------------------------
-- workspace_invites
-- ---------------------------------------------------------------------------
create table if not exists public.workspace_invites (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  email         text not null,
  role          workspace_role not null default 'client_owner',
  token         text not null unique,
  invited_by    uuid references auth.users(id) on delete set null,
  expires_at    timestamptz not null default (now() + interval '14 days'),
  accepted_at   timestamptz,
  accepted_by   uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists workspace_invites_email_idx on public.workspace_invites(lower(email));

-- ---------------------------------------------------------------------------
-- RLS helper functions
-- ---------------------------------------------------------------------------
create or replace function public.is_agency_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.agency_admins a where a.user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_agency_admin()
    or exists (
      select 1
      from public.workspace_members m
      where m.workspace_id = p_workspace_id
        and m.user_id = auth.uid()
    );
$$;

create or replace function public.can_write_workspace(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_agency_admin()
    or exists (
      select 1
      from public.workspace_members m
      where m.workspace_id = p_workspace_id
        and m.user_id = auth.uid()
        and m.role in ('agency_admin', 'client_owner')
    );
$$;

grant execute on function public.is_agency_admin() to authenticated;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.can_write_workspace(uuid) to authenticated;

-- updated_at trigger helper (v2-specific name to avoid clashing with v1 helpers)
create or replace function public.v2_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workspaces_touch_updated_at on public.workspaces;
create trigger workspaces_touch_updated_at
  before update on public.workspaces
  for each row execute function public.v2_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Provisioning steps — idempotent, per-step retryable
-- ---------------------------------------------------------------------------
create table if not exists public.workspace_provisioning_steps (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  step_key      text not null,
  label         text not null,
  position      int  not null default 0,
  status        provisioning_status not null default 'pending',
  attempts      int not null default 0,
  result        jsonb,
  error         text,
  started_at    timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (workspace_id, step_key)
);

create index if not exists provisioning_steps_ws_idx
  on public.workspace_provisioning_steps(workspace_id, position);

drop trigger if exists provisioning_steps_touch_updated_at on public.workspace_provisioning_steps;
create trigger provisioning_steps_touch_updated_at
  before update on public.workspace_provisioning_steps
  for each row execute function public.v2_touch_updated_at();

-- ---------------------------------------------------------------------------
-- integration_logs — every outbound call to an external system
-- ---------------------------------------------------------------------------
create table if not exists public.integration_logs (
  id               bigserial primary key,
  workspace_id     uuid references public.workspaces(id) on delete set null,
  provider         text not null,            -- ghl | resend | anthropic
  operation        text not null,            -- logical name, e.g. contacts.upsert
  method           text,
  endpoint         text,
  request_summary  jsonb,
  status_code      int,
  ok               boolean not null default false,
  response_summary jsonb,
  error            text,
  duration_ms      int,
  attempt          int not null default 1,
  idempotency_key  text,
  created_at       timestamptz not null default now()
);

create index if not exists integration_logs_ws_created_idx
  on public.integration_logs(workspace_id, created_at desc);
create index if not exists integration_logs_provider_idx
  on public.integration_logs(provider, created_at desc);

-- ---------------------------------------------------------------------------
-- ghl_oauth_tokens — agency token + per-location tokens
-- ---------------------------------------------------------------------------
create table if not exists public.ghl_oauth_tokens (
  id             uuid primary key default gen_random_uuid(),
  scope_type     text not null check (scope_type in ('agency', 'location')),
  location_id    text,
  company_id     text,
  access_token   text not null,
  refresh_token  text,
  expires_at     timestamptz,
  scopes         text,
  user_type      text,
  raw            jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index if not exists ghl_oauth_tokens_agency_uniq
  on public.ghl_oauth_tokens(scope_type)
  where scope_type = 'agency';

create unique index if not exists ghl_oauth_tokens_location_uniq
  on public.ghl_oauth_tokens(location_id)
  where scope_type = 'location';

drop trigger if exists ghl_oauth_tokens_touch_updated_at on public.ghl_oauth_tokens;
create trigger ghl_oauth_tokens_touch_updated_at
  before update on public.ghl_oauth_tokens
  for each row execute function public.v2_touch_updated_at();

-- ---------------------------------------------------------------------------
-- workspace_activity — human-readable audit trail (self-documentation layer)
-- ---------------------------------------------------------------------------
create table if not exists public.workspace_activity (
  id           bigserial primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  actor_type   text not null default 'system',  -- user | system | webhook
  actor_id     uuid references auth.users(id) on delete set null,
  actor_label  text,
  action       text not null,                   -- machine key, e.g. campaign.generated
  summary      text not null,                   -- human-readable sentence
  entity_type  text,
  entity_id    text,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists workspace_activity_ws_created_idx
  on public.workspace_activity(workspace_id, created_at desc);
create index if not exists workspace_activity_action_idx
  on public.workspace_activity(action);

-- ---------------------------------------------------------------------------
-- sending_identities — per-workspace Resend from-identity
-- ---------------------------------------------------------------------------
create table if not exists public.sending_identities (
  id                 uuid primary key default gen_random_uuid(),
  workspace_id       uuid not null references public.workspaces(id) on delete cascade,
  from_name          text not null,
  from_email         text not null,
  reply_to           text,
  domain             text,
  resend_domain_id   text,
  dkim_status        text not null default 'pending',
  verified           boolean not null default false,
  is_shared_domain   boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (workspace_id)
);

drop trigger if exists sending_identities_touch_updated_at on public.sending_identities;
create trigger sending_identities_touch_updated_at
  before update on public.sending_identities
  for each row execute function public.v2_touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.agency_admins                  enable row level security;
alter table public.workspaces                     enable row level security;
alter table public.workspace_members              enable row level security;
alter table public.workspace_invites              enable row level security;
alter table public.workspace_provisioning_steps   enable row level security;
alter table public.integration_logs               enable row level security;
alter table public.ghl_oauth_tokens               enable row level security;
alter table public.workspace_activity             enable row level security;
alter table public.sending_identities             enable row level security;

-- agency_admins: readable by agency admins only; writes are service-role only.
drop policy if exists agency_admins_select on public.agency_admins;
create policy agency_admins_select on public.agency_admins
  for select to authenticated
  using (public.is_agency_admin() or user_id = auth.uid());

-- workspaces
drop policy if exists workspaces_select on public.workspaces;
create policy workspaces_select on public.workspaces
  for select to authenticated
  using (public.is_workspace_member(id));

drop policy if exists workspaces_insert on public.workspaces;
create policy workspaces_insert on public.workspaces
  for insert to authenticated
  with check (public.is_agency_admin());

drop policy if exists workspaces_update on public.workspaces;
create policy workspaces_update on public.workspaces
  for update to authenticated
  using (public.can_write_workspace(id))
  with check (public.can_write_workspace(id));

drop policy if exists workspaces_delete on public.workspaces;
create policy workspaces_delete on public.workspaces
  for delete to authenticated
  using (public.is_agency_admin());

-- workspace_members: a user can always see their own memberships (this is what the
-- is_workspace_member() lookup needs) plus every row in workspaces they belong to.
drop policy if exists workspace_members_select on public.workspace_members;
create policy workspace_members_select on public.workspace_members
  for select to authenticated
  using (user_id = auth.uid() or public.is_workspace_member(workspace_id));

drop policy if exists workspace_members_write on public.workspace_members;
create policy workspace_members_write on public.workspace_members
  for all to authenticated
  using (public.can_write_workspace(workspace_id))
  with check (public.can_write_workspace(workspace_id));

-- workspace_invites
drop policy if exists workspace_invites_all on public.workspace_invites;
create policy workspace_invites_all on public.workspace_invites
  for all to authenticated
  using (public.can_write_workspace(workspace_id))
  with check (public.can_write_workspace(workspace_id));

-- provisioning steps
drop policy if exists provisioning_steps_select on public.workspace_provisioning_steps;
create policy provisioning_steps_select on public.workspace_provisioning_steps
  for select to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists provisioning_steps_write on public.workspace_provisioning_steps;
create policy provisioning_steps_write on public.workspace_provisioning_steps
  for all to authenticated
  using (public.is_agency_admin())
  with check (public.is_agency_admin());

-- integration logs: read-only for members, written by the service role
drop policy if exists integration_logs_select on public.integration_logs;
create policy integration_logs_select on public.integration_logs
  for select to authenticated
  using (workspace_id is not null and public.is_workspace_member(workspace_id));

-- GHL tokens: never readable from the client. No policies => service role only.

-- workspace activity
drop policy if exists workspace_activity_select on public.workspace_activity;
create policy workspace_activity_select on public.workspace_activity
  for select to authenticated
  using (workspace_id is not null and public.is_workspace_member(workspace_id));

-- sending identities
drop policy if exists sending_identities_select on public.sending_identities;
create policy sending_identities_select on public.sending_identities
  for select to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists sending_identities_write on public.sending_identities;
create policy sending_identities_write on public.sending_identities
  for all to authenticated
  using (public.can_write_workspace(workspace_id))
  with check (public.can_write_workspace(workspace_id));
