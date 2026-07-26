# Selestial v2 — Architecture

A multi-workspace reactivation engine. One workspace is one client is one GoHighLevel
sub-account. Dormant customer lists come in, generated SMS and email campaigns go out
through the client's own sub-account and our Resend domain, and every interaction lands
in one event log that everything else derives from.

Kept current as the system changes. Companion document: [INTEGRATIONS.md](./INTEGRATIONS.md).

---

## Load-bearing decisions

**Selestial is the source of truth; GoHighLevel mirrors it.** State flows one way. A GHL
outage degrades the client's automations and blocks SMS, but never corrupts our data. The
single exception is an opt-out, which is honoured in both directions because suppression
only ever travels toward more suppression.

**One events table.** `engagement_events` is the only thing dashboards read. Every send,
delivery, click, view, reply and booking is one row. No denormalized counters, because a
counter that drifts from the log is worse than no number.

**Isolation is enforced by the database.** Row-level security on all 23 v2 tables, not
application code remembering to filter. Proved by `supabase/tests/rls_isolation_test.sql`.

**Compliance is enforced in code, not prompted for.** Generation is asked to include
opt-out language; the renderer guarantees it. Quiet hours clamp whatever window an
operator configures. Suppression is checked immediately before dispatch, not at schedule
time.

**No message-editing surface.** Not hidden, not flagged — it does not exist. Preview and
regenerate are the only controls over copy.

**Additive to v1.** Nothing in the v1 schema is dropped or altered, and every v2 table
claims a name v1 was not using. v1 routes keep working; v2 lives under `/w/[slug]` and
`/agency`.

---

## Data model

23 tables, created by three migrations under `supabase/migrations/20260726*`.

### Tenancy

| Table | Purpose |
| --- | --- |
| `workspaces` | One per client. Carries the GHL location id, business profile (fed to generation), branding, compliance address. |
| `workspace_members` | User → workspace with a role: `client_owner`, `client_staff`. |
| `agency_admins` | Global operator allowlist. An agency admin sees every workspace. |
| `workspace_invites` | Tokenized, 14-day expiry, one live invite per address. |

RLS helpers, all `security definer`:

- `is_agency_admin()`
- `is_workspace_member(uuid)` — agency admin **or** a member
- `can_write_workspace(uuid)` — agency admin or `client_owner`

Every workspace-scoped table has a select policy of `is_workspace_member(workspace_id)`.
Writes mostly go through the service role in server actions; the exceptions are contact
updates, notes and saved segments, which clients legitimately edit.

`ghl_oauth_tokens` has **no policies at all**, so it is invisible to every non-service
role.

### Contacts and lists

| Table | Purpose |
| --- | --- |
| `contacts` | The case-file subject. Identity, service history, status, engagement score, AI summary, GHL mirror id. |
| `contact_lists` | One upload, attached to exactly one campaign. Carries the column mapping and import stats. |
| `contact_list_members` | List membership, with a `was_merged` flag. |
| `import_rejects` | Rejected rows with a reason and the original data, downloadable as CSV. |
| `contact_notes` | Freeform and system-written. |
| `saved_segments` | Named filter sets. |

Dedupe is enforced by two partial unique indexes: `(workspace_id, phone)` and
`(workspace_id, lower(email))`. Concurrent imports therefore end in a merge rather than a
constraint error.

### Campaigns

| Table | Purpose |
| --- | --- |
| `campaigns` | Type, status, channel mix, schedule settings, generation provenance. |
| `campaign_touches` | The generated sequence, **versioned**. Regenerating writes a new version; old ones are kept so a sent message traces to its exact template. |
| `campaign_enrollments` | One contact in one campaign, with exit state and reason. |
| `campaign_attachments` | Files in private storage, only ever served tokenized. |
| `outreach_messages` | Both the queue entry and the permanent record of what was sent. |

`outreach_messages` doing double duty is deliberate. It makes "outreach committed this
week" a number the dashboard reads straight off the table, and it makes a sequence exit a
single UPDATE that cancels everything pending rather than a race against the next tick.

Uniqueness on `idempotency_key` (`campaign:contact:vN:sN`) means a retried launch cannot
double-schedule.

### Tracking

| Table | Purpose |
| --- | --- |
| `tracked_links` | One token per contact per message per destination. Kinds: `url`, `attachment`, `unsubscribe`. |
| `engagement_events` | The canonical log. Unique on `(provider, provider_event_id)` so webhook retries cannot double-count. |
| `inbound_webhooks` | Raw payload intake plus dead-letter state. |

### Operations

| Table | Purpose |
| --- | --- |
| `integration_logs` | Every outbound call to GHL, Resend and Anthropic, one row per attempt. |
| `workspace_activity` | Human-readable audit trail. Both the debugging path and client-facing proof of work. |
| `workspace_provisioning_steps` | Per-step provisioning state, unique on `(workspace_id, step_key)`, which is what makes retry idempotent. |
| `sending_identities` | Per-workspace Resend from-identity. |

One database function does aggregation: `workspace_week_stats(workspace, start, end)`.

---

## Module map

```
src/lib/v2/
  db.ts           userDb() (RLS, session) and adminDb() (service role)
  types.ts        Hand-written row types — the generated types file reflects v1
  workspace.ts    Viewer, membership, role resolution, slugs
  activity.ts     Audit writer; never throws
  events.ts       recordEvent() and the engagement score
  engagement.ts   What every signal triggers: score, tag push, summary staleness, exits
  csv.ts          Parser and column detection (pure)
  normalize.ts    Phone, email, date, name, money (pure)
  import.ts       Validate, dedupe, merge, mirror
  ghl-sync.ts     One-way mirror into GHL; best-effort by design
  ai.ts           Anthropic access, prompt versions, model-call logging
  generate.ts     Campaign sequence generation, repair, fallback
  template.ts     Merge substitution and text-to-HTML (pure)
  render.ts       Per-contact render: variables, links, compliance, personalization
  compliance.ts   Opt-out language, segments, suppression gate, footers
  schedule.ts     Timezone windows and quiet hours (pure)
  sequence.ts     Launch, enrollment, exits, opt-out propagation
  dispatch.ts     The send worker
  links.ts        Token minting and resolution
  case-file.ts    Timeline assembly and narrative summaries
  metrics.ts      Dashboard aggregation
  webhooks.ts     Intake, signature verification, dead-letter
  provisioning.ts The five-step pipeline
  email.ts        Resend sending with per-workspace identity
  invites.ts      Invite lifecycle

src/lib/ghl/
  config.ts       Auth modes, scopes, the field and tag taxonomy
  tokens.ts       OAuth token store, refresh, location-token minting
  http.ts         The single chokepoint: rate limit, retry, log
  client.ts       The typed surface
```

The pure modules (`csv`, `normalize`, `schedule`, `template`, `compliance`) deliberately
avoid server imports so they can be unit tested directly. 49 tests, `npm test`.

---

## Request paths

### Import

```
CSV → parseCsv → detectMapping → per row:
  normalize phone/email/date → reject with a reason, or
  match existing by phone then email → merge without overwriting good data, or insert
→ contact_imported / contact_merged events
→ mirror into GHL with selestial:uploaded
→ import_rejects, list stats, activity row
```

### Generation

```
workspace profile + campaign settings + list characteristics
→ Anthropic (prompt version recorded)
→ normalizeTouches: strip unknown variables, force channel, make delays increase,
  guarantee opt-out on the first SMS
→ campaign_touches at version N+1
→ campaign status ready, provenance stored
```

Model failure falls back to a built-in sequence, flagged `fallback: true`.

### Launch

```
contacts on the campaign's lists
→ suppression check → suppressed enrollments recorded with a reason
→ cohort day = index / daily_cap, jitter within the send window
→ materialize every touch as a scheduled outreach_message
→ message_scheduled events
```

### Dispatch (cron, every 5 minutes)

```
release rows locked > 5 min by a dead run
→ claim due rows with a lock token, read back only the ones we won
→ per message:
    campaign paused?          → return to scheduled
    suppressed?               → skip + message_skipped
    outside the window?       → reschedule
    render → send → message_sent, or message_failed
```

Suppression is re-checked here, not trusted from schedule time. That is what stops an
already-queued touch reaching someone who opted out an hour ago.

### Engagement

```
click / open / view / reply / booking
→ engagement_events (idempotent on provider event id)
→ recompute engagement score
→ mark the case-file summary stale
→ push the tag into GHL
→ reply or booking: cancel every remaining touch
```

---

## Routes

| Path | Who |
| --- | --- |
| `/w/[slug]` | Workspace dashboard, campaigns, contacts, activity, settings |
| `/agency` | Rollup, onboarding, provisioning, integrations, webhook queue |
| `/l/[token]` | Click resolver |
| `/v/[token]` | Attachment viewer |
| `/u/[token]` | Unsubscribe page (GET only, on purpose) |
| `/api/unsubscribe/[token]` | One-click unsubscribe (POST only) |
| `/api/webhooks/ghl`, `/api/webhooks/resend` | Inbound |
| `/api/cron/dispatch`, `/api/cron/maintenance` | Scheduled |
| `/api/ghl/oauth/start`, `/callback` | Agency OAuth |
| `/docs`, `/docs/[slug]` | Markdown from `src/content/docs` |

Middleware lands v2 users in their own workspace from `/`, keeps the v1 dashboard for
accounts without one, adds a `go.*` short-link host, and leaves the token routes public so
a text message never bounces someone to a login.

---

## Testing

```
npm test        49 unit tests over the pure modules
npm run test:db applies the migrations to a throwaway Postgres and proves isolation
npm run build   full production build
```

`rls_isolation_test.sql` asserts that a client in workspace A reads zero rows from
workspace B on every table, that GHL tokens are invisible to all non-service roles, that
anonymous sees nothing, and that RLS is enabled on all 23 tables — the last one catches a
table added later without it.
