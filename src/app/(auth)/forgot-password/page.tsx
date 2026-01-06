"use client"

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/reset-password`,
    })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    // Also send via Resend for better deliverability
    try {
      await fetch('/api/email/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch (err) {
      console.error('Failed to send password reset email via Resend:', err)
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
          <p className="text-muted-foreground mt-2">
            We sent a password reset link to<br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <Button
          onClick={() => setSent(false)}
          variant="outline"
          className="w-full h-12"
        >
          Try another email
        </Button>

        <Link href="/login" className="text-primary hover:underline text-sm inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
        <p className="text-muted-foreground mt-2">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="mt-1.5 h-12"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base glow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send reset link'}
        </Button>
      </form>
    </div>
  )
}
