'use client';

import { useState, useTransition } from 'react';

import type { CampaignTouch } from '@/lib/v2/types';
import { previewCampaign, type PreviewSample } from '../../actions';

interface Props {
  slug: string;
  campaignId: string;
  touches: CampaignTouch[];
  canWrite: boolean;
}

/**
 * The generated sequence, plus rendered previews against five real contacts.
 *
 * Templates are shown read-only on purpose. The preview is the honest view of what will
 * actually be received, because it runs the same renderer the dispatcher uses.
 */
export function SequenceView({ slug, campaignId, touches, canWrite }: Props) {
  const [pending, startTransition] = useTransition();
  const [samples, setSamples] = useState<PreviewSample[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSample, setActiveSample] = useState(0);

  function loadPreview() {
    setError(null);
    startTransition(async () => {
      const result = await previewCampaign(slug, campaignId);
      if (!result.ok) {
        setError(result.error ?? 'Could not build a preview.');
        return;
      }
      setSamples(result.samples ?? []);
      setActiveSample(0);
    });
  }

  if (touches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
        <p className="text-sm text-zinc-600">
          No sequence has been generated for this campaign yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">
          The sequence · {touches.length} touches
        </h2>
        {canWrite ? (
          <button
            type="button"
            onClick={loadPreview}
            disabled={pending}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            {pending ? 'Rendering…' : samples ? 'Refresh preview' : 'Preview 5 real contacts'}
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {samples && samples.length > 0 ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-zinc-600">Previewing:</span>
            {samples.map((sample, index) => (
              <button
                key={sample.contactId}
                type="button"
                onClick={() => setActiveSample(index)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  index === activeSample
                    ? 'bg-primary text-white'
                    : 'bg-white text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {sample.contactName}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <ol className="space-y-3">
        {touches.map((touch) => {
          const sample = samples?.[activeSample]?.messages.find(
            (m) => m.stepIndex === touch.step_index
          );

          return (
            <li key={touch.id} className="rounded-xl border border-zinc-200 bg-white">
              <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-5 py-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                  {touch.step_index + 1}
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium uppercase text-zinc-600">
                  {touch.channel}
                </span>
                <span className="text-xs text-zinc-500">{formatDelay(touch.delay_hours)}</span>
                {touch.include_optout ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    carries opt-out
                  </span>
                ) : null}
                {touch.link_kind ? (
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                    {touch.link_kind} link
                  </span>
                ) : null}
                {touch.angle ? (
                  <span className="ml-auto text-xs italic text-zinc-400">{touch.angle}</span>
                ) : null}
              </div>

              <div className="px-5 py-4">
                {sample ? (
                  <>
                    {sample.subject ? (
                      <p className="mb-2 text-sm font-semibold text-zinc-900">
                        Subject: {sample.subject}
                      </p>
                    ) : null}
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-700">
                      {sample.body}
                    </pre>
                    {sample.segments ? (
                      <p className="mt-2 text-xs text-zinc-400">
                        {sample.body.length} characters · {sample.segments} SMS segment
                        {sample.segments === 1 ? '' : 's'}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    {touch.subject_template ? (
                      <p className="mb-2 text-sm font-semibold text-zinc-900">
                        Subject: {touch.subject_template}
                      </p>
                    ) : null}
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-600">
                      {touch.body_template}
                    </pre>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-zinc-400">
        Copy is generated, not written by hand, and cannot be edited here. If the angle is wrong,
        regenerate — that is the control.
      </p>
    </div>
  );
}

function formatDelay(hours: number): string {
  if (hours === 0) return 'Immediately on launch';
  if (hours < 24) return `+${hours}h`;
  const days = Math.round(hours / 24);
  return `Day ${days + 1}`;
}
