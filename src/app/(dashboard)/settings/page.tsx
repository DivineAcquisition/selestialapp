"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import BusinessProfileForm from '@/components/settings/BusinessProfileForm';
import NotificationSettings from '@/components/settings/NotificationSettings';
import QuoteNotificationSettings from '@/components/settings/QuoteNotificationSettings';
import BusinessHoursSettings from '@/components/settings/BusinessHoursSettings';
import DangerZone from '@/components/settings/DangerZone';
import PhoneSetup from '@/components/settings/PhoneSetup';
import ReviewSettings from '@/components/settings/ReviewSettings';
import PaymentSettings from '@/components/settings/PaymentSettings';
import AISettings from '@/components/settings/AISettings';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBusiness, useAuth } from '@/providers';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { 
  User, 
  Bell, 
  Clock, 
  Phone, 
  Send, 
  Loader2, 
  Star, 
  CreditCard, 
  Sparkles,
  ChevronRight,
  Building2,
  Shield,
  Zap
} from 'lucide-react';
import type { Business } from '@/types';

const settingsSections = [
  {
    id: 'profile',
    label: 'Business Profile',
    icon: Building2,
    description: 'Your business information',
  },
  {
    id: 'phone',
    label: 'Phone Setup',
    icon: Phone,
    description: 'SMS & calling configuration',
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    description: 'Stripe Connect & billing',
  },
  {
    id: 'ai',
    label: 'AI Assistant',
    icon: Sparkles,
    description: 'Smart replies & automation',
    highlight: true,
  },
  {
    id: 'quote-alerts',
    label: 'Quote Notifications',
    icon: Send,
    description: 'SMS & email alerts for quotes',
  },
  {
    id: 'reviews',
    label: 'Review Requests',
    icon: Star,
    description: 'Automated review collection',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Alert preferences',
  },
  {
    id: 'hours',
    label: 'Business Hours',
    icon: Clock,
    description: 'Operating schedule',
  },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signOut } = useAuth();
  const { business, loading, updateBusiness } = useBusiness();
  
  const defaultTab = searchParams.get('tab') || 'profile';
  const [activeSection, setActiveSection] = useState(defaultTab);
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnWon: true,
    emailOnLost: false,
    emailDailyDigest: true,
    smsOnResponse: true,
  });
  
  const [businessHours, setBusinessHours] = useState({
    enabled: true,
    start: '08:00',
    end: '18:00',
    days: [1, 2, 3, 4, 5],
  });
  
  useEffect(() => {
    if (business) {
      setNotificationSettings({
        emailOnWon: business.notify_email_won,
        emailOnLost: business.notify_email_lost,
        emailDailyDigest: business.notify_email_daily_digest,
        smsOnResponse: business.notify_sms_response,
      });
      setBusinessHours({
        enabled: business.business_hours_enabled,
        start: business.business_hours_start,
        end: business.business_hours_end,
        days: business.business_days,
      });
    }
  }, [business]);
  
  const transformedBusiness: Business | null = business ? {
    id: business.id,
    name: business.name,
    owner_name: business.owner_name,
    phone: business.phone,
    email: business.email,
    industry: business.industry as Business['industry'],
    timezone: business.timezone,
    default_sequence_id: business.default_sequence_id || undefined,
    auto_start_sequence: business.auto_start_sequence,
  } : null;
  
  const handleSaveBusiness = async (updatedBusiness: Business) => {
    const { error } = await updateBusiness({
      name: updatedBusiness.name,
      owner_name: updatedBusiness.owner_name,
      email: updatedBusiness.email,
      phone: updatedBusiness.phone,
      industry: updatedBusiness.industry,
    });
    
    if (error) throw error;
  };
  
  const handleNotificationChange = async (settings: typeof notificationSettings) => {
    setNotificationSettings(settings);
    await updateBusiness({
      notify_email_won: settings.emailOnWon,
      notify_email_lost: settings.emailOnLost,
      notify_email_daily_digest: settings.emailDailyDigest,
      notify_sms_response: settings.smsOnResponse,
    });
  };
  
  const handleBusinessHoursChange = async (settings: typeof businessHours) => {
    setBusinessHours(settings);
    await updateBusiness({
      business_hours_enabled: settings.enabled,
      business_hours_start: settings.start,
      business_hours_end: settings.end,
      business_days: settings.days,
    });
  };
  
  const handleDeleteAccount = async () => {
    if (!business) return;
    
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', business.id);
    
    if (error) {
      console.error('Failed to delete account:', error);
      return;
    }
    
    await signOut();
    router.push('/login');
  };
  
  if (loading || !transformedBusiness) {
    return (
      <Layout title="Settings">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <BusinessProfileForm business={transformedBusiness} onSave={handleSaveBusiness} />
            <DangerZone businessName={transformedBusiness.name} onDeleteAccount={handleDeleteAccount} />
          </div>
        );
      case 'phone':
        return <PhoneSetup />;
      case 'payments':
        return <PaymentSettings />;
      case 'ai':
        return <AISettings />;
      case 'quote-alerts':
        return <QuoteNotificationSettings />;
      case 'reviews':
        return <ReviewSettings />;
      case 'notifications':
        return <NotificationSettings settings={notificationSettings} onChange={handleNotificationChange} />;
      case 'hours':
        return <BusinessHoursSettings settings={businessHours} onChange={handleBusinessHoursChange} />;
      default:
        return null;
    }
  };

  const currentSection = settingsSections.find(s => s.id === activeSection);
  
  return (
    <Layout title="Settings">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-72 flex-shrink-0">
          <Card className="p-2 sticky top-20">
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-secondary",
                      section.highlight && !isActive && "feature-card border-0"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                      isActive 
                        ? "bg-primary-foreground/20" 
                        : section.highlight 
                          ? "bg-primary/10" 
                          : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        isActive 
                          ? "text-primary-foreground" 
                          : section.highlight 
                            ? "text-primary" 
                            : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm truncate",
                        !isActive && "text-foreground"
                      )}>
                        {section.label}
                      </p>
                      <p className={cn(
                        "text-xs truncate",
                        isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {section.description}
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 flex-shrink-0 transition-transform",
                      isActive ? "text-primary-foreground" : "text-muted-foreground",
                      isActive && "translate-x-0.5"
                    )} />
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              {currentSection && (
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  currentSection.highlight ? "bg-primary/10 glow-sm" : "bg-muted"
                )}>
                  <currentSection.icon className={cn(
                    "w-5 h-5",
                    currentSection.highlight ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{currentSection?.label}</h2>
                <p className="text-sm text-muted-foreground">{currentSection?.description}</p>
              </div>
            </div>
          </div>
          
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <Layout title="Settings">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    }>
      <SettingsContent />
    </Suspense>
  );
}
