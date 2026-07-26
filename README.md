# Selestial

A multi-workspace reactivation engine. One workspace is one client is one GoHighLevel
sub-account. Dormant customer lists come in; generated SMS and email campaigns go out
through the client's own sub-account and our Resend domain; every click, reply and booking
lands in one event log that every dashboard reads from.

The operator's job is upload a list, pick a campaign, launch. Nothing else.

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — data model, module map, request paths
- **[INTEGRATIONS.md](./INTEGRATIONS.md)** — GoHighLevel, Resend, Anthropic, Supabase
- **`/docs`** in the running app — operator and client documentation, written as markdown
  in `src/content/docs`

## Running it

```bash
npm install
cp .env.example .env.local   # then fill it in
npm run dev
```

The v2 surfaces are `/w/[slug]` for a client workspace and `/agency` for the operator
view. Signing in as a user with a workspace lands you in it automatically.

### Database

The v2 schema is three additive migrations in `supabase/migrations/20260726*`. They do not
drop or alter anything from v1. Apply them with the Supabase CLI or by running them in
order against your project.

Give yourself operator access by inserting your user id into `agency_admins`.

## Checks

```bash
npm test          # 49 unit tests over the pure modules
npm run test:db   # applies the migrations to a throwaway Postgres and tests them
npm run typecheck
npm run lint
npm run build
```

`npm run test:db` needs a local Postgres 14+. It creates a scratch database, applies a
minimal Supabase shim plus the v2 migrations, then asserts two things:

- **Isolation** — a client in workspace A reads zero rows from workspace B on every table,
  GHL tokens are invisible to all non-service roles, anonymous sees nothing, and RLS is
  enabled on all 23 v2 tables.
- **Invariants** — the constraints the application relies on for safety: a retried launch
  cannot double-schedule, a webhook retry cannot double-count, a concurrent import merges
  rather than duplicating, and `workspace_week_stats` counts what it claims to.

## Environment

`.env.example` is annotated. The minimum for v2 is Supabase (including the service role
key), `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY` and the
GoHighLevel OAuth credentials.

Two cron jobs are configured in `vercel.json`: `/api/cron/dispatch` every five minutes to
send what is due, and `/api/cron/maintenance` hourly for case-file summaries, campaign
completion and webhook retries.

## What v1 left behind

v1 was a single-business CRM: booking widget, quotes, Twilio SMS, Stripe funnel. All of it
still works and none of it was deleted. v2 lives alongside it under new routes and new
tables. See [docs/V2_REPO_AUDIT.md](./docs/V2_REPO_AUDIT.md) for the map of what existed
before and what v2 reuses.
