import 'server-only';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * The v2 tables do not exist in the generated `Database` type (which reflects the v1
 * live schema), so v2 access uses a deliberately untyped client. Row shapes come from
 * `@/lib/v2/types` at the call site instead.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = SupabaseClient<any, 'public', any>;

/**
 * Request-scoped client carrying the caller's session. RLS applies, so this is what
 * every read on behalf of a signed-in user should use — isolation is enforced by the
 * database rather than by remembering to add a `workspace_id` filter.
 */
export async function userDb(): Promise<Db> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Components cannot set cookies; middleware already refreshed the session.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // See above.
          }
        },
      },
    }
  ) as Db;
}

let cachedAdmin: Db | null = null;

/**
 * Service-role client. Bypasses RLS, so it is only for work the user cannot do on their
 * own behalf: webhook intake, cron dispatch, provisioning, and writes to append-only
 * tables (events, logs, activity). Callers must scope by `workspace_id` themselves.
 *
 * Constructed lazily so a missing env var fails the request rather than the build.
 */
export function adminDb(): Db {
  if (cachedAdmin) return cachedAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Selestial v2 requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. ' +
        'The anon key is not a valid substitute here — v2 server work writes to tables ' +
        'that are intentionally unwritable under RLS.'
    );
  }

  cachedAdmin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  }) as Db;

  return cachedAdmin;
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
