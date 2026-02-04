import { useEffect } from 'react';
import { useOnboarding } from './OnboardingContext';
import OnboardingLayout from './OnboardingLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

export default function StepPhoneSetup() {
  const { data, updateData, setCanGoNext } = useOnboarding();
  
  // Validate
  useEffect(() => {
    if (data.skipPhoneSetup) {
      setCanGoNext(true);
    } else {
      const isValid = 
        data.twilioAccountSid.trim().startsWith('AC') &&
        data.twilioAuthToken.trim().length > 20;
      setCanGoNext(isValid);
    }
  }, [data.skipPhoneSetup, data.twilioAccountSid, data.twilioAuthToken, setCanGoNext]);
  
  return (
    <OnboardingLayout
      title="Set up SMS sending"
      subtitle="Connect Twilio to send automated follow-up texts"
    >
      <div className="space-y-6">
        {/* Options */}
        <div className="grid gap-4">
          {/* Skip for now */}
          <Card
            className={cn(
              'p-4 cursor-pointer transition-all border-2',
              data.skipPhoneSetup
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
            onClick={() => updateData({ skipPhoneSetup: true })}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  data.skipPhoneSetup
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                )}
              >
                {data.skipPhoneSetup && <Icon name="check" size="xs" className="text-primary-foreground" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="clock" size="md" className="text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Skip for Now</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set up SMS later in Settings. You can still add quotes and manage your pipeline.
                </p>
              </div>
            </div>
          </Card>
          
          {/* Connect Twilio */}
          <Card
            className={cn(
              'p-4 cursor-pointer transition-all border-2',
              !data.skipPhoneSetup
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
            onClick={() => updateData({ skipPhoneSetup: false })}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  !data.skipPhoneSetup
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                )}
              >
                {!data.skipPhoneSetup && <Icon name="check" size="xs" className="text-primary-foreground" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="phone" size="md" className="text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Connect Twilio</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Start sending automated follow-up texts immediately.
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Twilio setup form */}
        {!data.skipPhoneSetup && (
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <Icon name="alertCircle" size="lg" className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">You will need a Twilio account</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Twilio charges about $0.01 per SMS. Most users spend $5-20/month.{' '}
                  <a
                    href="https://www.twilio.com/try-twilio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium hover:underline"
                  >
                    Create free account
                    <Icon name="externalLink" size="xs" />
                  </a>
                </p>
              </div>
            </div>
            
            {/* Account SID */}
            <div className="space-y-2">
              <Label htmlFor="twilioSid" className="text-foreground">
                Account SID *
              </Label>
              <Input
                id="twilioSid"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={data.twilioAccountSid}
                onChange={(e) => updateData({ twilioAccountSid: e.target.value })}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Found in your{' '}
                <a
                  href="https://console.twilio.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Twilio Console
                </a>
              </p>
            </div>
            
            {/* Auth Token */}
            <div className="space-y-2">
              <Label htmlFor="twilioToken" className="text-foreground">
                Auth Token *
              </Label>
              <Input
                id="twilioToken"
                type="password"
                placeholder="Your auth token"
                value={data.twilioAuthToken}
                onChange={(e) => updateData({ twilioAuthToken: e.target.value })}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Keep this secret! We encrypt it securely.
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              After setup, we will help you get a phone number for sending messages.
            </p>
          </div>
        )}
        
        {data.skipPhoneSetup && (
          <div className="bg-muted/50 rounded-lg p-6">
            <p className="text-sm text-muted-foreground">
              No problem! You can connect Twilio anytime in Settings → Phone Setup.
              <br /><br />
              You will still be able to add quotes and track your pipeline.
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
