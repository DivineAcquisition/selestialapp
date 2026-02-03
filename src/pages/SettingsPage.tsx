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
import AISettings from '@/components/settings/AISettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Bell, Clock, Phone, Send, Loader2, Star, CreditCard, Sparkles } from 'lucide-react';
import type { Business } from '@/types';
import type { Json } from '@/integrations/supabase/types';

// Helper to parse business_hours JSON
function parseBusinessHours(businessHours: Json | null): { 
  enabled: boolean; 
  start: string; 
  end: string; 
  days: number[];
} {
  const defaultHours = {
    enabled: true,
    start: '09:00',
    end: '17:00',
    days: [1, 2, 3, 4, 5],
  };
  
  if (!businessHours || typeof businessHours !== 'object' || Array.isArray(businessHours)) {
    return defaultHours;
  }
  
  const hours = businessHours as Record<string, unknown>;
  
  // Parse day-based format from DB
  const daysOpen: number[] = [];
  const dayMap: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, 
    thursday: 4, friday: 5, saturday: 6
  };
  
  let startTime = '09:00';
  let endTime = '17:00';
  
  for (const [day, value] of Object.entries(hours)) {
    if (value && typeof value === 'object' && dayMap[day] !== undefined) {
      daysOpen.push(dayMap[day]);
      const dayHours = value as Record<string, string>;
      if (dayHours.open) startTime = dayHours.open;
      if (dayHours.close) endTime = dayHours.close;
    }
  }
  
  return {
    enabled: daysOpen.length > 0,
    start: startTime,
    end: endTime,
    days: daysOpen.length > 0 ? daysOpen : defaultHours.days,
  };
}

// Convert business hours settings back to DB format
function toBusinessHoursJson(settings: { enabled: boolean; start: string; end: string; days: number[] }): Json {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const result: Record<string, { open: string; close: string } | null> = {};
  
  for (let i = 0; i < 7; i++) {
    if (settings.enabled && settings.days.includes(i)) {
      result[dayNames[i]] = { open: settings.start, close: settings.end };
    } else {
      result[dayNames[i]] = null;
    }
  }
  
  return result as Json;
}

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
      // Use notify_quote_won/lost as fallback for email notifications
      setNotificationSettings({
        emailOnWon: business.notify_quote_won ?? true,
        emailOnLost: business.notify_quote_lost ?? false,
        emailDailyDigest: true,
        smsOnResponse: business.notify_new_message ?? true,
      });
      
      // Parse business_hours JSON
      setBusinessHours(parseBusinessHours(business.business_hours));
    }
  }, [business]);
  
  // Transform DB business to the Business type expected by form
  const transformedBusiness: Business | null = business ? {
    id: business.id,
    name: business.name,
    owner_name: business.owner_name || '',
    phone: business.phone || '',
    email: business.email || '',
    industry: (business.industry || 'other') as Business['industry'],
    timezone: business.timezone || 'America/New_York',
    default_sequence_id: undefined,
    auto_start_sequence: false,
  } : null;
  
  const handleSaveBusiness = async (updatedBusiness: Business) => {
    const { error } = await updateBusiness({
      name: updatedBusiness.name,
      owner_name: updatedBusiness.owner_name,
      email: updatedBusiness.email,
      phone: updatedBusiness.phone,
      // Cast to the DB enum type
      industry: updatedBusiness.industry as any,
    });
    
    if (error) {
      console.error('Failed to update business:', error);
      throw error;
    }
  };
  
  const handleNotificationChange = async (settings: typeof notificationSettings) => {
    setNotificationSettings(settings);
    
    await updateBusiness({
      notify_quote_won: settings.emailOnWon,
      notify_quote_lost: settings.emailOnLost,
      notify_new_message: settings.smsOnResponse,
    });
  };
  
  const handleBusinessHoursChange = async (settings: typeof businessHours) => {
    setBusinessHours(settings);
    
    await updateBusiness({
      business_hours: toBusinessHoursJson(settings),
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
          <TabsList className="grid w-full grid-cols-8">
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
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4 hidden sm:block" />
              AI
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
          
          <TabsContent value="ai">
            <AISettings />
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
