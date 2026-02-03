'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: Using 'any' for Supabase calls until database types are regenerated

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { useStaff } from '@/hooks/useBookings';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Staff, StaffAvailability } from '@/types/booking';

// ============================================================================
// CONSTANTS
// ============================================================================

const STAFF_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
];

const WEEKDAYS = [
  { label: 'Sunday', short: 'Sun' },
  { label: 'Monday', short: 'Mon' },
  { label: 'Tuesday', short: 'Tue' },
  { label: 'Wednesday', short: 'Wed' },
  { label: 'Thursday', short: 'Thu' },
  { label: 'Friday', short: 'Fri' },
  { label: 'Saturday', short: 'Sat' },
];

const DEFAULT_AVAILABILITY: Omit<StaffAvailability, 'id' | 'staff_id'>[] = [
  { day_of_week: 0, start_time: '09:00', end_time: '17:00', is_available: false },
  { day_of_week: 1, start_time: '08:00', end_time: '17:00', is_available: true },
  { day_of_week: 2, start_time: '08:00', end_time: '17:00', is_available: true },
  { day_of_week: 3, start_time: '08:00', end_time: '17:00', is_available: true },
  { day_of_week: 4, start_time: '08:00', end_time: '17:00', is_available: true },
  { day_of_week: 5, start_time: '08:00', end_time: '17:00', is_available: true },
  { day_of_week: 6, start_time: '09:00', end_time: '15:00', is_available: false },
];

// ============================================================================
// COMPONENTS
// ============================================================================

interface StaffFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'cleaner' | 'lead' | 'manager' | 'admin';
  color: string;
  hourly_rate: string;
}

function StaffModal({
  open,
  onClose,
  staff,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSave: (data: Partial<Staff>) => Promise<boolean>;
}) {
  const [saving, setSaving] = useState(false);
  
  // Compute initial form
  const initialForm = useMemo((): StaffFormData => {
    if (staff) {
      return {
        first_name: staff.first_name,
        last_name: staff.last_name,
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role,
        color: staff.color,
        hourly_rate: staff.hourly_rate ? String(staff.hourly_rate / 100) : '',
      };
    }
    return {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'cleaner',
      color: STAFF_COLORS[Math.floor(Math.random() * STAFF_COLORS.length)],
      hourly_rate: '',
    };
  }, [staff]);
  
  const [form, setForm] = useState<StaffFormData>(initialForm);
  
  // Reset form when modal opens
  const formKey = `${open}-${staff?.id || 'new'}`;
  useMemo(() => {
    if (open) {
      setForm(initialForm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey]);

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    const success = await onSave({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      role: form.role,
      color: form.color,
      hourly_rate: form.hourly_rate ? Math.round(parseFloat(form.hourly_rate) * 100) : undefined,
    });
    setSaving(false);

    if (success) {
      toast.success(staff ? 'Staff updated' : 'Staff member added');
      onClose();
    } else {
      toast.error('Failed to save');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {staff ? 'Edit Staff Member' : 'Add Staff Member'}
          </DialogTitle>
          <DialogDescription>
            {staff
              ? 'Update this team member\'s information'
              : 'Add a new cleaner or team member'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Role & Pay */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaner">Cleaner</SelectItem>
                  <SelectItem value="lead">Lead Cleaner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hourly Rate</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={form.hourly_rate}
                  onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                  className="pl-7"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Color */}
          <div>
            <Label>Calendar Color</Label>
            <div className="flex gap-2 mt-2">
              {STAFF_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'w-8 h-8 rounded-full transition-transform',
                    form.color === color && 'ring-2 ring-offset-2 ring-primary scale-110'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setForm({ ...form, color })}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : staff ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AvailabilityEditor({
  staffId,
  availability,
  onUpdate,
}: {
  staffId: string;
  availability: StaffAvailability[];
  onUpdate: () => void;
}) {
  const [saving, setSaving] = useState<number | null>(null);

  const updateAvailability = async (
    dayOfWeek: number,
    updates: Partial<StaffAvailability>
  ) => {
    setSaving(dayOfWeek);
    try {
      const existing = availability.find((a) => a.day_of_week === dayOfWeek);
      
      if (existing) {
        await (supabase as any)
          .from('staff_availability')
          .update(updates)
          .eq('id', existing.id);
      } else {
        const defaultAvail = DEFAULT_AVAILABILITY[dayOfWeek];
        await (supabase as any)
          .from('staff_availability')
          .insert({
            staff_id: staffId,
            day_of_week: dayOfWeek,
            start_time: defaultAvail.start_time,
            end_time: defaultAvail.end_time,
            is_available: defaultAvail.is_available,
            ...updates,
          });
      }
      
      onUpdate();
    } catch (err) {
      console.error('Error updating availability:', err);
      toast.error('Failed to update');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-3">
      {WEEKDAYS.map((day, i) => {
        const dayAvail = availability.find((a) => a.day_of_week === i) || DEFAULT_AVAILABILITY[i];
        return (
          <div
            key={i}
            className={cn(
              'flex items-center gap-4 p-3 rounded-lg border',
              !dayAvail.is_available && 'bg-muted/50'
            )}
          >
            <div className="w-24">
              <span className="font-medium">{day.short}</span>
            </div>
            
            <Switch
              checked={dayAvail.is_available}
              onCheckedChange={(checked) =>
                updateAvailability(i, { is_available: checked })
              }
              disabled={saving === i}
            />
            
            {dayAvail.is_available && (
              <>
                <Select
                  value={dayAvail.start_time}
                  onValueChange={(v) => updateAvailability(i, { start_time: v })}
                  disabled={saving === i}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00'].map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {t.slice(0, 5)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                
                <span className="text-muted-foreground">to</span>
                
                <Select
                  value={dayAvail.end_time}
                  onValueChange={(v) => updateAvailability(i, { end_time: v })}
                  disabled={saving === i}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {t.slice(0, 5)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </>
            )}
            
            {!dayAvail.is_available && (
              <span className="text-sm text-muted-foreground">Not Available</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StaffCard({
  member,
  onEdit,
  onDelete,
  onViewAvailability,
}: {
  member: Staff;
  onEdit: () => void;
  onDelete: () => void;
  onViewAvailability: () => void;
}) {
  const initials = `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12" style={{ backgroundColor: member.color }}>
          <AvatarFallback className="text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">
              {member.first_name} {member.last_name}
            </h3>
            <Badge variant="outline" className="capitalize text-xs">
              {member.role}
            </Badge>
          </div>

          {member.email && (
            <p className="text-sm text-muted-foreground truncate">{member.email}</p>
          )}
          {member.phone && (
            <p className="text-sm text-muted-foreground">{member.phone}</p>
          )}

          {member.hourly_rate && (
            <p className="text-sm mt-1">
              <span className="text-muted-foreground">Rate:</span>{' '}
              <span className="font-medium">${(member.hourly_rate / 100).toFixed(2)}/hr</span>
            </p>
          )}
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onViewAvailability}>
            <Icon name="clock" size="sm" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Icon name="edit" size="sm" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700"
            onClick={onDelete}
          >
            <Icon name="trash" size="sm" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function StaffPage() {
  const { staff, loading, createStaff, updateStaff, deleteStaff } = useStaff();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availability, setAvailability] = useState<StaffAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const loadAvailability = async (staffId: string) => {
    setLoadingAvailability(true);
    try {
      const { data } = await (supabase as any)
        .from('staff_availability')
        .select('*')
        .eq('staff_id', staffId)
        .order('day_of_week');
      setAvailability(data || []);
    } catch (err) {
      console.error('Error loading availability:', err);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleSave = async (data: Partial<Staff>): Promise<boolean> => {
    if (selectedStaff) {
      return await updateStaff(selectedStaff.id, data);
    } else {
      const result = await createStaff(data);
      return !!result;
    }
  };

  const handleDelete = async (staffMember: Staff) => {
    if (!confirm(`Remove ${staffMember.first_name} ${staffMember.last_name} from your team?`)) {
      return;
    }
    const success = await deleteStaff(staffMember.id);
    if (success) {
      toast.success('Team member removed');
    } else {
      toast.error('Failed to remove');
    }
  };

  const handleViewAvailability = async (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    await loadAvailability(staffMember.id);
    setAvailabilityOpen(true);
  };

  if (loading && staff.length === 0) {
    return (
      <Layout title="Team">
        <div className="flex items-center justify-center min-h-96">
          <Icon name="loader" size="xl" className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Team">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/20">
              <Icon name="users" size="lg" className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Team Members</h1>
              <p className="text-sm text-muted-foreground">Manage your cleaning crew</p>
            </div>
          </div>

          <Button
            onClick={() => {
              setSelectedStaff(null);
              setModalOpen(true);
            }}
          >
            <Icon name="plus" size="sm" className="mr-2" />
            Add Team Member
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon name="users" size="md" />
              </div>
              <div>
                <p className="text-2xl font-bold">{staff.length}</p>
                <p className="text-xs text-muted-foreground">Total Staff</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Icon name="sparkles" size="md" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {staff.filter((s) => s.role === 'cleaner').length}
                </p>
                <p className="text-xs text-muted-foreground">Cleaners</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Icon name="crown" size="md" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {staff.filter((s) => s.role === 'lead').length}
                </p>
                <p className="text-xs text-muted-foreground">Lead Cleaners</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Icon name="settings" size="md" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {staff.filter((s) => ['manager', 'admin'].includes(s.role)).length}
                </p>
                <p className="text-xs text-muted-foreground">Managers</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Staff Grid */}
        {staff.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="users" size="xl" className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg">No team members yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Add your cleaning crew to start assigning jobs
            </p>
            <Button
              onClick={() => {
                setSelectedStaff(null);
                setModalOpen(true);
              }}
            >
              <Icon name="plus" size="sm" className="mr-2" />
              Add First Team Member
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <StaffCard
                key={member.id}
                member={member}
                onEdit={() => {
                  setSelectedStaff(member);
                  setModalOpen(true);
                }}
                onDelete={() => handleDelete(member)}
                onViewAvailability={() => handleViewAvailability(member)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Staff Modal */}
      <StaffModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
        onSave={handleSave}
      />

      {/* Availability Modal */}
      <Dialog open={availabilityOpen} onOpenChange={setAvailabilityOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedStaff?.first_name}&apos;s Availability
            </DialogTitle>
            <DialogDescription>
              Set working hours for each day of the week
            </DialogDescription>
          </DialogHeader>

          {loadingAvailability ? (
            <div className="py-8 text-center">
              <Icon name="loader" size="lg" className="animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <div className="py-4">
              <AvailabilityEditor
                staffId={selectedStaff?.id || ''}
                availability={availability}
                onUpdate={() => loadAvailability(selectedStaff?.id || '')}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAvailabilityOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
