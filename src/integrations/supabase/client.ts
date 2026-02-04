import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// Use placeholder values during build time to prevent build errors
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Validate that we're not using the service role key in the browser
function validateAnonKey(key: string): boolean {
  if (!key || key === 'placeholder-key') return true;
  try {
    const parts = key.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.role === 'service_role') {
      console.error('⚠️ SECURITY ERROR: Using service_role key in browser!');
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

const isKeyValid = validateAnonKey(SUPABASE_ANON_KEY);

// Create the Supabase browser client
// Using createBrowserClient from @supabase/ssr which handles cookies automatically
// This is critical for PKCE OAuth flow where code_verifier must persist across redirects
export const supabase = createBrowserClient<Database>(
  SUPABASE_URL,
  isKeyValid ? SUPABASE_ANON_KEY : 'invalid-key'
);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return (
    isKeyValid &&
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
  );
};

// Export validation status for use in components
export const isServiceRoleKeyError = !isKeyValid;
