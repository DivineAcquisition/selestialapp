import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import BusinessProfileForm from '@/components/settings/BusinessProfileForm';
import NotificationSettings from '@/components/settings/NotificationSettings';
import QuoteNotificationSettings from '@/components/settings/QuoteNotificationSettings';
import BusinessHoursSettings from '@/components/settings/BusinessHoursSettings';
import DangerZone from '@/components/settings/DangerZone';
import PhoneSetup from '@/components/settings/PhoneSetup';
import ReviewSettings from '@/components/settings/ReviewSettings';
import PaymentSettings from '@/components/settings/PaymentSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Bell, Clock, Phone, Send, Loader2, Star, CreditCard } from 'lucide-react';
import type { Business } from '@/types';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signOut } = useAuth();
  const { business, loading, updateBusiness } = useBusiness();
  
  // Handle tab from URL param (for Stripe Connect redirects)
  const defaultTab = searchParams.get('tab') || 'profile';
  
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
  
  // Sync settings from business
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
  
  // Transform DB business to the Business type expected by form
  const transformedBusiness: Business | null = business ? {
    id: business.id,
    name: business.name,
    owner_name: business.owner_name,
    phone: business.phone,
    email: business.email,
    industry: business.industry as any,
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
    
    if (error) {
      console.error('Failed to update business:', error);
      throw error;
    }
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
    
    // Delete business (cascades to all related data)
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', business.id);
    
    if (error) {
      console.error('Failed to delete account:', error);
      return;
    }
    
    // Sign out
    await signOut();
    navigate('/login');
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
      <div className="max-w-3xl">
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4 hidden sm:block" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="phone" className="gap-2">
              <Phone className="h-4 w-4 hidden sm:block" />
              Phone
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4 hidden sm:block" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="quote-alerts" className="gap-2">
              <Send className="h-4 w-4 hidden sm:block" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="h-4 w-4 hidden sm:block" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4 hidden sm:block" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="hours" className="gap-2">
              <Clock className="h-4 w-4 hidden sm:block" />
              Hours
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <BusinessProfileForm business={transformedBusiness} onSave={handleSaveBusiness} />
            <DangerZone businessName={transformedBusiness.name} onDeleteAccount={handleDeleteAccount} />
          </TabsContent>
          
          <TabsContent value="phone">
            <PhoneSetup />
          </TabsContent>
          
          <TabsContent value="payments">
            <PaymentSettings />
          </TabsContent>
          
          <TabsContent value="quote-alerts">
            <QuoteNotificationSettings />
          </TabsContent>
          
          <TabsContent value="reviews">
            <ReviewSettings />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationSettings settings={notificationSettings} onChange={handleNotificationChange} />
          </TabsContent>
          
          <TabsContent value="hours">
            <BusinessHoursSettings settings={businessHours} onChange={handleBusinessHoursChange} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
