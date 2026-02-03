// Re-export from the main client file to ensure single instance
// This prevents PKCE issues where different instances have different storage
export { supabase, isSupabaseConfigured, isServiceRoleKeyError } from '@/integrations/supabase/client'

// Also export createClient for compatibility
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/integrations/supabase/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    isSingleton: true
  })
}

export function getSupabaseClient() {
  // Import and return the singleton from integrations
  const { supabase } = require('@/integrations/supabase/client')
  return supabase
}
