---
title: How every metric is counted
description: The exact definition behind each number on the dashboards.
category: Reference
order: 1
---

# How every metric is counted

Every number on every dashboard is a count of rows in one table, `engagement_events`.
Nothing is estimated, extrapolated, or read from a cached counter that could drift.

If a number looks wrong, it is answerable: there is a row, or there is not.

## The week

Weeks run **Monday 00:00 to the following Monday 00:00**. The week picker moves in
whole weeks and does not go into the future.

An event belongs to the week its `occurred_at` falls in — the moment the thing actually
happened, which for provider-reported events is the provider's timestamp, not when we
processed it.

## Workspace dashboard

| Metric | Counted as |
| --- | --- |
| **Outreach committed** | Messages scheduled **plus** messages sent this week. A message scheduled Monday and sent Wednesday counts once in each, which is intended: committed is what we promised, sent is what left. |
| **Sent** | `message_sent` events, split by channel. Written only after the provider accepted the message. |
| **Delivered** | `message_delivered` events. Email from Resend; SMS from GoHighLevel's outbound confirmation. Always lags Sent, and will be lower for SMS where carriers do not report. |
| **Links clicked** | `link_clicked` events. Total clicks, with unique contacts shown alongside. One person clicking three times is 3 clicks and 1 unique contact. |
| **Attachment views** | `attachment_viewed` events — someone opened a tokenized attachment. |
| **Replies** | `reply_received` events. Opt-out replies are **not** counted here; they are counted as opt-outs. |
| **Bookings** | `booking_created` events, from a GHL appointment webhook or an operator marking a contact booked. |
| **Opt-outs** | `opted_out` events, from any channel and any cause including spam complaints. |
| **Failures** | `message_failed` events — the provider rejected the send. |

## Click rate

**Unique contacts who clicked, divided by messages sent**, in that week.

Unique rather than total, because total clicks over sends is inflated by one enthusiastic
person and by email scanners. It reads lower than the number most tools show. It is the
one that means something.

A dash means there were no sends to divide by.

## Engagement score

0 to 100, on every contact, recomputed whenever an engagement signal lands.

```
score = (deepest signal + breadth bonus) x recency factor
```

**Deepest signal** — the strongest thing this contact has ever done:

| Signal | Weight |
| --- | --- |
| Delivered | 2 |
| Opened an email | 10 |
| Clicked a link | 30 |
| Opened an attachment | 45 |
| Replied | 70 |
| Booked | 100 |

Strongest-ever, not most recent, so a reply is never diluted by a quiet week afterwards.

**Breadth bonus** — 2 points per engagement action, capped at 15. Five clicks outrank one.
Deliveries do not count: that is something we did, not something they did.

**Recency factor** — applied to the total:

| Days since last engagement | Factor |
| --- | --- |
| 0–3 | 1.0 |
| 4–7 | 0.9 |
| 8–14 | 0.75 |
| 15–30 | 0.55 |
| 31–60 | 0.35 |
| 61+ | 0.2 |

Tiers: **cold** 0, **cool** 1–24, **warm** 25–49, **hot** 50–74, **ready** 75+.

## Agency rollup

Same definitions, aggregated per client, plus a health flag:

| Flag | Means |
| --- | --- |
| **Healthy** | Nothing to look at |
| **Sub-account not provisioned** | No GHL location, so SMS cannot send |
| **Behind schedule** | Messages more than an hour past their scheduled time. Usually the dispatch cron is not running. |
| **Webhook failures** | Payloads that failed processing this week. Replies and bookings may be missing. |
| **High opt-out rate** | Opt-outs above 3% of sends. A copy or list-quality problem, not a technical one. |

Flags are reported in that order, most serious first, and only one shows per client.

## Attachment view duration

Reported by the browser when the viewer closes, clamped between 2 seconds and 30 minutes.
It is client-reported and therefore untrusted, which is why it appears on the case file as
context and drives no dashboard metric and no part of the score.
