import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// Type definitions for booking config
interface DayConfig {
  start: string | null;
  end: string | null;
  enabled: boolean;
}

interface OperatingHours {
  mon: DayConfig;
  tue: DayConfig;
  wed: DayConfig;
  thu: DayConfig;
  fri: DayConfig;
  sat: DayConfig;
  sun: DayConfig;
}

interface BookingConfig {
  operating_hours: OperatingHours;
  blocked_dates: string[];
  lead_time_hours: number;
  max_advance_days: number;
  slot_duration_minutes: number;
}

interface ExistingBooking {
  scheduled_time_start: string | null;
  scheduled_time_end: string | null;
  estimated_duration_minutes: number | null;
}

// Helper functions for date manipulation
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

function isBefore(date1: Date, date2: Date): boolean {
  return date1.getTime() < date2.getTime();
}

function isAfter(date1: Date, date2: Date): boolean {
  return date1.getTime() > date2.getTime();
}

// GET - Fetch available time slots
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    
    const dateParam = searchParams.get('date'); // YYYY-MM-DD
    const durationMinutes = parseInt(searchParams.get('duration') || '120');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter required' },
        { status: 400 }
      );
    }

    const requestedDate = parseDate(dateParam);

    // Fetch config
    const { data: configData } = await supabase
      .from('cleaning_booking_config')
      .select('operating_hours, blocked_dates, lead_time_hours, max_advance_days, slot_duration_minutes')
      .eq('business_id', businessId)
      .single();

    // Use defaults if no config
    const finalConfig: BookingConfig = (configData as unknown as BookingConfig) || {
      operating_hours: {
        mon: { start: '08:00', end: '17:00', enabled: true },
        tue: { start: '08:00', end: '17:00', enabled: true },
        wed: { start: '08:00', end: '17:00', enabled: true },
        thu: { start: '08:00', end: '17:00', enabled: true },
        fri: { start: '08:00', end: '17:00', enabled: true },
        sat: { start: '09:00', end: '14:00', enabled: true },
        sun: { start: null, end: null, enabled: false },
      },
      blocked_dates: [],
      lead_time_hours: 24,
      max_advance_days: 60,
      slot_duration_minutes: 30,
    };

    // Check if date is blocked
    if (finalConfig.blocked_dates?.includes(dateParam)) {
      return NextResponse.json({
        date: dateParam,
        available: false,
        reason: 'Date is unavailable',
        slots: [],
      });
    }

    // Check lead time
    const now = new Date();
    const minDate = addDays(now, Math.ceil(finalConfig.lead_time_hours / 24));
    minDate.setHours(0, 0, 0, 0);
    
    if (isBefore(requestedDate, minDate)) {
      return NextResponse.json({
        date: dateParam,
        available: false,
        reason: `Bookings require ${finalConfig.lead_time_hours} hours notice`,
        slots: [],
      });
    }

    // Check max advance
    const maxDate = addDays(now, finalConfig.max_advance_days);
    if (isAfter(requestedDate, maxDate)) {
      return NextResponse.json({
        date: dateParam,
        available: false,
        reason: `Cannot book more than ${finalConfig.max_advance_days} days in advance`,
        slots: [],
      });
    }

    // Get day of week
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayOfWeek = dayNames[requestedDate.getDay()] as 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    const dayConfig = finalConfig.operating_hours?.[dayOfWeek];

    if (!dayConfig?.enabled || !dayConfig.start || !dayConfig.end) {
      return NextResponse.json({
        date: dateParam,
        available: false,
        reason: 'Closed on this day',
        slots: [],
      });
    }

    // Generate time slots
    const slotDuration = finalConfig.slot_duration_minutes || 30;
    const slots: Array<{ time: string; available: boolean }> = [];

    const [startHour, startMin] = dayConfig.start.split(':').map(Number);
    const [endHour, endMin] = dayConfig.end.split(':').map(Number);

    let currentTime = new Date(requestedDate);
    currentTime.setHours(startHour, startMin, 0, 0);
    
    const endTime = new Date(requestedDate);
    endTime.setHours(endHour, endMin, 0, 0);

    // Fetch existing bookings for this date
    const { data: existingBookingsData } = await supabase
      .from('cleaning_bookings')
      .select('scheduled_time_start, scheduled_time_end, estimated_duration_minutes')
      .eq('business_id', businessId)
      .eq('scheduled_date', dateParam)
      .in('status', ['pending', 'confirmed']);

    const existingBookings = (existingBookingsData || []) as ExistingBooking[];

    while (isBefore(currentTime, endTime)) {
      const timeString = formatTime(currentTime);
      
      // Check if slot conflicts with existing booking
      const isBooked = existingBookings.some((booking) => {
        const bookingStart = booking.scheduled_time_start?.slice(0, 5);
        const bookingDuration = booking.estimated_duration_minutes || 120;
        
        if (!bookingStart) return false;
        
        // Calculate booking end time
        const [bStartH, bStartM] = bookingStart.split(':').map(Number);
        const bookingEndMinutes = bStartH * 60 + bStartM + bookingDuration;
        const bookingEnd = `${Math.floor(bookingEndMinutes / 60).toString().padStart(2, '0')}:${(bookingEndMinutes % 60).toString().padStart(2, '0')}`;
        
        // Check overlap
        const slotStart = timeString;
        const slotMinutes = parseInt(timeString.split(':')[0]) * 60 + parseInt(timeString.split(':')[1]);
        const slotEndMinutes = slotMinutes + durationMinutes;
        const slotEnd = `${Math.floor(slotEndMinutes / 60).toString().padStart(2, '0')}:${(slotEndMinutes % 60).toString().padStart(2, '0')}`;
        
        // Overlap check: slot starts before booking ends AND slot ends after booking starts
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });

      // Check if there's enough time for the service
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);
      const fitsInDay = isBefore(slotEnd, endTime) || slotEnd.getTime() === endTime.getTime();

      // Check if slot is in the past (for today)
      const isInPast = isBefore(currentTime, now);

      slots.push({
        time: timeString,
        available: !isBooked && fitsInDay && !isInPast,
      });

      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    return NextResponse.json({
      date: dateParam,
      available: true,
      dayOfWeek,
      operatingHours: {
        start: dayConfig.start,
        end: dayConfig.end,
      },
      slots,
    });
  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
