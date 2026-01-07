"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/providers';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form } from '@/components/ui/form';
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icon, IconName } from '@/components/ui/icon';
import { INDUSTRIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Step = 'welcome' | 'business' | 'complete';

interface Feature {
  icon: IconName;
  title: string;
  desc: string;
  color: string;
}

interface QuickStartItem {
  num: number;
  text: string;
  desc: string;
  icon: IconName;
}

export default function OnboardingClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading, refetch: refetchBusiness } = useBusiness();
  
  const [step, setStep] = useState<Step>('welcome');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form data
  const [industry, setIndustry] = useState('');
  const [ownerName, setOwnerName] = useState('');
  
  // Pre-fill owner name from user metadata
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setOwnerName(user.user_metadata.full_name);
    } else if (user?.user_metadata?.name) {
      setOwnerName(user.user_metadata.name);
    }
  }, [user]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  // Redirect if already has business
  useEffect(() => {
    if (!businessLoading && business) {
      router.push('/');
    }
  }, [business, businessLoading, router]);
  
  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length > 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      return `(${digits}`;
    }
    return '';
  };
  
  const handleCreateBusiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    const businessName = formData.get('businessName') as string;
    const ownerNameValue = formData.get('ownerName') as string;
    const phone = formData.get('phone') as string;
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!businessName?.trim()) newErrors.businessName = 'Business name is required';
    if (!ownerNameValue?.trim()) newErrors.ownerName = 'Your name is required';
    if (!phone || phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Valid phone number required';
    if (!industry) newErrors.industry = 'Please select an industry';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setSaving(true);
    setErrors({});
    
    try {
      // Format phone to E.164
      const phoneDigits = phone.replace(/\D/g, '');
      const formattedPhone = phoneDigits.length === 10 ? `+1${phoneDigits}` : `+${phoneDigits}`;
      
      // Calculate trial end
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);
      
      const { error: createError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: businessName.trim(),
          owner_name: ownerNameValue.trim(),
          email: user.email || '',
          phone: formattedPhone,
          industry: industry,
          subscription_status: 'trialing',
          subscription_plan: 'starter',
          trial_ends_at: trialEndsAt.toISOString(),
          quotes_limit: 100,
          sequences_limit: 5,
        });
      
      if (createError) {
        throw new Error(createError.message);
      }
      
      // Create default sequence
      const { data: newBusiness } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (newBusiness) {
        await supabase.from('sequences').insert({
          business_id: newBusiness.id,
          name: 'Default Follow-Up',
          description: 'Automated follow-up for new quotes',
          is_default: true,
          is_active: true,
        });
      }
      
      // Send welcome email (non-blocking)
      fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: ownerNameValue }),
      }).catch(() => {});
      
      await refetchBusiness();
      setOwnerName(ownerNameValue.trim());
      setStep('complete');
    } catch (err) {
      console.error('Create business error:', err);
      setErrors({ form: err instanceof Error ? err.message : 'Failed to create business' });
    } finally {
      setSaving(false);
    }
  };
  
  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <Icon name="spinner" size="2xl" className="animate-spin text-primary" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return null;

  const features: Feature[] = [
    { icon: 'message', title: 'Smart Follow-Ups', desc: 'Automated SMS sequences', color: 'bg-blue-100 text-blue-600' },
    { icon: 'trendUp', title: 'Win More Jobs', desc: 'Increase close rate by 30%', color: 'bg-emerald-100 text-emerald-600' },
    { icon: 'clock', title: 'Save 10+ Hours', desc: 'Per week on follow-ups', color: 'bg-amber-100 text-amber-600' },
  ];

  const quickStartItems: QuickStartItem[] = [
    { num: 1, text: 'Add your first quote', desc: 'Enter a recent quote you gave', icon: 'target' },
    { num: 2, text: 'Watch the magic', desc: 'We auto-follow up at the perfect time', icon: 'robot' },
    { num: 3, text: 'Win the job', desc: 'Track your success in the dashboard', icon: 'trendUp' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-icon-new.png" alt="Selestial" width={40} height={40} className="rounded-xl shadow-lg shadow-primary/20" />
            <span className="font-bold text-xl text-gray-900">Selestial</span>
          </div>
          {step !== 'welcome' && step !== 'complete' && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Step</span>
              <Badge className="bg-primary/10 text-primary border-0 font-semibold">
                {step === 'business' ? '1' : '2'} of 2
              </Badge>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-0 px-4 py-2">
                <Icon name="sparkles" size="sm" className="mr-2" />
                Welcome to Selestial
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Win more jobs with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#9D96FF] block mt-2">automated follow-ups</span>
              </h1>
              
              <p className="text-lg text-gray-500 max-w-md mx-auto">
                Never let a quote go cold again. We&apos;ll help you follow up at the perfect time.
              </p>
            </div>
            
            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4 py-6">
              {features.map((feature, i) => (
                <Card 
                  key={i}
                  className="card-elevated p-5 text-center hover:shadow-lg transition-all group"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110",
                    feature.color
                  )}>
                    <Icon name={feature.icon} size="xl" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </Card>
              ))}
            </div>
            
            <Button 
              size="lg" 
              onClick={() => setStep('business')}
              className="h-14 px-10 text-lg font-semibold gap-2 bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl shadow-lg shadow-primary/25 group"
            >
              Get Started
              <Icon name="arrowRight" size="lg" className="group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-sm text-gray-400">
              Takes less than 2 minutes to set up
            </p>
          </div>
        )}
        
        {/* Business Info Step */}
        {step === 'business' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#9D96FF] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                <Icon name="building" size="2xl" className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tell us about your business</h1>
              <p className="text-gray-500">
                This info helps us personalize your follow-up messages
              </p>
            </div>
            
            {errors.form && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center text-red-600">
                {errors.form}
              </div>
            )}
            
            <Card className="card-elevated p-6 md:p-8 rounded-2xl">
              <Form onSubmit={handleCreateBusiness}>
                {/* Business Name */}
                <Field name="businessName">
                  <FieldLabel required>Business Name</FieldLabel>
                  <div className="relative">
                    <Icon name="building" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      name="businessName"
                      placeholder="Johnson Plumbing"
                      className="pl-10 h-12 rounded-xl"
                      autoFocus
                    />
                  </div>
                  <FieldError show={!!errors.businessName}>{errors.businessName}</FieldError>
                </Field>
                
                {/* Owner Name */}
                <Field name="ownerName">
                  <FieldLabel required>Your Name</FieldLabel>
                  <div className="relative">
                    <Icon name="user" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      name="ownerName"
                      placeholder="Mike Johnson"
                      defaultValue={ownerName}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                  <FieldDescription>This will be used in follow-up messages</FieldDescription>
                  <FieldError show={!!errors.ownerName}>{errors.ownerName}</FieldError>
                </Field>
                
                {/* Phone & Industry */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field name="phone">
                    <FieldLabel required>Business Phone</FieldLabel>
                    <div className="relative">
                      <Icon name="phone" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        name="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        onChange={(e) => {
                          e.target.value = formatPhoneInput(e.target.value);
                        }}
                        className="pl-10 h-12 rounded-xl"
                      />
                    </div>
                    <FieldError show={!!errors.phone}>{errors.phone}</FieldError>
                  </Field>
                  
                  <Field name="industry">
                    <FieldLabel required>Industry</FieldLabel>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Icon name="bolt" size="sm" className="text-gray-400" />
                          <SelectValue placeholder="Select industry" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind.value} value={ind.value}>
                            {ind.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError show={!!errors.industry}>{errors.industry}</FieldError>
                  </Field>
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={saving}
                    className="w-full h-14 text-lg font-semibold gap-2 bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl shadow-lg shadow-primary/25 group"
                  >
                    {saving ? (
                      <>
                        <Icon name="spinner" size="lg" className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <Icon name="arrowRight" size="lg" className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        )}
        
        {/* Complete Step */}
        {step === 'complete' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mx-auto shadow-lg">
                <Icon name="checkCircle" size="4xl" className="text-emerald-600" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                You&apos;re all set, {ownerName.split(' ')[0]}!
              </h1>
              
              <p className="text-lg text-gray-500">
                Your account is ready. Let&apos;s start winning more jobs.
              </p>
            </div>
            
            {/* Next Steps */}
            <Card className="card-elevated p-6 text-left max-w-md mx-auto rounded-2xl">
              <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Icon name="sparkles" size="lg" className="text-primary" />
                Quick Start Guide
              </h3>
              
              <div className="space-y-4">
                {quickStartItems.map((item) => (
                  <div key={item.num} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#9D96FF] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg shadow-primary/20">
                      {item.num}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.text}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <Icon name={item.icon} size="lg" className="text-gray-300" />
                  </div>
                ))}
              </div>
            </Card>
            
            <Button 
              size="lg"
              onClick={() => router.push('/')}
              className="h-14 px-10 text-lg font-semibold gap-2 bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl shadow-lg shadow-primary/25 group"
            >
              Go to Dashboard
              <Icon name="arrowRight" size="lg" className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-200/60 py-6 mt-auto">
        <p className="text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Selestial · All rights reserved
        </p>
      </footer>
    </div>
  );
}
