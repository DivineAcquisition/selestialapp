"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '@/providers';
import { supabase } from '@/integrations/supabase/client';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

export interface CalendarEvent {
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
  bookingId?: string;
}

export interface GoogleCalendarConnection {
  isConnected: boolean;
  accountEmail?: string;
  accountName?: string;
  lastSyncedAt?: string;
}

export interface UseCalendarOptions {
  initialDate?: Date;
  view?: 'day' | 'week' | 'month';
}

export interface UseCalendarReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  googleConnection: GoogleCalendarConnection;
  fetchEvents: (startDate: Date, endDate: Date) => Promise<void>;
  syncGoogleCalendar: () => Promise<void>;
  createEvent: (event: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  refreshEvents: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useCalendar(options: UseCalendarOptions = {}): UseCalendarReturn {
  const { business } = useBusiness();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleConnection, setGoogleConnection] = useState<GoogleCalendarConnection>({
    isConnected: false,
  });
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const initialDate = options.initialDate || new Date();
    const view = options.view || 'week';
    
    switch (view) {
      case 'day':
        return { start: initialDate, end: addDays(initialDate, 1) };
      case 'week':
        return { start: startOfWeek(initialDate), end: endOfWeek(initialDate) };
      case 'month':
        return { start: startOfMonth(initialDate), end: endOfMonth(initialDate) };
    }
  });

  // Check Google Calendar connection status
  const checkGoogleConnection = useCallback(async () => {
    if (!business?.id) return;

    try {
      // Cast to any since this table may not be in types yet
      const { data: connection } = await (supabase as any)
        .from('integration_connections')
        .select('account_email, account_name, connected_at, last_sync_at')
        .eq('business_id', business.id)
        .eq('integration_type', 'google_calendar')
        .eq('is_active', true)
        .single();

      if (connection) {
        setGoogleConnection({
          isConnected: true,
          accountEmail: connection.account_email || undefined,
          accountName: connection.account_name || undefined,
          lastSyncedAt: connection.last_sync_at || undefined,
        });
      } else {
        setGoogleConnection({ isConnected: false });
      }
    } catch {
      setGoogleConnection({ isConnected: false });
    }
  }, [business?.id]);

  // Fetch bookings from database
  const fetchBookings = useCallback(async (startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
    if (!business?.id) return [];

    try {
      // Cast to any since some tables may not be in generated types
      const { data: bookings, error } = await (supabase as any)
        .from('cleaning_bookings')
        .select('*')
        .eq('business_id', business.id)
        .gte('scheduled_date', startDate.toISOString().split('T')[0])
        .lte('scheduled_date', endDate.toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time_start', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }

      return (bookings || []).map((booking: any) => {
        const [hours, minutes] = (booking.scheduled_time_start || '09:00').split(':');
        const start = new Date(booking.scheduled_date);
        start.setHours(parseInt(hours), parseInt(minutes));
        
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + (booking.estimated_duration_minutes || 120));

        return {
          id: booking.id,
          title: `${booking.service_name} - ${booking.customer_name}`,
          description: booking.special_requests || undefined,
          start,
          end,
          type: 'booking' as const,
          status: booking.status,
          customer: {
            name: booking.customer_name,
            phone: booking.customer_phone,
            email: booking.customer_email || undefined,
          },
          location: [
            booking.address_line1,
            booking.city,
            booking.state,
            booking.zip_code,
          ].filter(Boolean).join(', '),
          bookingId: booking.id,
        };
      });
    } catch (err) {
      console.error('Error fetching bookings:', err);
      return [];
    }
  }, [business?.id]);

  // Fetch Google Calendar events
  const fetchGoogleEvents = useCallback(async (startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
    if (!googleConnection.isConnected) return [];

    try {
      const response = await fetch(
        `/api/integrations/google-calendar/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return (data.events || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: new Date(event.start),
        end: new Date(event.end),
        type: 'google' as const,
        location: event.location,
        googleEventId: event.googleEventId,
      }));
    } catch {
      return [];
    }
  }, [googleConnection.isConnected]);

  // Fetch blocked time slots
  const fetchBlockedSlots = useCallback(async (startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
    if (!business?.id) return [];

    try {
      const { data: blocked, error } = await (supabase as any)
        .from('calendar_blocked_times')
        .select('*')
        .eq('business_id', business.id)
        .gte('start_time', startDate.toISOString())
        .lte('end_time', endDate.toISOString());

      if (error) return [];

      return (blocked || []).map((slot: any) => ({
        id: slot.id,
        title: slot.title || 'Blocked Time',
        description: slot.reason,
        start: new Date(slot.start_time),
        end: new Date(slot.end_time),
        type: 'blocked' as const,
      }));
    } catch {
      return [];
    }
  }, [business?.id]);

  // Main fetch function
  const fetchEvents = useCallback(async (startDate: Date, endDate: Date) => {
    setLoading(true);
    setError(null);

    try {
      const [bookings, googleEvents, blockedSlots] = await Promise.all([
        fetchBookings(startDate, endDate),
        fetchGoogleEvents(startDate, endDate),
        fetchBlockedSlots(startDate, endDate),
      ]);

      const allEvents = [...bookings, ...googleEvents, ...blockedSlots];
      allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
      
      setEvents(allEvents);
      setDateRange({ start: startDate, end: endDate });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [fetchBookings, fetchGoogleEvents, fetchBlockedSlots]);

  // Sync Google Calendar
  const syncGoogleCalendar = useCallback(async () => {
    if (!googleConnection.isConnected) return;

    try {
      await fetchGoogleEvents(dateRange.start, dateRange.end);
      
      // Update last sync time
      if (business?.id) {
        await (supabase as any)
          .from('integration_connections')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('business_id', business.id)
          .eq('integration_type', 'google_calendar');
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }
  }, [googleConnection.isConnected, dateRange, fetchGoogleEvents, business?.id]);

  // Create event
  const createEvent = useCallback(async (event: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
    if (!business?.id || !event.title || !event.start || !event.end) return null;

    try {
      if (event.type === 'blocked') {
        const { data, error } = await (supabase as any)
          .from('calendar_blocked_times')
          .insert({
            business_id: business.id,
            title: event.title,
            reason: event.description,
            start_time: event.start.toISOString(),
            end_time: event.end.toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        const newEvent: CalendarEvent = {
          id: data.id,
          title: data.title,
          description: data.reason,
          start: new Date(data.start_time),
          end: new Date(data.end_time),
          type: 'blocked',
        };

        setEvents(prev => [...prev, newEvent].sort((a, b) => a.start.getTime() - b.start.getTime()));
        return newEvent;
      }

      // For Google Calendar events
      if (event.type === 'google' && googleConnection.isConnected) {
        const response = await fetch('/api/integrations/google-calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: event.title,
            description: event.description,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
            location: event.location,
          }),
        });

        if (!response.ok) throw new Error('Failed to create event');

        const { event: createdEvent } = await response.json();
        const newEvent: CalendarEvent = {
          id: createdEvent.id,
          title: createdEvent.title,
          start: new Date(createdEvent.start),
          end: new Date(createdEvent.end),
          type: 'google',
          location: createdEvent.location,
          googleEventId: createdEvent.googleEventId,
        };

        setEvents(prev => [...prev, newEvent].sort((a, b) => a.start.getTime() - b.start.getTime()));
        return newEvent;
      }

      return null;
    } catch (err) {
      console.error('Create event error:', err);
      return null;
    }
  }, [business?.id, googleConnection.isConnected]);

  // Update event
  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>): Promise<boolean> => {
    try {
      // Find the event to determine its type
      const event = events.find(e => e.id === id);
      if (!event) return false;

      if (event.type === 'blocked' && business?.id) {
        const { error } = await (supabase as any)
          .from('calendar_blocked_times')
          .update({
            title: updates.title,
            reason: updates.description,
            start_time: updates.start?.toISOString(),
            end_time: updates.end?.toISOString(),
          })
          .eq('id', id);

        if (error) throw error;

        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
        return true;
      }

      return false;
    } catch (err) {
      console.error('Update event error:', err);
      return false;
    }
  }, [events, business?.id]);

  // Delete event
  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const event = events.find(e => e.id === id);
      if (!event) return false;

      if (event.type === 'blocked' && business?.id) {
        const { error } = await (supabase as any)
          .from('calendar_blocked_times')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setEvents(prev => prev.filter(e => e.id !== id));
        return true;
      }

      return false;
    } catch (err) {
      console.error('Delete event error:', err);
      return false;
    }
  }, [events, business?.id]);

  // Refresh current view
  const refreshEvents = useCallback(async () => {
    await fetchEvents(dateRange.start, dateRange.end);
  }, [fetchEvents, dateRange]);

  // Initial fetch
  useEffect(() => {
    checkGoogleConnection();
  }, [checkGoogleConnection]);

  useEffect(() => {
    if (business?.id) {
      fetchEvents(dateRange.start, dateRange.end);
    }
  }, [business?.id, fetchEvents, dateRange.start, dateRange.end]);

  return {
    events,
    loading,
    error,
    googleConnection,
    fetchEvents,
    syncGoogleCalendar,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  };
}
