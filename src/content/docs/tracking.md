---
title: Tracking links and attachments
description: Why every link is tokenized, and what a click actually records.
category: Reference
order: 2
---

# Tracking links and attachments

No message Selestial sends contains a raw destination URL. Every link is a token minted
for one contact, one message and one destination.

## Why tokens rather than query parameters

A shared URL with `?utm_source=` tells you a click happened. A token tells you *who*
clicked, from *which* message, at *which* touch in the sequence.

That difference is the entire case file. "Someone clicked the pricing link" is a vanity
metric. "Dana clicked the pricing link from touch three on Tuesday evening" is a reason to
call Dana.

## What a click records

Following `https://go.selestial.io/l/<token>` writes one `link_clicked` event carrying the
contact, campaign, message, touch, destination, timestamp and user agent — then redirects.

It also recomputes the contact's engagement score, marks their case-file summary stale so
it gets rewritten, and pushes `selestial:clicked` into GoHighLevel so the client's own
automations can react in near real time.

The event write is awaited before the redirect. A click we failed to record is a click
that never happened as far as every dashboard is concerned, and a few milliseconds is a
fair price. If the write fails anyway, the redirect still happens — a tracking failure
must never strand someone on an error page.

Only `http` and `https` destinations are ever followed.

## Attachments

Campaign attachments — an offer PDF, a before-and-after gallery, a pricing sheet — live in
private storage and are **never linked directly**.

They are served through a tokenized viewer at `/v/<token>`, which:

1. Records an `attachment_viewed` event attributed to that specific contact
2. Mints a signed URL valid for 30 minutes
3. Renders PDFs and images inline, with a download button for everything else

The storage path never appears in a link, so a forwarded email does not hand out a
permanent public URL to the client's pricing sheet.

When the viewer closes, the browser reports how long it was open. Under two seconds is
discarded as a bounce rather than a read. The figure is clamped and treated as untrusted
context on the case file — it drives no dashboard metric and no part of the engagement
score.

## Email opens

Tracked through Resend, which handles the pixel. Opens are the weakest signal in the
system and are weighted accordingly: mail privacy protection inflates them, and a click is
worth three times as much in the engagement score.

## The link domain

Links are served from `NEXT_PUBLIC_LINK_BASE_URL`, or the app URL if that is not set.
Pointing it at a short host like `go.selestial.io` matters more than it looks: in SMS,
every character of domain is a character not spent on the message, and a long URL pushes a
one-segment text into two.

## Unsubscribe links

Also tokenized, and also per contact — that is how a one-click unsubscribe from a mail
client knows who to suppress without asking them to type anything.

The unsubscribe **page** applies nothing on load. It needs a button press, because mail
scanners prefetch links and unsubscribing someone who never clicked would be its own kind
of failure. The one-click header points at a separate POST-only endpoint that mail clients
call directly.
