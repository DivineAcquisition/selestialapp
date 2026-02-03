import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

// ============================================================================
// CONNECTION STATUS
// ============================================================================

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

export interface ConnectionState {
  status: ConnectionStatus
  latency?: number
  error?: string
  lastChecked: Date
}

/**
 * Check if the Supabase connection is working
 */
export async function checkConnection(
  supabase: SupabaseClient<Database>
): Promise<ConnectionState> {
  const startTime = Date.now()
  
  try {
    // Perform a simple query to check connection
    const { error } = await supabase
      .from('businesses')
      .select('id')
      .limit(1)
      .maybeSingle()
    
    const latency = Date.now() - startTime
    
    if (error) {
      // RLS error is okay - it means we're connected but no data access
      if (error.code === 'PGRST116' || error.message.includes('permission')) {
        return {
          status: 'connected',
          latency,
          lastChecked: new Date(),
        }
      }
      
      return {
        status: 'error',
        error: error.message,
        latency,
        lastChecked: new Date(),
      }
    }
    
    return {
      status: 'connected',
      latency,
      lastChecked: new Date(),
    }
  } catch (err) {
    return {
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
      latency: Date.now() - startTime,
      lastChecked: new Date(),
    }
  }
}

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

export interface SupabaseConfig {
  url: string | undefined
  anonKey: string | undefined
  serviceRoleKey?: string | undefined
}

export interface ConfigValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate Supabase configuration
 */
export function validateConfig(config: SupabaseConfig): ConfigValidation {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check URL
  if (!config.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set')
  } else if (config.url === 'https://placeholder.supabase.co') {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is still set to placeholder value')
  } else if (!config.url.includes('supabase')) {
    warnings.push('NEXT_PUBLIC_SUPABASE_URL does not appear to be a Supabase URL')
  }
  
  // Check anon key
  if (!config.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  } else if (config.anonKey === 'placeholder-key') {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is still set to placeholder value')
  } else if (!config.anonKey.startsWith('eyJ')) {
    warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY does not appear to be a valid JWT')
  }
  
  // Check if using service role key in browser (security issue)
  if (config.anonKey && config.anonKey.startsWith('eyJ')) {
    try {
      const parts = config.anonKey.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        if (payload.role === 'service_role') {
          errors.push('SECURITY: service_role key is being used as anon key - this is a security risk!')
        }
      }
    } catch {
      // Can't decode, that's fine
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get current Supabase configuration from environment
 */
export function getCurrentConfig(): SupabaseConfig {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

/**
 * Check if Supabase is properly configured (for runtime checks)
 */
export function isSupabaseConfigured(): boolean {
  const config = getCurrentConfig()
  return validateConfig(config).isValid
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

export type QueryResult<T> = {
  data: T | null
  error: Error | null
  count?: number
}

/**
 * Execute a Supabase query with error handling
 */
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: Error | null; count?: number | null }>
): Promise<QueryResult<T>> {
  try {
    const { data, error, count } = await queryFn()
    
    if (error) {
      return {
        data: null,
        error: error as Error,
        count: undefined,
      }
    }
    
    return {
      data,
      error: null,
      count: count ?? undefined,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
    }
  }
}

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

/**
 * Calculate offset for pagination
 */
export function getPaginationRange(params: PaginationParams): { from: number; to: number } {
  const { page, pageSize } = params
  const from = page * pageSize
  const to = from + pageSize - 1
  return { from, to }
}

// ============================================================================
// REALTIME HELPERS
// ============================================================================

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

export interface RealtimeConfig {
  table: string
  schema?: string
  filter?: string
  event?: RealtimeEvent
}

/**
 * Create a realtime subscription configuration
 */
export function createRealtimeConfig(
  table: string,
  options?: Partial<Omit<RealtimeConfig, 'table'>>
): RealtimeConfig {
  return {
    table,
    schema: options?.schema ?? 'public',
    event: options?.event ?? '*',
    filter: options?.filter,
  }
}

// ============================================================================
// DATE HELPERS FOR SUPABASE
// ============================================================================

/**
 * Format a date for Supabase (ISO string)
 */
export function toSupabaseDate(date: Date): string {
  return date.toISOString()
}

/**
 * Parse a Supabase date string to Date
 */
export function fromSupabaseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null
  return new Date(dateStr)
}

// ============================================================================
// BUSINESS CONTEXT HELPERS
// ============================================================================

/**
 * Get the current user's business ID from context
 * This is a helper to ensure business_id is always included in queries
 */
export function withBusinessId<T extends Record<string, unknown>>(
  businessId: string,
  data: T
): T & { business_id: string } {
  return {
    ...data,
    business_id: businessId,
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export interface SupabaseErrorInfo {
  code: string
  message: string
  hint?: string
  isAuthError: boolean
  isRLSError: boolean
  isNetworkError: boolean
}

/**
 * Parse and categorize Supabase errors
 */
export function parseSupabaseError(error: unknown): SupabaseErrorInfo {
  if (!error) {
    return {
      code: 'UNKNOWN',
      message: 'Unknown error',
      isAuthError: false,
      isRLSError: false,
      isNetworkError: false,
    }
  }
  
  const err = error as { code?: string; message?: string; hint?: string }
  const code = err.code ?? 'UNKNOWN'
  const message = err.message ?? 'Unknown error'
  const hint = err.hint
  
  return {
    code,
    message,
    hint,
    isAuthError: code.startsWith('PGRST3') || message.includes('JWT'),
    isRLSError: code === 'PGRST116' || message.includes('permission'),
    isNetworkError: message.includes('fetch') || message.includes('network'),
  }
}

/**
 * Get a user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
  const { message, isAuthError, isRLSError, isNetworkError } = parseSupabaseError(error)
  
  if (isNetworkError) {
    return 'Unable to connect to the server. Please check your internet connection.'
  }
  
  if (isAuthError) {
    return 'Your session has expired. Please sign in again.'
  }
  
  if (isRLSError) {
    return 'You do not have permission to perform this action.'
  }
  
  // Return a sanitized version of the message
  if (message.length > 100) {
    return 'An unexpected error occurred. Please try again.'
  }
  
  return message
}
