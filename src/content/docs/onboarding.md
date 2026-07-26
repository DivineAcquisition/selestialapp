---
title: Onboarding a client
description: What happens between filling in the form and the client having a working workspace.
category: Getting started
order: 1
---

# Onboarding a client

Onboarding is one form. Everything downstream of it is automatic.

## What you fill in

Go to **Agency → Onboard a client**. The form asks for three kinds of thing:

**Identity** — business name, owner name, owner email, phone, website. The owner email is
the only strictly required field beyond the name, because it is how the client gets access.

**Operating details** — timezone, service area, the services they sell, physical address,
booking link.

Two of these matter more than they look:

- **Timezone** is the fallback for send windows. Every message is scheduled in the
  *contact's* timezone where we know it, and the workspace timezone where we do not. Get
  this wrong and a Texas client's list gets texted on Pacific hours.
- **Physical address** is legally required on marketing email. Without it, emails go out
  with a placeholder in the footer, which is a compliance problem, not a cosmetic one.

**Voice** — tone, positioning, what makes them different. Optional, and the single
highest-leverage thing you can fill in. This is fed verbatim into campaign generation. A
client whose profile says *"warm and direct, never salesy, same crew every visit"* gets
noticeably different copy from one with an empty profile.

## What happens on submit

The workspace row is written first, before any GoHighLevel call. That is deliberate: if
GHL is down, you have a retryable record rather than a lost form.

Then five provisioning steps run in the background. You are redirected to a page that
shows them ticking over live.

1. **Creating the GoHighLevel sub-account** — creates the location under your agency and
   applies your standard snapshot if `GHL_DEFAULT_SNAPSHOT_ID` is set.
2. **Storing the sub-account token** — pauses here until someone pastes in the Private
   Integration Token from inside the new sub-account. The agency credential can create a
   sub-account but cannot work inside one, so everything below needs this.
3. **Provisioning custom fields** — creates the four Selestial fields, or reuses them if
   they already exist.
4. **Provisioning the tag taxonomy** — the six `selestial:*` tags.
5. **Registering webhooks** — see [GHL provisioning](/docs/ghl-provisioning) for why this
   step often lands on "action needed" rather than "done".
6. **Inviting the client owner** — emails the invite.

Steps 2 and 5 are the two that wait on a human. Both show as "action needed" rather than
failing, and the pipeline picks up again by itself once the token is saved.

Every step is idempotent. Re-running one that already succeeded does nothing harmful, so
"Retry" is always safe to press.

## Connecting an existing sub-account

If the client already has a sub-account in your agency, choose **Connect an existing one**
and pick it from the list. Selestial attaches the workspace to it and then runs steps 2
through 5 against it exactly as it would for a new one. Nothing in their existing
sub-account is deleted or overwritten.

You can also connect one later from **Agency → the workspace → Connect an existing
sub-account** if you have the location ID.

## When a step fails

The step goes red with the error from GoHighLevel attached, and the pipeline stops rather
than running later steps against a half-built sub-account. Fix the cause, press Retry on
that step, then **Run remaining steps**.

The most common causes:

- **No agency token.** Connect the agency at **Agency → Integrations** first.
- **Snapshot ID wrong.** Clear `GHL_DEFAULT_SNAPSHOT_ID` and retry to create a bare
  sub-account.
- **Rate limited.** The step retries on its own with backoff; if it still fails, wait a
  minute and press Retry.

## What the client sees

An invite email with a link valid for 14 days. Accepting it signs them in and drops them
straight into their own workspace — they never see another client's data, and there is
nothing for them to configure.

Re-sending an invite from the workspace page mints a new link and invalidates the old one.
