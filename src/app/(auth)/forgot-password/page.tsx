"use client"

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/integrations/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BottomGradient } from '@/components/ui/bottom-gradient'
import { Loader2, ArrowLeft, Mail, CheckCircle2, ArrowRight, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

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
      <div className="space-y-8">
        {/* Success state */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto animate-scale-fade shadow-lg shadow-emerald-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Check your email</h1>
            <p className="text-gray-500 max-w-sm mx-auto">
              We sent a password reset link to{' '}
              <span className="font-semibold text-gray-900">{email}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200/60 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Didn&apos;t receive the email?</p>
                <p>Check your spam folder or make sure you entered the correct email address.</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSent(false)}
            className="group/btn relative w-full h-12 font-medium rounded-xl bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center justify-center"
          >
            Try another email
            <BottomGradient />
          </button>
        </div>

        <div className="text-center">
          <Link 
            href="/login" 
            className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center gap-2 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link 
        href="/login" 
        className="text-gray-500 hover:text-gray-900 text-sm inline-flex items-center gap-2 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to sign in
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-[#9D96FF]/10 rounded-2xl flex items-center justify-center mb-4">
          <Shield className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reset password</h1>
        <p className="text-gray-500">
          Enter your email and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email address
          </Label>
          <div className={cn(
            "relative rounded-xl transition-all duration-300",
            focusedField === 'email' && "ring-2 ring-primary/20"
          )}>
            <Mail className={cn(
              "absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
              focusedField === 'email' ? "text-primary" : "text-gray-400"
            )} />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="you@company.com"
              required
              className="h-12 pl-11 text-base rounded-xl border-gray-200"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "group/btn relative w-full h-12 text-base font-semibold rounded-xl text-white",
            "bg-gradient-to-br from-primary to-[#9D96FF]",
            "shadow-[0px_1px_0px_0px_rgba(255,255,255,0.2)_inset,0px_-1px_0px_0px_rgba(255,255,255,0.2)_inset]",
            "hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5",
            "transition-all duration-300",
            "flex items-center justify-center gap-2",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          )}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Send reset link
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
          <BottomGradient />
        </button>
      </form>
    </div>
  )
}
