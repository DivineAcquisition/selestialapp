import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import PasswordStrengthIndicator, { isPasswordValid } from '@/components/auth/PasswordStrengthIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!isPasswordValid(password)) {
      setError('Please create a stronger password.');
      return;
    }
    
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions.');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(signUpError.message);
        }
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
      <AuthLayout title="Check your email" subtitle="We've sent you a verification link">
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-foreground">
              We've sent a verification email to <strong>{email}</strong>. 
              Click the link in the email to verify your account.
            </p>
          </div>
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Didn't receive the email?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your spam folder</li>
              <li>Make sure you entered the correct email</li>
            </ul>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/login')}
          >
            Back to login
          </Button>
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout title="Start your free trial" subtitle="14 days free, no credit card required">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrengthIndicator password={password} />
        </div>
        
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
            I agree to the{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </label>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-11" 
          disabled={loading || !isPasswordValid(password) || !agreedToTerms}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Create account
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or continue with</span>
          </div>
        </div>
        
        <SocialAuthButtons />
        
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
