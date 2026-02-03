"use client"

import { useDashboardAnalytics, useSyncStatus } from '@/hooks/useAnalytics'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw,
  FileText,
  Users,
  MessageSquare,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon?: React.ReactNode
  description?: string
  loading?: boolean
}

function StatCard({ title, value, change, trend, icon, description, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
  const ArrowIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(change !== undefined || description) && (
          <div className="flex items-center mt-1">
            {change !== undefined && (
              <span className={cn('flex items-center text-xs font-medium', trendColor)}>
                {ArrowIcon && <ArrowIcon className="h-3 w-3 mr-0.5" />}
                {Math.abs(change)}%
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground ml-2">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// SYNC STATUS BADGE
// ============================================================================

function SyncStatusBadge() {
  const { lastSync, status, pendingCount, triggerSync, isSyncing } = useSyncStatus()

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-muted-foreground">
        {lastSync ? (
          <span>Last synced: {lastSync.toLocaleString()}</span>
        ) : (
          <span>Never synced</span>
        )}
        {pendingCount > 0 && (
          <span className="ml-2 text-yellow-600">({pendingCount} pending)</span>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={triggerSync}
        disabled={isSyncing}
      >
        <RefreshCw className={cn("h-4 w-4 mr-1", isSyncing && "animate-spin")} />
        {isSyncing ? 'Syncing...' : 'Sync Now'}
      </Button>
    </div>
  )
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

interface AnalyticsDashboardProps {
  days?: number
  showSync?: boolean
  className?: string
}

export function AnalyticsDashboard({ 
  days = 30, 
  showSync = true,
  className 
}: AnalyticsDashboardProps) {
  const { summary, trends, loading, error, refetch } = useDashboardAnalytics({
    days,
    includeTrends: true,
    autoRefresh: true,
    refreshInterval: 60000,
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Your business performance over the last {days} days
          </p>
        </div>
        {showSync && <SyncStatusBadge />}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Quotes"
          value={loading ? 0 : formatNumber(summary?.quotes.total || 0)}
          change={trends?.quotes?.change}
          trend={trends?.quotes?.trend as 'up' | 'down' | 'stable' | undefined}
          icon={<FileText className="h-4 w-4" />}
          description="vs previous period"
          loading={loading}
        />
        <StatCard
          title="Quotes Won"
          value={loading ? 0 : formatNumber(summary?.quotes.won || 0)}
          change={trends?.won?.change}
          trend={trends?.won?.trend as 'up' | 'down' | 'stable' | undefined}
          icon={<TrendingUp className="h-4 w-4" />}
          description={`${summary?.quotes.conversion_rate || 0}% conversion`}
          loading={loading}
        />
        <StatCard
          title="New Customers"
          value={loading ? 0 : formatNumber(summary?.customers.new || 0)}
          change={trends?.customers?.change}
          trend={trends?.customers?.trend as 'up' | 'down' | 'stable' | undefined}
          icon={<Users className="h-4 w-4" />}
          description="vs previous period"
          loading={loading}
        />
        <StatCard
          title="Revenue"
          value={loading ? '$0' : formatCurrency(summary?.quotes.won_value || 0)}
          change={trends?.revenue?.change}
          trend={trends?.revenue?.trend as 'up' | 'down' | 'stable' | undefined}
          icon={<DollarSign className="h-4 w-4" />}
          description="from won quotes"
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : formatNumber(summary?.messages.sent || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
              <div>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : formatNumber(summary?.messages.received || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Received</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : formatNumber(summary?.payments.count || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground/50" />
              <div>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-20" /> : formatCurrency(summary?.payments.volume || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Volume</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customer Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? <Skeleton className="h-8 w-16" /> : formatNumber(summary?.customers.active || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/50" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {loading ? <Skeleton className="h-8 w-16" /> : formatNumber(summary?.customers.at_risk || 0)}
                </div>
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
