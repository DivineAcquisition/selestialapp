import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';

interface BusinessHoursSettingsProps {
  settings: {
    enabled: boolean;
    start: string;
    end: string;
    days: number[];
  };
  onChange: (settings: BusinessHoursSettingsProps['settings']) => void;
}

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export default function BusinessHoursSettings({ settings, onChange }: BusinessHoursSettingsProps) {
  const handleDayToggle = (day: number) => {
    const newDays = settings.days.includes(day)
      ? settings.days.filter(d => d !== day)
      : [...settings.days, day].sort();
    onChange({ ...settings, days: newDays });
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Business Hours</h3>
          <p className="text-sm text-muted-foreground">Control when follow-up messages are sent</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Enable business hours</Label>
            <p className="text-sm text-muted-foreground">
              Only send messages during your business hours
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => onChange({ ...settings, enabled: checked })}
          />
        </div>
        
        {settings.enabled && (
          <>
            {/* Hours */}
            <div className="flex items-center gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Start Time</Label>
                <Input
                  type="time"
                  value={settings.start}
                  onChange={(e) => onChange({ ...settings, start: e.target.value })}
                  className="w-32"
                />
              </div>
              
              <span className="text-muted-foreground pt-6">to</span>
              
              <div className="space-y-1.5">
                <Label className="text-sm">End Time</Label>
                <Input
                  type="time"
                  value={settings.end}
                  onChange={(e) => onChange({ ...settings, end: e.target.value })}
                  className="w-32"
                />
              </div>
            </div>
            
            {/* Days */}
            <div className="space-y-3">
              <Label>Active Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      settings.days.includes(day.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Messages scheduled outside these hours will be sent at the next available time
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
