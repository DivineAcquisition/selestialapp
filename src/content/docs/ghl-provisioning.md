---
title: What provisioning does in GoHighLevel
description: The exact fields, tags and webhooks Selestial creates in a client sub-account, and why.
category: Getting started
order: 2
---

# What provisioning does in GoHighLevel

Selestial is the source of truth. GoHighLevel is a mirror. State flows one way — from
Selestial into GHL — with one deliberate exception noted at the bottom.

## Two credentials, deliberately

Selestial uses two different GoHighLevel credentials, and they do different jobs.

**The agency credential** is configured once, by us, and does exactly one thing: create
sub-accounts during onboarding (and list the existing ones so a client can be connected
to a sub-account they already have). It never touches contacts or messages.

**The sub-account token** is a Private Integration Token created *inside* the client's own
sub-account and stored on their workspace. Every call that works inside that sub-account
— custom fields, tags, mirroring contacts, sending SMS — uses it.

This split matters for two reasons. GHL issues Private Integration Tokens at the location
level, so this is how the platform actually works rather than something we invented. And
it means one client's credential cannot reach another client's sub-account: the blast
radius of a leaked token is one workspace.

Provisioning pauses at **Storing the sub-account token** until that token exists. The step
shows as "action needed" rather than failing, because nothing is broken — the pipeline is
waiting on a person, and it resumes the moment the token is saved.

### Creating the sub-account token

In the client's sub-account: **Settings → Private Integrations → New Integration**. Grant
read and write on contacts, conversations, custom fields and tags. Create it, copy the
token, and paste it into the workspace — **Agency → the workspace → Sub-account token**,
or the client can do it themselves from their own **Settings** page.

The token is verified against the live API before it is stored. An under-scoped token is
rejected at the point of entry with the missing scope named, rather than accepted and
discovered days later when a campaign quietly fails to send.

Two things worth knowing:

- **Adding scopes does not widen a token that already exists.** After changing scopes you
  have to regenerate the token and paste the new value. The old string keeps whatever it
  was minted with, so the dashboard can show the right scopes while every call still 401s.
- **The token is never shown again** once stored, and is never sent back to the browser.
  Replace it by pasting a new one.

## Custom fields

Four contact fields are created in each sub-account. If a field with the same name already
exists, it is reused rather than duplicated.

| Field | Type | What Selestial writes into it |
| --- | --- | --- |
| Selestial Reactivation Status | Text | `active`, `opted_out`, `do_not_contact`, `booked` or `bounced` |
| Selestial Last Service Date | Date | The last service date from the imported list |
| Selestial Engagement Score | Number | 0–100, recomputed on every engagement signal |
| Selestial Contact ID | Text | Our contact id, so a row in GHL can always be traced back |

The mapping from our field key to the GHL field id is stored on the workspace, so a
sub-account whose fields were created in a different order still works.

## Tags

Six tags, applied as the contact moves through a campaign:

- `selestial:uploaded` — set on import
- `selestial:contacted` — set on the first send
- `selestial:clicked` — set on the first click or attachment view
- `selestial:replied` — set on a reply
- `selestial:booked` — set on a booking
- `selestial:opted-out` — set on an opt-out, from any channel

These exist so the client's own GHL automations can react. If they already have a workflow
that fires on a tag, pointing it at `selestial:replied` gives them speed-to-lead on
reactivation replies without touching Selestial.

## Webhooks

**This step usually finishes as "action needed" rather than "done", and that is correct.**

GoHighLevel v2 has no per-location webhook subscription endpoint. Delivery is configured
once, on the marketplace app, and applies to every sub-account the app is installed in.
There is no API call Selestial can make per client.

Rather than mark the step green over a channel that may be silently dead, provisioning
records exactly what has to be true and marks itself `skipped`:

- **Endpoint:** `https://<your app host>/api/webhooks/ghl`
- **Events:** InboundMessage, OutboundMessage, ContactCreate, ContactUpdate, ContactDelete,
  AppointmentCreate, AppointmentUpdate, OpportunityCreate

Once the app is subscribed, set `GHL_WEBHOOK_APP_CONFIGURED=true` and re-run the step. It
will pass.

If webhooks are not delivering, replies do not exit contacts from sequences and bookings
do not register. That is the single most important thing to get right, which is why the
step refuses to lie about it.

## What flows back from GHL

One thing, and only one: **an opt-out**.

If the client tags a contact as opted out or DND inside GoHighLevel directly, the
`ContactUpdate` webhook applies that opt-out in Selestial too. Suppression only ever
travels in the direction of more suppression, so this cannot be used to un-suppress
someone or to overwrite our data.

Everything else — names, service history, campaign membership, engagement — is written by
Selestial and never read back.

## Rate limits and retries

Every GHL call goes through one module that owns rate limiting and retries. Bulk work
(importing a five-thousand-row list) is throttled below the burst ceiling on our side, and
a 429 or 5xx is retried with exponential backoff and jitter.

Sends are the exception: an SMS is attempted exactly once, because a blind retry of a send
risks texting someone twice. A failed send is recorded as failed and surfaced rather than
retried silently.

Every attempt writes a row to the integration log, visible per workspace at
**Agency → the workspace → Recent integration calls**.
