---
title: Uploading a list
description: What Selestial accepts, how columns are detected, and exactly why a row gets rejected.
category: Running campaigns
order: 1
---

# Uploading a list

Upload the CSV your client's CRM exported. You do not need to clean it first.

## What the file can look like

The parser handles what real exports actually contain:

- Headers in any casing, with spaces, underscores or hyphens
- Quoted fields containing commas, and quoted fields containing line breaks
- Escaped double quotes (`""`)
- A UTF-8 byte-order mark
- Windows (CRLF) or Unix line endings
- Blank rows anywhere in the file
- Rows with more or fewer cells than the header

There is one hard requirement: a header row. Everything else is best-effort.

## Column detection

Selestial matches your headers against a synonym list in two passes: exact matches first,
then substrings. `Customer Name`, `customer_name`, `CUSTOMER NAME` and `Client Name` all
land on the same field. `E-Mail Address` finds email. `Last Cleaning` finds last service
date.

The detected mapping is shown for confirmation with a confidence rating:

- **High** — a name, a contact channel and a service date were all found
- **Medium** — a name and a contact channel
- **Low** — no phone or email column found, which means most of the file will be rejected

Confirming is one click. Change a dropdown only if something looks wrong.

Columns Selestial does not recognise are not discarded — they are kept on the contact and
shown on the case file under "From the import". A gate code column stays a gate code.

## Validation

**Phone numbers** are normalized to E.164. `(512) 555-0142`, `512.555.0142`,
`1-512-555-0142` and `+1 512 555 0142` all become `+15125550142`. Trailing extensions
(`x204`, `ext. 12`) are stripped rather than folded into the number.

A number Selestial cannot confidently normalize is rejected rather than guessed at. That
includes numbers that are too short, and North American numbers with an implausible area
code or exchange. Texting a wrong number is worse than dropping a row.

**Email addresses** are lowercased and syntax-checked. `Jane Doe <jane@example.com>` is
unwrapped to the address.

**Dates** are parsed from the formats exports actually use: `2024-03-09`, `3/9/2024`,
`03-09-2024`, `3/9/24`, `March 9, 2024`, and ISO timestamps. Ambiguous day/month pairs are
read US-style, month first. An impossible date (`2024-02-30`) is dropped, not shifted.

## Deduplication

A row must produce a usable phone **or** email. One is enough.

Duplicates are matched on normalized phone first, then email — the same keys the database
enforces, so two people uploading at once end in a merge rather than an error.

Duplicates inside the same file are collapsed into the first occurrence before anything is
written.

When a row matches an existing contact, Selestial **merges** rather than duplicating:

- Empty fields on the existing contact are filled in from the new row
- Fields that already have a value are left alone — a later, worse export cannot rename
  someone
- The **most recent** last-service-date wins, whichever side it came from
- Unmapped columns are added to the existing custom fields
- A system note is written to the case file recording what changed

## The import summary

After import you get counts for imported, merged and rejected, plus the number of blank
rows ignored.

Every rejected row is stored with a reason and can be downloaded as a CSV with the
original data intact — fix it in a spreadsheet and re-upload. Re-uploading corrected rows
merges them into existing contacts rather than creating duplicates.

Common rejection reasons:

| Reason | What to do |
| --- | --- |
| Row has no phone or email | Nothing — the row is not a lead |
| Neither the phone nor the email is valid | Check the phone column mapped to the right column |
| Could not be saved | Rare; check the activity log for the underlying error |

## Mirroring into GoHighLevel

Every imported and merged contact is upserted into the client's sub-account with the
`selestial:uploaded` tag and the Selestial custom fields populated.

Mirroring is best-effort. If GHL is unavailable, the import still succeeds and the
mirror-failure count is reported — Selestial's data is never held hostage to GHL's
availability. Contacts that failed to mirror are retried the first time a message is sent
to them.

## A list belongs to exactly one campaign

You pick or create the campaign at upload time. This is not a limitation to work around —
it is what makes generation possible, because the copy is written for the specific
characteristics of that list.
