import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazily-initialized Supabase admin client (service-role).
 *
 * Why lazy?
 * Next.js build's "Collecting page data" step evaluates route module bodies.
 * If we instantiate a Supabase client at the top level with `process.env.X!`,
 * a missing env var will throw `supabaseUrl is required` and break the build.
 * Deferring instantiation until the first request lets the build succeed
 * even when env vars are absent at build time (they're injected at runtime).
 *
 * Server-side only — never import from a client component.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDatabase = any;

let _supabaseAdmin: SupabaseClient<AnyDatabase> | null = null;

export function getSupabaseAdmin(): SupabaseClient<AnyDatabase> {
  if (_supabaseAdmin) return _supabaseAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
        'SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in your environment.'
    );
  }

  _supabaseAdmin = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return _supabaseAdmin;
}

/**
 * Backwards-compatible proxy. Resolves to the lazy admin client on first
 * property access. Throws at runtime (not module load) if env vars missing.
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient<AnyDatabase>, {
  get(_target, prop) {
    const admin = getSupabaseAdmin();
    return (admin as unknown as Record<string | symbol, unknown>)[prop];
  },
});
