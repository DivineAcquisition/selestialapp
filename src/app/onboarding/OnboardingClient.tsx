"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/providers';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INDUSTRIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { 
  Loader2, 
  ArrowRight, 
  CheckCircle, 
  Building2, 
  User, 
  Phone,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Clock,
  Zap,
  Bot,
  Target,
} from 'lucide-react';

type Step = 'welcome' | 'business' | 'complete';

export default function OnboardingClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading, refetch: refetchBusiness } = useBusiness();
  
  const [step, setStep] = useState<Step>('welcome');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');
  
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
  
  const formatPhone = (value: string) => {
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
  
  const handlePhoneChange = (value: string) => {
    setPhone(formatPhone(value));
  };
  
  const isBusinessFormValid = () => {
    return (
      businessName.trim().length > 0 &&
      ownerName.trim().length > 0 &&
      phone.replace(/\D/g, '').length >= 10 &&
      industry.length > 0
    );
  };
  
  const handleCreateBusiness = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    
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
          owner_name: ownerName.trim(),
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
        body: JSON.stringify({ email: user.email, name: ownerName }),
      }).catch(() => {});
      
      await refetchBusiness();
      setStep('complete');
    } catch (err) {
      console.error('Create business error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create business');
    } finally {
      setSaving(false);
    }
  };
  
  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return null;
  
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
                <Sparkles className="w-4 h-4 mr-2" />
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
              {[
                { icon: MessageSquare, title: 'Smart Follow-Ups', desc: 'Automated SMS sequences', color: 'bg-blue-100 text-blue-600' },
                { icon: TrendingUp, title: 'Win More Jobs', desc: 'Increase close rate by 30%', color: 'bg-emerald-100 text-emerald-600' },
                { icon: Clock, title: 'Save 10+ Hours', desc: 'Per week on follow-ups', color: 'bg-amber-100 text-amber-600' },
              ].map((feature, i) => (
                <Card 
                  key={i}
                  className="card-elevated p-5 text-center hover:shadow-lg transition-all group"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110",
                    feature.color
                  )}>
                    <feature.icon className="w-6 h-6" />
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
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tell us about your business</h1>
              <p className="text-gray-500">
                This info helps us personalize your follow-up messages
              </p>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center text-red-600">
                {error}
              </div>
            )}
            
            <Card className="card-elevated p-6 md:p-8 rounded-2xl">
              <div className="space-y-5">
                {/* Business Name */}
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="flex items-center gap-2 text-gray-700">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    Business Name
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="Johnson Plumbing"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-12 rounded-xl"
                    autoFocus
                  />
                </div>
                
                {/* Owner Name */}
                <div className="space-y-2">
                  <Label htmlFor="ownerName" className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    Your Name
                  </Label>
                  <Input
                    id="ownerName"
                    placeholder="Mike Johnson"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                
                {/* Phone & Industry */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      Business Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="flex items-center gap-2 text-gray-700">
                      <Zap className="w-4 h-4 text-gray-400" />
                      Industry
                    </Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind.value} value={ind.value}>
                            {ind.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleCreateBusiness}
                disabled={!isBusinessFormValid() || saving}
                className="h-14 px-10 text-lg font-semibold gap-2 bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl shadow-lg shadow-primary/25 group"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* Complete Step */}
        {step === 'complete' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
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
                <Sparkles className="w-5 h-5 text-primary" />
                Quick Start Guide
              </h3>
              
              <div className="space-y-4">
                {[
                  { num: 1, text: 'Add your first quote', desc: 'Enter a recent quote you gave', icon: Target },
                  { num: 2, text: 'Watch the magic', desc: 'We auto-follow up at the perfect time', icon: Bot },
                  { num: 3, text: 'Win the job', desc: 'Track your success in the dashboard', icon: TrendingUp },
                ].map((item) => (
                  <div key={item.num} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#9D96FF] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg shadow-primary/20">
                      {item.num}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.text}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <item.icon className="w-5 h-5 text-gray-300" />
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
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
