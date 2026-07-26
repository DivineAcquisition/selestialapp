---
title: What provisioning does in GoHighLevel
description: The exact fields, tags and webhooks Selestial creates in a client sub-account, and why.
category: Getting started
order: 2
---

# What provisioning does in GoHighLevel

Selestial is the source of truth. GoHighLevel is a mirror. State flows one way — from
Selestial into GHL — with one deliberate exception noted at the bottom.

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
