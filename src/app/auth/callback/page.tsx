"use client";

import { Suspense, useEffect, useState, useCallback } from 'react';
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
  
  const handleCallback = useCallback(async () => {
    try {
      // Get all URL parameters for debugging
      const code = searchParams.get('code');
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const redirectTo = searchParams.get('redirect') || searchParams.get('redirect_to') || '/';
      const errorDescription = searchParams.get('error_description');
      const error_param = searchParams.get('error');
      const accessToken = searchParams.get('access_token');
      
      // Debug logging
      console.log('=== Auth Callback Debug ===');
      console.log('Full URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');
      console.log('Search params:', typeof window !== 'undefined' ? window.location.search : 'SSR');
      console.log('Hash:', typeof window !== 'undefined' ? window.location.hash : 'SSR');
      console.log('code:', code);
      console.log('access_token in params:', accessToken);
      console.log('token_hash:', tokenHash);
      console.log('type:', type);
      console.log('error:', error_param);
      console.log('error_description:', errorDescription);
      
      // Check for errors from Supabase/OAuth
      if (errorDescription || error_param) {
        throw new Error(errorDescription || error_param || 'Authentication error');
      }
      
      // For implicit flow, tokens come in the URL hash fragment
      // Parse hash manually if present
      if (typeof window !== 'undefined' && window.location.hash) {
        console.log('Found URL hash, parsing...');
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        
        console.log('Hash access_token:', !!hashAccessToken);
        console.log('Hash refresh_token:', !!hashRefreshToken);
        
        if (hashAccessToken) {
          console.log('Setting session from hash tokens...');
          const { data, error } = await supabase.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashRefreshToken || '',
          });
          
          if (error) {
            console.error('setSession error:', error);
          } else if (data.session) {
            console.log('Session set successfully from hash!');
            setStatus('success');
            setMessage('Signed in successfully!');
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            setTimeout(() => router.push(redirectTo), 1000);
            return;
          }
        }
      }
      
      // Check if we have a session already
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Existing session check:', !!session, sessionError?.message);
      
      if (session) {
        console.log('Session found!');
        setStatus('success');
        setMessage('Signed in successfully!');
        setTimeout(() => router.push(redirectTo), 1000);
        return;
      }
      
      // Handle PKCE code exchange if present
      if (code) {
        console.log('Attempting PKCE code exchange...');
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('Code exchange error:', error);
          setMessage(`Code exchange failed: ${error.message}`);
        } else if (data.session) {
          console.log('Session established via code exchange!');
          setStatus('success');
          setMessage('Signed in successfully!');
          setTimeout(() => router.push(redirectTo), 1000);
          return;
        }
      }
      
      // Handle email verification / magic link (token_hash)
      if (tokenHash && type) {
        console.log('Verifying OTP token...');
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'signup' | 'recovery' | 'email_change' | 'email',
        });
        
        if (error) throw error;
        
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
        setTimeout(() => router.push(redirectTo), 1500);
        return;
      }
      
      // Final check for session after all processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { data: finalCheck } = await supabase.auth.getSession();
      console.log('Final session check:', !!finalCheck.session);
      
      if (finalCheck.session) {
        setStatus('success');
        setMessage('Signed in successfully!');
        setTimeout(() => router.push(redirectTo), 1000);
        return;
      }
      
      // No valid auth found - show debug info
      const debugInfo = `No session found. URL had: code=${!!code}, hash=${typeof window !== 'undefined' && !!window.location.hash}`;
      console.error(debugInfo);
      throw new Error('Unable to complete authentication. Please try again.');
      
    } catch (error) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Authentication failed');
    }
  }, [searchParams, router]);
  
  useEffect(() => {
    handleCallback();
  }, [handleCallback]);
  
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
