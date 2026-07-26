-- Minimal Supabase shim so the v2 migrations can be applied against a stock
-- Postgres for syntax/constraint verification in CI or locally.
--   createdb selestial_v2_test
--   psql -d selestial_v2_test -f supabase/tests/shim.sql
--   psql -d selestial_v2_test -f supabase/migrations/20260726000100_v2_workspaces_core.sql
--   ... (parts 2 and 3)
--   psql -d selestial_v2_test -f supabase/tests/rls_isolation_test.sql

create extension if not exists "pgcrypto";

create schema if not exists auth;
create schema if not exists storage;

create table if not exists auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text
);

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create table if not exists storage.buckets (
  id     text primary key,
  name   text not null,
  public boolean not null default false
);

create table if not exists storage.objects (
  id        uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name      text
);

alter table storage.objects enable row level security;

do $$ begin create role anon; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated; exception when duplicate_object then null; end $$;
do $$ begin create role service_role; exception when duplicate_object then null; end $$;
