"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';
import AuthLayout from '@/components/auth/AuthLayout';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import PasswordStrengthIndicator, { isPasswordValid } from '@/components/auth/PasswordStrengthIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2, AlertCircle, Mail, ArrowLeft, ArrowRight, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, resendVerification, user, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!isPasswordValid(password)) {
      setError('Please choose a stronger password that meets all requirements.');
      return;
    }
    
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error: signUpError, needsVerification } = await signUp(email, password);
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (signUpError.status === 429) {
          setError(signUpError.message);
        } else {
          setError(signUpError.message || 'Unable to create account. Please try again.');
        }
        return;
      }
      
      if (needsVerification) {
        setSuccess(true);
      } else {
        // User was auto-confirmed (shouldn't happen with our settings, but handle it)
        router.push('/onboarding');
      }
      
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    setResending(true);
    setError(null);
    try {
      const { error } = await resendVerification(email);
      if (error) {
        setError(error.message);
      }
    } finally {
      setResending(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return null;
  }
  
  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent you a verification link">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center animate-float">
              <Mail className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-foreground">
              We&apos;ve sent a verification email to
            </p>
            <p className="text-primary font-semibold">{email}</p>
            <p className="text-sm text-muted-foreground mt-3">
              Click the link in the email to verify your account and get started.
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-sm space-y-3">
            <p className="font-semibold text-foreground">Didn&apos;t receive the email?</p>
            <ul className="text-muted-foreground space-y-2 text-left">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>Check your spam or junk folder</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>Make sure you entered the correct email</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3 pt-2">
            <Button 
              variant="outline" 
              className="w-full h-11"
              onClick={handleResendVerification}
              disabled={resending}
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend verification email'
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full h-11 gap-2"
              onClick={() => router.push('/login')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Button>
          </div>
          
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive text-left">{error}</p>
            </div>
          )}
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout title="Start your free trial" subtitle="14 days free, no credit card required">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Features list */}
        <div className="flex flex-wrap gap-2 justify-center mb-2">
          {['AI Replies', 'Auto Follow-ups', 'SMS & Email'].map((feature) => (
            <div 
              key={feature}
              className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full"
            >
              <Sparkles className="w-3 h-3 text-primary" />
              {feature}
            </div>
          ))}
        </div>
        
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
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
          <Label htmlFor="password">Create password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="pr-10"
              disabled={loading}
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
          <PasswordStrengthIndicator password={password} />
        </div>
        
        <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            disabled={loading}
            className="mt-0.5"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
            I agree to the{' '}
            <Link href="/terms" className="text-primary hover:text-primary/80 font-medium transition-colors">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-primary hover:text-primary/80 font-medium transition-colors">Privacy Policy</Link>
          </label>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !isPasswordValid(password) || !agreedToTerms}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <SocialAuthButtons />
        
        <p className="text-center text-sm text-muted-foreground pt-2">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
