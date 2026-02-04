"use client";

import { Suspense, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icon } from '@/components/ui/icon';
import { useBusiness, useAuth } from '@/providers';
import { supabase } from '@/integrations/supabase/client';
import { NavigationCard } from '@/components/ui/interactive-card';
import type { Business } from '@/types';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signOut } = useAuth();
  const { business, loading, updateBusiness } = useBusiness();
  
  const defaultTab = searchParams.get('tab') || 'general';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Use business values directly when available, with defaults as fallback
  const notificationSettings = {
    emailOnWon: business?.notify_email_won ?? true,
    emailOnLost: business?.notify_email_lost ?? false,
    emailDailyDigest: business?.notify_email_daily_digest ?? true,
    smsOnResponse: business?.notify_sms_response ?? true,
  };
  
  const businessHours = {
    enabled: business?.business_hours_enabled ?? true,
    start: business?.business_hours_start ?? '08:00',
    end: business?.business_hours_end ?? '18:00',
    days: business?.business_days ?? [1, 2, 3, 4, 5],
  };
  
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
    await updateBusiness({
      notify_email_won: settings.emailOnWon,
      notify_email_lost: settings.emailOnLost,
      notify_email_daily_digest: settings.emailDailyDigest,
      notify_sms_response: settings.smsOnResponse,
    });
  };
  
  const handleBusinessHoursChange = async (settings: typeof businessHours) => {
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
        <div className="flex items-center justify-center py-20">
          <Icon name="spinner" size="2xl" className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
            <Icon name="settings" size="xl" className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500">
              Manage your business preferences and configurations
            </p>
          </div>
        </div>

        {/* Tabs Layout */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-100/80 p-1 h-auto flex-wrap rounded-xl">
            <TabsTrigger value="general" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Icon name="building" size="sm" />
              General
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Icon name="sparkles" size="sm" />
              AI Assistant
              <Badge className="text-[10px] ml-1 bg-primary/10 text-primary border-0">
                New
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="communications" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Icon name="message" size="sm" />
              Communications
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Icon name="creditCard" size="sm" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Icon name="bell" size="sm" />
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
              <Card className="card-elevated p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Icon name="clock" size="lg" className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-sm text-gray-500">Set when sequences can send messages</p>
                  </div>
                </div>
                <BusinessHoursSettings settings={businessHours} onChange={handleBusinessHoursChange} />
              </Card>

              {/* Account */}
              <Card className="card-elevated p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Icon name="shield" size="lg" className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Account</h3>
                    <p className="text-sm text-gray-500">Manage your account settings</p>
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
            <div className="grid grid-cols-1 gap-6">
              {/* Phone Setup */}
              <Card className="card-elevated p-0 overflow-hidden rounded-2xl">
                <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Icon name="phone" size="lg" className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Phone & SMS Setup</h3>
                      <p className="text-sm text-gray-500">Configure Twilio for SMS messaging</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <PhoneSetup />
                </div>
              </Card>
              
              {/* Quote Notifications */}
              <QuoteNotificationSettings />
              
              {/* Review Requests */}
              <ReviewSettings />
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6">
            <PaymentSettings />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="card-elevated p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Icon name="bell" size="lg" className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
                  <p className="text-sm text-gray-500">Choose how you want to be notified</p>
                </div>
              </div>
              <NotificationSettings settings={notificationSettings} onChange={handleNotificationChange} />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Navigation */}
        <Card className="card-elevated p-6 bg-gradient-to-br from-gray-50/80 to-white rounded-2xl ring-1 ring-white/50">
          <h3 className="font-semibold text-gray-900 mb-4">Settings Navigation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NavigationCard 
              icon={<Icon name="user" size="lg" />}
              title="Profile"
              description="Business information"
              onClick={() => router.push('/settings/profile')}
            />
            <NavigationCard 
              icon={<Icon name="users" size="lg" />}
              title="Team"
              description="Manage members"
              onClick={() => router.push('/settings/team')}
            />
            <NavigationCard 
              icon={<Icon name="plug" size="lg" />}
              title="Integrations"
              description="Connect your tools"
              onClick={() => router.push('/settings/integrations')}
            />
            <NavigationCard 
              icon={<Icon name="shield" size="lg" />}
              title="Security"
              description="Password & 2FA"
              onClick={() => router.push('/settings/security')}
            />
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="card-elevated p-6 bg-gradient-to-br from-gray-50/80 to-white rounded-2xl ring-1 ring-white/50">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <NavigationCard 
              icon={<Icon name="creditCard" size="lg" />}
              title="Billing"
              description="Manage subscription"
              onClick={() => router.push('/billing')}
            />
            <NavigationCard 
              icon={<Icon name="calendar" size="lg" />}
              title="Bookings"
              description="Widget settings"
              onClick={() => router.push('/bookings/customize')}
            />
            <NavigationCard 
              icon={<Icon name="bolt" size="lg" />}
              title="Sequences"
              description="Manage automations"
              onClick={() => router.push('/sequences')}
            />
            <NavigationCard 
              icon={<Icon name="chart" size="lg" />}
              title="Analytics"
              description="View performance"
              onClick={() => router.push('/analytics')}
            />
            <NavigationCard 
              icon={<Icon name="help" size="lg" />}
              title="Support"
              description="Get help"
              onClick={() => router.push('/settings/support')}
            />
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
        <div className="flex items-center justify-center py-20">
          <Icon name="spinner" size="2xl" className="animate-spin text-primary" />
        </div>
      </Layout>
    }>
      <SettingsContent />
    </Suspense>
  );
}
