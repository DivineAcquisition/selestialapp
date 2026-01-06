import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// Use placeholder values during build time to prevent build errors
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Validate that we're not using the service role key in the browser
function validateAnonKey(key: string): boolean {
  if (!key || key === 'placeholder-key') return true; // Skip validation for placeholder
  
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = key.split('.');
    if (parts.length !== 3) return true; // Not a valid JWT, let Supabase handle it
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Service role keys have role: 'service_role'
    // Anon keys have role: 'anon'
    if (payload.role === 'service_role') {
      console.error(
        '⚠️ SECURITY ERROR: You are using the service_role key in the browser!\n' +
        'This key should NEVER be exposed to the client.\n' +
        'Please use the "anon" key instead.\n\n' +
        'To fix this:\n' +
        '1. Go to your Supabase dashboard > Settings > API\n' +
        '2. Copy the "anon public" key (NOT service_role)\n' +
        '3. Update NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel environment variables'
      );
      return false;
    }
    
    return true;
  } catch {
    // If we can't decode the token, let Supabase handle validation
    return true;
  }
}

// Check key validity on initialization
const isKeyValid = validateAnonKey(SUPABASE_ANON_KEY);

// Create the client - will fail gracefully if key is invalid
export const supabase = createBrowserClient<Database>(
  SUPABASE_URL, 
  isKeyValid ? SUPABASE_ANON_KEY : 'invalid-key-detected',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
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
