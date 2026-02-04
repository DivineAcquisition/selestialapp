"use client"

import { useSupabaseConnection, type ConnectionStatus } from '@/hooks/useSupabaseConnection'
import { cn } from '@/lib/utils'

interface SupabaseStatusProps {
  /** Show detailed information including latency */
  detailed?: boolean
  /** Additional CSS classes */
  className?: string
  /** Show as a badge/pill style */
  variant?: 'badge' | 'dot' | 'text'
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg'
}

const statusColors: Record<ConnectionStatus, { bg: string; text: string; dot: string }> = {
  connected: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  connecting: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
  },
  disconnected: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-500',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
}

const sizeClasses = {
  sm: {
    badge: 'text-xs px-2 py-0.5',
    dot: 'w-2 h-2',
    text: 'text-xs',
  },
  md: {
    badge: 'text-sm px-2.5 py-1',
    dot: 'w-2.5 h-2.5',
    text: 'text-sm',
  },
  lg: {
    badge: 'text-base px-3 py-1.5',
    dot: 'w-3 h-3',
    text: 'text-base',
  },
}

/**
 * Component to display Supabase connection status
 */
export function SupabaseStatus({
  detailed = false,
  className,
  variant = 'badge',
  size = 'sm',
}: SupabaseStatusProps) {
  const { connection, isConfigured, isChecking, statusMessage } = useSupabaseConnection({
    checkInterval: 60000, // Check every minute
  })
  
  const colors = statusColors[connection.status]
  const sizes = sizeClasses[size]
  
  // Don't show anything if not configured and not in detailed mode
  if (!isConfigured && !detailed) {
    return null
  }
  
  if (variant === 'dot') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span 
          className={cn(
            'rounded-full',
            sizes.dot,
            colors.dot,
            isChecking && 'animate-pulse'
          )} 
        />
        {detailed && (
          <span className={cn(sizes.text, 'text-muted-foreground')}>
            {statusMessage}
          </span>
        )}
      </div>
    )
  }
  
  if (variant === 'text') {
    return (
      <span className={cn(sizes.text, colors.text, className)}>
        {statusMessage}
      </span>
    )
  }
  
  // Badge variant (default)
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizes.badge,
        colors.bg,
        colors.text,
        className
      )}
    >
      <span 
        className={cn(
          'rounded-full',
          sizes.dot,
          colors.dot,
          isChecking && 'animate-pulse'
        )} 
      />
      {detailed ? statusMessage : getShortStatus(connection.status)}
    </div>
  )
}

function getShortStatus(status: ConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected'
    case 'connecting':
      return 'Connecting...'
    case 'disconnected':
      return 'Offline'
    case 'error':
      return 'Error'
    default:
      return 'Unknown'
  }
}

/**
 * Component to display Supabase configuration warnings
 * Useful for development to show when env vars are missing
 */
export function SupabaseConfigWarning({ className }: { className?: string }) {
  const { config, isConfigured } = useSupabaseConnection({
    checkInterval: 0, // Don't check connection, just validate config
    checkOnMount: false,
  })
  
  if (isConfigured) {
    return null
  }
  
  return (
    <div
      className={cn(
        'rounded-lg border border-yellow-200 bg-yellow-50 p-4',
        className
      )}
    >
      <h4 className="font-medium text-yellow-800 mb-2">
        Supabase Configuration Required
      </h4>
      <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
        {config.errors.map((error, i) => (
          <li key={i}>{error}</li>
        ))}
      </ul>
      {config.warnings.length > 0 && (
        <>
          <h5 className="font-medium text-yellow-700 mt-3 mb-1">Warnings:</h5>
          <ul className="list-disc list-inside text-sm text-yellow-600 space-y-1">
            {config.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </>
      )}
      <p className="text-sm text-yellow-600 mt-3">
        Copy <code className="bg-yellow-100 px-1 rounded">.env.example</code> to{' '}
        <code className="bg-yellow-100 px-1 rounded">.env.local</code> and add your Supabase credentials.
      </p>
    </div>
  )
}

/**
 * Inline connection indicator for headers/footers
 */
export function SupabaseConnectionDot({ className }: { className?: string }) {
  const { connection, isChecking } = useSupabaseConnection({
    checkInterval: 60000,
  })
  
  const colors = statusColors[connection.status]
  
  return (
    <span
      title={`Database: ${connection.status}${connection.latency ? ` (${connection.latency}ms)` : ''}`}
      className={cn(
        'inline-block w-2 h-2 rounded-full',
        colors.dot,
        isChecking && 'animate-pulse',
        className
      )}
    />
  )
}
