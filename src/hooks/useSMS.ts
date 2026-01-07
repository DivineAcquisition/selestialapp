"use client"

import { useState } from 'react'

interface SendMessageResult {
  success: boolean
  messageId?: string
  twilioSid?: string
}

export function useSMS() {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (
    to: string,
    message: string,
    customerId?: string,
    quoteId?: string
  ): Promise<SendMessageResult> => {
    setSending(true)
    setError(null)
    
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message, customerId, quoteId }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send SMS')
      }
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send SMS'
      setError(errorMessage)
      throw err
    } finally {
      setSending(false)
    }
  }

  return { sendMessage, sending, error }
}
