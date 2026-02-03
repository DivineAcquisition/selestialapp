// Supabase client exports
export { createClient, getSupabaseClient, supabase } from './client'
export { createServerSupabaseClient } from './server'
export { getSupabaseAdmin, supabaseAdmin } from './admin'

// Utility exports
export {
  // Connection
  checkConnection,
  type ConnectionStatus,
  type ConnectionState,
  
  // Configuration
  validateConfig,
  getCurrentConfig,
  isSupabaseConfigured,
  type SupabaseConfig,
  type ConfigValidation,
  
  // Query helpers
  safeQuery,
  type QueryResult,
  
  // Pagination
  getPaginationRange,
  type PaginationParams,
  type PaginatedResult,
  
  // Realtime
  createRealtimeConfig,
  type RealtimeEvent,
  type RealtimeConfig,
  
  // Date helpers
  toSupabaseDate,
  fromSupabaseDate,
  
  // Business context
  withBusinessId,
  
  // Error handling
  parseSupabaseError,
  getUserFriendlyError,
  type SupabaseErrorInfo,
} from './utils'
