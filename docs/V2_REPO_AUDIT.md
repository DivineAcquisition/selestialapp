# Selestial v1 → v2: Repo Audit

Written before any v2 code was added. This is the map of what already existed, what
v2 reuses, and what v2 replaces.

## Stack as found

| Concern | What exists |
| --- | --- |
| Framework | Next.js 16.1.1 (App Router), React 19.2, TypeScript 5, Turbopack-era config |
| Styling | Tailwind v4 (`@tailwindcss/postcss`), shadcn/ui "new-york" / zinc base, brand violet `#6428F9` in `src/app/globals.css` |
| Data | Supabase (Postgres + Auth + Storage). `@supabase/ssr` cookie clients + a lazy service-role admin client |
| Email | Resend `^6.6.0`, wired through `src/lib/email/resend.ts` and `/api/email/*` with React Email templates |
| SMS | Twilio `^5.11.1` via `/api/sms/send` and an unverified inbound webhook |
| AI | `@anthropic-ai/sdk` (`claude-3-haiku-20240307`) used only for inbox smart replies; `openai` installed |
| Payments | Stripe (subscription checkout for the $297/mo onboarding funnel, plus Connect) |
| Hosting | Vercel (`vercel.json` is framework-only, no crons) |

## Routing / domains

`src/middleware.ts` splits traffic by subdomain: `app` (authenticated SaaS), `docs`,
`access` (marketing funnel), `book` (booking widget), `paylink`. The matcher **excludes
`/api`**, so every API route does its own auth. Protected app prefixes are enumerated in
a `protectedPrefixes` array.

App surface today is a single-business CRM: `/inbox`, `/quotes`, `/customers`,
`/sequences`, `/retention`, `/campaigns`, `/analytics`, `/bookings`, `/payments`,
`/pricing`, `/settings`, plus a large public booking funnel under `/book/[businessId]`.

## Tenancy as found

One user → one business. `BusinessProvider` resolves the tenant with
`businesses.select('*').eq('user_id', user.id).maybeSingle()`, and effectively every
table is scoped by `business_id`. There is no workspace concept, no membership table, and
no way for one operator to hold many clients.

RLS in `supabase/migrations/` is inconsistent: the older cleaning/booking migrations test
`businesses.owner_id`, while the newer ones and the `is_business_owner()` helper test
`businesses.user_id`. The generated types only expose `user_id`.

## Schema drift (important)

`src/integrations/supabase/types.ts` lists **148 tables** in `public`, but
`supabase/migrations/` only creates ~35 of them — almost all cleaning/booking widget
tables. Core tables (`businesses`, `customers`, `quotes`, `messages`, `sequences`,
`seasonal_campaigns`, `activity_logs`, `message_queue`, `provisioning_jobs`,
`short_links`, `shortlinks`, `webhook_events`, …) exist in the live database with no
CREATE migration in the repo.

**Consequence for v2:** any new table must not collide with a name already live in the
database, and the v2 migration must be additive only. v2 therefore claims previously
unused names (`workspaces`, `contacts`, `campaigns`, `engagement_events`,
`outreach_messages`, `tracked_links`, `workspace_activity`, …) and never drops or alters
a v1 table.

## Pieces v2 reuses

- **Supabase client patterns** — `createServerSupabaseClient()` (cookies/RLS) and
  `getSupabaseAdmin()` (service role, lazily constructed so builds survive missing env).
- **Resend** — the SDK wiring and `isResendConfigured()` guard; v2 adds per-workspace
  sending identities on top instead of the single hardcoded `EMAIL_FROM`.
- **Anthropic SDK** — already a dependency; v2 adds a real generation pipeline beside the
  existing `generateSmartReplies`.
- **GHL clients** — `src/lib/integrations/ghl/client.ts` (per-location Private Integration
  Token, `services.leadconnectorhq.com`, 3 endpoints, no retries/logging) and
  `src/lib/integrations/ghl/agency.ts` (agency API key, v1 `rest.gohighlevel.com`,
  location create/list/delete + per-location key mint). v2 keeps these working as fallback
  auth modes but routes everything through a new module that adds OAuth, retries, rate
  limiting, and logging.
- **shadcn/ui component library** and the existing brand tokens.
- **Storage** — the `pricing-docs` bucket pattern is the template for the v2
  `campaign-attachments` bucket.

## Pieces v2 replaces

| v1 | v2 |
| --- | --- |
| `businesses` (1 user : 1 business) | `workspaces` + `workspace_members` + `agency_admins` |
| `customers` | `contacts` (workspace-scoped, with case files) |
| `seasonal_campaigns` + `campaign_recipients` | `campaigns` + `campaign_touches` + `campaign_enrollments` |
| `sequences` / `retention_sequences` / static `src/lib/sequences/templates.ts` | AI-generated `campaign_touches`, no hand-written copy |
| `message_queue` + `messages` | `outreach_messages` (row is both the queue entry and the audit record) |
| `short_links` / `shortlinks` | `tracked_links` (per contact per message per destination) |
| `activity_logs` | `workspace_activity` |
| Twilio SMS | GHL conversations API (replies land where the client already works) |
| Hardcoded React `/docs` pages | markdown files in `src/content/docs` rendered by a catch-all route |

Nothing in v1 is deleted. The v1 routes keep working; v2 lives under `/w/[slug]` and
`/agency` so both can be served while clients migrate.
