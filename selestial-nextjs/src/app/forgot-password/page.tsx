"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        setError(resetError.message);
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
      <AuthLayout title="Check your email" subtitle="We've sent you a password reset link">
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-foreground text-center">
              If an account exists for <strong>{email}</strong>, you will receive a password reset email shortly.
            </p>
          </div>
          
          <div className="space-y-3 text-sm text-muted-foreground text-center">
            <p>Didn&apos;t receive the email?</p>
            <ul className="space-y-1">
              <li>Check your spam folder</li>
              <li>Make sure you entered the correct email</li>
            </ul>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setSuccess(false);
              setEmail('');
            }}
          >
            Try a different email
          </Button>
          
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
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
          />
        </div>
        
        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Send reset link
        </Button>
        
        <Link 
          href="/login" 
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </form>
    </AuthLayout>
  );
}
