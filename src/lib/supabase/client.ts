import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/integrations/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  return createBrowserClient<Database>(url, key)
}

// Lazy-loaded singleton for client components
let _supabase: SupabaseClient<Database> | null = null

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    if (!_supabase) {
      _supabase = createClient()
    }
    return (_supabase as unknown as Record<string | symbol, unknown>)[prop]
  }
})
