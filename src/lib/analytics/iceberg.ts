// ============================================================================
// ICEBERG ANALYTICS CONFIGURATION
// For historical data warehousing
// ============================================================================

export interface IcebergConfig {
  projectRef: string
  warehouse: string
  token: string
  s3AccessKey: string
  s3SecretKey: string
  s3Region: string
  s3Endpoint: string
  catalogUri: string
}

/**
 * Get Iceberg configuration from environment variables
 */
export function getIcebergConfig(): IcebergConfig | null {
  const projectRef = process.env.SUPABASE_PROJECT_REF || 'thbegonbonhswsbgszxi'
  const warehouse = process.env.ICEBERG_WAREHOUSE
  const token = process.env.ICEBERG_TOKEN
  const s3AccessKey = process.env.ICEBERG_S3_ACCESS_KEY
  const s3SecretKey = process.env.ICEBERG_S3_SECRET_KEY

  if (!warehouse || !token || !s3AccessKey || !s3SecretKey) {
    return null
  }

  return {
    projectRef,
    warehouse,
    token,
    s3AccessKey,
    s3SecretKey,
    s3Region: process.env.ICEBERG_S3_REGION || 'us-west-2',
    s3Endpoint: process.env.ICEBERG_S3_ENDPOINT || `https://${projectRef}.storage.supabase.co/storage/v1/s3`,
    catalogUri: process.env.ICEBERG_CATALOG_URI || `https://${projectRef}.storage.supabase.co/storage/v1/iceberg`,
  }
}

/**
 * Check if Iceberg is configured
 */
export function isIcebergConfigured(): boolean {
  return getIcebergConfig() !== null
}

// ============================================================================
// ICEBERG QUERY SERVICE
// For querying historical data from Iceberg tables
// ============================================================================

export interface IcebergQueryOptions {
  table: 'daily_aggregates' | 'events' | 'metrics'
  startDate?: string
  endDate?: string
  businessId?: string
  limit?: number
}

export interface IcebergQueryResult<T> {
  data: T[]
  rowCount: number
  queryTimeMs: number
}

/**
 * Query Iceberg table via REST API
 * Note: This is a simplified client - for complex queries, use the Python SDK
 */
export async function queryIceberg<T>(
  options: IcebergQueryOptions
): Promise<IcebergQueryResult<T> | null> {
  const config = getIcebergConfig()
  if (!config) {
    console.warn('Iceberg is not configured')
    return null
  }

  const startTime = Date.now()

  try {
    // Build query parameters
    const params = new URLSearchParams({
      table: `analytics.${options.table}`,
      ...(options.startDate && { start_date: options.startDate }),
      ...(options.endDate && { end_date: options.endDate }),
      ...(options.businessId && { business_id: options.businessId }),
      ...(options.limit && { limit: options.limit.toString() }),
    })

    // Note: This would need a custom API endpoint for Iceberg queries
    // For now, this is a placeholder for the query structure
    const response = await fetch(`/api/analytics/iceberg/query?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Iceberg query failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    return {
      data: result.data as T[],
      rowCount: result.rowCount,
      queryTimeMs: Date.now() - startTime,
    }
  } catch (error) {
    console.error('Iceberg query error:', error)
    return null
  }
}

// ============================================================================
// SYNC STATUS
// ============================================================================

export interface SyncStatus {
  lastSync: Date | null
  recordsSynced: number
  status: 'idle' | 'syncing' | 'completed' | 'failed'
  error?: string
}

/**
 * Get the current sync status
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  try {
    const response = await fetch('/api/analytics/sync/status')
    if (!response.ok) {
      throw new Error('Failed to get sync status')
    }
    return await response.json()
  } catch (error) {
    return {
      lastSync: null,
      recordsSynced: 0,
      status: 'idle',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Trigger a manual sync
 */
export async function triggerSync(options?: {
  syncType?: 'all' | 'aggregates' | 'events' | 'metrics'
  days?: number
}): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/analytics/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {}),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, message: error.message || 'Sync failed' }
    }

    const result = await response.json()
    return { success: true, message: result.message }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Sync failed',
    }
  }
}
