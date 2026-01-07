"use client"

import Link from 'next/link'
import { useUsage } from '@/hooks/useUsage'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

interface UsageBarProps {
  feature: 'quotesPerMonth' | 'smsPerMonth' | 'activeSequences' | 'teamMembers'
  label: string
  showUpgradeLink?: boolean
  className?: string
}

const featureLabels: Record<string, string> = {
  quotesPerMonth: 'quotes',
  smsPerMonth: 'SMS',
  activeSequences: 'sequences',
  teamMembers: 'team members',
}

export default function UsageBar({ 
  feature, 
  label, 
  showUpgradeLink = true,
  className,
}: UsageBarProps) {
  const { usage } = useUsage()
  const { getFeatureLimit, isFeatureUnlimited, canUpgrade } = useFeatureGate()

  const limit = getFeatureLimit(feature)
  const unlimited = isFeatureUnlimited(feature)
  
  const used = {
    quotesPerMonth: usage.quotesThisMonth,
    smsPerMonth: usage.smsThisMonth,
    activeSequences: usage.activeSequences,
    teamMembers: usage.teamMembers,
  }[feature]

  // Unlimited display
  if (unlimited) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium flex items-center gap-1">
            {used} used
            <Icon name="infinity" size="sm" className="text-primary" />
          </span>
        </div>
        <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-primary to-primary/60 rounded-full" />
        </div>
        <p className="text-xs text-muted-foreground">Unlimited on Growth plan</p>
      </div>
    )
  }

  const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 100
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(
          "font-medium",
          isAtLimit && "text-destructive",
          isNearLimit && !isAtLimit && "text-amber-600"
        )}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isAtLimit && "bg-destructive",
            isNearLimit && !isAtLimit && "bg-amber-500",
            !isNearLimit && "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isNearLimit && showUpgradeLink && canUpgrade() && (
        <p className={cn(
          "text-xs",
          isAtLimit ? "text-destructive" : "text-amber-600"
        )}>
          {isAtLimit ? `${featureLabels[feature]} limit reached. ` : 'Approaching limit. '}
          <Link href="/billing" className="underline hover:no-underline font-medium">
            Upgrade for more
          </Link>
        </p>
      )}
    </div>
  )
}
