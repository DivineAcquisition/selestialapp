# Selestial v2 — Integrations

Every external system, what Selestial asks of it, and what degrades without it.
Companion document: [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## GoHighLevel

Carries outbound SMS and inbound replies. SMS goes through **each client's own
sub-account** so replies land in the inbox they already work out of, and their existing
automations can react to our tags.

### Auth modes

Resolved in this order by `resolveAuthMode()`:

| Mode | Requires | Reaches |
| --- | --- | --- |
| `oauth` | `GHL_CLIENT_ID`, `GHL_CLIENT_SECRET`, `GHL_AGENCY_COMPANY_ID` | Everything. Agency token for company-scoped calls; per-location tokens minted on demand and cached. |
| `agency_key` | `GHL_AGENCY_API_KEY` | Sub-account CRUD only, on the v1 API at `rest.gohighlevel.com`. |
| `pit` | `GHL_PRIVATE_INTEGRATION_TOKEN` | Location-scoped v2 calls against one sub-account. |

OAuth is the target. The other two exist so an install carrying v1 keys keeps working
while OAuth is set up.

Install flow: `/api/ghl/oauth/start` → `marketplace.gohighlevel.com/oauth/chooselocation`
→ `/api/ghl/oauth/callback` → agency token stored in `ghl_oauth_tokens`.

Tokens refresh transparently five minutes before expiry. A 401 on a location-scoped call
drops the cached location token and mints a fresh one on retry.

### Endpoints used

| Operation | Method | Path | Scope |
| --- | --- | --- | --- |
| `locations.create` | POST | `/locations/` (v1: `/v1/locations/`) | agency |
| `locations.get` | GET | `/locations/{id}` | agency |
| `locations.search` / `.list` | GET | `/locations/search` (v1: `/v1/locations/`) | agency |
| `customFields.list` | GET | `/locations/{id}/customFields` | location |
| `customFields.create` | POST | `/locations/{id}/customFields` | location |
| `tags.create` | POST | `/locations/{id}/tags` | location |
| `contacts.upsert` | POST | `/contacts/upsert` | location |
| `contacts.addTags` | POST | `/contacts/{id}/tags` | location |
| `contacts.removeTags` | DELETE | `/contacts/{id}/tags` | location |
| `conversations.sendSms` | POST | `/conversations/messages` | location |

API version header: `2021-07-28`, overridable with `GHL_API_VERSION`.

### Reliability

Everything goes through `ghlRequest()` in `src/lib/ghl/http.ts`. Nothing else in the
codebase may `fetch` GoHighLevel directly.

- **Rate limiting** — per-scope token bucket, 90 requests per 10s by default
  (`GHL_BURST_LIMIT`). Per-instance, so it exists to keep our own bulk loops under the
  ceiling; cross-instance contention is handled by the 429 path.
- **Retries** — 429 and 5xx retry up to 4 times with exponential backoff plus jitter, and
  honour `Retry-After`.
- **Sends are never blind-retried.** `conversations.sendSms` runs with `maxAttempts: 1`,
  because retrying a send risks texting someone twice. A failure is recorded and surfaced.
- **Logging** — one `integration_logs` row per attempt: endpoint, status, duration,
  attempt number, trimmed payload summaries.

### Provisioning

Four custom fields (`selestial_reactivation_status`, `selestial_last_service_date`,
`selestial_engagement_score`, `selestial_contact_id`) and six tags (`selestial:uploaded`,
`:contacted`, `:clicked`, `:replied`, `:booked`, `:opted-out`). Existing fields are matched
by name and reused rather than duplicated.

### Webhooks

**GHL v2 has no per-location webhook subscription API.** Delivery is configured once on the
marketplace app. The provisioning step therefore records what must be true and marks
itself `skipped` rather than reporting success over a channel that may be dead. Set
`GHL_WEBHOOK_APP_CONFIGURED=true` once the app is subscribed and re-run it.

- **Endpoint:** `POST /api/webhooks/ghl`
- **Events:** InboundMessage, OutboundMessage, ContactCreate, ContactUpdate, ContactDelete,
  AppointmentCreate, AppointmentUpdate, OpportunityCreate
- **Signature:** RSA-SHA256 over the raw body in `x-wh-signature`, verified against
  `GHL_WEBHOOK_PUBLIC_KEY`. Set `GHL_WEBHOOK_REQUIRE_SIGNATURE=true` to reject unsigned.

Handled:

| Event | Effect |
| --- | --- |
| `InboundMessage` | Opt-out keyword → opt out everywhere. Otherwise `reply_received` and exit from all remaining touches. |
| `OutboundMessage` | `message_delivered` for SMS. |
| `AppointmentCreate` / `Update` | `booking_created`, status set to booked, exit from all campaigns. Cancelled and no-show updates ignored. |
| `ContactUpdate` | An opt-out or DND tag applied in GHL is honoured here too. |

Contacts are matched by mirrored id, then normalized phone, then email — and the mirrored
id is backfilled when a match is found the slower way.

**Without GoHighLevel:** no SMS, no reply detection, no booking events. Email campaigns
work unchanged.

---

## Resend

Campaign email and platform mail.

### Sending pattern

One shared, agency-owned domain with a per-client from-name and the client's address as
reply-to:

```
From:     Sparkle Clean Co <sparkle-clean-co@mail.selestial.io>
Reply-To: dana@sparkleclean.com
```

Chosen over a subdomain per client so onboarding never blocks on the client's DNS and
reputation is managed in one place. A client who wants their own domain can have one: set
`domain`, `from_email` and `resend_domain_id` on their `sending_identities` row and
everything else works unchanged.

DNS on the shared domain (values from Resend): MX on `send`, SPF TXT on `send`, DKIM TXT
on `resend._domainkey`, DMARC TXT on `_dmarc`. Start DMARC at `p=none`.

Every campaign email carries the business name, physical address, an unsubscribe link, and
`List-Unsubscribe` / `List-Unsubscribe-Post` headers.

### Webhooks

- **Endpoint:** `POST /api/webhooks/resend`
- **Signature:** Svix HMAC-SHA256 over `${id}.${timestamp}.${body}` with
  `RESEND_WEBHOOK_SECRET`, with a 5-minute replay window. When the secret is set, an
  unverified payload is rejected outright.

| Resend event | Effect |
| --- | --- |
| `email.delivered` | Message marked delivered, `message_delivered` |
| `email.opened` | `email_opened` |
| `email.clicked` | `link_clicked` |
| `email.bounced` | `email_bounced`; a **hard** bounce sets status `bounced`, a soft one does not |
| `email.complained` | `email_complained` **and** a full opt-out |

Opens and clicks legitimately repeat, so they are not collapsed onto one row. Everything
else is deduped on the Svix id.

**Without Resend:** no email sends, no invites. SMS campaigns work unchanged.

---

## Anthropic

Campaign sequence generation, per-contact personalization, and case-file summaries.

- `SELESTIAL_GENERATION_MODEL` — sequences. Default: a Sonnet model.
- `SELESTIAL_SUMMARY_MODEL` — summaries and personalization. Default: Haiku.

Every call goes through `callModel()`, which records model, prompt version, token usage,
latency and a response preview to `integration_logs`. Prompt versions live in
`PROMPT_VERSIONS` and are stored on every generated template and rendered message, so
"which prompt produced this copy" stays answerable months later.

Model output is never trusted directly:

- Unknown merge variables are stripped
- Channels are forced to the campaign's mix
- Delays are made strictly increasing
- Opt-out language on the first SMS is guaranteed regardless
- A personalization that drops a URL or balloons in length is discarded in favour of the
  deterministic render

**Without Anthropic:** campaigns use a built-in fallback sequence, flagged so it can be
regenerated later. Case files use a deterministic summary. Nothing stops.

---

## Supabase

Postgres, Auth and Storage.

Two clients: `userDb()` carries the caller's session so RLS applies, and `adminDb()` uses
the service role for work the user cannot do on their own behalf — webhook intake, cron
dispatch, provisioning, and writes to append-only tables.

`SUPABASE_SERVICE_ROLE_KEY` is **required**. Unlike v1, the anon key is not accepted as a
fallback: v2 server work writes to tables that are intentionally unwritable under RLS, and
silently falling back would fail confusingly at the first webhook.

Storage bucket `campaign-attachments` is private. Files are only ever served through the
tokenized viewer using a 30-minute signed URL.

---

## Scheduling

`CRON_SECRET` is **required**. Without it the cron endpoints return 503 rather than running
unauthenticated — these endpoints send real messages to real people, so an open one is a
way for anyone to drain a client's queue early.

| Job | Schedule | Does |
| --- | --- | --- |
| `/api/cron/dispatch` | `*/5 * * * *` | Sends what is due, up to `SELESTIAL_DISPATCH_BATCH` (100) |
| `/api/cron/maintenance` | `17 * * * *` | Refreshes stale case-file summaries, closes finished campaigns, retries failed webhooks |

Separate so a slow model call in maintenance can never delay a send.

Webhook retries replay the stored payload through the live endpoint using an internal
header authenticated with `CRON_SECRET`, so a retry exercises the same code path as a real
delivery rather than a parallel one that could drift.

---

## Environment

See `.env.example` for the full list with commentary. The required minimum for v2:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
NEXT_PUBLIC_APP_URL
RESEND_API_KEY
ANTHROPIC_API_KEY
GHL_CLIENT_ID / GHL_CLIENT_SECRET / GHL_AGENCY_COMPANY_ID
```

---

## Carried over from v1, unused by v2

Stripe (the onboarding funnel), Twilio (the v1 SMS path) and the v1 booking widget are
untouched and keep working. v2 sends reactivation SMS through GoHighLevel, not Twilio.
