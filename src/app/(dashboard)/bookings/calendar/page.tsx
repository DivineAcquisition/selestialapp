"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: Using 'any' for some type casts until database types are regenerated

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { useBookings, useStaff } from '@/hooks/useBookings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  parseISO,
  setHours,
} from 'date-fns';
import type { 
  Booking, 
  BookingStatus, 
  CalendarEvent,
  CreateBookingForm,
  CleaningServiceType,
  CleaningFrequency,
} from '@/types/booking';
import { SERVICE_TYPE_LABELS, FREQUENCY_LABELS, STATUS_CONFIG } from '@/types/booking';

// ============================================================================
// TYPES
// ============================================================================

type CalendarView = 'day' | 'week' | 'month';

// ============================================================================
// CONSTANTS
// ============================================================================

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am to 7pm
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatTime(date: Date) {
  return format(date, 'h:mm a');
}

function getStatusColor(status: BookingStatus) {
  return STATUS_CONFIG[status]?.bgColor || 'bg-gray-100';
}

// ============================================================================
// BOOKING MODAL
// ============================================================================

function BookingModal({
  open,
  onClose,
  booking,
  selectedDate,
  selectedTime,
  onSave,
  onStatusChange,
}: {
  open: boolean;
  onClose: () => void;
  booking?: Booking | null;
  selectedDate?: Date;
  selectedTime?: string;
  onSave: (data: CreateBookingForm) => Promise<boolean>;
  onStatusChange: (id: string, status: BookingStatus) => Promise<boolean>;
}) {
  const { staff } = useStaff();
  const [saving, setSaving] = useState(false);
  
  // Compute initial form based on whether we're editing or creating
  const initialForm = useMemo((): CreateBookingForm => {
    if (booking) {
      return {
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        customer_phone: booking.customer_phone,
        service_type: booking.service_type as CleaningServiceType,
        frequency: ((booking as unknown as Record<string, unknown>).frequency_name as CleaningFrequency) || 'one_time',
        address_line1: booking.address_line1,
        city: booking.city,
        state: booking.state,
        zip_code: booking.zip_code,
        bedrooms: booking.bedrooms,
        bathrooms: booking.bathrooms,
        property_type: 'house',
        has_pets: booking.has_pets,
        scheduled_date: booking.scheduled_date,
        scheduled_time_start: booking.scheduled_time_start,
        addon_ids: [],
      };
    }
    return {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      service_type: 'standard',
      frequency: 'one_time',
      address_line1: '',
      city: '',
      state: '',
      zip_code: '',
      bedrooms: 3,
      bathrooms: 2,
      property_type: 'house',
      has_pets: false,
      scheduled_date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
      scheduled_time_start: selectedTime || '09:00',
      addon_ids: [],
    };
  }, [booking, selectedDate, selectedTime]);
  
  const [form, setForm] = useState<CreateBookingForm>(initialForm);
  
  // Reset form when initial values change (modal opens/closes or booking changes)
  const formKey = `${open}-${booking?.id || 'new'}-${selectedDate?.toISOString()}-${selectedTime}`;
  useMemo(() => {
    if (open) {
      setForm(initialForm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey]);

  const handleSubmit = async () => {
    if (!form.customer_name || !form.customer_phone || !form.address_line1) {
      toast.error('Please fill in required fields');
      return;
    }
    
    setSaving(true);
    const success = await onSave(form);
    setSaving(false);
    
    if (success) {
      toast.success(booking ? 'Booking updated' : 'Booking created');
      onClose();
    } else {
      toast.error('Failed to save booking');
    }
  };

  const handleStatusChange = async (status: BookingStatus) => {
    if (!booking) return;
    const success = await onStatusChange(booking.id, status);
    if (success) {
      toast.success(`Booking ${status}`);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="calendar" size="lg" className="text-primary" />
            {booking ? `Booking #${booking.booking_number}` : 'New Booking'}
          </DialogTitle>
          {booking && (
            <Badge className={cn('w-fit', getStatusColor(booking.status))}>
              {STATUS_CONFIG[booking.status]?.label}
            </Badge>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Info */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Icon name="user" size="sm" className="text-muted-foreground" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  placeholder="John Smith"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  placeholder="john@email.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Service */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Icon name="sparkles" size="sm" className="text-muted-foreground" />
              Service Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Service Type *</Label>
                <Select
                  value={form.service_type}
                  onValueChange={(v) => setForm({ ...form, service_type: v as CleaningServiceType })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select
                  value={form.frequency}
                  onValueChange={(v) => setForm({ ...form, frequency: v as CleaningFrequency })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Property */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Icon name="home" size="sm" className="text-muted-foreground" />
              Property Details
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Address *</Label>
                <Input
                  value={form.address_line1}
                  onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                  placeholder="123 Main St"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="TX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>ZIP *</Label>
                  <Input
                    value={form.zip_code}
                    onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Bedrooms</Label>
                  <Select
                    value={String(form.bedrooms)}
                    onValueChange={(v) => setForm({ ...form, bedrooms: Number(v) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} BR</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <Select
                    value={String(form.bathrooms)}
                    onValueChange={(v) => setForm({ ...form, bathrooms: Number(v) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,1.5,2,2.5,3,3.5,4,4.5,5].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} BA</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 pb-2">
                    <Checkbox
                      checked={form.has_pets}
                      onCheckedChange={(c) => setForm({ ...form, has_pets: !!c })}
                    />
                    <span className="text-sm">Has Pets</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Icon name="clock" size="sm" className="text-muted-foreground" />
              Schedule
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Time *</Label>
                <Select
                  value={form.scheduled_time_start}
                  onValueChange={(v) => setForm({ ...form, scheduled_time_start: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                      <SelectItem key={t} value={t}>
                        {format(parseISO(`2000-01-01T${t}`), 'h:mm a')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Staff Assignment */}
          {staff.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Icon name="users" size="sm" className="text-muted-foreground" />
                Assign Staff
              </h3>
              <div className="flex flex-wrap gap-2">
                {staff.map(s => (
                  <label
                    key={s.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                      form.assigned_staff_ids?.includes(s.id)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted'
                    )}
                  >
                    <Checkbox
                      checked={form.assigned_staff_ids?.includes(s.id)}
                      onCheckedChange={(c) => {
                        const ids = form.assigned_staff_ids || [];
                        setForm({
                          ...form,
                          assigned_staff_ids: c
                            ? [...ids, s.id]
                            : ids.filter(id => id !== s.id)
                        });
                      }}
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-sm">{s.first_name} {s.last_name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Icon name="fileText" size="sm" className="text-muted-foreground" />
              Notes
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Access Instructions</Label>
                <Textarea
                  value={form.access_instructions || ''}
                  onChange={(e) => setForm({ ...form, access_instructions: e.target.value })}
                  placeholder="Gate code, key location, etc."
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div>
                <Label>Special Requests</Label>
                <Textarea
                  value={form.special_requests || ''}
                  onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                  placeholder="Focus areas, allergies, etc."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {booking && (
            <div className="flex gap-2 mr-auto">
              {booking.status === 'pending' && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('confirmed')}
                  className="text-blue-600"
                >
                  <Icon name="check" size="sm" className="mr-1" />
                  Confirm
                </Button>
              )}
              {booking.status === 'confirmed' && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('in_progress')}
                  className="text-purple-600"
                >
                  <Icon name="play" size="sm" className="mr-1" />
                  Start
                </Button>
              )}
              {booking.status === 'in_progress' && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('completed')}
                  className="text-green-600"
                >
                  <Icon name="checkCircle" size="sm" className="mr-1" />
                  Complete
                </Button>
              )}
              {!['cancelled', 'completed'].includes(booking.status) && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('cancelled')}
                  className="text-red-600"
                >
                  <Icon name="x" size="sm" className="mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <><Icon name="loader" size="sm" className="mr-2 animate-spin" />Saving...</>
            ) : (
              <><Icon name="save" size="sm" className="mr-2" />{booking ? 'Update' : 'Create'} Booking</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// CALENDAR COMPONENTS
// ============================================================================

function TimeColumn() {
  return (
    <div className="w-16 flex-shrink-0 border-r">
      <div className="h-10 border-b" />
      {HOURS.map((hour) => (
        <div key={hour} className="h-14 border-b pr-2 text-right">
          <span className="text-xs text-muted-foreground">
            {format(setHours(new Date(), hour), 'ha')}
          </span>
        </div>
      ))}
    </div>
  );
}

function DayColumn({
  date,
  events,
  onEventClick,
  onSlotClick,
  showHeader = true,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date, hour: number) => void;
  showHeader?: boolean;
}) {
  const dayEvents = events.filter((e) => isSameDay(e.start, date));
  const isCurrentDay = isToday(date);

  const getEventPosition = (event: CalendarEvent) => {
    const startHour = event.start.getHours() + event.start.getMinutes() / 60;
    const endHour = event.end.getHours() + event.end.getMinutes() / 60;
    const top = (startHour - 7) * 56;
    const height = Math.max((endHour - startHour) * 56, 28);
    return { top, height };
  };

  return (
    <div className="flex-1 min-w-[100px] border-r last:border-r-0">
      {showHeader && (
        <div
          className={cn(
            'h-10 border-b flex flex-col items-center justify-center sticky top-0 bg-background z-10',
            isCurrentDay && 'bg-primary/5'
          )}
        >
          <span className="text-[10px] text-muted-foreground uppercase">
            {format(date, 'EEE')}
          </span>
          <span
            className={cn(
              'text-sm font-medium',
              isCurrentDay && 'w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs'
            )}
          >
            {format(date, 'd')}
          </span>
        </div>
      )}
      <div className="relative">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="h-14 border-b hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onSlotClick(date, hour)}
          />
        ))}
        {dayEvents.map((event) => {
          const { top, height } = getEventPosition(event);
          const statusColor = event.status ? STATUS_CONFIG[event.status] : null;
          return (
            <div
              key={event.id}
              className={cn(
                'absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 cursor-pointer overflow-hidden text-xs border-l-2 shadow-sm',
                statusColor?.bgColor || 'bg-primary/10',
                statusColor?.color || 'text-primary',
                'hover:shadow-md transition-shadow'
              )}
              style={{ 
                top, 
                height,
                borderLeftColor: event.booking?.status === 'confirmed' ? '#3b82f6' 
                  : event.booking?.status === 'in_progress' ? '#8b5cf6'
                  : event.booking?.status === 'completed' ? '#10b981'
                  : '#eab308'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
            >
              <p className="font-medium truncate text-[11px]">{event.title}</p>
              {height > 35 && (
                <p className="text-[10px] opacity-75 truncate">
                  {formatTime(event.start)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  currentDate,
  events,
  onEventClick,
  onSlotClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date, hour: number) => void;
}) {
  const weekStart = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <Card className="overflow-hidden">
      <div className="flex overflow-x-auto">
        <TimeColumn />
        {days.map((day) => (
          <DayColumn
            key={day.toISOString()}
            date={day}
            events={events}
            onEventClick={onEventClick}
            onSlotClick={onSlotClick}
          />
        ))}
      </div>
    </Card>
  );
}

function DayView({
  currentDate,
  events,
  onEventClick,
  onSlotClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date, hour: number) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <TimeColumn />
        <DayColumn
          date={currentDate}
          events={events}
          onEventClick={onEventClick}
          onSlotClick={onSlotClick}
          showHeader={false}
        />
      </div>
    </Card>
  );
}

function MonthView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(e.start, day));
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[100px] border-b border-r p-1 cursor-pointer hover:bg-muted/50 transition-colors',
                !isCurrentMonth && 'bg-muted/30'
              )}
              onClick={() => onDateClick(day)}
            >
              <div className="flex justify-between items-start">
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-6 h-6 text-xs rounded-full',
                    isCurrentDay ? 'bg-primary text-white font-semibold' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {dayEvents.length}
                  </Badge>
                )}
              </div>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => {
                  const statusColor = event.status ? STATUS_CONFIG[event.status] : null;
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        'text-[10px] px-1 py-0.5 rounded truncate',
                        statusColor?.bgColor || 'bg-primary/10',
                        statusColor?.color || 'text-primary'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      {format(event.start, 'h:mma')} {event.booking?.customer_name?.split(' ')[0] || event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function CalendarPage() {
  const router = useRouter();
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('09:00');

  // Date range for fetching
  const dateRange = useMemo(() => {
    switch (view) {
      case 'day':
        return { startDate: currentDate, endDate: currentDate };
      case 'week':
        return { startDate: startOfWeek(currentDate), endDate: endOfWeek(currentDate) };
      case 'month':
        return { startDate: startOfMonth(currentDate), endDate: endOfMonth(currentDate) };
    }
  }, [view, currentDate]);

  const { 
    bookings, 
    loading, 
    stats, 
    createBooking, 
    updateBooking,
    updateStatus,
    getCalendarEvents,
  } = useBookings(dateRange);

  const events = useMemo(() => 
    getCalendarEvents(dateRange.startDate, dateRange.endDate),
    [getCalendarEvents, dateRange]
  );

  const handleNavigate = (direction: 'prev' | 'next') => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
        break;
    }
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleEventClick = (event: CalendarEvent) => {
    if (event.booking) {
      setSelectedBooking(event.booking);
      setModalOpen(true);
    }
  };

  const handleSlotClick = (date: Date, hour: number) => {
    setSelectedDate(date);
    setSelectedTime(`${hour.toString().padStart(2, '0')}:00`);
    setSelectedBooking(null);
    setModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setView('day');
  };

  const handleSave = async (form: CreateBookingForm): Promise<boolean> => {
    if (selectedBooking) {
      return await updateBooking(selectedBooking.id, form as any);
    } else {
      const result = await createBooking(form);
      return !!result;
    }
  };

  const getDateLabel = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <Layout title="Calendar">
        <div className="flex items-center justify-center min-h-96">
          <Icon name="loader" size="xl" className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Calendar">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/20">
              <Icon name="calendar" size="lg" className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Calendar</h1>
              <p className="text-sm text-muted-foreground">Manage your cleaning schedule</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/bookings')}>
              <Icon name="list" size="sm" className="mr-1" />
              List View
            </Button>
            <Button 
              size="sm"
              onClick={() => {
                setSelectedBooking(null);
                setSelectedDate(new Date());
                setSelectedTime('09:00');
                setModalOpen(true);
              }}
            >
              <Icon name="plus" size="sm" className="mr-1" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Today', value: stats.todayCount, icon: 'calendar', color: 'bg-blue-100 text-blue-600' },
            { label: 'Pending', value: stats.pending, icon: 'clock', color: 'bg-yellow-100 text-yellow-600' },
            { label: 'Confirmed', value: stats.confirmed, icon: 'checkCircle', color: 'bg-green-100 text-green-600' },
            { label: 'This Week', value: `$${stats.weekRevenue.toLocaleString()}`, icon: 'dollarSign', color: 'bg-emerald-100 text-emerald-600' },
            { label: 'This Month', value: `$${stats.monthRevenue.toLocaleString()}`, icon: 'trendUp', color: 'bg-purple-100 text-purple-600' },
          ].map((stat) => (
            <Card key={stat.label} className="p-3">
              <div className="flex items-center gap-2">
                <div className={cn('p-1.5 rounded-lg', stat.color)}>
                  <Icon name={stat.icon as any} size="sm" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNavigate('prev')}>
                <Icon name="chevronLeft" size="sm" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNavigate('next')}>
                <Icon name="chevronRight" size="sm" />
              </Button>
            </div>
            <h2 className="text-lg font-semibold">{getDateLabel()}</h2>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)}>
            <TabsList className="h-8">
              <TabsTrigger value="day" className="text-xs px-3 h-7">Day</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3 h-7">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3 h-7">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Calendar View */}
        <div className="overflow-auto max-h-[calc(100vh-350px)]">
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(STATUS_CONFIG).slice(0, 4).map(([status, config]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded', config.bgColor)} />
              <span className="text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onSave={handleSave}
        onStatusChange={updateStatus}
      />
    </Layout>
  );
}
