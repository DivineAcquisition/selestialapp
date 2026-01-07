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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ThumbsUp, 
  CreditCard, 
  Sparkles,
  Building2,
  Settings2,
  Palette,
  Shield,
  Globe,
  Zap,
  Mail,
  MessageSquare,
} from 'lucide-react';
import type { Business } from '@/types';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signOut } = useAuth();
  const { business, loading, updateBusiness } = useBusiness();
  
  const defaultTab = searchParams.get('tab') || 'general';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
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
  
  return (
    <Layout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl">
            <Settings2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your business preferences and configurations
            </p>
          </div>
        </div>

        {/* Tabs Layout */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-white">
              <Building2 className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2 data-[state=active]:bg-white">
              <Sparkles className="h-4 w-4" />
              AI Assistant
              <Badge variant="secondary" className="text-[10px] ml-1 bg-primary/10 text-primary border-0">
                New
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="communications" className="gap-2 data-[state=active]:bg-white">
              <MessageSquare className="h-4 w-4" />
              Communications
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 data-[state=active]:bg-white">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-white">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Profile */}
              <div className="lg:col-span-2">
                <BusinessProfileForm business={transformedBusiness} onSave={handleSaveBusiness} />
              </div>
              
              {/* Business Hours */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Business Hours</h3>
                    <p className="text-sm text-muted-foreground">Set when sequences can send messages</p>
                  </div>
                </div>
                <BusinessHoursSettings settings={businessHours} onChange={handleBusinessHoursChange} />
              </Card>

              {/* Account */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Account</h3>
                    <p className="text-sm text-muted-foreground">Manage your account settings</p>
                  </div>
                </div>
                <DangerZone businessName={transformedBusiness.name} onDeleteAccount={handleDeleteAccount} />
              </Card>
            </div>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai" className="mt-6">
            <AISettings />
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Phone Setup */}
              <Card className="p-0 overflow-hidden lg:col-span-2">
                <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Phone & SMS Setup</h3>
                      <p className="text-sm text-muted-foreground">Configure Twilio for SMS messaging</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <PhoneSetup />
                </div>
              </Card>
              
              {/* Quote Notifications */}
              <div className="lg:col-span-2">
                <QuoteNotificationSettings />
              </div>
              
              {/* Review Requests */}
              <div className="lg:col-span-2">
                <ReviewSettings />
              </div>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6">
            <PaymentSettings />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Notification Preferences</h3>
                  <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
                </div>
              </div>
              <NotificationSettings settings={notificationSettings} onChange={handleNotificationChange} />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <Card className="p-6 bg-muted/30">
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/billing')}
              className="p-4 bg-background rounded-xl border hover:border-primary/40 hover:shadow-sm transition-all text-left"
            >
              <CreditCard className="h-5 w-5 text-primary mb-2" />
              <p className="font-medium text-sm">Billing</p>
              <p className="text-xs text-muted-foreground">Manage subscription</p>
            </button>
            <button 
              onClick={() => router.push('/connections')}
              className="p-4 bg-background rounded-xl border hover:border-primary/40 hover:shadow-sm transition-all text-left"
            >
              <Globe className="h-5 w-5 text-primary mb-2" />
              <p className="font-medium text-sm">Integrations</p>
              <p className="text-xs text-muted-foreground">Connect your tools</p>
            </button>
            <button 
              onClick={() => router.push('/sequences')}
              className="p-4 bg-background rounded-xl border hover:border-primary/40 hover:shadow-sm transition-all text-left"
            >
              <Zap className="h-5 w-5 text-primary mb-2" />
              <p className="font-medium text-sm">Sequences</p>
              <p className="text-xs text-muted-foreground">Manage automations</p>
            </button>
            <button 
              onClick={() => router.push('/analytics')}
              className="p-4 bg-background rounded-xl border hover:border-primary/40 hover:shadow-sm transition-all text-left"
            >
              <Mail className="h-5 w-5 text-primary mb-2" />
              <p className="font-medium text-sm">Analytics</p>
              <p className="text-xs text-muted-foreground">View performance</p>
            </button>
          </div>
        </Card>
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
