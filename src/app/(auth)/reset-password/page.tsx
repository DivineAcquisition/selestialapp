"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SimpleForm as Form } from '@/components/ui/form'
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import { Icon } from '@/components/ui/icon'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validate
    const newErrors: { password?: string; confirmPassword?: string } = {}
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords don\'t match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      setErrors({ password: error.message })
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  if (success) {
    return (
      <div className="space-y-8">
        {/* Success state */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto animate-scale-fade shadow-lg shadow-emerald-100">
            <Icon name="checkCircle" size="3xl" className="text-emerald-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Password updated!</h1>
            <p className="text-gray-500">
              Your password has been reset successfully.
              <br />
              Redirecting you to the dashboard...
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Icon name="spinner" size="lg" className="animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-[#9D96FF]/10 rounded-2xl flex items-center justify-center mb-4">
          <Icon name="shield" size="2xl" className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create new password</h1>
        <p className="text-gray-500">
          Your new password must be at least 8 characters long.
        </p>
      </div>

      {/* Form */}
      <Form onSubmit={handleSubmit}>
        <Field name="password">
          <FieldLabel>New password</FieldLabel>
          <div className="relative">
            <Icon name="lock" size="lg" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              minLength={8}
              disabled={loading}
              className="h-12 pl-11 pr-11 text-base rounded-xl border-gray-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} size="lg" />
            </button>
          </div>
          <FieldDescription>Must be at least 8 characters</FieldDescription>
          <FieldError show={!!errors.password}>{errors.password}</FieldError>
        </Field>

        <Field name="confirmPassword">
          <FieldLabel>Confirm new password</FieldLabel>
          <div className="relative">
            <Icon name="lock" size="lg" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              minLength={8}
              disabled={loading}
              className="h-12 pl-11 pr-11 text-base rounded-xl border-gray-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name={showConfirmPassword ? "eyeOff" : "eye"} size="lg" />
            </button>
          </div>
          <FieldError show={!!errors.confirmPassword}>{errors.confirmPassword}</FieldError>
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
              Reset password
              <Icon name="arrowRight" size="md" className="ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </Form>
    </div>
  )
}
