import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazily-initialized Supabase admin client (service-role).
 *
 * Why lazy?
 * Next.js build's "Collecting page data" step evaluates route module bodies.
 * If we instantiate a Supabase client at the top level with `process.env.X!`,
 * a missing env var will throw `supabaseUrl is required` and break the build.
 * By deferring instantiation until the first request, the build can succeed
 * even when env vars are absent at build time (they're injected at runtime).
 *
 * Server-side only — never import from a client component.
 */

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
        'SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in your environment.'
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
