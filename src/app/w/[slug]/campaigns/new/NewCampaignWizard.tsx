'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import {
  applyMapping,
  CONTACT_FIELDS,
  detectMapping,
  FIELD_LABELS,
  mappingConfidence,
  parseCsv,
  type ColumnMapping,
  type ContactField,
} from '@/lib/v2/csv';
import { normalizeEmail, normalizePhone } from '@/lib/v2/normalize';
import { createCampaignAndImport } from '../../actions';

interface Props {
  slug: string;
  workspaceProvisioned: boolean;
  defaultBookingUrl: string;
}

interface FilePreview {
  headers: string[];
  rows: string[][];
  blankRowCount: number;
  mapping: ColumnMapping;
  confidence: 'high' | 'medium' | 'low';
  reachable: number;
  unreachable: number;
}

/**
 * Upload → confirm mapping → launch prep.
 *
 * The file is parsed in the browser purely so the operator can see the detected mapping
 * and a reachability count before committing. The authoritative parse, validation and
 * dedupe all happen server-side against the same functions.
 */
export function NewCampaignWizard({ slug, workspaceProvisioned, defaultBookingUrl }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [error, setError] = useState<string | null>(null);

  const onFile = useCallback(async (selected: File) => {
    setError(null);
    setFile(selected);

    const text = await selected.text();
    const parsed = parseCsv(text);

    if (parsed.headers.length === 0) {
      setError('That file has no header row we can read.');
      setPreview(null);
      return;
    }

    const detected = detectMapping(parsed.headers);

    let reachable = 0;
    for (const row of parsed.rows.slice(0, 500)) {
      const { values } = applyMapping(parsed.headers, row, detected);
      if (normalizePhone(values.phone ?? null) || normalizeEmail(values.email ?? null)) reachable++;
    }

    const sampled = Math.min(parsed.rows.length, 500);

    setMapping(detected);
    setPreview({
      headers: parsed.headers,
      rows: parsed.rows.slice(0, 5),
      blankRowCount: parsed.blankRowCount,
      mapping: detected,
      confidence: mappingConfidence(detected),
      reachable,
      unreachable: sampled - reachable,
    });
  }, []);

  function submit(formData: FormData) {
    setError(null);
    formData.set('mapping', JSON.stringify(mapping));

    startTransition(async () => {
      const result = await createCampaignAndImport(slug, formData);
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      if (result.redirectTo) router.push(result.redirectTo);
    });
  }

  return (
    <form action={submit} className="max-w-3xl space-y-6">
      {!workspaceProvisioned ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This workspace has no GoHighLevel sub-account yet, so contacts will not be mirrored and
          SMS cannot be sent. Email still works. Finish provisioning to enable SMS.
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900">1. The list</h2>
        <p className="mt-1 text-xs text-zinc-500">
          A CSV export of dormant customers. Messy headers, blank rows and duplicates are fine.
        </p>

        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) void onFile(selected);
          }}
          className="mt-4 block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90"
        />

        {preview ? (
          <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm">
            <p className="text-zinc-700">
              <strong className="tabular-nums">{preview.reachable}</strong> of the first{' '}
              {preview.reachable + preview.unreachable} rows have a usable phone or email.
              {preview.unreachable > 0 ? (
                <>
                  {' '}
                  <span className="text-zinc-500">
                    The other {preview.unreachable} will be rejected with a reason you can download.
                  </span>
                </>
              ) : null}
            </p>
            {preview.blankRowCount > 0 ? (
              <p className="mt-1 text-xs text-zinc-500">
                {preview.blankRowCount} blank row{preview.blankRowCount === 1 ? '' : 's'} ignored.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      {preview ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">2. Confirm the columns</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Detected automatically. Change one only if it looks wrong.
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                preview.confidence === 'high'
                  ? 'bg-emerald-50 text-emerald-700'
                  : preview.confidence === 'medium'
                    ? 'bg-sky-50 text-sky-700'
                    : 'bg-amber-50 text-amber-700'
              }`}
            >
              {preview.confidence} confidence
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {CONTACT_FIELDS.map((field) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <span className="w-36 shrink-0 text-zinc-600">{FIELD_LABELS[field]}</span>
                <select
                  value={mapping[field] ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    setMapping((current) => {
                      const next = { ...current };
                      if (value === '') delete next[field];
                      else next[field] = Number(value);
                      return next;
                    });
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
                >
                  <option value="">Not in this file</option>
                  {preview.headers.map((header, index) => (
                    <option key={`${header}-${index}`} value={index}>
                      {header || `Column ${index + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-700">
              Preview the first rows
            </summary>
            <div className="mt-2 overflow-x-auto rounded-lg border border-zinc-100">
              <table className="w-full text-xs">
                <thead className="bg-zinc-50">
                  <tr>
                    {preview.headers.map((header, index) => (
                      <th key={index} className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-zinc-600">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-zinc-100">
                      {preview.headers.map((_, cellIndex) => (
                        <td key={cellIndex} className="whitespace-nowrap px-2 py-1.5 text-zinc-600">
                          {row[cellIndex] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900">3. The campaign</h2>

        <div className="mt-4 space-y-4">
          <Field label="Campaign name" hint="Only you see this.">
            <input
              name="name"
              required
              defaultValue={`Reactivation — ${new Date().toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}`}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <select
                name="kind"
                defaultValue="reactivation"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                <option value="reactivation">Reactivation</option>
                <option value="winback">Win-back</option>
                <option value="referral">Referral</option>
                <option value="review">Review request</option>
              </select>
            </Field>

            <Field label="Channels">
              <select
                name="channel_mix"
                defaultValue={workspaceProvisioned ? 'both' : 'email'}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                <option value="both">SMS and email</option>
                <option value="sms">SMS only</option>
                <option value="email">Email only</option>
              </select>
            </Field>
          </div>

          <Field
            label="Offer"
            hint="Optional. Left blank, Selestial will not invent a discount."
          >
            <input
              name="offer"
              placeholder="e.g. $40 off the first clean back"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Booking link" hint="Where every tracked link points.">
              <input
                name="booking_url"
                type="url"
                defaultValue={defaultBookingUrl}
                placeholder="https://…"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Daily send cap" hint="Contacts started per day.">
              <input
                name="daily_cap"
                type="number"
                min={10}
                max={5000}
                defaultValue={250}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || !file}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Importing and generating…' : 'Import list and generate campaign'}
        </button>
        <p className="text-xs text-zinc-500">
          Nothing sends until you review the sequence and press launch.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}
