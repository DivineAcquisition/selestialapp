import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import BusinessProfileForm from '@/components/settings/BusinessProfileForm';
import NotificationSettings from '@/components/settings/NotificationSettings';
import BusinessHoursSettings from '@/components/settings/BusinessHoursSettings';
import SubscriptionCard from '@/components/settings/SubscriptionCard';
import DangerZone from '@/components/settings/DangerZone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Business } from '@/types';
import { mockBusiness } from '@/lib/mockData';
import { User, Bell, Clock, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business>(mockBusiness);
  
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
    days: [1, 2, 3, 4, 5], // Mon-Fri
  });
  
  const [subscription] = useState({
    status: 'trialing' as const,
    plan: 'starter',
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  });
  
  const handleSaveBusiness = async (updatedBusiness: Business) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setBusiness(updatedBusiness);
  };
  
  const handleManageBilling = () => {
    // TODO: Open Stripe Customer Portal
    console.log('Open billing portal');
  };
  
  const handleUpgrade = () => {
    // TODO: Open upgrade flow
    console.log('Open upgrade flow');
  };
  
  const handleDeleteAccount = () => {
    // TODO: Delete account
    console.log('Delete account');
  };
  
  return (
    <Layout title="Settings">
      <div className="max-w-3xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4 hidden sm:block" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4 hidden sm:block" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="hours" className="gap-2">
              <Clock className="h-4 w-4 hidden sm:block" />
              Hours
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4 hidden sm:block" />
              Billing
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <BusinessProfileForm business={business} onSave={handleSaveBusiness} />
            <DangerZone businessName={business.name} onDeleteAccount={handleDeleteAccount} />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationSettings settings={notificationSettings} onChange={setNotificationSettings} />
          </TabsContent>
          
          <TabsContent value="hours">
            <BusinessHoursSettings settings={businessHours} onChange={setBusinessHours} />
          </TabsContent>
          
          <TabsContent value="billing">
            <SubscriptionCard
              subscription={subscription}
              onManageBilling={handleManageBilling}
              onUpgrade={handleUpgrade}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
