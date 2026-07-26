---
title: Email sending and DNS
description: The sending pattern, why it was chosen, and the DNS records behind it.
category: Operations
order: 1
---

# Email sending and DNS

## The pattern

One shared, agency-owned sending domain, with a per-client from-name and the client's own
address as reply-to:

```
From:     Sparkle Clean Co <sparkle-clean-co@mail.selestial.io>
Reply-To: dana@sparkleclean.com
```

The recipient sees the client's name in their inbox. Replies go to the client. The domain
being ours is not something a former customer reads or reacts to.

## Why this rather than a subdomain per client

**Onboarding never blocks on DNS.** A subdomain per client means every new client waits on
their web person to add three records before a single email can go out. With a shared
domain, a client onboarded at 10am can send at 10:05.

**Reputation is managed in one place.** One domain that we warm, monitor and keep clean,
rather than fifty cold domains each building reputation from zero. A new domain sending
two thousand emails on day one lands in spam; an established one does not.

**One set of records to get right.** SPF, DKIM and DMARC configured once, by us.

The trade-off is real: one client with a bad list can hurt deliverability for the others.
That is why opt-out rate is a health flag on the agency dashboard and why hard bounces
suppress an address permanently.

## The DNS records

Set these once, on the sending domain (`mail.selestial.io` by default, overridable with
`SELESTIAL_SENDING_DOMAIN`). Resend gives you the exact values when you add the domain.

| Type | Host | Purpose |
| --- | --- | --- |
| MX | `send` | Return-path, so bounces come back to Resend |
| TXT | `send` | SPF — authorizes Resend to send as this domain |
| TXT | `resend._domainkey` | DKIM — signs outgoing mail |
| TXT | `_dmarc` | DMARC policy |

Start DMARC at `p=none` while you watch the reports, then move to `p=quarantine` once
alignment is clean. Going straight to `p=reject` on a new domain is a good way to lose
mail you cannot see.

## Giving one client their own domain

Supported without a code change. Add the domain in Resend, verify it, then set `domain`,
`from_email` and `resend_domain_id` on that workspace's sending identity row. Everything
else works unchanged.

Worth doing for a client with real volume or their own brand requirements. Not worth doing
by default.

## What the footer contains

Every marketing email carries the client's business name, their physical address and an
unsubscribe link. The address comes from the workspace profile — set it at onboarding.
Without it the footer shows a placeholder, which is a compliance gap rather than a
cosmetic one.

Emails also carry `List-Unsubscribe` and `List-Unsubscribe-Post` headers, so mail clients
show a native unsubscribe button. Gmail and Yahoo both expect this from bulk senders, and
having it is part of why complaint rates stay low.

## Bounces

A **hard** bounce marks the address dead: the contact's status becomes `bounced` and no
further email is attempted. SMS to that contact still works.

A **soft** bounce — mailbox full, temporary rejection — records the event and marks the
case-file summary stale, but does not cost the client a contact.

A **spam complaint** is treated as an opt-out, across every channel.

## Platform mail

Invites and operator notifications send from `SELESTIAL_PLATFORM_FROM`, separate from
campaign mail, so a client's list-quality problem cannot stop you inviting the next one.
