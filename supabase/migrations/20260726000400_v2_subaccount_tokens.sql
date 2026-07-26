-- =============================================================================
-- Selestial v2 — per-sub-account GoHighLevel credentials
-- =============================================================================
-- The agency credential exists to create sub-accounts and nothing else. Each
-- workspace then holds its own sub-account Private Integration Token, entered by
-- the client or the operator, and every location-scoped call for that workspace
-- uses it.
--
-- This matches how GHL actually issues PITs — they are location-level constructs —
-- and it means one client's credential cannot reach another client's sub-account.
-- =============================================================================

alter table public.ghl_oauth_tokens
  add column if not exists source text not null default 'oauth',
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists label text,
  add column if not exists last_verified_at timestamptz,
  add column if not exists verified_capabilities jsonb;

do $$ begin
  alter table public.ghl_oauth_tokens
    add constraint ghl_oauth_tokens_source_check check (source in ('oauth', 'pit'));
exception when duplicate_object then null; end $$;

-- A stored sub-account token has no refresh cycle, so `refresh_token` and
-- `expires_at` stay null for source = 'pit'. The existing partial unique index on
-- location_id already guarantees one credential per sub-account.
create index if not exists ghl_oauth_tokens_workspace_idx
  on public.ghl_oauth_tokens(workspace_id)
  where workspace_id is not null;

comment on column public.ghl_oauth_tokens.source is
  'oauth = minted through the agency OAuth install; pit = a sub-account Private '
  'Integration Token pasted in by the client or operator.';

-- The token table has no RLS policies at all, so credentials stay invisible to every
-- non-service role. The UI still needs to show whether a sub-account token is stored
-- and what it can do, so that is exposed through this function instead.
--
-- Security definer, because it has to read a table the caller cannot. That makes the
-- membership check inside it load-bearing rather than decorative: without it, any
-- authenticated user could ask about any workspace. It returns status only — the token
-- itself is never selected.
create or replace function public.workspace_ghl_credential_status(p_workspace_id uuid)
returns table (
  has_token             boolean,
  source                text,
  label                 text,
  last_verified_at      timestamptz,
  verified_capabilities jsonb,
  token_updated_at      timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'Not authorized to read credential status for this workspace'
      using errcode = 'insufficient_privilege';
  end if;

  return query
  select
    (t.id is not null),
    t.source,
    t.label,
    t.last_verified_at,
    t.verified_capabilities,
    t.updated_at
  from public.workspaces w
  left join public.ghl_oauth_tokens t
    on t.scope_type = 'location'
   and t.location_id = w.ghl_location_id
  where w.id = p_workspace_id;
end;
$$;

grant execute on function public.workspace_ghl_credential_status(uuid) to authenticated;
