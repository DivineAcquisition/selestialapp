---
title: How campaign generation works
description: Where the copy comes from, what the model is told, and what happens when it misbehaves.
category: Running campaigns
order: 2
---

# How campaign generation works

There is no message-editing surface in Selestial. Not hidden, not behind a flag — it does
not exist. The operator's controls are **preview** and **regenerate**.

That is the product. If an operator has to write copy, they are doing the specialization
Selestial is supposed to be doing for them.

## Two layers

**Campaign templates** are generated once per campaign. They are the sequence skeleton:
five to seven touches over fourteen to twenty-one days, mixing SMS and email, each with
merge variables in place of contact detail.

**Per-contact rendering** happens at send time. The template becomes the exact message
one person receives, with their name, their service history, their dormancy, and their own
tokenized links.

## What generation is told

- **The business** — name, service area, services, tone, positioning, what makes them
  different. This comes from the workspace profile you filled in at onboarding, and it is
  the biggest lever you have on output quality.
- **The campaign** — type, channels available, the offer if you set one, the touch count
  and span to aim for.
- **The list** — how many contacts, typical dormancy in months, what services they
  actually bought, and how many are reachable by each channel. A list of two-year-dormant
  move-out cleaning customers gets different copy from six-month-dormant recurring ones.
- **On regeneration** — the previous angle, with an instruction to take a genuinely
  different approach rather than reword the same one.

## What generation is forbidden from doing

The prompt is explicit, and the code enforces it afterwards rather than trusting it:

- No claimed discount, guarantee or timeframe that was not in the brief. Leave the offer
  field blank and no discount will be invented.
- No implied existing appointment, outstanding balance or prior conversation.
- No merge variable outside the known list. Anything invented is stripped before storage.
- The first SMS carries opt-out language. If the model omits it, it is appended.

Model output is also repaired deterministically: channels are forced to the campaign's
mix, step indexes are renumbered, and delays are made strictly increasing so a sequence
cannot land all at once.

## Preview

**Preview 5 real contacts** renders the whole sequence against five randomly chosen
contacts from the campaign's own lists, using the same renderer the dispatcher uses. What
you see is what those people will receive, character for character, including SMS segment
counts.

Preview mints no tracking tokens and writes nothing. The links show a placeholder.

## Regenerate

One click, whole campaign. A new version of the sequence is written; the previous version
is kept, so a message that already went out can always be traced back to the exact
template it came from.

Regenerating an active campaign does not rewrite messages already scheduled — those keep
the version they were scheduled against.

## Provenance

Every campaign records the model, prompt version, template version and generation
timestamp, visible on the campaign page under **Provenance**. Every rendered message
records whether it was personalized and with what.

Months later, "which prompt produced this message" is a question with an answer.

## When the model is unavailable

Generation falls back to a built-in sequence rather than failing the launch. The campaign
is flagged with an amber **fallback copy** badge and the underlying error is shown.

The fallback is deliberately plain — it keeps the client's outreach moving through an API
outage, but it is not what you want going out long-term. Regenerate once the cause is
fixed.

## Personalization at send time

If a contact has a case-file summary, the message can be lightly adapted to them before
sending — at most a sentence or two, same intent, same call to action, same link.

This is guarded rather than trusted. If the adapted version drops a URL or balloons in
length, it is discarded and the deterministic render is sent instead.
