#!/usr/bin/env bash
# Applies the Selestial v2 migrations to a throwaway Postgres database and runs
# the workspace-isolation test against them. Requires a local Postgres 14+.
#
#   ./scripts/db-test.sh
#
# Set PSQL_SUPERUSER if your superuser is not `postgres`.
set -euo pipefail

cd "$(dirname "$0")/.."

DB_NAME="${DB_NAME:-selestial_v2_test}"
PSQL_SUPERUSER="${PSQL_SUPERUSER:-postgres}"

run() { sudo -u "$PSQL_SUPERUSER" "$@"; }

echo "==> recreating $DB_NAME"
run dropdb --if-exists "$DB_NAME"
run createdb "$DB_NAME"

apply() {
  echo "==> $1"
  run psql -v ON_ERROR_STOP=1 -q -d "$DB_NAME" -f "$1" 2>&1 | grep -v 'does not exist, skipping' || true
}

apply supabase/tests/shim.sql
for f in supabase/migrations/20260726*_v2_*.sql; do
  apply "$f"
done

echo "==> running isolation test"
run psql -v ON_ERROR_STOP=1 -q -d "$DB_NAME" -f supabase/tests/rls_isolation_test.sql

echo "==> running invariants test"
run psql -v ON_ERROR_STOP=1 -q -d "$DB_NAME" -f supabase/tests/invariants_test.sql

echo "==> re-applying migrations (must be a no-op)"
for f in supabase/migrations/20260726*_v2_*.sql; do
  run psql -v ON_ERROR_STOP=1 -q -d "$DB_NAME" -f "$f" > /dev/null 2>&1 \
    || { echo "FAIL: re-applying $f is not idempotent"; exit 1; }
done

echo "==> conflict guard (separate database, no v2 tables)"
GUARD_DB="${DB_NAME}_guard"
run dropdb --if-exists "$GUARD_DB"
run createdb "$GUARD_DB"
run psql -v ON_ERROR_STOP=1 -q -d "$GUARD_DB" -f supabase/tests/shim.sql > /dev/null 2>&1
run psql -v ON_ERROR_STOP=1 -q -d "$GUARD_DB" -f supabase/migrations/20260726000100_v2_workspaces_core.sql > /dev/null 2>&1
run psql -v ON_ERROR_STOP=1 -q -d "$GUARD_DB" -f supabase/tests/conflict_guard_test.sql
run dropdb --if-exists "$GUARD_DB"

echo "==> OK"
