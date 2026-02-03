"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: Using 'any' for Supabase calls because database types for new tables
// (cleaning_bookings, staff_members, etc.) need to be regenerated after migration

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBusiness } from '@/providers';
import { supabase } from '@/integrations/supabase/client';
import type { 
  Booking, 
  BookingStatus, 
  CreateBookingForm,
  Staff,
  CleaningService,
  CleaningAddon,
  CalendarEvent,
} from '@/types/booking';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  startOfMonth, 
  parseISO,
  format,
  addMinutes,
} from 'date-fns';

// ============================================================================
// HOOK OPTIONS
// ============================================================================

export interface UseBookingsOptions {
  startDate?: Date;
  endDate?: Date;
  status?: BookingStatus | 'all';
  staffId?: string;
}

export interface UseBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  createBooking: (data: CreateBookingForm) => Promise<Booking | null>;
  updateBooking: (id: string, data: Partial<Booking>) => Promise<boolean>;
  updateStatus: (id: string, status: BookingStatus, reason?: string) => Promise<boolean>;
  deleteBooking: (id: string) => Promise<boolean>;
  
  // Fetch operations
  fetchBookings: (options?: UseBookingsOptions) => Promise<void>;
  getBookingById: (id: string) => Promise<Booking | null>;
  
  // Calendar
  getCalendarEvents: (start: Date, end: Date) => CalendarEvent[];
  
  // Stats
  stats: BookingStats;
  
  refetch: () => Promise<void>;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  todayCount: number;
  weekRevenue: number;
  monthRevenue: number;
}

// ============================================================================
// GENERATE BOOKING NUMBER
// ============================================================================

function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}${random}`;
}

// ============================================================================
// CALCULATE PRICING
// ============================================================================

function calculatePricing(
  form: CreateBookingForm,
  services: CleaningService[],
  addons: CleaningAddon[]
): { basePrice: number; addonsTotal: number; subtotal: number; tax: number; total: number; duration: number } {
  const service = services.find(s => s.type === form.service_type);
  if (!service) {
    return { basePrice: 0, addonsTotal: 0, subtotal: 0, tax: 0, total: 0, duration: 120 };
  }
  
  // Calculate base price
  let basePrice = service.base_price;
  basePrice += service.price_per_bedroom * form.bedrooms;
  basePrice += service.price_per_bathroom * form.bathrooms;
  if (service.price_per_sqft && form.square_feet) {
    basePrice += service.price_per_sqft * form.square_feet;
  }
  basePrice = Math.max(basePrice, service.minimum_price);
  
  // Calculate duration
  let duration = service.base_duration_minutes;
  duration += service.duration_per_bedroom * form.bedrooms;
  duration += service.duration_per_bathroom * form.bathrooms;
  
  // Calculate addons
  let addonsTotal = 0;
  const selectedAddons = addons.filter(a => form.addon_ids?.includes(a.id));
  for (const addon of selectedAddons) {
    addonsTotal += addon.price;
    duration += addon.duration_minutes;
  }
  
  const subtotal = basePrice + addonsTotal;
  const tax = Math.round(subtotal * 0.0825); // 8.25% tax example
  const total = subtotal + tax;
  
  return { basePrice, addonsTotal, subtotal, tax, total, duration };
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useBookings(options: UseBookingsOptions = {}): UseBookingsReturn {
  const { business } = useBusiness();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Services and addons for pricing (to be loaded from DB in future)
  const [services] = useState<CleaningService[]>([]);
  const [addons] = useState<CleaningAddon[]>([]);

  // Fetch bookings
  const fetchBookings = useCallback(async (fetchOptions?: UseBookingsOptions) => {
    if (!business?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = (supabase as any)
        .from('cleaning_bookings')
        .select('*')
        .eq('business_id', business.id)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time_start', { ascending: true });
      
      const opts = fetchOptions || options;
      
      if (opts.startDate) {
        query = query.gte('scheduled_date', format(opts.startDate, 'yyyy-MM-dd'));
      }
      if (opts.endDate) {
        query = query.lte('scheduled_date', format(opts.endDate, 'yyyy-MM-dd'));
      }
      if (opts.status && opts.status !== 'all') {
        query = query.eq('status', opts.status);
      }
      if (opts.staffId) {
        query = query.contains('assigned_staff_ids', [opts.staffId]);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        // Table might not exist
        if (fetchError.code === '42P01') {
          setBookings([]);
        } else {
          throw fetchError;
        }
      } else {
        setBookings(data || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [business?.id, options]);

  // Create booking
  const createBooking = useCallback(async (form: CreateBookingForm): Promise<Booking | null> => {
    if (!business?.id) return null;
    
    try {
      const pricing = calculatePricing(form, services, addons);
      const bookingNumber = generateBookingNumber();
      
      const endTime = format(
        addMinutes(parseISO(`2000-01-01T${form.scheduled_time_start}`), pricing.duration),
        'HH:mm'
      );
      
      const selectedAddons = addons
        .filter(a => form.addon_ids?.includes(a.id))
        .map(a => ({ id: a.id, name: a.name, price: a.price, quantity: 1 }));
      
      const bookingData = {
        business_id: business.id,
        booking_number: bookingNumber,
        
        // Customer
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        
        // Service
        service_type: form.service_type,
        service_name: services.find(s => s.type === form.service_type)?.name || form.service_type,
        frequency_name: form.frequency,
        
        // Property
        address_line1: form.address_line1,
        address_line2: form.address_line2 || null,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        square_feet: form.square_feet || null,
        has_pets: form.has_pets,
        
        // Schedule
        scheduled_date: form.scheduled_date,
        scheduled_time_start: form.scheduled_time_start,
        scheduled_time_end: endTime,
        estimated_duration_minutes: pricing.duration,
        
        // Add-ons
        addons: selectedAddons,
        
        // Pricing
        base_price: pricing.basePrice,
        total_price: pricing.total / 100, // Convert to dollars for display
        deposit_amount: Math.round(pricing.total * 0.25) / 100, // 25% deposit
        deposit_paid: false,
        
        // Status
        status: 'pending' as BookingStatus,
        
        // Notes
        access_instructions: form.access_instructions || null,
        special_requests: form.special_requests || null,
        
        // Staff
        assigned_staff_ids: form.assigned_staff_ids || [],
        
        // Source
        source: 'manual',
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await (supabase as any)
        .from('cleaning_bookings')
        .insert(bookingData)
        .select()
        .single();
      
      if (error) throw error;
      
      setBookings(prev => [...prev, data].sort((a, b) => 
        new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
      ));
      
      return data;
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking');
      return null;
    }
  }, [business?.id, services, addons]);

  // Update booking
  const updateBooking = useCallback(async (id: string, data: Partial<Booking>): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('cleaning_bookings')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
      return true;
    } catch (err) {
      console.error('Error updating booking:', err);
      return false;
    }
  }, []);

  // Update status
  const updateStatus = useCallback(async (
    id: string, 
    status: BookingStatus, 
    reason?: string
  ): Promise<boolean> => {
    try {
      const updates: Partial<Booking> = { 
        status,
        updated_at: new Date().toISOString(),
      };
      
      if (status === 'confirmed') {
        updates.confirmed_at = new Date().toISOString();
      } else if (status === 'in_progress') {
        updates.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updates.cancelled_at = new Date().toISOString();
        updates.cancellation_reason = reason;
      }
      
      const { error } = await (supabase as any)
        .from('cleaning_bookings')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      return true;
    } catch (err) {
      console.error('Error updating booking status:', err);
      return false;
    }
  }, []);

  // Delete booking
  const deleteBooking = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('cleaning_bookings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setBookings(prev => prev.filter(b => b.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting booking:', err);
      return false;
    }
  }, []);

  // Get booking by ID
  const getBookingById = useCallback(async (id: string): Promise<Booking | null> => {
    try {
      const { data, error } = await (supabase as any)
        .from('cleaning_bookings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching booking:', err);
      return null;
    }
  }, []);

  // Get calendar events
  const getCalendarEvents = useCallback((start: Date, end: Date): CalendarEvent[] => {
    return bookings
      .filter(b => {
        const bookingDate = parseISO(b.scheduled_date);
        return bookingDate >= startOfDay(start) && bookingDate <= endOfDay(end);
      })
      .map(b => {
        const [hours, minutes] = b.scheduled_time_start.split(':').map(Number);
        const startDate = parseISO(b.scheduled_date);
        startDate.setHours(hours, minutes);
        
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + (b.estimated_duration_minutes || 120));
        
        return {
          id: b.id,
          title: `${b.service_name || b.service_type} - ${b.customer_name}`,
          description: b.special_requests || undefined,
          start: startDate,
          end: endDate,
          type: 'booking' as const,
          status: b.status,
          booking: b,
          location: `${b.address_line1}, ${b.city}`,
        };
      });
  }, [bookings]);

  // Calculate stats
  const stats = useMemo((): BookingStats => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const weekStart = startOfWeek(new Date());
    const monthStart = startOfMonth(new Date());
    
    const completed = bookings.filter(b => b.status === 'completed');
    const weekCompleted = completed.filter(b => parseISO(b.scheduled_date) >= weekStart);
    const monthCompleted = completed.filter(b => parseISO(b.scheduled_date) >= monthStart);
    
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: completed.length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      todayCount: bookings.filter(b => b.scheduled_date === today).length,
      weekRevenue: weekCompleted.reduce((sum, b) => sum + (b.total_price || 0), 0),
      monthRevenue: monthCompleted.reduce((sum, b) => sum + (b.total_price || 0), 0),
    };
  }, [bookings]);

  // Refetch
  const refetch = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  // Initial fetch
  useEffect(() => {
    if (business?.id) {
      fetchBookings();
    }
  }, [business?.id, fetchBookings]);

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    updateStatus,
    deleteBooking,
    fetchBookings,
    getBookingById,
    getCalendarEvents,
    stats,
    refetch,
  };
}

// ============================================================================
// STAFF HOOK
// ============================================================================

export function useStaff() {
  const { business } = useBusiness();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    if (!business?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('staff_members')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('first_name');
      
      if (error && error.code !== '42P01') throw error;
      setStaff(data || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  const createStaff = useCallback(async (data: Partial<Staff>): Promise<Staff | null> => {
    if (!business?.id) return null;
    
    try {
      const { data: created, error } = await (supabase as any)
        .from('staff_members')
        .insert({
          ...data,
          business_id: business.id,
          is_active: true,
          color: data.color || '#' + Math.floor(Math.random()*16777215).toString(16),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      setStaff(prev => [...prev, created]);
      return created;
    } catch (err) {
      console.error('Error creating staff:', err);
      return null;
    }
  }, [business?.id]);

  const updateStaff = useCallback(async (id: string, data: Partial<Staff>): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('staff_members')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      setStaff(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      return true;
    } catch (err) {
      console.error('Error updating staff:', err);
      return false;
    }
  }, []);

  const deleteStaff = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('staff_members')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      setStaff(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting staff:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    if (business?.id) {
      fetchStaff();
    }
  }, [business?.id, fetchStaff]);

  return {
    staff,
    loading,
    createStaff,
    updateStaff,
    deleteStaff,
    refetch: fetchStaff,
  };
}

// ============================================================================
// SERVICES HOOK
// ============================================================================

export function useCleaningServices() {
  const { business } = useBusiness();
  const [services, setServices] = useState<CleaningService[]>([]);
  const [addons, setAddons] = useState<CleaningAddon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    if (!business?.id) return;
    
    setLoading(true);
    try {
      // Fetch services
      const { data: servicesData } = await (supabase as any)
        .from('cleaning_services')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('display_order');
      
      // Fetch addons
      const { data: addonsData } = await (supabase as any)
        .from('cleaning_addons')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('display_order');
      
      setServices(servicesData || []);
      setAddons(addonsData || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  useEffect(() => {
    if (business?.id) {
      fetchServices();
    }
  }, [business?.id, fetchServices]);

  return {
    services,
    addons,
    loading,
    refetch: fetchServices,
  };
}
