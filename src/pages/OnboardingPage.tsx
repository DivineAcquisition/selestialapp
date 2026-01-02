import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, ArrowRight } from 'lucide-react';
import { INDUSTRIES } from '@/lib/constants';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refetch } = useBusiness();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    email: user?.email || '',
    phone: '',
    industry: 'other',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    
    return formatted;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }
    if (!formData.owner_name.trim()) {
      newErrors.owner_name = 'Your name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Valid phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;
    
    setLoading(true);
    
    try {
      // Create the business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          owner_name: formData.owner_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          industry: formData.industry,
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Create default sequence
      await supabase.rpc('create_default_sequence', { p_business_id: business.id });

      // Log onboarding activity
      await supabase.rpc('log_activity', {
        p_business_id: business.id,
        p_action: 'onboarding_completed',
        p_description: `${formData.owner_name} created ${formData.name}`,
      });

      await refetch();
      
      toast({
        title: 'Welcome to Selestial!',
        description: 'Your business has been set up. Start adding quotes!',
      });
      
      navigate('/');
    } catch (err) {
      toast({
        title: 'Setup failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg p-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">Selestial</span>
        </div>
        
        <h1 className="text-xl font-semibold text-center mb-2">Let's set up your business</h1>
        <p className="text-muted-foreground text-center mb-6">
          We'll use this information to personalize your follow-up messages.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Business Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Johnson Plumbing LLC"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="owner_name">Your Name *</Label>
            <Input
              id="owner_name"
              value={formData.owner_name}
              onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              placeholder="Mike Johnson"
              className={errors.owner_name ? 'border-destructive' : ''}
            />
            {errors.owner_name && (
              <p className="text-sm text-destructive">{errors.owner_name}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="mike@company.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                placeholder="(555) 123-4567"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => setFormData({ ...formData, industry: value })}
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
              This helps us suggest relevant service types for your quotes.
            </p>
          </div>
          
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Get Started
          </Button>
        </form>
      </Card>
    </div>
  );
}
