"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOnboarding } from './OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toE164 } from '@/lib/formatters';
import { Icon } from '@/components/ui/icon';

export default function StepComplete() {
  const router = useRouter();
  const { user } = useAuth();
  const { refetch: refetchBusiness } = useBusiness();
  const { data, setCanGoNext } = useOnboarding();
  
  const [status, setStatus] = useState<'saving' | 'success' | 'error'>('saving');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setCanGoNext(false);
    createBusiness();
  }, []);
  
  const createBusiness = async () => {
    if (!user) {
      setError('Not authenticated');
      setStatus('error');
      return;
    }
    
    try {
      // Calculate trial end date (14 days from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      // Format phone number
      let formattedPhone = data.phone;
      try {
        formattedPhone = toE164(data.phone);
      } catch (e) {
        // Use as-is if formatting fails
        formattedPhone = data.phone.replace(/\D/g, '');
        if (formattedPhone.length === 10) {
          formattedPhone = '+1' + formattedPhone;
        }
      }

      // 1. Create the business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: data.businessName,
          owner_name: data.ownerName,
          email: data.email,
          phone: formattedPhone,
          industry: data.industry,
          subscription_status: 'trialing',
          subscription_plan: 'starter',
          trial_ends_at: trialEndsAt.toISOString(),
          quotes_limit: 100,
          sequences_limit: 5,
        })
        .select()
        .single();
      
      if (businessError) {
        console.error('Business creation error:', businessError);
        throw new Error(businessError.message || 'Failed to create business');
      }
      
      if (!business) {
        throw new Error('No business returned after creation');
      }

      // 2. Create default sequence (optional - don't fail if it doesn't work)
      if (data.useDefaultSequence) {
        try {
          // Check if the function exists first by trying to create a basic sequence
          const { error: sequenceError } = await supabase
            .from('sequences')
            .insert({
              business_id: business.id,
              name: 'Default Follow-Up',
              description: 'Automated follow-up sequence for new quotes',
              is_default: true,
              is_active: true,
            });
          
          if (sequenceError) {
            console.warn('Could not create default sequence:', sequenceError);
          }
        } catch (seqErr) {
          console.warn('Sequence creation failed:', seqErr);
          // Non-fatal, continue
        }
      }
      
      // 3. Try to send welcome email via API (optional)
      try {
        await fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            name: data.ownerName,
          }),
        });
      } catch (emailErr) {
        console.warn('Welcome email failed:', emailErr);
        // Non-fatal, continue
      }
      
      // 4. Refresh business context
      await refetchBusiness();
      
      setStatus('success');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
      setStatus('error');
    }
  };
  
  const handleContinue = () => {
    router.push('/');
  };
  
  const handleRetry = () => {
    setStatus('saving');
    setError(null);
    createBusiness();
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Image src="/logo-icon-new.png" alt="Selestial" width={40} height={40} className="h-10 w-auto" />
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {status === 'saving' && (
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Icon name="spinner" size="2xl" className="text-primary animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Setting up your account...</h1>
                <p className="text-muted-foreground mt-2">Just a moment while we get everything ready.</p>
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                <Icon name="checkCircle" size="2xl" className="text-emerald-600" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">You&apos;re all set!</h1>
                <p className="text-muted-foreground mt-2">
                  Welcome to Selestial, {data.ownerName.split(' ')[0]}. Let&apos;s start winning more jobs.
                </p>
              </div>
              
              {/* What's next */}
              <div className="bg-muted/50 rounded-lg p-6 text-left">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="lightbulb" size="md" className="text-primary" />
                  What&apos;s next?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                      1
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Add your first quote — Enter a recent quote you&apos;ve given
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                      2
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Watch the magic — We&apos;ll automatically follow up
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                      3
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Win more jobs — Mark quotes as won when they convert
                    </span>
                  </div>
                </div>
              </div>
              
              <Button size="lg" onClick={handleContinue} className="w-full">
                Go to Dashboard
                <Icon name="arrowRight" size="md" className="ml-2" />
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-6">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <Icon name="alertCircle" size="2xl" className="text-destructive" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
                <p className="text-muted-foreground mt-2">
                  {error || "We couldn't complete your setup. Please try again."}
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button onClick={handleRetry}>
                  Try Again
                </Button>
                <Button variant="ghost" onClick={() => router.push('/login')}>
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 px-6 border-t border-border">
        <div className="max-w-md mx-auto flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Selestial</span>
        </div>
      </footer>
    </div>
  );
}
