---
title: The operator flow
description: The three things an operator actually does, start to finish.
category: Getting started
order: 3
---

# The operator flow

Upload a list. Pick a campaign. Launch. That is the job.

Everything else — writing the messages, cleaning the phone numbers, deciding when to send,
stopping when someone replies — is Selestial's job. If you find yourself doing any of it by
hand, something is wrong with the product, not with you.

## 1. Upload

**Campaigns → New campaign.**

Drop in the CSV. Selestial parses it in the browser and shows you two things immediately:
the detected column mapping, and how many of the first rows have a usable phone or email.

If the mapping looks right, leave it. It usually is. See
[uploading a list](/docs/list-upload) for what it handles and why rows get rejected.

## 2. Describe the campaign

Name it, choose the channels, and set an offer if there is one. Leaving the offer blank is
fine and often better — Selestial will not invent a discount that was never authorized.

The booking link is where every tracked link points. The daily cap controls how many
contacts start per day, not how many messages go out.

Press **Import list and generate campaign**. The import runs, then the sequence is
generated. This takes a few seconds; you are watching it because it is the only thing
between upload and launch.

## 3. Read it, then launch

You land on the campaign with the whole sequence laid out: five to seven touches over two
to three weeks, each one showing its channel, its timing and what it is trying to do.

Press **Preview 5 real contacts**. This renders the sequence against five actual people
from the list you just uploaded, using the same renderer that will send it. Read one
person's whole sequence top to bottom. If it sounds like the client, launch.

If it does not, press **Regenerate**. You get a genuinely different angle, not a reworded
version of the same one. Regenerate as many times as you like — it is one click and it
costs seconds.

There is no way to edit the copy, and that is deliberate. The moment operators start
editing, the product becomes a worse version of an email tool.

Press **Launch**, confirm, and it starts.

## What happens after you walk away

Contacts are enrolled and their whole sequence is scheduled, spread across days according
to the daily cap and across hours within the send window. The dispatcher sends what is due
every five minutes, in each contact's own timezone.

When someone replies, they stop receiving the rest of the sequence. Same for a booking.
Same, permanently and across every campaign, for an opt-out.

Clicks, opens, attachment views, replies and bookings all land on the contact's
[case file](/docs/case-files) and roll up into
[this week's dashboard](/docs/metrics).

## What to check the next morning

The workspace dashboard. Two numbers matter:

- **Outreach committed** should match roughly what you expected from the list size
- **Failures** should be at or near zero

If sends are zero and the campaign is active, start at
[troubleshooting](/docs/troubleshooting).
