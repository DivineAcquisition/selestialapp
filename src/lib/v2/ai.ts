import 'server-only';

import Anthropic from '@anthropic-ai/sdk';

import { adminDb } from './db';

/**
 * Anthropic access for the generation pipeline.
 *
 * Everything that calls the model goes through `callModel` so the model name, prompt
 * version, token usage and latency all land in `integration_logs` — the same audit trail
 * the GHL and Resend calls write to. Campaign copy is generated content that went out
 * under a client's name, so being able to answer "which prompt produced this message"
 * months later is not optional.
 */

export const GENERATION_MODEL = process.env.SELESTIAL_GENERATION_MODEL || 'claude-sonnet-4-5-20250929';
export const SUMMARY_MODEL = process.env.SELESTIAL_SUMMARY_MODEL || 'claude-3-5-haiku-20241022';

/**
 * Bump the relevant version whenever a prompt changes. Stored on every generated
 * template and rendered message so output can be traced back to the exact prompt.
 */
export const PROMPT_VERSIONS = {
  campaignSequence: '2026-07-26.1',
  contactPersonalization: '2026-07-26.1',
  caseFileSummary: '2026-07-26.1',
} as const;

let cachedClient: Anthropic | null = null;

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function client(): Anthropic {
  if (!isAiConfigured()) {
    throw new Error('ANTHROPIC_API_KEY is not set — campaign generation is unavailable.');
  }
  if (!cachedClient) cachedClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return cachedClient;
}

export interface CallModelParams {
  workspaceId: string | null;
  operation: string;
  promptVersion: string;
  model?: string;
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ModelResult {
  text: string;
  model: string;
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
}

export async function callModel(params: CallModelParams): Promise<ModelResult> {
  const model = params.model ?? GENERATION_MODEL;
  const startedAt = Date.now();

  try {
    const response = await client().messages.create({
      model,
      max_tokens: params.maxTokens ?? 4000,
      temperature: params.temperature ?? 0.7,
      system: params.system,
      messages: [{ role: 'user', content: params.user }],
    });

    const text = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('')
      .trim();

    await logModelCall({
      workspaceId: params.workspaceId,
      operation: params.operation,
      ok: true,
      durationMs: Date.now() - startedAt,
      request: {
        model,
        promptVersion: params.promptVersion,
        systemChars: params.system.length,
        userChars: params.user.length,
      },
      response: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        stopReason: response.stop_reason,
        preview: text.slice(0, 400),
      },
      error: null,
    });

    return {
      text,
      model,
      promptVersion: params.promptVersion,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    await logModelCall({
      workspaceId: params.workspaceId,
      operation: params.operation,
      ok: false,
      durationMs: Date.now() - startedAt,
      request: { model, promptVersion: params.promptVersion },
      response: null,
      error: message,
    });

    throw err;
  }
}

async function logModelCall(input: {
  workspaceId: string | null;
  operation: string;
  ok: boolean;
  durationMs: number;
  request: unknown;
  response: unknown;
  error: string | null;
}): Promise<void> {
  try {
    await adminDb().from('integration_logs').insert({
      workspace_id: input.workspaceId,
      provider: 'anthropic',
      operation: input.operation,
      method: 'POST',
      endpoint: '/v1/messages',
      request_summary: input.request,
      status_code: input.ok ? 200 : null,
      ok: input.ok,
      response_summary: input.response,
      error: input.error,
      duration_ms: input.durationMs,
    });
  } catch (err) {
    console.error('[ai] failed to write integration log', err);
  }
}

/**
 * Extracts the first JSON value from a model response, tolerating the prose and fenced
 * code blocks models sometimes wrap output in.
 */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : text).trim();

  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Fall back to the outermost bracketed span.
    const start = candidate.search(/[[{]/);
    if (start === -1) throw new Error('Model response contained no JSON');

    const opening = candidate[start];
    const closing = opening === '[' ? ']' : '}';
    const end = candidate.lastIndexOf(closing);
    if (end <= start) throw new Error('Model response contained no complete JSON value');

    return JSON.parse(candidate.slice(start, end + 1)) as T;
  }
}
