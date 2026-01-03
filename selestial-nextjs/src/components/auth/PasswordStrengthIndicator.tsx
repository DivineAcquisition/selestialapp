import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p) => /[0-9]/.test(p) },
];

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const results = useMemo(() => 
    requirements.map(req => ({
      ...req,
      passed: req.test(password),
    })),
    [password]
  );
  
  const passedCount = results.filter(r => r.passed).length;
  const strength = passedCount / requirements.length;
  
  const strengthLabel = useMemo(() => {
    if (strength === 0) return { text: '', color: 'bg-muted' };
    if (strength <= 0.25) return { text: 'Weak', color: 'bg-destructive' };
    if (strength <= 0.5) return { text: 'Fair', color: 'bg-orange-500' };
    if (strength <= 0.75) return { text: 'Good', color: 'bg-yellow-500' };
    return { text: 'Strong', color: 'bg-emerald-500' };
  }, [strength]);
  
  if (!password) return null;
  
  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn(
            "font-medium",
            strength <= 0.25 && "text-destructive",
            strength > 0.25 && strength <= 0.5 && "text-orange-500",
            strength > 0.5 && strength <= 0.75 && "text-yellow-600",
            strength > 0.75 && "text-emerald-600"
          )}>
            {strengthLabel.text}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-300", strengthLabel.color)}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
      </div>
      
      {/* Requirements list */}
      <div className="grid grid-cols-2 gap-1">
        {results.map((req, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            {req.passed ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <X className="w-3 h-3 text-muted-foreground" />
            )}
            <span className={req.passed ? 'text-foreground' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function isPasswordValid(password: string): boolean {
  return requirements.every(req => req.test(password));
}
