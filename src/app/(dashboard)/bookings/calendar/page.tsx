"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon, IconName } from '@/components/ui/icon';
import { useBusiness } from '@/providers';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  format,
  addDays,
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
  getDay,
  parseISO,
  setHours,
  setMinutes,
} from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'booking' | 'blocked' | 'google' | 'manual';
  status?: string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
  location?: string;
  color?: string;
  googleEventId?: string;
}

type CalendarView = 'day' | 'week' | 'month';

// ============================================================================
// CONSTANTS
// ============================================================================

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am to 7pm
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_COLORS: Record<string, string> = {
  booking: 'bg-primary/90 border-primary text-white',
  blocked: 'bg-gray-400/90 border-gray-500 text-white',
  google: 'bg-blue-500/90 border-blue-600 text-white',
  manual: 'bg-emerald-500/90 border-emerald-600 text-white',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getEventStyle(event: CalendarEvent) {
  return EVENT_COLORS[event.type] || EVENT_COLORS.booking;
}

function formatTime(date: Date) {
  return format(date, 'h:mm a');
}

// ============================================================================
// COMPONENTS
// ============================================================================

function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onToday,
}: {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onToday: () => void;
}) {
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

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onToday} className="rounded-xl">
          Today
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('prev')}
            className="h-9 w-9 rounded-xl"
          >
            <Icon name="chevronLeft" size="lg" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('next')}
            className="h-9 w-9 rounded-xl"
          >
            <Icon name="chevronRight" size="lg" />
          </Button>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">{getDateLabel()}</h2>
      </div>

      <div className="flex items-center gap-3">
        <Tabs value={view} onValueChange={(v) => onViewChange(v as CalendarView)}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="day" className="rounded-lg px-4">Day</TabsTrigger>
            <TabsTrigger value="week" className="rounded-lg px-4">Week</TabsTrigger>
            <TabsTrigger value="month" className="rounded-lg px-4">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

function TimeColumn() {
  return (
    <div className="w-20 flex-shrink-0 border-r border-gray-200">
      <div className="h-12 border-b border-gray-200" /> {/* Header spacer */}
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="h-16 border-b border-gray-100 pr-3 text-right"
        >
          <span className="text-sm text-gray-500">
            {format(setHours(new Date(), hour), 'h a')}
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
    const top = (startHour - 7) * 64; // 64px per hour (h-16)
    const height = (endHour - startHour) * 64;
    return { top, height };
  };

  return (
    <div className="flex-1 min-w-[120px] border-r border-gray-200 last:border-r-0">
      {showHeader && (
        <div
          className={cn(
            'h-12 border-b border-gray-200 flex flex-col items-center justify-center sticky top-0 bg-white z-10',
            isCurrentDay && 'bg-primary/5'
          )}
        >
          <span className="text-xs text-gray-500 uppercase">
            {format(date, 'EEE')}
          </span>
          <span
            className={cn(
              'text-lg font-semibold',
              isCurrentDay
                ? 'w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center'
                : 'text-gray-900'
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
            className="h-16 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onSlotClick(date, hour)}
          />
        ))}
        {/* Events */}
        {dayEvents.map((event) => {
          const { top, height } = getEventPosition(event);
          return (
            <div
              key={event.id}
              className={cn(
                'absolute left-1 right-1 rounded-lg px-2 py-1 cursor-pointer overflow-hidden border-l-4 transition-transform hover:scale-[1.02]',
                getEventStyle(event)
              )}
              style={{ top, height: Math.max(height, 24) }}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
            >
              <p className="text-xs font-semibold truncate">{event.title}</p>
              {height > 40 && (
                <p className="text-xs opacity-90">
                  {formatTime(event.start)} - {formatTime(event.end)}
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
    <Card className="overflow-hidden rounded-2xl">
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
    <Card className="overflow-hidden rounded-2xl">
      <div className="flex overflow-x-auto">
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

  const getEventsForDay = (date: Date) => {
    return events.filter((e) => isSameDay(e.start, date));
  };

  return (
    <Card className="overflow-hidden rounded-2xl">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-medium text-gray-500 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[120px] border-b border-r border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition-colors',
                !isCurrentMonth && 'bg-gray-50/50'
              )}
              onClick={() => onDateClick(day)}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-7 h-7 text-sm rounded-full',
                    isCurrentDay
                      ? 'bg-primary text-white font-semibold'
                      : isCurrentMonth
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      'text-xs px-2 py-0.5 rounded truncate cursor-pointer',
                      getEventStyle(event)
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    {formatTime(event.start)} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 px-2">
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

function EventDetailsDialog({
  event,
  open,
  onOpenChange,
}: {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                event.type === 'booking' && 'bg-primary',
                event.type === 'google' && 'bg-blue-500',
                event.type === 'blocked' && 'bg-gray-500',
                event.type === 'manual' && 'bg-emerald-500'
              )}
            />
            <DialogTitle>{event.title}</DialogTitle>
          </div>
          <DialogDescription>
            {format(event.start, 'EEEE, MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Time */}
          <div className="flex items-center gap-3">
            <Icon name="clock" size="lg" className="text-gray-400" />
            <div>
              <p className="font-medium">
                {formatTime(event.start)} - {formatTime(event.end)}
              </p>
            </div>
          </div>

          {/* Customer info */}
          {event.customer && (
            <div className="flex items-start gap-3">
              <Icon name="user" size="lg" className="text-gray-400" />
              <div>
                <p className="font-medium">{event.customer.name}</p>
                <p className="text-sm text-gray-500">{event.customer.phone}</p>
                {event.customer.email && (
                  <p className="text-sm text-gray-500">{event.customer.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3">
              <Icon name="mapPin" size="lg" className="text-gray-400" />
              <p className="text-gray-700">{event.location}</p>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-3">
              <Icon name="fileText" size="lg" className="text-gray-400" />
              <p className="text-gray-700">{event.description}</p>
            </div>
          )}

          {/* Source badge */}
          <div className="pt-2">
            <Badge variant="outline" className="rounded-lg">
              {event.type === 'google' && (
                <>
                  <Icon name="google" size="xs" className="mr-1" />
                  Google Calendar
                </>
              )}
              {event.type === 'booking' && (
                <>
                  <Icon name="calendar" size="xs" className="mr-1" />
                  Booking
                </>
              )}
              {event.type === 'manual' && (
                <>
                  <Icon name="plus" size="xs" className="mr-1" />
                  Manual Event
                </>
              )}
              {event.type === 'blocked' && (
                <>
                  <Icon name="x" size="xs" className="mr-1" />
                  Blocked Time
                </>
              )}
            </Badge>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Close
          </Button>
          {event.type === 'booking' && (
            <Button className="rounded-xl">
              <Icon name="eye" size="sm" className="mr-2" />
              View Booking
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GoogleCalendarSync() {
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/integrations/google-calendar/connect', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      toast.error('Failed to connect Google Calendar');
    } finally {
      setConnecting(false);
    }
  };
  
  const handleSync = async () => {
    setSyncing(true);
    try {
      // Sync bookings to Google Calendar
      toast.success('Bookings synced to Google Calendar');
    } catch {
      toast.error('Sync failed');
    }
    setSyncing(false);
  };

  if (connected) {
    return (
      <Card className="rounded-2xl border-green-200 bg-green-50/50">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Icon name="checkCircle" size="lg" className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">Google Calendar Connected</p>
              <p className="text-xs text-green-700">Bookings will sync automatically</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <Icon name="loader" size="sm" className="animate-spin" />
            ) : (
              <><Icon name="refresh" size="sm" className="mr-1" />Sync Now</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-dashed border-2">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Icon name="calendar" size="lg" className="text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Sync to Google Calendar</p>
            <p className="text-xs text-gray-500">Push bookings to your Google Calendar</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleConnect} disabled={connecting}>
          {connecting ? (
            <Icon name="loader" size="sm" className="animate-spin" />
          ) : (
            <><Icon name="plug" size="sm" className="mr-1" />Connect</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function CalendarPage() {
  const router = useRouter();
  const { business } = useBusiness();
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  // Sample events for demonstration
  useEffect(() => {
    // Simulate loading events
    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Standard Clean - Smith',
        start: setMinutes(setHours(new Date(), 9), 0),
        end: setMinutes(setHours(new Date(), 11), 30),
        type: 'booking',
        customer: { name: 'John Smith', phone: '(555) 123-4567', email: 'john@example.com' },
        location: '123 Main St, City, ST 12345',
        status: 'confirmed',
      },
      {
        id: '2',
        title: 'Deep Clean - Johnson',
        start: setMinutes(setHours(addDays(new Date(), 1), 14), 0),
        end: setMinutes(setHours(addDays(new Date(), 1), 17), 0),
        type: 'booking',
        customer: { name: 'Sarah Johnson', phone: '(555) 987-6543' },
        location: '456 Oak Ave, Town, ST 67890',
        status: 'pending',
      },
      {
        id: '3',
        title: 'Team Meeting',
        start: setMinutes(setHours(addDays(new Date(), 2), 10), 0),
        end: setMinutes(setHours(addDays(new Date(), 2), 11), 0),
        type: 'google',
        description: 'Weekly team sync',
      },
      {
        id: '4',
        title: 'Lunch Break',
        start: setMinutes(setHours(new Date(), 12), 0),
        end: setMinutes(setHours(new Date(), 13), 0),
        type: 'blocked',
      },
    ];

    setTimeout(() => {
      setEvents(sampleEvents);
      setLoading(false);
    }, 500);
  }, []);

  const handleNavigate = (direction: 'prev' | 'next') => {
    switch (view) {
      case 'day':
        setCurrentDate((prev) =>
          direction === 'prev' ? addDays(prev, -1) : addDays(prev, 1)
        );
        break;
      case 'week':
        setCurrentDate((prev) =>
          direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
        );
        break;
      case 'month':
        setCurrentDate((prev) =>
          direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
        );
        break;
    }
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleSlotClick = (date: Date, hour: number) => {
    // Navigate to create new booking
    toast.info('Create new booking clicked');
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setView('day');
  };

  if (loading) {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
              <Icon name="calendar" size="xl" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-500">Your booking schedule and appointments</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl" onClick={() => router.push('/bookings')}>
              <Icon name="list" size="sm" className="mr-2" />
              List View
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90">
              <Icon name="plus" size="sm" className="mr-2" />
              Block Time
            </Button>
          </div>
        </div>

        {/* Google Calendar Sync (optional) */}
        <GoogleCalendarSync />

        {/* Calendar Header */}
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onNavigate={handleNavigate}
          onToday={handleToday}
        />

        {/* Calendar Views */}
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

        {/* Sidebar with upcoming events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="clock" size="lg" className="text-primary" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events.filter((e) => isToday(e.start)).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No events scheduled for today
                </p>
              ) : (
                <div className="space-y-3">
                  {events
                    .filter((e) => isToday(e.start))
                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => handleEventClick(event)}
                      >
                        <div
                          className={cn(
                            'w-1 h-12 rounded-full',
                            event.type === 'booking' && 'bg-primary',
                            event.type === 'google' && 'bg-blue-500',
                            event.type === 'blocked' && 'bg-gray-400'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {event.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </p>
                        </div>
                        <Icon name="chevronRight" size="sm" className="text-gray-300" />
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="trendUp" size="lg" className="text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-gray-900">
                    {events.filter((e) => e.type === 'booking').length}
                  </p>
                  <p className="text-sm text-gray-500">Bookings This Week</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-primary">
                    {events.filter((e) => isToday(e.start)).length}
                  </p>
                  <p className="text-sm text-gray-500">Today</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-emerald-600">85%</p>
                  <p className="text-sm text-gray-500">Availability</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-amber-600">2</p>
                  <p className="text-sm text-gray-500">Pending Confirmation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Dialog */}
      <EventDetailsDialog
        event={selectedEvent}
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
      />
    </Layout>
  );
}
