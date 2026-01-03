"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // The verification is handled by Supabase automatically via the URL hash
    // We just need to check if there's a session after the redirect
    const checkVerification = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          setStatus('error');
          return;
        }
        
        if (session) {
          setStatus('success');
          // Redirect to onboarding after a brief delay
          setTimeout(() => {
            router.push('/onboarding');
          }, 2000);
        } else {
          setError('Verification failed. The link may have expired.');
          setStatus('error');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
        setStatus('error');
      }
    };
    
    // Small delay to allow Supabase to process the token
    setTimeout(checkVerification, 500);
  }, [router]);
  
  if (status === 'loading') {
    return (
      <AuthLayout title="Verifying your email" subtitle="Please wait...">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Confirming your email address...</p>
        </div>
      </AuthLayout>
    );
  }
  
  if (status === 'error') {
    return (
      <AuthLayout title="Verification failed" subtitle="We couldn't verify your email">
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-foreground text-center">
              {error || 'The verification link is invalid or has expired.'}
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full"
              onClick={() => router.push('/signup')}
            >
              Try signing up again
            </Button>
            
            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout title="Email verified!" subtitle="Your account is ready">
      <div className="space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        
        <div className="p-4 rounded-lg bg-muted text-center">
          <p className="text-sm text-foreground">
            Your email has been verified successfully. Redirecting you to set up your business...
          </p>
        </div>
        
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    </AuthLayout>
  );
}
