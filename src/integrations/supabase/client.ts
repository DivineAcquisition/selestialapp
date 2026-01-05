import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let cachedClient: SupabaseBrowserClient | null = null;

function createClient(): SupabaseBrowserClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Do not throw at module import time; this file is imported widely and is
    // bundled for server builds too. Throw only when the client is actually used.
    throw new Error(
      "@supabase/ssr: Your project's URL and API key are required to create a Supabase client!",
    );
  }

  cachedClient = createBrowserClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return cachedClient;
}

export function getSupabaseClient(): SupabaseBrowserClient {
  return createClient();
}

export const supabase: SupabaseBrowserClient = new Proxy({} as SupabaseBrowserClient, {
  get(_target, prop) {
    const client = createClient();
    const value = (client as unknown as Record<PropertyKey, unknown>)[prop as PropertyKey];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});
