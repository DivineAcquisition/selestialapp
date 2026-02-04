import { useEffect } from 'react';
import { useOnboarding } from './OnboardingContext';
import OnboardingLayout from './OnboardingLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INDUSTRIES } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';

export default function StepBusinessInfo() {
  const { user } = useAuth();
  const { data, updateData, setCanGoNext } = useOnboarding();
  
  // Pre-fill email from auth
  useEffect(() => {
    if (user?.email && !data.email) {
      updateData({ email: user.email });
    }
  }, [user?.email, data.email, updateData]);
  
  // Validate form
  useEffect(() => {
    const isValid = 
      data.businessName.trim().length > 0 &&
      data.ownerName.trim().length > 0 &&
      data.email.trim().length > 0 &&
      data.phone.replace(/\D/g, '').length >= 10;
    
    setCanGoNext(isValid);
  }, [data.businessName, data.ownerName, data.email, data.phone, setCanGoNext]);
  
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    
    updateData({ phone: formatted });
  };
  
  return (
    <OnboardingLayout
      title="Tell us about your business"
      subtitle="This info appears in your follow-up messages"
    >
      <div className="space-y-6">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-foreground">
            Business Name *
          </Label>
          <Input
            id="businessName"
            placeholder="Johnson Plumbing"
            value={data.businessName}
            onChange={(e) => updateData({ businessName: e.target.value })}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            This appears in your messages as {'{{business_name}}'}
          </p>
        </div>
        
        {/* Owner Name */}
        <div className="space-y-2">
          <Label htmlFor="ownerName" className="text-foreground">
            Your Name *
          </Label>
          <Input
            id="ownerName"
            placeholder="Mike Johnson"
            value={data.ownerName}
            onChange={(e) => updateData({ ownerName: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            This appears in your messages as {'{{owner_name}}'}
          </p>
        </div>
        
        {/* Two columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="mike@johnsonplumbing.com"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
            />
          </div>
          
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">
              Business Phone *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={data.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
          </div>
        </div>
        
        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="industry" className="text-foreground">
            Industry *
          </Label>
          <Select
            value={data.industry}
            onValueChange={(value) => updateData({ industry: value as typeof data.industry })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            This determines the service types available when adding quotes
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
