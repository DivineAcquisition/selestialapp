import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from './OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toE164 } from '@/lib/formatters';
import { CheckCircle, Loader2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import selestialLogo from '@/assets/selestial-logo.png';

export default function StepComplete() {
  const navigate = useNavigate();
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
      // 1. Create the business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: data.businessName,
          owner_name: data.ownerName,
          email: data.email,
          phone: toE164(data.phone),
          industry: data.industry,
        })
        .select()
        .single();
      
      if (businessError) throw businessError;
      
      // 2. Create the default sequence if selected
      if (data.useDefaultSequence) {
        const { error: sequenceError } = await supabase.rpc('create_default_sequence', {
          p_business_id: business.id,
        });
        
        if (sequenceError) {
          console.error('Failed to create default sequence:', sequenceError);
          // Non-fatal, continue
        }
      }
      
      // 3. Log the activity
      await supabase.rpc('log_activity', {
        p_business_id: business.id,
        p_action: 'business_created',
        p_description: 'Account setup completed',
      });
      
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
    navigate('/');
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
          <img src={selestialLogo} alt="Selestial" className="h-8" />
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {status === 'saving' && (
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
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
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">You're all set!</h1>
                <p className="text-muted-foreground mt-2">
                  Welcome to Selestial, {data.ownerName.split(' ')[0]}. Let's start winning more jobs.
                </p>
              </div>
              
              {/* What's next */}
              <div className="bg-muted/50 rounded-lg p-6 text-left">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  What's next?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                      1
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Add your first quote — Enter a recent quote you've given
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                      2
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Watch the magic — We'll automatically follow up
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
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              {!data.skipPhoneSetup && (
                <p className="text-xs text-muted-foreground">
                  Don't forget to finish setting up your Twilio phone number in Settings!
                </p>
              )}
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-6">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-destructive" />
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
                <Button variant="ghost" onClick={() => navigate('/login')}>
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
          <span>·</span>
          <a 
            href="https://selestial.io/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </a>
          <span>·</span>
          <a 
            href="https://selestial.io/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}
