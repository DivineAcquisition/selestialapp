"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SimpleForm as Form } from '@/components/ui/form'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { BottomGradient, FormDivider } from '@/components/ui/bottom-gradient'
import { Icon } from '@/components/ui/icon'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validate
    const newErrors: { email?: string; password?: string } = {}
    if (!email) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive',
      })
      if (error.message.includes('Invalid login')) {
        setErrors({ email: 'Invalid email or password' })
      }
      setLoading(false)
    } else {
      router.push(redirect)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    
    // Use API route for callback - handles PKCE server-side
    const callbackUrl = `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      setGoogleLoading(false)
    }
  }

  const features = [
    { text: 'AI-powered follow-ups', icon: 'robot' as const },
    { text: 'Automated sequences', icon: 'bolt' as const },
    { text: 'Smart analytics', icon: 'checkCircle' as const },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border-0 font-medium">
            <Icon name="robot" size="xs" className="mr-1" />
            Welcome back
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h1>
        <p className="text-gray-500">
          Continue where you left off with your quote follow-ups
        </p>
      </div>

      {/* Features */}
      <div className="flex flex-wrap gap-2">
        {features.map((feature) => (
          <div 
            key={feature.text}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full border border-gray-200/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-default"
          >
            <Icon name={feature.icon} size="xs" className="text-primary" />
            {feature.text}
          </div>
        ))}
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className={cn(
          "group/btn relative w-full h-12 text-sm font-medium rounded-xl",
          "bg-white border-2 border-gray-200",
          "hover:bg-gray-50 hover:border-gray-300",
          "transition-all duration-300",
          "flex items-center justify-center gap-3",
          "shadow-[0px_0px_1px_1px_rgba(0,0,0,0.02)]"
        )}
      >
        {googleLoading ? (
          <Icon name="spinner" size="lg" className="animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
            <Icon name="arrowRight" size="sm" className="opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
          </>
        )}
        <BottomGradient />
      </button>

      {/* Divider */}
      <FormDivider text="Or continue with email" />

      {/* Email Form */}
      <Form onSubmit={handleEmailLogin}>
        <Field name="email">
          <FieldLabel>Email address</FieldLabel>
          <div className="relative">
            <Icon name="email" size="lg" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-primary transition-colors" />
            <Input
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              disabled={loading}
              className="h-12 pl-11 text-sm rounded-xl border-gray-200 focus:border-primary peer"
            />
          </div>
          <FieldError show={!!errors.email}>{errors.email}</FieldError>
        </Field>

        <Field name="password">
          <div className="flex items-center justify-between">
            <FieldLabel>Password</FieldLabel>
            <Link 
              href="/forgot-password" 
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Icon name="lock" size="lg" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-primary transition-colors" />
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={loading}
              className="h-12 pl-11 text-sm rounded-xl border-gray-200 focus:border-primary peer"
            />
          </div>
          <FieldError show={!!errors.password}>{errors.password}</FieldError>
        </Field>

        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "group/btn relative w-full h-12 text-sm font-semibold rounded-xl",
            "bg-gradient-to-br from-primary to-[#9D96FF]",
            "hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
          )}
        >
          {loading ? (
            <Icon name="spinner" size="lg" className="animate-spin" />
          ) : (
            <>
              Sign in to your account
              <Icon name="arrowRight" size="sm" className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </Form>

      {/* Sign up link */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center">
          <p className="px-4 bg-white text-sm text-gray-500">
            New to Selestial?{' '}
            <Link 
              href="/signup" 
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Icon name="spinner" size="xl" className="animate-spin text-gray-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
