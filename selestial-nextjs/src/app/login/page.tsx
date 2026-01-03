"use client";

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers';
import AuthLayout from '@/components/auth/AuthLayout';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, loading: authLoading } = useAuth();
  
  // Get success message from URL params
  const successMessage = searchParams.get('message');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        // Handle specific error types
        if (signInError.message.includes('Invalid login')) {
          setError('Invalid email or password. Please try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before signing in. Check your inbox for a verification link.');
        } else if (signInError.message.includes('Rate limit') || signInError.status === 429) {
          setError(signInError.message);
        } else {
          setError(signInError.message || 'Unable to sign in. Please try again.');
        }
        return;
      }
      
      // Get redirect path or default to dashboard
      const redirectTo = searchParams.get('from') || '/';
      router.push(redirectTo);
      
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user) {
    return null;
  }
  
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success message */}
        {successMessage && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{decodeURIComponent(successMessage)}</p>
          </div>
        )}
        
        {/* Error alert */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-destructive">{error}</p>
              {error.includes('verify your email') && (
                <Link 
                  href={`/resend-verification?email=${encodeURIComponent(email)}`}
                  className="text-sm text-primary hover:underline mt-1 inline-block"
                >
                  Resend verification email
                </Link>
              )}
            </div>
          </div>
        )}
        
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="mike@johnsonplumbing.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
            disabled={loading}
          />
        </div>
        
        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link 
              href="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pr-10"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* Submit */}
        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
        
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        {/* Social auth */}
        <SocialAuthButtons />
        
        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Start free trial
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
