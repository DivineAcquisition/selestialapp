---
title: Lead case files
description: The living profile behind every contact, and what feeds it.
category: Reference
order: 3
---

# Lead case files

Every contact that enters Selestial gets a case file. It is the context engine: it is what
future campaigns read when they write to this person, and it is what a human reads before
picking up the phone.

## What is on it

**Identity and history** — everything imported, the source list, service history, last
service date, and computed dormancy. Columns Selestial did not recognise at import are
kept and shown under "From the import" rather than discarded.

**The timeline** — reverse chronological, filterable by channel:

- Every message sent, **with the copy that actually went out**, not the template
- Every delivery, failure and skip, with the reason
- Every open, click and attachment view
- Every reply, pulled from GoHighLevel conversations
- Every status change and campaign entry or exit
- Every note, written by a person or by the system

Reading back the rendered copy rather than the template matters. Two contacts on the same
touch can have received different messages if one was personalized from their case file.
The timeline shows what each of them got.

**Engagement score** — 0 to 100, with the tier. See
[how every metric is counted](/docs/metrics) for the formula.

**The narrative summary** — a short paragraph describing where this contact stands:

> Dormant 14 months, deep clean customer, opened both emails, clicked the pricing link
> Tuesday evening, has not replied.

It is written to be useful to a model as well as to a person, because it is exactly what
per-contact rendering reads on the next campaign. It states facts from the record and
never infers intent or mood.

It regenerates automatically when something meaningful lands — a click, an attachment
view, a reply, a booking, a bounce or an opt-out. Deliveries and opens are not enough to
trigger a rewrite. There is a manual **Refresh summary** button.

When the model is unavailable the summary falls back to a deterministic sentence
assembled straight from the record. Less fluent, never wrong.

**Notes** — freeform notes from anyone with access, plus system notes recording imports,
merges, campaign exits and status changes. System notes are how you reconstruct what
happened without reading the event log.

## Status controls

Every change is audited: it writes an event, a system note and an activity-log entry.

- **Mark as booked** — sets the status, records a booking, and removes them from the
  remaining touches in every campaign.
- **Do not contact** — suppresses all channels and cancels everything pending. Reversible.
- **Opt out** — the same, but permanent. See [compliance](/docs/compliance).
- **Return to active** — offered only for do-not-contact and booked contacts. It is
  deliberately not offered for an opt-out.

## The contacts index

Filter by campaign, engagement tier, status and dormancy, and search across name, email
and phone. Sorted by engagement score, so the people worth calling are at the top.
