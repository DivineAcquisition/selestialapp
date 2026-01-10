import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

// Lazy-load admin client to prevent build-time errors
let _supabaseAdmin: SupabaseClient<Database> | null = null

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      throw new Error('Missing Supabase admin configuration')
    }

    _supabaseAdmin = createClient<Database>(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return _supabaseAdmin
}

// For backwards compatibility - will throw at runtime if config is missing
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const admin = getSupabaseAdmin()
    return (admin as unknown as Record<string | symbol, unknown>)[prop]
  }
})

// Helper function for creating admin client dynamically (for use in API routes)
// This prevents build-time errors by not instantiating at module level
// Note: Using untyped client to support tables not in the generated types
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }
  
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
