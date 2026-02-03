"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

type CallbackStatus = 'loading' | 'success' | 'error';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    handleCallback();
  }, []);
  
  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const redirectTo = searchParams.get('redirect') || searchParams.get('redirect_to') || '/';
      const errorDescription = searchParams.get('error_description');
      const error_param = searchParams.get('error');
      
      // Check for errors from Supabase
      if (errorDescription || error_param) {
        throw new Error(errorDescription || error_param || 'Authentication error');
      }
      
      // Handle OAuth code exchange (Google, etc.)
      if (code) {
        console.log('Exchanging OAuth code for session...');
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('Code exchange error:', error);
          throw error;
        }
        
        if (data.session) {
          console.log('Session established successfully');
          setStatus('success');
          setMessage('Signed in successfully!');
          setTimeout(() => router.push(redirectTo), 1500);
          return;
        }
      }
      
      // Check URL hash for implicit OAuth flow (older Supabase versions)
      if (typeof window !== 'undefined' && window.location.hash) {
        console.log('Checking URL hash for auth tokens...');
        // Supabase client will automatically handle hash-based tokens
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setMessage('Signed in successfully!');
          setTimeout(() => router.push(redirectTo), 1500);
          return;
        }
      }
      
      // Handle email verification / magic link (token_hash)
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'signup' | 'recovery' | 'email_change' | 'email',
        });
        
        if (error) throw error;
        
        // Success messages based on type
        switch (type) {
          case 'signup':
            setMessage('Email verified! Welcome to Selestial.');
            break;
          case 'recovery':
            setMessage('Verified! You can now reset your password.');
            break;
          case 'email_change':
            setMessage('Email updated successfully!');
            break;
          default:
            setMessage('Verification successful!');
        }
        
        setStatus('success');
        setTimeout(() => router.push(redirectTo), 2000);
        return;
      }
      
      // No code or token - check if we already have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (session) {
        setStatus('success');
        setMessage('Signed in successfully!');
        setTimeout(() => router.push(redirectTo), 1500);
        return;
      }
      
      // No valid auth parameters found
      throw new Error('Invalid callback parameters. Please try signing in again.');
      
    } catch (error) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Verification failed');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Icon name="spinner" size="4xl" className="animate-spin text-primary mx-auto" />
            <h1 className="text-xl font-semibold text-foreground">Verifying...</h1>
            <p className="text-muted-foreground">Please wait while we verify your request.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Icon name="checkCircle" size="2xl" className="text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Success!</h1>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Icon name="alertCircle" size="2xl" className="text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Verification Failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => router.push('/login')}>
                Go to Login
              </Button>
              <Button onClick={() => router.push('/signup')}>
                Sign Up Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <Icon name="spinner" size="4xl" className="animate-spin text-primary mx-auto" />
          <h1 className="text-xl font-semibold text-foreground">Loading...</h1>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
