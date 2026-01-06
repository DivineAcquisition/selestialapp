"use client"

import { useState } from 'react'

interface QuoteNotificationData {
  email: string
  businessName: string
  customerName: string
  serviceType: string
  amount: number
  quoteId: string
}

export function useEmail() {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendWelcomeEmail = async (email: string, name: string) => {
    setSending(true)
    setError(null)
    
    try {
      const res = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send email')
      }
      
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send email'
      setError(message)
      console.error('Welcome email error:', err)
      return false
    } finally {
      setSending(false)
    }
  }

  const sendPasswordResetEmail = async (email: string, resetLink?: string) => {
    setSending(true)
    setError(null)
    
    try {
      const res = await fetch('/api/email/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetLink }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send email')
      }
      
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send email'
      setError(message)
      console.error('Password reset email error:', err)
      return false
    } finally {
      setSending(false)
    }
  }

  const sendQuoteNotification = async (data: QuoteNotificationData) => {
    setSending(true)
    setError(null)
    
    try {
      const res = await fetch('/api/email/quote-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!res.ok) {
        const responseData = await res.json()
        throw new Error(responseData.error || 'Failed to send email')
      }
      
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send email'
      setError(message)
      console.error('Quote notification email error:', err)
      return false
    } finally {
      setSending(false)
    }
  }

  return { 
    sending, 
    error,
    sendWelcomeEmail, 
    sendPasswordResetEmail,
    sendQuoteNotification 
  }
}
