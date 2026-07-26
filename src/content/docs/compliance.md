---
title: Compliance behaviour
description: Opt-outs, quiet hours, unsubscribe, and what Selestial refuses to do.
category: Running campaigns
order: 3
---

# Compliance behaviour

These rules are enforced in code at send time, not asked of the model and hoped for.

## Opt-out is absolute

An opt-out applies to **every channel, every campaign, permanently, immediately**.

When a contact opts out:

1. Their status becomes `opted_out` with the channel and reason recorded.
2. Every message still scheduled for them, across all campaigns, is cancelled.
3. The `selestial:opted-out` tag is pushed to their GoHighLevel record.
4. An event is written, and their case file gets a system note.

There is no per-campaign opt-out and no "opted out of SMS but not email". There is one
suppression list and it is the contact record.

An opt-out **cannot be reversed from the interface**. The "return to active" control is
not offered for an opted-out contact. Someone who opted out has to opt back in.

## Every send passes one gate

Immediately before dispatch — not at schedule time — each message is checked against:

| Condition | Result |
| --- | --- |
| Status is `opted_out` | Suppressed, all channels |
| Marked do-not-contact | Suppressed, all channels |
| Already booked | Suppressed |
| Hard-bounced email | Suppressed for email only; SMS still allowed |
| No email address | Suppressed for email only |
| No phone number | Suppressed for SMS only |

Checking at dispatch rather than at enrollment is the point: a contact who opted out an
hour ago never receives the touch that was queued for them yesterday.

## Ways a contact can opt out

- Replying STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT or OPT OUT to an SMS
- Clicking unsubscribe in an email
- One-click unsubscribe from their mail client
- Marking an email as spam — a complaint is treated as an opt-out
- An operator marking them opted out
- The client tagging them as opted out inside GoHighLevel

Reply detection is deliberately narrow. Only short messages are treated as keywords, so
*"please stop by on Tuesday around noon"* is a reply, not an opt-out.

## Quiet hours

No marketing message is sent outside **8am to 9pm in the recipient's local time**, ever.
This is the TCPA bound and it is a hard clamp: a campaign's configured send window is
intersected with it, never widened by it. Setting a window of 5am–11pm produces sends
between 8am and 9pm.

Local time means the *contact's* timezone where we know it, falling back to the
workspace's. A single campaign sending to Austin and Boston sends at 9am in both places,
which is two different instants.

Campaigns also carry allowed send days, weekdays by default. A touch that comes due on an
excluded day rolls forward to the next allowed one.

If the queue backs up and a message becomes due outside the window, it is **rescheduled**,
not sent late.

## SMS opt-out language

The first SMS in every sequence carries opt-out language. Generation is asked to include
it naturally; if it does not, `Reply STOP to opt out.` is appended, trimming the body if
needed so the message still fits its segment budget.

Later touches do not repeat it, which is both the legal standard and better writing.

## Email requirements

Every marketing email carries, in the footer:

- The client's business name
- The client's physical address — set it at onboarding. Without it the footer shows a
  placeholder, which is a compliance gap, not a cosmetic one.
- An unsubscribe link

Emails also carry `List-Unsubscribe` and `List-Unsubscribe-Post` headers, so mail clients
show a native unsubscribe button. Using it opts the contact out everywhere, exactly as
clicking the link would.

The unsubscribe **page** applies nothing on load; it needs a button press. Mail scanners
prefetch links, and unsubscribing someone who never clicked would be its own failure.

## Throughput

Each campaign has a daily cap on how many contacts are *started* per day. With a cap of
250 and 900 contacts, the first 250 begin today and the rest follow on subsequent days.
Within a day, sends are spread across the window rather than fired in one burst.
