import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Use any type for the database schema to allow all table names
// This is needed because the types file may not include all tables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDatabase = any

// Lazy-load admin client to prevent build-time errors
let _supabaseAdmin: SupabaseClient<AnyDatabase> | null = null

export function getSupabaseAdmin(): SupabaseClient<AnyDatabase> {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      throw new Error('Missing Supabase admin configuration')
    }

    _supabaseAdmin = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return _supabaseAdmin
}

// For backwards compatibility - will throw at runtime if config is missing
export const supabaseAdmin = new Proxy({} as SupabaseClient<AnyDatabase>, {
  get(_target, prop) {
    const admin = getSupabaseAdmin()
    return (admin as unknown as Record<string | symbol, unknown>)[prop]
  }
})
