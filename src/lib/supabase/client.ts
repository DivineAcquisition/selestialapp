// Re-export everything from the main client file to ensure single instance
export { 
  supabase, 
  isSupabaseConfigured, 
  isServiceRoleKeyError 
} from '@/integrations/supabase/client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/integrations/supabase/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export function getSupabaseClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}
