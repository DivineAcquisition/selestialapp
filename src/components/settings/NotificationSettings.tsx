"use client";

import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@/components/ui/icon';

interface NotificationSettingsProps {
  settings: {
    emailOnWon: boolean;
    emailOnLost: boolean;
    emailDailyDigest: boolean;
    smsOnResponse: boolean;
  };
  onChange: (settings: NotificationSettingsProps['settings']) => void;
}

export default function NotificationSettings({ settings, onChange }: NotificationSettingsProps) {
  const handleToggle = (key: keyof typeof settings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };
  
  return (
    <Card className="card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Icon name="bell" size="lg" className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <p className="text-sm text-gray-500">Choose how you want to be notified</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Email notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <Icon name="email" size="sm" />
            Email Notifications
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Quote won</p>
                <p className="text-sm text-gray-500">Get notified when a quote is marked as won</p>
              </div>
              <Switch
                checked={settings.emailOnWon}
                onCheckedChange={() => handleToggle('emailOnWon')}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Quote lost</p>
                <p className="text-sm text-gray-500">Get notified when a quote is marked as lost</p>
              </div>
              <Switch
                checked={settings.emailOnLost}
                onCheckedChange={() => handleToggle('emailOnLost')}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Daily digest</p>
                <p className="text-sm text-gray-500">Receive a daily summary of your quote activity</p>
              </div>
              <Switch
                checked={settings.emailDailyDigest}
                onCheckedChange={() => handleToggle('emailDailyDigest')}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </div>
        
        {/* SMS notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <Icon name="message" size="sm" />
            SMS Notifications
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Customer response</p>
                <p className="text-sm text-gray-500">Get a text when a customer replies to a follow-up</p>
              </div>
              <Switch
                checked={settings.smsOnResponse}
                onCheckedChange={() => handleToggle('smsOnResponse')}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
