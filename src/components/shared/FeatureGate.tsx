"use client"

import { ReactNode } from 'react'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { PlanLimits } from '@/lib/plans'
import UpgradePrompt from './UpgradePrompt'

interface FeatureGateProps {
  feature: keyof PlanLimits
  children: ReactNode
  fallback?: ReactNode
  showUpgrade?: boolean
  upgradeMessage?: string
  upgradeVariant?: 'inline' | 'banner' | 'card'
}

export default function FeatureGate({
  feature,
  children,
  fallback,
  showUpgrade = true,
  upgradeMessage,
  upgradeVariant = 'inline',
}: FeatureGateProps) {
  const { hasFeature, requiresUpgrade } = useFeatureGate()

  // If user has access to this feature, render children
  if (hasFeature(feature)) {
    return <>{children}</>
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // Show upgrade prompt if feature requires upgrade
  if (showUpgrade && requiresUpgrade(feature)) {
    // Format feature name for display
    const featureLabel = feature
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
    
    return (
      <UpgradePrompt 
        feature={featureLabel}
        description={upgradeMessage}
        variant={upgradeVariant}
      />
    )
  }

  // Don't render anything if no upgrade available
  return null
}
