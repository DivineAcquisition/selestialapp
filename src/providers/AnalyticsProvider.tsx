"use client"

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useBusiness } from './BusinessProvider'

interface AnalyticsContextType {
  track: (eventName: string, category: string, eventData?: Record<string, unknown>) => void
  trackPageView: (page: string) => void
  trackFeature: (featureName: string, metadata?: Record<string, unknown>) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { business } = useBusiness()

  // Initialize analytics when business is available
  useEffect(() => {
    if (business) {
      import('@/lib/analytics/analytics-service').then(({ analytics }) => {
        analytics.init(business.id)
      })
    }

    return () => {
      import('@/lib/analytics/analytics-service').then(({ analytics }) => {
        analytics.destroy()
      })
    }
  }, [business])

  // Track function
  const track = async (
    eventName: string, 
    category: string, 
    eventData?: Record<string, unknown>
  ) => {
    if (!business) return
    
    const { analytics } = await import('@/lib/analytics/analytics-service')
    analytics.track(eventName, category as never, eventData)
  }

  // Track page view
  const trackPageView = async (page: string) => {
    if (!business) return
    
    const { analytics } = await import('@/lib/analytics/analytics-service')
    analytics.trackPageView(page)
  }

  // Track feature usage
  const trackFeature = async (featureName: string, metadata?: Record<string, unknown>) => {
    if (!business) return
    
    const { analytics } = await import('@/lib/analytics/analytics-service')
    analytics.trackFeatureUsed(featureName, metadata)
  }

  return (
    <AnalyticsContext.Provider value={{ track, trackPageView, trackFeature }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}
