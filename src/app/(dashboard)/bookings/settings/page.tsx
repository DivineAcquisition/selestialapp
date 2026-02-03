'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Icon } from '@/components/ui/icon';
import { useBusiness } from '@/providers';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { BusinessHours, AvailabilitySettings } from '@/types/booking';

// ============================================================================
// CONSTANTS
// ============================================================================

const WEEKDAYS = [
  { label: 'Sunday', short: 'Sun', value: 0 },
  { label: 'Monday', short: 'Mon', value: 1 },
  { label: 'Tuesday', short: 'Tue', value: 2 },
  { label: 'Wednesday', short: 'Wed', value: 3 },
  { label: 'Thursday', short: 'Thu', value: 4 },
  { label: 'Friday', short: 'Fri', value: 5 },
  { label: 'Saturday', short: 'Sat', value: 6 },
];

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00',
];

const DEFAULT_BUSINESS_HOURS: BusinessHours[] = WEEKDAYS.map((day) => ({
  day_of_week: day.value,
  is_open: day.value >= 1 && day.value <= 5, // Mon-Fri
  open_time: '08:00',
  close_time: '17:00',
}));

const DEFAULT_SETTINGS: Omit<AvailabilitySettings, 'business_id'> = {
  min_advance_hours: 24,
  max_advance_days: 60,
  buffer_between_bookings: 30,
  slot_duration_minutes: 30,
  slots_per_day_limit: undefined,
  service_zip_codes: [],
  service_radius_miles: undefined,
  business_hours: DEFAULT_BUSINESS_HOURS,
};

// ============================================================================
// COMPONENTS
// ============================================================================

function BusinessHoursEditor({
  hours,
  onChange,
}: {
  hours: BusinessHours[];
  onChange: (hours: BusinessHours[]) => void;
}) {
  const updateDay = (dayOfWeek: number, updates: Partial<BusinessHours>) => {
    const newHours = hours.map((h) =>
      h.day_of_week === dayOfWeek ? { ...h, ...updates } : h
    );
    onChange(newHours);
  };

  return (
    <div className="space-y-3">
      {WEEKDAYS.map((day) => {
        const dayHours = hours.find((h) => h.day_of_week === day.value) || {
          day_of_week: day.value,
          is_open: false,
          open_time: '08:00',
          close_time: '17:00',
        };

        return (
          <div
            key={day.value}
            className={cn(
              'flex items-center gap-4 p-3 rounded-lg border transition-colors',
              !dayHours.is_open && 'bg-muted/50'
            )}
          >
            <div className="w-28 font-medium">{day.label}</div>

            <Switch
              checked={dayHours.is_open}
              onCheckedChange={(checked) =>
                updateDay(day.value, { is_open: checked })
              }
            />

            {dayHours.is_open ? (
              <>
                <Select
                  value={dayHours.open_time}
                  onValueChange={(v) => updateDay(day.value, { open_time: v })}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.slice(0, -4).map((t) => (
                      <SelectItem key={t} value={t}>
                        {formatTime(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-muted-foreground">to</span>

                <Select
                  value={dayHours.close_time}
                  onValueChange={(v) => updateDay(day.value, { close_time: v })}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.slice(4).map((t) => (
                      <SelectItem key={t} value={t}>
                        {formatTime(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function ServiceAreaEditor({
  zipCodes,
  onChange,
}: {
  zipCodes: string[];
  onChange: (zipCodes: string[]) => void;
}) {
  const [newZip, setNewZip] = useState('');

  const addZip = () => {
    const zip = newZip.trim();
    if (zip && /^\d{5}$/.test(zip) && !zipCodes.includes(zip)) {
      onChange([...zipCodes, zip]);
      setNewZip('');
    } else if (zipCodes.includes(zip)) {
      toast.error('ZIP code already added');
    } else {
      toast.error('Please enter a valid 5-digit ZIP code');
    }
  };

  const removeZip = (zip: string) => {
    onChange(zipCodes.filter((z) => z !== zip));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter ZIP code"
          value={newZip}
          onChange={(e) => setNewZip(e.target.value)}
          maxLength={5}
          className="w-32"
          onKeyDown={(e) => e.key === 'Enter' && addZip()}
        />
        <Button variant="outline" onClick={addZip}>
          <Icon name="plus" size="sm" className="mr-1" />
          Add
        </Button>
      </div>

      {zipCodes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {zipCodes.map((zip) => (
            <Badge
              key={zip}
              variant="secondary"
              className="text-sm px-3 py-1.5"
            >
              {zip}
              <button
                onClick={() => removeZip(zip)}
                className="ml-2 hover:text-destructive"
              >
                <Icon name="x" size="xs" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No service areas defined. All ZIP codes will be accepted.
        </p>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function BookingSettingsPage() {
  const { business } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Omit<AvailabilitySettings, 'business_id'>>(DEFAULT_SETTINGS);

  // Load settings
  useEffect(() => {
    if (!business?.id) return;

    const loadSettings = async () => {
      setLoading(true);
      try {
        const { data } = await (supabase as any)
          .from('availability_settings')
          .select('*')
          .eq('business_id', business.id)
          .single();

        if (data) {
          setSettings({
            min_advance_hours: data.min_advance_hours || DEFAULT_SETTINGS.min_advance_hours,
            max_advance_days: data.max_advance_days || DEFAULT_SETTINGS.max_advance_days,
            buffer_between_bookings: data.buffer_between_bookings || DEFAULT_SETTINGS.buffer_between_bookings,
            slot_duration_minutes: data.slot_duration_minutes || DEFAULT_SETTINGS.slot_duration_minutes,
            slots_per_day_limit: data.slots_per_day_limit,
            service_zip_codes: data.service_zip_codes || [],
            service_radius_miles: data.service_radius_miles,
            business_hours: data.business_hours || DEFAULT_BUSINESS_HOURS,
          });
        }
      } catch (err) {
        // Table might not exist yet
        console.log('Settings not found, using defaults');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [business?.id]);

  // Save settings
  const handleSave = async () => {
    if (!business?.id) return;

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('availability_settings')
        .upsert({
          business_id: business.id,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Settings saved');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Booking Settings">
        <div className="flex items-center justify-center min-h-96">
          <Icon name="loader" size="xl" className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Booking Settings">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/20">
              <Icon name="settings" size="lg" className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Booking Settings</h1>
              <p className="text-sm text-muted-foreground">
                Configure availability, scheduling rules & service areas
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Icon name="loader" size="sm" className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon name="save" size="sm" className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="hours" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="hours">Hours</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="service-area">Service Area</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Business Hours */}
          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="clock" size="md" className="text-primary" />
                  Business Hours
                </CardTitle>
                <CardDescription>
                  Set your regular cleaning availability for each day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusinessHoursEditor
                  hours={settings.business_hours}
                  onChange={(hours) =>
                    setSettings({ ...settings, business_hours: hours })
                  }
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSettings({
                    ...settings,
                    business_hours: settings.business_hours.map((h) => ({
                      ...h,
                      is_open: h.day_of_week >= 1 && h.day_of_week <= 5,
                    })),
                  })
                }
              >
                Mon-Fri Only
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSettings({
                    ...settings,
                    business_hours: settings.business_hours.map((h) => ({
                      ...h,
                      is_open: h.day_of_week >= 1 && h.day_of_week <= 6,
                    })),
                  })
                }
              >
                Mon-Sat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSettings({
                    ...settings,
                    business_hours: settings.business_hours.map((h) => ({
                      ...h,
                      is_open: true,
                    })),
                  })
                }
              >
                All Days
              </Button>
            </div>
          </TabsContent>

          {/* Scheduling Rules */}
          <TabsContent value="scheduling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="calendar" size="md" className="text-primary" />
                  Scheduling Rules
                </CardTitle>
                <CardDescription>
                  Control how far in advance customers can book
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Advance Booking */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Minimum Advance Notice</Label>
                    <Select
                      value={String(settings.min_advance_hours)}
                      onValueChange={(v) =>
                        setSettings({ ...settings, min_advance_hours: Number(v) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">24 hours (1 day)</SelectItem>
                        <SelectItem value="48">48 hours (2 days)</SelectItem>
                        <SelectItem value="72">72 hours (3 days)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How much notice you need before a cleaning
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Maximum Advance Booking</Label>
                    <Select
                      value={String(settings.max_advance_days)}
                      onValueChange={(v) =>
                        setSettings({ ...settings, max_advance_days: Number(v) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="14">2 weeks</SelectItem>
                        <SelectItem value="30">1 month</SelectItem>
                        <SelectItem value="60">2 months</SelectItem>
                        <SelectItem value="90">3 months</SelectItem>
                        <SelectItem value="180">6 months</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How far ahead customers can schedule
                    </p>
                  </div>
                </div>

                {/* Buffer Time */}
                <div className="space-y-3">
                  <Label>Buffer Time Between Cleanings</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.buffer_between_bookings]}
                      onValueChange={([v]) =>
                        setSettings({ ...settings, buffer_between_bookings: v })
                      }
                      min={0}
                      max={120}
                      step={15}
                      className="flex-1"
                    />
                    <Badge variant="secondary" className="min-w-[80px] justify-center">
                      {settings.buffer_between_bookings} min
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Travel/prep time between cleaning jobs
                  </p>
                </div>

                {/* Time Slots */}
                <div className="space-y-2">
                  <Label>Time Slot Duration</Label>
                  <Select
                    value={String(settings.slot_duration_minutes)}
                    onValueChange={(v) =>
                      setSettings({ ...settings, slot_duration_minutes: Number(v) })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Available start times increment (e.g., 9:00, 9:30, 10:00)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Area */}
          <TabsContent value="service-area" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="mapPin" size="md" className="text-primary" />
                  Service Area
                </CardTitle>
                <CardDescription>
                  Define which ZIP codes you serve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceAreaEditor
                  zipCodes={settings.service_zip_codes}
                  onChange={(zipCodes) =>
                    setSettings({ ...settings, service_zip_codes: zipCodes })
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="target" size="md" className="text-primary" />
                  Service Radius
                </CardTitle>
                <CardDescription>
                  Optional: Set a maximum travel distance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={settings.service_radius_miles !== undefined}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        service_radius_miles: checked ? 25 : undefined,
                      })
                    }
                  />
                  <Label>Enable radius limit</Label>
                </div>

                {settings.service_radius_miles !== undefined && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[settings.service_radius_miles]}
                        onValueChange={([v]) =>
                          setSettings({ ...settings, service_radius_miles: v })
                        }
                        min={5}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <Badge variant="secondary" className="min-w-[80px] justify-center">
                        {settings.service_radius_miles} miles
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum distance from your business location
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="gauge" size="md" className="text-primary" />
                  Capacity Limits
                </CardTitle>
                <CardDescription>
                  Control how many bookings you accept per day
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={settings.slots_per_day_limit !== undefined}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        slots_per_day_limit: checked ? 8 : undefined,
                      })
                    }
                  />
                  <Label>Limit bookings per day</Label>
                </div>

                {settings.slots_per_day_limit !== undefined && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[settings.slots_per_day_limit]}
                        onValueChange={([v]) =>
                          setSettings({ ...settings, slots_per_day_limit: v })
                        }
                        min={1}
                        max={20}
                        step={1}
                        className="flex-1"
                      />
                      <Badge variant="secondary" className="min-w-[100px] justify-center">
                        {settings.slots_per_day_limit} bookings
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum cleaning jobs per day (across all staff)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="bell" size="md" className="text-primary" />
                  Booking Notifications
                </CardTitle>
                <CardDescription>
                  How you want to be notified of new bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email for new bookings
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get text alerts for urgent bookings
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Summary</p>
                    <p className="text-sm text-muted-foreground">
                      Morning digest of the day's schedule
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
