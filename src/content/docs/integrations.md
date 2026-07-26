---
title: Integrations and environment
description: Every external system, what it needs, and what breaks without it.
category: Operations
order: 4
---

# Integrations and environment

Live status for all of these is at **Agency → Integrations**.

## GoHighLevel

Carries SMS and inbound replies. Sending through each client's own sub-account is the
whole point: replies land in the inbox they already work out of, and their existing
automations can react to our tags.

Three auth modes, tried in this order:

| Mode | Variables | Capability |
| --- | --- | --- |
| **OAuth** (target) | `GHL_CLIENT_ID`, `GHL_CLIENT_SECRET`, `GHL_AGENCY_COMPANY_ID` | Everything. Agency token for company calls, per-location tokens minted on demand. |
| Legacy agency key | `GHL_AGENCY_API_KEY` | Sub-account CRUD only, on the v1 API |
| Private integration token | `GHL_PRIVATE_INTEGRATION_TOKEN` | Location-scoped calls against one sub-account |

Connect OAuth at **Agency → Integrations → Connect the agency**. The redirect URI must
match `GHL_OAUTH_REDIRECT_URI` exactly, including protocol and trailing path.

Optional: `GHL_DEFAULT_SNAPSHOT_ID` to install a snapshot into every new sub-account;
`GHL_WEBHOOK_PUBLIC_KEY` to verify inbound signatures;
`GHL_WEBHOOK_REQUIRE_SIGNATURE=true` to reject unsigned payloads;
`GHL_WEBHOOK_APP_CONFIGURED=true` once the marketplace app is subscribed.

**Without it:** no SMS, no reply detection, no booking events. Email campaigns still work.

## Resend

Carries campaign email and platform mail.

- `RESEND_API_KEY` — required to send
- `RESEND_WEBHOOK_SECRET` — signing secret, so delivery, open, click, bounce and complaint
  events can be trusted
- `SELESTIAL_SENDING_DOMAIN` — the shared sending domain, default `mail.selestial.io`
- `SELESTIAL_PLATFORM_FROM` — from-address for invites and operator mail

**Without it:** no email sends, no invites. SMS campaigns still work.

## Anthropic

Writes the campaign sequences and the case-file summaries.

- `ANTHROPIC_API_KEY` — required
- `SELESTIAL_GENERATION_MODEL` — sequence generation, defaults to a Sonnet model
- `SELESTIAL_SUMMARY_MODEL` — summaries and per-contact personalization, defaults to Haiku

**Without it:** campaigns fall back to a built-in sequence and are flagged so you can
regenerate later. Case files fall back to a deterministic summary. Nothing stops.

## Supabase

Database, auth and storage.

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client and session
- `SUPABASE_SERVICE_ROLE_KEY` — **required** for v2. Webhook intake, cron dispatch and
  provisioning write to tables that are intentionally unwritable under RLS, so the anon key
  is not a valid substitute here.

## Scheduling

- `CRON_SECRET` — **required**. Without it the cron endpoints return 503 rather than
  running unauthenticated, because they send real messages to real people.

Two jobs, configured in `vercel.json`:

- `/api/cron/dispatch` every 5 minutes — sends what is due
- `/api/cron/maintenance` hourly — refreshes stale case-file summaries, closes finished
  campaigns, retries failed webhooks

They are separate so a slow model call in maintenance can never delay a send.

## URLs

- `NEXT_PUBLIC_APP_URL` — used in invites, webhook endpoint display and link generation
- `NEXT_PUBLIC_LINK_BASE_URL` — the tracked-link host. Point it at something short like
  `go.selestial.io`: in SMS, every character of domain is a character not spent on the
  message.

## Tuning

- `SELESTIAL_DISPATCH_BATCH` — messages per dispatch tick, default 100
- `GHL_BURST_LIMIT` — our own ceiling on GHL calls per 10s window, default 90
- `SELESTIAL_DEFAULT_COUNTRY_CODE` — phone normalization default, `1`

## What still runs from v1

Stripe (the onboarding funnel), Twilio (the v1 SMS path) and the v1 booking widget are
untouched by v2 and keep working. v2 does not use them: reactivation SMS goes through
GoHighLevel, not Twilio.
