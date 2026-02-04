import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { 
  checkConnection, 
  validateConfig, 
  getCurrentConfig,
  type ConnectionState, 
  type ConnectionStatus,
  type ConfigValidation 
} from '@/lib/supabase/utils'

export interface UseSupabaseConnectionOptions {
  /**
   * How often to check the connection (in milliseconds)
   * Set to 0 to disable automatic checks
   * @default 30000 (30 seconds)
   */
  checkInterval?: number
  
  /**
   * Whether to check connection immediately on mount
   * @default true
   */
  checkOnMount?: boolean
  
  /**
   * Callback when connection status changes
   */
  onStatusChange?: (status: ConnectionStatus) => void
}

export interface UseSupabaseConnectionReturn {
  /** Current connection state */
  connection: ConnectionState
  
  /** Configuration validation result */
  config: ConfigValidation
  
  /** Whether Supabase is properly configured */
  isConfigured: boolean
  
  /** Whether currently checking connection */
  isChecking: boolean
  
  /** Manually trigger a connection check */
  checkNow: () => Promise<void>
  
  /** Get a user-friendly status message */
  statusMessage: string
}

const DEFAULT_OPTIONS: Required<UseSupabaseConnectionOptions> = {
  checkInterval: 30000,
  checkOnMount: true,
  onStatusChange: () => {},
}

/**
 * Hook to monitor Supabase connection status
 */
export function useSupabaseConnection(
  options: UseSupabaseConnectionOptions = {}
): UseSupabaseConnectionReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  const [connection, setConnection] = useState<ConnectionState>({
    status: 'connecting',
    lastChecked: new Date(),
  })
  const [isChecking, setIsChecking] = useState(false)
  const previousStatus = useRef<ConnectionStatus>('connecting')
  
  // Validate configuration
  const config = validateConfig(getCurrentConfig())
  const isConfigured = config.isValid
  
  // Check connection
  const checkNow = useCallback(async () => {
    if (!isConfigured) {
      setConnection({
        status: 'error',
        error: 'Supabase is not configured',
        lastChecked: new Date(),
      })
      return
    }
    
    setIsChecking(true)
    
    try {
      const result = await checkConnection(supabase)
      setConnection(result)
      
      // Call status change callback if status changed
      if (result.status !== previousStatus.current) {
        previousStatus.current = result.status
        opts.onStatusChange(result.status)
      }
    } catch (err) {
      setConnection({
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        lastChecked: new Date(),
      })
    } finally {
      setIsChecking(false)
    }
  }, [isConfigured, opts])
  
  // Check on mount
  useEffect(() => {
    if (opts.checkOnMount) {
      checkNow()
    }
  }, [opts.checkOnMount, checkNow])
  
  // Set up interval for periodic checks
  useEffect(() => {
    if (opts.checkInterval <= 0) return
    
    const interval = setInterval(checkNow, opts.checkInterval)
    return () => clearInterval(interval)
  }, [opts.checkInterval, checkNow])
  
  // Get user-friendly status message
  const statusMessage = getStatusMessage(connection, config)
  
  return {
    connection,
    config,
    isConfigured,
    isChecking,
    checkNow,
    statusMessage,
  }
}

function getStatusMessage(
  connection: ConnectionState, 
  config: ConfigValidation
): string {
  if (!config.isValid) {
    return config.errors[0] || 'Supabase is not configured'
  }
  
  switch (connection.status) {
    case 'connected':
      if (connection.latency !== undefined) {
        return `Connected (${connection.latency}ms)`
      }
      return 'Connected'
      
    case 'connecting':
      return 'Connecting to database...'
      
    case 'disconnected':
      return 'Disconnected from database'
      
    case 'error':
      return connection.error || 'Connection error'
      
    default:
      return 'Unknown status'
  }
}

// Export types
export type { ConnectionState, ConnectionStatus, ConfigValidation }
