"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mail, Lock, ArrowRight, Sparkles, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { toast } = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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
      setLoading(false)
    } else {
      router.push(redirect)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback?redirect=${redirect}`,
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
    'AI-powered follow-ups',
    'Automated sequences',
    'Smart analytics',
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border-0 font-medium">
            <Sparkles className="h-3 w-3 mr-1" />
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
            key={feature}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
          >
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            {feature}
          </div>
        ))}
      </div>

      {/* Google Sign In */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className={cn(
          "w-full h-12 text-sm font-medium border-2 rounded-xl",
          "hover:bg-gray-50 hover:border-gray-300",
          "transition-all duration-300",
          "group"
        )}
      >
        {googleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
            <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs font-medium text-gray-400 uppercase tracking-wider">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleEmailLogin} className="space-y-5">
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
              className="h-12 pl-11 text-sm rounded-xl border-gray-200 focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Link 
              href="/forgot-password" 
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className={cn(
            "relative rounded-xl transition-all duration-300",
            focusedField === 'password' && "ring-2 ring-primary/20"
          )}>
            <Lock className={cn(
              "absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
              focusedField === 'password' ? "text-primary" : "text-gray-400"
            )} />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="••••••••"
              required
              className="h-12 pl-11 text-sm rounded-xl border-gray-200 focus:border-primary"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-12 text-sm font-semibold rounded-xl",
            "bg-gradient-to-r from-primary to-[#9D96FF]",
            "hover:opacity-90 hover:shadow-lg hover:shadow-primary/25",
            "transition-all duration-300",
            "group"
          )}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign in to your account
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>

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
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
