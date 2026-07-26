---
title: Troubleshooting
description: The failures that actually happen, and what to do about each one.
category: Operations
order: 3
---

# Troubleshooting

## Nothing is sending

Work down this list in order.

**Is the campaign active?** A campaign sits in `ready` until someone presses Launch.
Generating a sequence does not send anything.

**Is the dispatch cron running?** Messages leave in a job that runs every five minutes.
On Vercel, check the cron log for `/api/cron/dispatch`. If `CRON_SECRET` is unset the
endpoint returns 503 by design — an open send endpoint is a way for anyone to drain a
client's queue, so it refuses to run unauthenticated rather than running unprotected.

The agency dashboard flags this as **behind schedule** when messages are more than an hour
past due.

**Is it inside the send window?** Messages are only sent between 8am and 9pm in the
recipient's local time, on the campaign's allowed days. A campaign launched Friday evening
with weekday-only sending starts Monday morning.

**Was everyone suppressed?** Check the `campaign.launched` row in the activity log. If
`enrolled` is 0 and `skipped` is high, the list had no contacts reachable on this
campaign's channels — commonly an SMS campaign against a list with only emails.

## SMS is failing but email works

SMS goes through the client's GoHighLevel sub-account, so it needs three things email does
not: a provisioned sub-account, the contact mirrored into it, and a phone number
provisioned in GHL.

Check **Settings → GoHighLevel sub-account**. No location ID means provisioning never
completed.

Then check the integration log on the workspace page for `conversations.sendSms` failures.
The error from GHL is recorded verbatim. The usual causes are no phone number on the
sub-account and an A2P registration that has not been approved.

## Replies are not exiting contacts from sequences

Webhooks are not arriving. This is the most common serious failure, because everything
still *looks* fine — messages go out, nothing errors, and contacts keep receiving touches
after they have already replied.

1. Go to **Agency → Webhook queue**. If it is empty for GoHighLevel, nothing is arriving.
2. Confirm the marketplace app is subscribed to `InboundMessage` at
   `https://<your host>/api/webhooks/ghl`. GHL v2 has no per-location webhook API — the
   subscription lives on the app. See [GHL provisioning](/docs/ghl-provisioning).
3. If payloads are arriving but marked `ignored`, the location ID on them does not match
   any workspace. Compare the location ID in the raw payload against
   **Settings → Location ID**.

## Webhook payloads are failing

**Agency → Webhook queue** shows everything that arrived, with the raw payload and the
error. Nothing is ever discarded silently.

- **failed** — will be retried automatically by the hourly maintenance job
- **dead letter** — five attempts exhausted; retry manually once the cause is fixed
- **ignored** — arrived fine but had nothing to act on, such as an unmatched location

Retrying replays the stored payload through the live endpoint, so it exercises the same
code path a real delivery would rather than a parallel one that could drift.

Payloads marked **unsigned** were accepted without a verified signature. For Resend that
cannot happen when `RESEND_WEBHOOK_SECRET` is set. For GoHighLevel it means
`GHL_WEBHOOK_PUBLIC_KEY` is unset; set it, and set `GHL_WEBHOOK_REQUIRE_SIGNATURE=true` to
reject unsigned payloads outright.

## Emails are bouncing

A few hard bounces on a dormant list is normal — those addresses died while the customer
was away, which is the same reason they are on a reactivation list.

Sustained bounces point at the domain. Check the SPF, DKIM and DMARC records on the
sending domain; see [email sending](/docs/email-sending).

If a whole client's mail is bouncing, look at their sending identity in
**Settings → Email sending**. An unverified custom domain is the usual cause.

## Opt-out rate is high

Flagged on the agency dashboard above 3% of sends.

This is a copy or list problem, not a technical one. Two things to check:

- **The list.** Contacts who never really were customers, or who were dormant for so long
  they do not remember the business, opt out at much higher rates.
- **The angle.** Open the campaign and read the sequence. Regenerate to get a different
  approach — the model is told the previous angle was rejected and to take a genuinely
  different one.

## Generation produced fallback copy

An amber **fallback copy** badge means the model call failed and the built-in sequence was
used so the launch could proceed. The underlying error is shown on the campaign page.

Usually `ANTHROPIC_API_KEY` is unset or the API was briefly unavailable. Fix it and press
Regenerate.

## A client can see the wrong data

They cannot. Workspace isolation is enforced by row-level security in Postgres, not by
application code remembering to filter — the database will not return another workspace's
rows to their session.

`supabase/tests/rls_isolation_test.sql` proves this against a real Postgres and runs via
`npm run test:db`. If you are ever unsure, run it.
