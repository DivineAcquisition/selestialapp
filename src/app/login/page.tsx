"use client";

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers';
import { isServiceRoleKeyError } from '@/integrations/supabase/client';
import AuthLayout from '@/components/auth/AuthLayout';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, loading: authLoading } = useAuth();
  
  const successMessage = searchParams.get('message');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
        if (signInError.message.includes('secret API key') || signInError.message.includes('Forbidden')) {
          setError('Configuration error: The app is using the wrong API key. Please contact the administrator.');
        } else if (signInError.message.includes('Invalid login')) {
          setError('Invalid email or password. Please try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before signing in.');
        } else if (signInError.message.includes('Rate limit') || signInError.status === 429) {
          setError(signInError.message);
        } else {
          setError(signInError.message || 'Unable to sign in. Please try again.');
        }
        return;
      }
      
      const redirectTo = searchParams.get('from') || '/';
      router.push(redirectTo);
      
    } catch {
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
  
  // Show configuration error if service role key is detected
  if (isServiceRoleKeyError) {
    return (
      <AuthLayout title="Configuration Error" subtitle="There's an issue with the app configuration">
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-destructive">Invalid API Key Configuration</p>
              <p className="text-sm text-muted-foreground">
                The app is configured with a service role key instead of the anon (public) key.
                This is a security issue that needs to be fixed by the administrator.
              </p>
              <div className="mt-4 p-3 bg-muted rounded-md text-xs text-muted-foreground">
                <p className="font-medium mb-2">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Vercel → Project Settings → Environment Variables</li>
                  <li>Update <code className="bg-background px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                  <li>Use the &quot;anon public&quot; key from Supabase (Settings → API)</li>
                  <li>Redeploy the application</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your dashboard">
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMessage && (
          <div className="p-3 rounded-md bg-green-50 border border-green-200 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{decodeURIComponent(successMessage)}</p>
          </div>
        )}
        
        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
              {error.includes('verify your email') && (
                <Link 
                  href={`/resend-verification?email=${encodeURIComponent(email)}`}
                  className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
                >
                  Resend verification email
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link 
              href="/forgot-password" 
              className="text-xs text-primary hover:underline font-medium"
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
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
        
        <Separator className="my-6" />
        
        <SocialAuthButtons />
        
        <p className="text-center text-sm text-muted-foreground pt-2">
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
