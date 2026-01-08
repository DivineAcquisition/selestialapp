"use client"

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SimpleForm as Form } from '@/components/ui/form'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Icon } from '@/components/ui/icon'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<{ email?: string }>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const emailValue = formData.get('email') as string

    // Validate
    if (!emailValue) {
      setErrors({ email: 'Email is required' })
      return
    }

    setLoading(true)
    setErrors({})
    setEmail(emailValue)

    const { error } = await supabase.auth.resetPasswordForEmail(emailValue, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/reset-password`,
    })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      setErrors({ email: error.message })
      setLoading(false)
      return
    }

    // Also send via Resend for better deliverability
    try {
      await fetch('/api/email/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
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
            <Icon name="checkCircle" size="3xl" className="text-emerald-600" />
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
              <Icon name="shield" size="lg" className="text-primary mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Didn&apos;t receive the email?</p>
                <p>Check your spam folder or make sure you entered the correct email address.</p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setSent(false)}
            className="w-full h-12 rounded-xl"
          >
            Try another email
          </Button>
        </div>

        <div className="text-center">
          <Link 
            href="/login" 
            className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center gap-2 transition-colors group"
          >
            <Icon name="arrowLeft" size="md" className="group-hover:-translate-x-1 transition-transform" />
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
        <Icon name="arrowLeft" size="md" className="group-hover:-translate-x-1 transition-transform" />
        Back to sign in
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-[#9D96FF]/10 rounded-2xl flex items-center justify-center mb-4">
          <Icon name="shield" size="2xl" className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reset password</h1>
        <p className="text-gray-500">
          Enter your email and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {/* Form */}
      <Form onSubmit={handleSubmit}>
        <Field name="email">
          <FieldLabel>Email address</FieldLabel>
          <div className="relative">
            <Icon name="email" size="lg" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              disabled={loading}
              className="h-12 pl-11 text-base rounded-xl border-gray-200"
            />
          </div>
          <FieldError show={!!errors.email}>{errors.email}</FieldError>
        </Field>

        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-12 text-base font-semibold rounded-xl",
            "bg-gradient-to-br from-primary to-[#9D96FF]",
            "hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
          )}
        >
          {loading ? (
            <Icon name="spinner" size="lg" className="animate-spin" />
          ) : (
            <>
              Send reset link
              <Icon name="arrowRight" size="md" className="ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </Form>
    </div>
  )
}
