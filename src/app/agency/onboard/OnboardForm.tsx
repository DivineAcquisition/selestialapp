'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { onboardClient } from '../actions';

interface Props {
  existingLocations: { id: string; name?: string }[];
  lookupError: string | null;
  authMode: string | null;
}

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
];

export function OnboardForm({ existingLocations, lookupError, authMode }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'create' | 'connect'>('create');

  function submit(formData: FormData) {
    setError(null);
    if (mode === 'create') formData.delete('existing_location_id');

    startTransition(async () => {
      const result = await onboardClient(formData);
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      if (result.redirectTo) router.push(result.redirectTo);
    });
  }

  return (
    <form action={submit} className="max-w-2xl space-y-6">
      <Section
        title="The business"
        description="This is what message generation is told about them, so specifics pay off."
      >
        <Field label="Business name" required>
          <input name="business_name" required className={inputClass} placeholder="Sparkle Clean Co" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Owner name">
            <input name="owner_name" className={inputClass} placeholder="Dana Reyes" />
          </Field>
          <Field label="Owner email" required hint="Where the workspace invite goes.">
            <input name="email" type="email" required className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <input name="phone" className={inputClass} placeholder="(512) 555-0142" />
          </Field>
          <Field label="Website">
            <input name="website" type="url" className={inputClass} placeholder="https://…" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Timezone" hint="Send windows are enforced in the contact's local time.">
            <select name="timezone" defaultValue="America/Chicago" className={inputClass}>
              {TIMEZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone.replace('America/', '').replace('_', ' ')}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Service area">
            <input name="service_area" className={inputClass} placeholder="Austin and Round Rock" />
          </Field>
        </div>

        <Field label="Services" hint="Comma separated.">
          <input
            name="service_types"
            className={inputClass}
            placeholder="Deep clean, Recurring clean, Move-out"
          />
        </Field>

        <Field
          label="Physical address"
          hint="Required by law on marketing email. Without it, emails carry a placeholder."
        >
          <input name="physical_address" className={inputClass} placeholder="123 Main St, Austin TX 78701" />
        </Field>

        <Field label="Booking link" hint="Where tracked links send people.">
          <input name="booking_url" type="url" className={inputClass} placeholder="https://…" />
        </Field>
      </Section>

      <Section title="Voice" description="Optional, but it makes the generated copy sound like them.">
        <Field label="Tone">
          <input
            name="tone"
            className={inputClass}
            placeholder="warm and direct, never salesy"
          />
        </Field>
        <Field label="Positioning">
          <input
            name="positioning"
            className={inputClass}
            placeholder="premium residential cleaning, same crew every visit"
          />
        </Field>
        <Field label="What makes them different">
          <textarea
            name="differentiators"
            rows={2}
            className={inputClass}
            placeholder="Background-checked staff, 48-hour re-clean guarantee"
          />
        </Field>
      </Section>

      <Section
        title="GoHighLevel sub-account"
        description={
          authMode
            ? `Connected using ${authMode.replace('_', ' ')} authentication.`
            : 'Not connected. The workspace will be created without a sub-account.'
        }
      >
        <div className="flex gap-2">
          <ModeButton active={mode === 'create'} onClick={() => setMode('create')}>
            Create a new one
          </ModeButton>
          <ModeButton
            active={mode === 'connect'}
            onClick={() => setMode('connect')}
            disabled={existingLocations.length === 0}
          >
            Connect an existing one
            {existingLocations.length > 0 ? ` (${existingLocations.length})` : ''}
          </ModeButton>
        </div>

        {mode === 'connect' ? (
          <div className="mt-4">
            <Field label="Sub-account" hint="Fields, tags and webhooks are still provisioned into it.">
              <select name="existing_location_id" className={inputClass} required>
                <option value="">Choose a sub-account</option>
                {existingLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name ?? location.id}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-600">
            Selestial creates the sub-account under your agency, applies the standard snapshot if
            one is configured, then provisions the custom fields, the tag taxonomy and the webhook
            subscription.
          </p>
        )}

        {lookupError ? (
          <p className="mt-3 text-xs text-amber-700">
            Could not list existing sub-accounts: {lookupError}
          </p>
        ) : null}
      </Section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? 'Creating…' : 'Create workspace and provision'}
      </button>
    </form>
  );
}

const inputClass = 'w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      {description ? <p className="mt-1 text-xs text-zinc-500">{description}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-700">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}

function ModeButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'bg-zinc-900 text-white' : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
      }`}
    >
      {children}
    </button>
  );
}
