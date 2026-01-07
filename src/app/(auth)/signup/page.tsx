"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/integrations/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { BottomGradient, FormDivider } from '@/components/ui/bottom-gradient'
import { Loader2, User, Mail, Lock, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: name,
            name: name,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast({
          title: 'Error creating account',
          description: error.message,
          variant: 'destructive',
        })
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
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
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

  const benefits = [
    { text: '14-day free trial', highlight: true, icon: Sparkles },
    { text: 'No credit card required', highlight: false, icon: Shield },
    { text: 'Cancel anytime', highlight: false, icon: Zap },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Badge className="bg-primary/10 text-primary border-0 px-3 py-1.5">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
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
            <benefit.icon className={cn("w-3.5 h-3.5", benefit.highlight ? "text-primary" : "text-gray-500")} />
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
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
            <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
          </>
        )}
        <BottomGradient />
      </button>

      {/* Divider */}
      <FormDivider text="Or continue with email" />

      {/* Email Form */}
      <form onSubmit={handleSignup} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full name
          </Label>
          <div className={cn(
            "relative rounded-xl transition-all duration-300",
            focusedField === 'name' && "ring-2 ring-primary/20"
          )}>
            <User className={cn(
              "absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
              focusedField === 'name' ? "text-primary" : "text-gray-400"
            )} />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="John Smith"
              required
              className="h-12 pl-11 text-base rounded-xl border-gray-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Work email
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

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </Label>
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
              minLength={8}
              className="h-12 pl-11 text-base rounded-xl border-gray-200"
            />
          </div>
          <p className="text-xs text-gray-400">
            Must be at least 8 characters
          </p>
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
              Create account
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
          <BottomGradient />
        </button>
      </form>

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
