import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; needsVerification: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  resendVerification: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiting for auth operations
const rateLimiter = {
  attempts: new Map<string, { count: number; resetAt: number }>(),
  
  check(key: string, maxAttempts = 5, windowMs = 60000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    
    if (record.count >= maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  },
  
  reset(key: string) {
    this.attempts.delete(key);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
          setInitialized(true);
          
          // Handle specific events
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (mounted) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Rate limiting
    const rateLimitKey = `signin:${email.toLowerCase()}`;
    if (!rateLimiter.check(rateLimitKey)) {
      return { 
        error: { 
          message: 'Too many sign in attempts. Please try again in a minute.',
          name: 'RateLimitError',
          status: 429,
        } as AuthError 
      };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase().trim(), 
        password 
      });

      if (error) {
        return { error };
      }

      // Reset rate limit on successful login
      rateLimiter.reset(rateLimitKey);
      
      return { error: null };
    } catch (error) {
      return { 
        error: { 
          message: 'An unexpected error occurred. Please try again.',
          name: 'UnexpectedError',
          status: 500,
        } as AuthError 
      };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    // Rate limiting
    const rateLimitKey = `signup:${email.toLowerCase()}`;
    if (!rateLimiter.check(rateLimitKey, 3, 300000)) { // 3 attempts per 5 minutes
      return { 
        error: { 
          message: 'Too many sign up attempts. Please try again later.',
          name: 'RateLimitError',
          status: 429,
        } as AuthError,
        needsVerification: false,
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: email.toLowerCase().trim(), 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error, needsVerification: false };
      }

      // Check if user needs email verification
      const needsVerification = !data.session && !!data.user;
      
      return { error: null, needsVerification };
    } catch (error) {
      return { 
        error: { 
          message: 'An unexpected error occurred. Please try again.',
          name: 'UnexpectedError',
          status: 500,
        } as AuthError,
        needsVerification: false,
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    // Rate limiting
    const rateLimitKey = `reset:${email.toLowerCase()}`;
    if (!rateLimiter.check(rateLimitKey, 3, 300000)) { // 3 attempts per 5 minutes
      return { 
        error: { 
          message: 'Too many reset attempts. Please try again later.',
          name: 'RateLimitError',
          status: 429,
        } as AuthError 
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(), 
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );
      
      return { error };
    } catch (error) {
      return { 
        error: { 
          message: 'An unexpected error occurred. Please try again.',
          name: 'UnexpectedError',
          status: 500,
        } as AuthError 
      };
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } catch (error) {
      return { 
        error: { 
          message: 'An unexpected error occurred. Please try again.',
          name: 'UnexpectedError',
          status: 500,
        } as AuthError 
      };
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    // Rate limiting
    const rateLimitKey = `resend:${email.toLowerCase()}`;
    if (!rateLimiter.check(rateLimitKey, 2, 120000)) { // 2 attempts per 2 minutes
      return { 
        error: { 
          message: 'Please wait before requesting another verification email.',
          name: 'RateLimitError',
          status: 429,
        } as AuthError 
      };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      return { error };
    } catch (error) {
      return { 
        error: { 
          message: 'An unexpected error occurred. Please try again.',
          name: 'UnexpectedError',
          status: 500,
        } as AuthError 
      };
    }
  }, []);

  const value = {
    user,
    session,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    resendVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
