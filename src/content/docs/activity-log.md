---
title: The activity log
description: The self-documenting audit trail, and how to read it when something looks wrong.
category: Operations
order: 2
---

# The activity log

Every consequential action writes a plain-English row to the workspace activity log. It is
both the debugging trail and the client-facing proof of work — the same log answers "what
did Selestial do for me last week" and "why did that message not go out".

Find it at **Activity** inside any workspace.

## What gets logged

| Action | Written when |
| --- | --- |
| `workspace.created` | A client is onboarded |
| `provisioning.*` | Each provisioning step finishes or fails |
| `ghl.agency_connected` | The agency OAuth install completes |
| `list.imported` | A CSV import finishes, with imported/merged/rejected counts |
| `campaign.created` | A campaign is created from an upload |
| `campaign.generated` | A sequence is generated, with model, prompt version and template version |
| `campaign.regenerated` | A sequence is regenerated |
| `campaign.launched` | A campaign launches, with enrolled, committed and suppressed counts |
| `campaign.paused` / `.resumed` / `.completed` | Status changes |
| `contact.opted_out` | An opt-out, with its source and how many messages were cancelled |
| `contact.status_changed` | An operator changes a contact's status |
| `webhook.reply` | An inbound reply is processed and remaining touches are cancelled |
| `webhook.reply_opt_out` | An inbound reply was an opt-out request |

Each row carries a human-readable summary and a structured details blob. The summary is
written to be read by a client. The details are written to be read at 2am by whoever is
debugging.

## Reading it when something looks wrong

**"Nothing has gone out."** Look for `campaign.launched`. If it is absent, the campaign was
never launched. If it is present, check `enrolled` and `skipped` in its details — a launch
that enrolled 0 and suppressed 400 means the list had no reachable contacts on the
campaign's channels.

**"The copy is wrong."** Look at `campaign.generated`. The details carry the model, prompt
version, template version and angle. Regenerating writes a new row, so you can see how
many attempts there have been and what changed.

**"Replies are not stopping the sequence."** Look for `webhook.reply` rows. If there are
none, webhooks are not arriving — check the
[webhook queue](/docs/troubleshooting) and the marketplace app subscription.

**"A client says they were messaged after unsubscribing."** Search the contact's case file
for `contact.opted_out`; the details record the cancellation count and the source. Every
send after that point is checked against the suppression gate, so this should be
impossible — but the log is how you prove it either way.

## The other logs

The activity log is the human layer. Two lower-level logs sit underneath it:

**Integration logs** record every outbound call to GoHighLevel, Resend and Anthropic —
endpoint, status, duration, attempt number and a payload summary. Visible per workspace at
**Agency → the workspace → Recent integration calls**. This is where you look when the
activity log says a step failed and you want to know what the provider actually returned.

**Inbound webhooks** record every payload that arrived, verified or not, processed or
failed. See [troubleshooting](/docs/troubleshooting).

## Retention

None of these are pruned automatically. They are append-only and cheap, and the first time
you need one is usually months after it was written.
