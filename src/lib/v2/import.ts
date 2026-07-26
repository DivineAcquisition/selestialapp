import 'server-only';

import { SELESTIAL_TAGS } from '@/lib/ghl/config';
import { logActivity } from './activity';
import { applyMapping, type ColumnMapping, parseCsv } from './csv';
import { adminDb } from './db';
import { recordEvent } from './events';
import { mirrorContactToGhl } from './ghl-sync';
import {
  normalizeDate,
  normalizeEmail,
  normalizeMoneyCents,
  normalizePhone,
  splitName,
} from './normalize';
import type { Contact, Workspace } from './types';

export interface ImportSummary {
  listId: string;
  rows: number;
  imported: number;
  merged: number;
  rejected: number;
  blankRows: number;
  mirrored: number;
  mirrorFailures: number;
}

interface CandidateContact {
  rowNumber: number;
  raw: Record<string, string>;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  phone_raw: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  last_service_date: string | null;
  service_type: string | null;
  lifetime_value_cents: number | null;
  imported_notes: string | null;
  custom_fields: Record<string, string>;
}

interface Rejection {
  rowNumber: number;
  reason: string;
  raw: Record<string, string>;
}

/**
 * Turns one CSV row into a contact candidate, or a rejection with a reason the operator
 * can act on. A row must yield at least one reachable channel — a contact we cannot text
 * or email is not a lead, it is noise in the dashboard.
 */
function buildCandidate(
  headers: string[],
  row: string[],
  mapping: ColumnMapping,
  rowNumber: number
): CandidateContact | Rejection {
  const { values, extras } = applyMapping(headers, row, mapping);

  const raw: Record<string, string> = { ...extras };
  headers.forEach((header, index) => {
    if (row[index] !== undefined && row[index] !== '') raw[header] = row[index];
  });

  const rawPhone = values.phone ?? null;
  const rawEmail = values.email ?? null;

  const phone = normalizePhone(rawPhone);
  const email = normalizeEmail(rawEmail);

  if (!phone && !email) {
    const reason = rawPhone || rawEmail
      ? `Neither the phone (${rawPhone ?? 'none'}) nor the email (${rawEmail ?? 'none'}) is valid`
      : 'Row has no phone or email';
    return { rowNumber, reason, raw };
  }

  const name = splitName(values.full_name, values.first_name, values.last_name);

  return {
    rowNumber,
    raw,
    first_name: name.firstName,
    last_name: name.lastName,
    full_name: name.fullName,
    email,
    phone,
    phone_raw: rawPhone,
    address: values.address ?? null,
    city: values.city ?? null,
    state: values.state ?? null,
    postal_code: values.postal_code ?? null,
    last_service_date: normalizeDate(values.last_service_date),
    service_type: values.service_type ?? null,
    lifetime_value_cents: normalizeMoneyCents(values.lifetime_value),
    imported_notes: values.notes ?? null,
    custom_fields: extras,
  };
}

function isRejection(value: CandidateContact | Rejection): value is Rejection {
  return 'reason' in value;
}

/** Merges imported values into an existing contact without overwriting good data with blanks. */
function mergePatch(existing: Contact, candidate: CandidateContact): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  const preferNew = <K extends keyof Contact>(key: K, value: unknown) => {
    if (value === null || value === undefined || value === '') return;
    if (existing[key] === value) return;
    patch[key as string] = value;
  };

  // Identity: only fill gaps, never rename someone from a worse source.
  if (!existing.first_name) preferNew('first_name', candidate.first_name);
  if (!existing.last_name) preferNew('last_name', candidate.last_name);
  if (!existing.full_name) preferNew('full_name', candidate.full_name);
  if (!existing.email) preferNew('email', candidate.email);
  if (!existing.phone) preferNew('phone', candidate.phone);
  if (!existing.address) preferNew('address', candidate.address);
  if (!existing.city) preferNew('city', candidate.city);
  if (!existing.state) preferNew('state', candidate.state);
  if (!existing.postal_code) preferNew('postal_code', candidate.postal_code);
  if (!existing.service_type) preferNew('service_type', candidate.service_type);
  if (!existing.imported_notes) preferNew('imported_notes', candidate.imported_notes);
  if (existing.lifetime_value_cents == null) {
    preferNew('lifetime_value_cents', candidate.lifetime_value_cents);
  }

  // Service history: the most recent date wins, whichever side it came from.
  if (
    candidate.last_service_date &&
    (!existing.last_service_date || candidate.last_service_date > existing.last_service_date)
  ) {
    patch.last_service_date = candidate.last_service_date;
  }

  if (Object.keys(candidate.custom_fields).length > 0) {
    patch.custom_fields = { ...existing.custom_fields, ...candidate.custom_fields };
  }

  // Any new information is a reason to refresh the case-file narrative.
  if (Object.keys(patch).length > 0) patch.ai_summary_stale = true;

  return patch;
}

export interface RunImportParams {
  workspace: Workspace;
  csvText: string;
  mapping: ColumnMapping;
  listName: string;
  sourceFilename?: string;
  campaignId: string;
  importedBy?: string | null;
  /** Mirroring into GHL is skipped when the sub-account is not provisioned yet. */
  mirrorToGhl?: boolean;
}

/**
 * Imports a CSV into contacts, deduped against the workspace.
 *
 * Dedupe is by normalized phone first, then email — the same keys the database enforces
 * with partial unique indexes, so a race between two uploads ends in a merge rather than
 * a constraint error. Duplicates *within* one file are collapsed too.
 */
export async function runImport(params: RunImportParams): Promise<ImportSummary> {
  const db = adminDb();
  const { workspace } = params;

  const parsed = parseCsv(params.csvText);

  const { data: listRow, error: listError } = await db
    .from('contact_lists')
    .insert({
      workspace_id: workspace.id,
      campaign_id: params.campaignId,
      name: params.listName,
      source_filename: params.sourceFilename ?? null,
      status: 'importing',
      column_mapping: params.mapping,
      imported_by: params.importedBy ?? null,
    })
    .select('id')
    .single();

  if (listError) throw listError;
  const listId = listRow.id as string;

  // ---- Build candidates -------------------------------------------------
  const candidates: CandidateContact[] = [];
  const rejections: Rejection[] = [];

  const seenPhones = new Map<string, number>();
  const seenEmails = new Map<string, number>();

  parsed.rows.forEach((row, index) => {
    const rowNumber = index + 2; // +1 for zero-index, +1 for the header row
    const result = buildCandidate(parsed.headers, row, params.mapping, rowNumber);

    if (isRejection(result)) {
      rejections.push(result);
      return;
    }

    // Collapse duplicates inside the same file into the first occurrence.
    const phoneDupe = result.phone ? seenPhones.get(result.phone) : undefined;
    const emailDupe = result.email ? seenEmails.get(result.email) : undefined;
    const dupeIndex = phoneDupe ?? emailDupe;

    if (dupeIndex !== undefined) {
      const target = candidates[dupeIndex];
      Object.assign(target, {
        email: target.email ?? result.email,
        phone: target.phone ?? result.phone,
        last_service_date:
          result.last_service_date && (!target.last_service_date || result.last_service_date > target.last_service_date)
            ? result.last_service_date
            : target.last_service_date,
        custom_fields: { ...target.custom_fields, ...result.custom_fields },
      });
      return;
    }

    const position = candidates.push(result) - 1;
    if (result.phone) seenPhones.set(result.phone, position);
    if (result.email) seenEmails.set(result.email, position);
  });

  // ---- Match against existing contacts ----------------------------------
  const existingByPhone = new Map<string, Contact>();
  const existingByEmail = new Map<string, Contact>();

  const phones = candidates.map((c) => c.phone).filter((p): p is string => Boolean(p));
  const emails = candidates.map((c) => c.email).filter((e): e is string => Boolean(e));

  for (const chunk of chunked(phones, 200)) {
    const { data } = await db
      .from('contacts')
      .select('*')
      .eq('workspace_id', workspace.id)
      .in('phone', chunk);
    for (const row of (data ?? []) as Contact[]) {
      if (row.phone) existingByPhone.set(row.phone, row);
    }
  }

  for (const chunk of chunked(emails, 200)) {
    const { data } = await db
      .from('contacts')
      .select('*')
      .eq('workspace_id', workspace.id)
      .in('email', chunk);
    for (const row of (data ?? []) as Contact[]) {
      if (row.email) existingByEmail.set(row.email, row);
    }
  }

  // ---- Insert or merge ---------------------------------------------------
  const importedIds: string[] = [];
  const mergedIds: string[] = [];

  for (const candidate of candidates) {
    const existing =
      (candidate.phone ? existingByPhone.get(candidate.phone) : undefined) ??
      (candidate.email ? existingByEmail.get(candidate.email) : undefined);

    if (existing) {
      const patch = mergePatch(existing, candidate);
      if (Object.keys(patch).length > 0) {
        patch.source_list_id = existing.source_list_id ?? listId;
        await db.from('contacts').update(patch).eq('id', existing.id);
      }

      await db.from('contact_list_members').upsert(
        {
          workspace_id: workspace.id,
          list_id: listId,
          contact_id: existing.id,
          was_merged: true,
        },
        { onConflict: 'list_id,contact_id', ignoreDuplicates: true }
      );

      await db.from('contact_notes').insert({
        workspace_id: workspace.id,
        contact_id: existing.id,
        kind: 'system',
        body: `Merged from list "${params.listName}" (row ${candidate.rowNumber}). ${
          Object.keys(patch).length > 0
            ? `Updated: ${Object.keys(patch).filter((k) => k !== 'ai_summary_stale').join(', ')}.`
            : 'No new information.'
        }`,
      });

      await recordEvent({
        workspaceId: workspace.id,
        contactId: existing.id,
        eventType: 'contact_merged',
        metadata: { listId, listName: params.listName, rowNumber: candidate.rowNumber },
      });

      mergedIds.push(existing.id);
      continue;
    }

    const { data: inserted, error: insertError } = await db
      .from('contacts')
      .insert({
        workspace_id: workspace.id,
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        full_name: candidate.full_name,
        email: candidate.email,
        phone: candidate.phone,
        phone_raw: candidate.phone_raw,
        address: candidate.address,
        city: candidate.city,
        state: candidate.state,
        postal_code: candidate.postal_code,
        timezone: workspace.timezone,
        last_service_date: candidate.last_service_date,
        service_type: candidate.service_type,
        lifetime_value_cents: candidate.lifetime_value_cents,
        imported_notes: candidate.imported_notes,
        custom_fields: candidate.custom_fields,
        source_list_id: listId,
      })
      .select('id')
      .maybeSingle();

    if (insertError || !inserted) {
      rejections.push({
        rowNumber: candidate.rowNumber,
        reason: insertError?.message ?? 'Could not be saved',
        raw: candidate.raw,
      });
      continue;
    }

    const contactId = inserted.id as string;

    await db.from('contact_list_members').insert({
      workspace_id: workspace.id,
      list_id: listId,
      contact_id: contactId,
    });

    await db.from('contact_notes').insert({
      workspace_id: workspace.id,
      contact_id: contactId,
      kind: 'system',
      body: `Imported from list "${params.listName}" (row ${candidate.rowNumber}).`,
    });

    await recordEvent({
      workspaceId: workspace.id,
      contactId,
      eventType: 'contact_imported',
      metadata: { listId, listName: params.listName, rowNumber: candidate.rowNumber },
    });

    importedIds.push(contactId);
  }

  // ---- Persist rejects ---------------------------------------------------
  if (rejections.length > 0) {
    for (const chunk of chunked(rejections, 500)) {
      await db.from('import_rejects').insert(
        chunk.map((r) => ({
          workspace_id: workspace.id,
          list_id: listId,
          row_number: r.rowNumber,
          reason: r.reason,
          raw: r.raw,
        }))
      );
    }
  }

  // ---- Mirror into GHL ---------------------------------------------------
  let mirrored = 0;
  let mirrorFailures = 0;

  if (params.mirrorToGhl !== false && workspace.ghl_location_id) {
    const touchedIds = [...importedIds, ...mergedIds];

    for (const chunk of chunked(touchedIds, 100)) {
      const { data } = await db.from('contacts').select('*').in('id', chunk);
      for (const contact of (data ?? []) as Contact[]) {
        const result = await mirrorContactToGhl(workspace, contact, {
          tags: [SELESTIAL_TAGS.uploaded],
        });
        if (result.ok) mirrored++;
        else mirrorFailures++;
      }
    }
  }

  const stats = {
    rows: parsed.rows.length,
    imported: importedIds.length,
    merged: mergedIds.length,
    rejected: rejections.length,
    blankRows: parsed.blankRowCount,
    mirrored,
    mirrorFailures,
  };

  await db
    .from('contact_lists')
    .update({ status: 'ready', stats })
    .eq('id', listId);

  await logActivity({
    workspaceId: workspace.id,
    actorType: params.importedBy ? 'user' : 'system',
    actorId: params.importedBy ?? null,
    action: 'list.imported',
    summary:
      `Imported "${params.listName}": ${stats.imported} new contacts, ${stats.merged} merged into ` +
      `existing records, ${stats.rejected} rejected.`,
    entityType: 'contact_list',
    entityId: listId,
    metadata: { ...stats, campaignId: params.campaignId, mapping: params.mapping },
  });

  return { listId, ...stats };
}

function chunked<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}
