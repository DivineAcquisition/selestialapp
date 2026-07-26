-- =============================================================================
-- Selestial v2 — table-name conflict guard
-- =============================================================================
-- Reproduces a real case: a live Selestial database has a `contacts` table with
-- an unrelated nine-column shape that does not appear in the generated types
-- file. Without the guard, `create table if not exists` skips creation and v2
-- goes on to index and write a table it does not own.
--
-- Run against a database where the v2 migrations have NOT been applied.
-- =============================================================================

create schema if not exists conflict_test;

-- The real shape, copied from the live database.
create table if not exists public.contacts (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz,
  updated_at        timestamptz,
  address           text,
  last_contacted_at timestamptz,
  last_response     timestamptz,
  lifetime_value    numeric,
  booking_count     integer,
  last_contacted    timestamptz
);

do $$
declare
  v_message text;
begin
  begin
    perform public.v2_assert_no_table_conflicts(
      array['contacts', 'campaigns'],
      array['workspace_id', 'workspace_id']
    );
    raise exception 'FAIL: the guard did not fire on a conflicting contacts table';
  exception when others then
    get stacked diagnostics v_message = message_text;

    if v_message like 'FAIL:%' then
      raise exception '%', v_message;
    end if;

    if v_message not like '%contacts%' then
      raise exception 'FAIL: the guard fired but did not name the conflicting table: %', v_message;
    end if;

    if v_message not like '%aborted%' then
      raise exception 'FAIL: the guard message does not say the migration aborted: %', v_message;
    end if;
  end;

  raise notice 'conflict guard fires on a foreign table: PASS';
end $$;

-- A name that is simply free must not trip the guard.
do $$
begin
  perform public.v2_assert_no_table_conflicts(
    array['definitely_not_a_real_table_name'],
    array['workspace_id']
  );
  raise notice 'guard ignores free names: PASS';
end $$;

-- Re-running the migrations against a database where v2 is already installed
-- must stay a no-op: the marker column is present, so there is no conflict.
do $$
begin
  create table if not exists conflict_test.probe (workspace_id uuid);

  -- Simulate the already-installed case using a public table v2 does own.
  create table if not exists public.v2_guard_probe (workspace_id uuid);
  perform public.v2_assert_no_table_conflicts(
    array['v2_guard_probe'],
    array['workspace_id']
  );
  drop table public.v2_guard_probe;

  raise notice 'guard is a no-op when v2 already owns the table: PASS';
end $$;

drop table public.contacts;
drop schema conflict_test cascade;
