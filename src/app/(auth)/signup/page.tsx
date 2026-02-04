"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SimpleForm as Form } from '@/components/ui/form'
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import { BottomGradient, FormDivider } from '@/components/ui/bottom-gradient'
import { Icon, IconName } from '@/components/ui/icon'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validate
    const newErrors: { name?: string; email?: string; password?: string } = {}
    if (!name) newErrors.name = 'Name is required'
    if (!email) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: name,
            name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/onboarding`,
        },
      })

      if (error) {
        toast({
          title: 'Error creating account',
          description: error.message,
          variant: 'destructive',
        })
        if (error.message.includes('email')) {
          setErrors({ email: error.message })
        }
        setLoading(false)
        return
      }

      if (data.session) {
        toast({
          title: 'Account created!',
          description: 'Welcome to Selestial.',
        })
        router.push('/onboarding')
      } else if (data.user && !data.session) {
        toast({
          title: 'Check your email',
          description: 'We sent you a confirmation link to verify your account.',
        })
        router.push('/verify-email')
      }
    } catch (err) {
      console.error('Signup error:', err)
      toast({
        title: 'Something went wrong',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    
    // Use client-side callback page - PKCE verifier stays in browser storage
    const callbackUrl = `${window.location.origin}/auth/callback?redirect=/onboarding`
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        skipBrowserRedirect: false,
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

  const benefits: { text: string; highlight: boolean; icon: IconName }[] = [
    { text: '14-day free trial', highlight: true, icon: 'gift' },
    { text: 'No credit card required', highlight: false, icon: 'shield' },
    { text: 'Cancel anytime', highlight: false, icon: 'bolt' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Badge className="bg-primary/10 text-primary border-0 px-3 py-1.5">
          <Icon name="magic" size="xs" className="mr-1.5" />
          Start free today
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h1>
        <p className="text-gray-500">
          Join 500+ home service businesses winning more jobs
        </p>
      </div>

      {/* Benefits pills */}
      <div className="flex flex-wrap gap-2">
        {benefits.map((benefit, i) => (
          <div 
            key={i} 
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-300",
              benefit.highlight 
                ? 'bg-gradient-to-r from-primary/10 to-[#9D96FF]/10 text-primary font-medium border border-primary/20' 
                : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200/50 hover:border-primary/30'
            )}
          >
            <Icon name={benefit.icon} size="xs" className={benefit.highlight ? "text-primary" : "text-gray-500"} />
            {benefit.text}
          </div>
        ))}
      </div>

      {/* Google Sign Up */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={googleLoading}
        className={cn(
          "group/btn relative w-full h-12 text-base font-medium rounded-xl",
          "bg-white border-2 border-gray-200",
          "hover:bg-gray-50 hover:border-gray-300",
          "transition-all duration-300",
          "flex items-center justify-center gap-3",
          "shadow-[0px_0px_1px_1px_rgba(0,0,0,0.02)]",
          "disabled:opacity-50 disabled:cursor-not-allowed"
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
      <Form onSubmit={handleSignup}>
        <Field name="name">
          <FieldLabel>Full name</FieldLabel>
          <div className="relative">
            <Icon name="user" size="lg" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              name="name"
              type="text"
              placeholder="John Smith"
              required
              disabled={loading}
              className="h-12 pl-11 text-base rounded-xl border-gray-200"
            />
          </div>
          <FieldError show={!!errors.name}>{errors.name}</FieldError>
        </Field>

        <Field name="email">
          <FieldLabel>Work email</FieldLabel>
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

        <Field name="password">
          <FieldLabel>Password</FieldLabel>
          <div className="relative">
            <Icon name="lock" size="lg" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              disabled={loading}
              className="h-12 pl-11 text-base rounded-xl border-gray-200"
            />
          </div>
          <FieldDescription>Must be at least 8 characters</FieldDescription>
          <FieldError show={!!errors.password}>{errors.password}</FieldError>
        </Field>

        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-12 text-base font-semibold rounded-xl",
            "bg-gradient-to-r from-primary to-[#9D96FF]",
            "hover:opacity-90 shadow-lg shadow-primary/25"
          )}
        >
          {loading ? (
            <Icon name="spinner" size="lg" className="animate-spin" />
          ) : (
            <>
              Create account
              <Icon name="arrowRight" size="sm" className="ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </Form>

      {/* Terms */}
      <p className="text-center text-xs text-gray-400">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
      </p>

      {/* Sign in link */}
      <div className="relative pt-4 border-t border-gray-100">
        <p className="text-center text-gray-500">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
