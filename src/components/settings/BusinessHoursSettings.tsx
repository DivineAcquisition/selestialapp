"use client";

import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

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
    <Card className="card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Icon name="clock" size="lg" className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Business Hours</h3>
          <p className="text-sm text-gray-500">Control when follow-up messages are sent</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Enable toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-900">Enable business hours</p>
            <p className="text-sm text-gray-500">
              Only send messages during your business hours
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => onChange({ ...settings, enabled: checked })}
            className="data-[state=checked]:bg-primary"
          />
        </div>
        
        {settings.enabled && (
          <>
            {/* Hours */}
            <div className="flex items-center gap-4">
              <Field name="start" className="flex-1">
                <FieldLabel className="text-sm">Start Time</FieldLabel>
                <Input
                  type="time"
                  value={settings.start}
                  onChange={(e) => onChange({ ...settings, start: e.target.value })}
                  className="rounded-xl"
                />
              </Field>
              
              <span className="text-gray-400 pt-6">to</span>
              
              <Field name="end" className="flex-1">
                <FieldLabel className="text-sm">End Time</FieldLabel>
                <Input
                  type="time"
                  value={settings.end}
                  onChange={(e) => onChange({ ...settings, end: e.target.value })}
                  className="rounded-xl"
                />
              </Field>
            </div>
            
            {/* Days */}
            <Field name="days">
              <FieldLabel>Active Days</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      settings.days.includes(day.value)
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <FieldDescription>
                Messages scheduled outside these hours will be sent at the next available time
              </FieldDescription>
            </Field>
          </>
        )}
      </div>
    </Card>
  );
}
