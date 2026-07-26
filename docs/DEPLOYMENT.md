# Selestial v2 — deployment state

What is provisioned, what is still outstanding, and the exact values needed to finish.

**No secrets are recorded in this file.** API keys, tokens and signing secrets belong in
the Vercel environment or the Cursor Cloud Agent secret store, never in the repository.

---

## Resend — done

| Item | Value |
| --- | --- |
| Campaign sending domain | `mail.selestial.io` |
| Domain ID | `768dcfd8-0f59-4c68-bccc-b4857b0a121e` |
| Region | `us-east-1` |
| Open tracking | **enabled** — the `email.opened` webhook depends on it |
| Click tracking | **disabled, deliberately** — see the warning below |
| Webhook endpoint | `https://app.selestial.io/api/webhooks/resend` |
| Webhook ID | `9646d74a-8f95-4d5d-8264-b032e6120197` |
| Subscribed events | `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`, `email.delivery_delayed` |

> **Do not enable Resend click tracking on this domain.** Resend rewrites every link in
> the HTML to route through its own tracking host. Selestial mints its own per-contact
> tokens, so link rewriting breaks attribution: the click lands on Resend's redirector
> instead of `/l/<token>`, and the contact, campaign and touch behind it are lost. Open
> tracking is safe because it uses a pixel and does not touch the links.

The webhook signing secret was shown once on creation. Set it as `RESEND_WEBHOOK_SECRET`.
If it was lost, delete webhook `9646d74a…` and create a new one to get a fresh secret.

### DNS records still to add for `mail.selestial.io`

Add these at the DNS provider for `selestial.io`, then run domain verification in Resend.

| Type | Name | Value | Priority |
| --- | --- | --- | --- |
| TXT | `resend._domainkey.mail` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDBiqwhLsOzTvT0lxMmyUarNRjOmcGGT+QJacR1BgU6OOHTZnmoSeIRQ9Hs/0uV51SmJP0BD4kIeZuknp9lp8knL4nRpwjYL7H++fTJUR5Xov/jyRFNrNuOeMWb8j8C77CuBWIlXYhRCBa78TdhHYNpjZuV+AHbcFtb709QWbo8+wIDAQAB` | — |
| MX | `send.mail` | `feedback-smtp.us-east-1.amazonses.com` | 10 |
| TXT | `send.mail` | `v=spf1 include:amazonses.com ~all` | — |

A DMARC record is not created automatically. Add one on `_dmarc.mail.selestial.io`
starting at `p=none` while you watch the reports.

### Sending before the DNS is live

`mail.selestial.io` cannot send until it is verified. Several `selestial.io` subdomains
are already verified in the same account, so campaign email can run today by pointing the
app at one of them:

```
SELESTIAL_SENDING_DOMAIN=updates.selestial.io
```

`updates.selestial.io` is the better interim choice than `notify.` or `noreply.`, which
carry transactional reputation that bulk reactivation sending should not be mixed into.

---

## GoHighLevel — blocked on token scopes

The supplied Private Integration Token authenticates correctly and resolves the agency:

| Item | Value |
| --- | --- |
| Agency company ID | `iW3Cq3fhbJcWMfM4fn1V` |
| Sub-accounts visible | `jWh1TtlCjUDeZZ27RkkI` BayAreaCleaningPros · `pNbNaLXpftikGN2jOFKG` DivineAcquisition · `fJddieqJDUjUoYAGOvbk` NovaraCleaning |

**It has exactly one scope: `locations.readonly`.** Probing the API returns
`401 The token is not authorized for this scope` for contacts, conversations, custom
fields, tags, calendars and opportunities.

That is enough to list sub-accounts on the onboarding screen, and not enough for anything
else. With this token alone: provisioning fails at the custom-fields step, imported
contacts are never mirrored, and **no SMS can be sent**.

### The token string does not gain scopes retroactively

Adding scopes to the integration in GoHighLevel does **not** widen a token that was
already issued. The existing `pit-…` string keeps whatever it was minted with, so the
scope list can look correct in the dashboard while every call still returns 401.

After changing scopes, **regenerate the token and copy the new value.** Re-tested 45
seconds apart to rule out propagation lag: read and write probes against contacts,
conversations, custom fields, tags, calendars and opportunities all still returned
`401 The token is not authorized for this scope`, as did `POST /oauth/locationToken`,
so there is no alternate route around it.

### Scopes to add

In GoHighLevel: **Settings → Private Integrations → edit the integration → Scopes**,
then regenerate.

```
contacts.readonly              contacts.write
conversations.readonly         conversations/message.write
locations/customFields.readonly  locations/customFields.write
locations/tags.readonly          locations/tags.write
locations.readonly             locations.write
opportunities.readonly
calendars/events.readonly
```

Then confirm it worked: **Agency → Integrations → Capability check → Run check**. It
probes each capability live and names the missing scope next to whatever it breaks.

Agency OAuth (`GHL_CLIENT_ID` / `GHL_CLIENT_SECRET`) remains the preferred path — it gets
per-location tokens and avoids one static credential covering every client.

---

## Supabase — blocked on billing

A dedicated `selestial` project could not be created:

```
PaymentRequiredException: There are overdue invoices in the organization(s)
DivineAcquisition™. Head to the organization's invoices page to settle the
invoices before creating a new project.
```

The connected credential sees exactly one organization, `DivineAcquisition™`
(`rwlqjppxddcpsvisthgs`), on the Pro plan with three existing projects. There is no
`DA Enterprise` organization visible to it, and the Supabase management API has no
create-organization operation — organizations can only be created in the dashboard.

To place the project under a different organization, create that organization in the
Supabase dashboard first. If it belongs to a separate Supabase account, that account's
access token has to be connected before it can be reached.

Once an organization is available and its invoices are clear, create the project and
apply the three migrations in `supabase/migrations/20260726*` in filename order.

### Do not install v2 into one of the existing projects without checking

The existing `NovaraCleaning` project (124 tables) already has a **`contacts` table with
an unrelated shape** — nine columns, no `workspace_id`, and absent from the repo's
generated types file. This is the schema drift the audit flagged, and it is why the
migrations now begin with a preflight guard that aborts with a clear message rather than
letting `create table if not exists` silently skip and bind v2 code to a foreign table.

If a migration aborts with *"these table names are already used by a different schema"*,
that guard is doing its job. Install into a clean database, or rename the conflicting
table first.

### After the project exists

1. Apply the three migrations in order.
2. Insert your user id into `agency_admins` to get the operator view.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
   `SUPABASE_SERVICE_ROLE_KEY`.
4. Confirm the storage bucket `campaign-attachments` was created and is **private**.

---

## Outstanding checklist

- [ ] Settle the Supabase invoices, create the project, apply the migrations
- [ ] Add the three DNS records for `mail.selestial.io` and verify the domain
- [ ] Add the missing GoHighLevel scopes, then run the capability check
- [ ] Set `RESEND_WEBHOOK_SECRET` from the webhook created above
- [ ] Set `CRON_SECRET` — without it the cron endpoints return 503 by design
- [ ] Point `NEXT_PUBLIC_LINK_BASE_URL` at a short host and give it a DNS record
- [ ] Rotate the GoHighLevel PIT that was shared in chat
