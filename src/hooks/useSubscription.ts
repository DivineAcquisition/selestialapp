"use client"

import { useState } from 'react'

export function useSubscription() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkout = async (priceId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await res.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed'
      setError(message)
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  const openPortal = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open portal'
      setError(message)
      console.error('Portal error:', err)
    } finally {
      setLoading(false)
    }
  }

  return { checkout, openPortal, loading, error }
}
