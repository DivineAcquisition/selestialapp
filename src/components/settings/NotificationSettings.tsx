import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare, Trophy, AlertCircle } from 'lucide-react';

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
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Notifications</h3>
          <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Email notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Mail className="h-4 w-4" />
            Email Notifications
          </div>
          
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Quote won</Label>
                <p className="text-sm text-muted-foreground">Get notified when a quote is marked as won</p>
              </div>
              <Switch
                checked={settings.emailOnWon}
                onCheckedChange={() => handleToggle('emailOnWon')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Quote lost</Label>
                <p className="text-sm text-muted-foreground">Get notified when a quote is marked as lost</p>
              </div>
              <Switch
                checked={settings.emailOnLost}
                onCheckedChange={() => handleToggle('emailOnLost')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Daily digest</Label>
                <p className="text-sm text-muted-foreground">Receive a daily summary of your quote activity</p>
              </div>
              <Switch
                checked={settings.emailDailyDigest}
                onCheckedChange={() => handleToggle('emailDailyDigest')}
              />
            </div>
          </div>
        </div>
        
        {/* SMS notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            SMS Notifications
          </div>
          
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Customer response</Label>
                <p className="text-sm text-muted-foreground">Get a text when a customer replies to a follow-up</p>
              </div>
              <Switch
                checked={settings.smsOnResponse}
                onCheckedChange={() => handleToggle('smsOnResponse')}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
