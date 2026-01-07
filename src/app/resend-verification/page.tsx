"use client";

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/icon';

function ResendVerificationContent() {
  const searchParams = useSearchParams();
  const { resendVerification } = useAuth();
  
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { error: resendError } = await resendVerification(email);
      
      if (resendError) {
        setError(resendError.message);
        return;
      }
      
      setSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <AuthLayout 
        title="Check your email" 
        subtitle="We've sent a new verification link"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="email" size="2xl" className="text-primary" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Verification email sent</h3>
            <p className="text-muted-foreground mt-2">
              We&apos;ve sent a new verification link to <strong>{email}</strong>. 
              Click the link in the email to verify your account.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Didn&apos;t receive the email? Check your spam folder.
            </p>
          </div>
          
          <Link href="/login">
            <Button variant="ghost" className="w-full gap-2">
              <Icon name="arrowLeft" size="md" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout 
      title="Resend verification" 
      subtitle="We'll send you a new verification email"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error alert */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 flex items-start gap-2">
            <Icon name="alertCircle" size="lg" className="shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {/* Email */}
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
        
        {/* Submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Icon name="spinner" size="md" className="mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            'Send verification email'
          )}
        </Button>
        
        {/* Back to login */}
        <Link href="/login">
          <Button variant="ghost" className="w-full gap-2">
            <Icon name="arrowLeft" size="md" />
            Back to sign in
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
}

export default function ResendVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Icon name="spinner" size="2xl" className="animate-spin text-primary" />
      </div>
    }>
      <ResendVerificationContent />
    </Suspense>
  );
}
