'use client';

import { useState, useMemo } from 'react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Icon } from '@/components/ui/icon';
import { useBusiness } from '@/providers';
import { useBookings } from '@/hooks/useBookings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, parseISO, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import type { Booking, BookingStatus } from '@/types/booking';
import { STATUS_CONFIG, SERVICE_TYPE_LABELS } from '@/types/booking';

// ============================================================================
// COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: BookingStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={cn('gap-1 text-xs', config.bgColor, config.color)}>
      {config.label}
    </Badge>
  );
}

function BookingRow({ 
  booking, 
  onView, 
  onStatusChange 
}: { 
  booking: Booking;
  onView: () => void;
  onStatusChange: (status: BookingStatus) => void;
}) {
  const formattedDate = format(parseISO(booking.scheduled_date), 'EEE, MMM d');
  const formattedTime = booking.scheduled_time_start?.slice(0, 5);
  const dateObj = parseISO(booking.scheduled_date);
  
  let dateLabel = formattedDate;
  if (isToday(dateObj)) dateLabel = 'Today';
  else if (isTomorrow(dateObj)) dateLabel = 'Tomorrow';

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onView}>
      <TableCell>
        <div>
          <span className="font-mono text-xs text-muted-foreground">
            {booking.booking_number}
          </span>
          <p className="font-medium">{booking.customer_name}</p>
          <p className="text-xs text-muted-foreground">{booking.customer_phone}</p>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{booking.service_name || SERVICE_TYPE_LABELS[booking.service_type as keyof typeof SERVICE_TYPE_LABELS]}</p>
          <p className="text-xs text-muted-foreground">
            {booking.bedrooms} BR / {booking.bathrooms} BA
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            isToday(dateObj) ? 'bg-blue-100 text-blue-700' :
            isTomorrow(dateObj) ? 'bg-purple-100 text-purple-700' :
            isPast(dateObj) ? 'bg-gray-100 text-gray-600' :
            'bg-green-100 text-green-700'
          )}>
            {dateLabel}
          </div>
          <span className="text-sm">
            {format(parseISO(`2000-01-01T${formattedTime}`), 'h:mm a')}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <p className="font-semibold">${booking.total_price}</p>
        {booking.deposit_paid ? (
          <span className="text-[10px] text-green-600">Deposit paid</span>
        ) : (
          <span className="text-[10px] text-yellow-600">Deposit pending</span>
        )}
      </TableCell>
      <TableCell>
        <StatusBadge status={booking.status} />
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Icon name="more" size="sm" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Icon name="eye" size="sm" className="mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {booking.status === 'pending' && (
              <DropdownMenuItem onClick={() => onStatusChange('confirmed')}>
                <Icon name="check" size="sm" className="mr-2 text-blue-600" />
                Confirm
              </DropdownMenuItem>
            )}
            {booking.status === 'confirmed' && (
              <DropdownMenuItem onClick={() => onStatusChange('in_progress')}>
                <Icon name="play" size="sm" className="mr-2 text-purple-600" />
                Start Service
              </DropdownMenuItem>
            )}
            {booking.status === 'in_progress' && (
              <DropdownMenuItem onClick={() => onStatusChange('completed')}>
                <Icon name="checkCircle" size="sm" className="mr-2 text-green-600" />
                Complete
              </DropdownMenuItem>
            )}
            {!['cancelled', 'completed'].includes(booking.status) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onStatusChange('cancelled')}
                  className="text-red-600"
                >
                  <Icon name="x" size="sm" className="mr-2" />
                  Cancel Booking
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function BookingDetailsModal({
  booking,
  open,
  onClose,
  onStatusChange,
}: {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: BookingStatus) => void;
}) {
  if (!booking) return null;

  const formattedDate = format(parseISO(booking.scheduled_date), 'EEEE, MMMM d, yyyy');
  const formattedTime = booking.scheduled_time_start?.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {booking.booking_number}
                <StatusBadge status={booking.status} />
              </DialogTitle>
              <DialogDescription>
                Created {format(parseISO(booking.created_at), 'MMM d, yyyy')}
              </DialogDescription>
            </div>
            <p className="text-2xl font-bold text-primary">${booking.total_price}</p>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{booking.customer_name}</p>
              <p className="text-sm">{booking.customer_email}</p>
              <p className="text-sm">{booking.customer_phone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{booking.address_line1}</p>
              <p className="text-sm">{booking.city}, {booking.state} {booking.zip_code}</p>
            </div>
          </div>

          {/* Service Details */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{booking.service_name}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.bedrooms} bedrooms, {booking.bathrooms} bathrooms
                </p>
              </div>
              {(booking as any).frequency_name && (
                <Badge variant="outline" className="capitalize">
                  {(booking as any).frequency_name}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Icon name="calendar" size="sm" className="text-muted-foreground" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="clock" size="sm" className="text-muted-foreground" />
                <span>{format(parseISO(`2000-01-01T${formattedTime}`), 'h:mm a')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="hourglass" size="sm" className="text-muted-foreground" />
                <span>~{Math.round(booking.estimated_duration_minutes / 60)} hrs</span>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          {booking.addons && booking.addons.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Add-ons</p>
              <div className="space-y-1">
                {booking.addons.map((addon: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{addon.name} {addon.quantity > 1 && `×${addon.quantity}`}</span>
                    <span>${(addon.price / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between mb-2">
              <span>Total</span>
              <span className="font-bold">${booking.total_price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Deposit</span>
              <span className={booking.deposit_paid ? 'text-green-600' : 'text-yellow-600'}>
                ${booking.deposit_amount} {booking.deposit_paid ? '(Paid)' : '(Pending)'}
              </span>
            </div>
            {booking.deposit_paid && (
              <div className="flex justify-between text-sm">
                <span>Balance due</span>
                <span>${(booking.total_price - booking.deposit_amount).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {(booking.access_instructions || booking.has_pets || booking.special_requests) && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Notes</p>
              {booking.access_instructions && (
                <div className="rounded-lg border p-3 text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Access Instructions</p>
                  <p>{booking.access_instructions}</p>
                </div>
              )}
              {booking.has_pets && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="paw" size="sm" className="text-orange-500" />
                  <span>Customer has pets</span>
                </div>
              )}
              {booking.special_requests && (
                <div className="rounded-lg border p-3 text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Special Requests</p>
                  <p>{booking.special_requests}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <div className="flex items-center gap-2 w-full">
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  onStatusChange(booking.id, 'cancelled');
                  onClose();
                }}
              >
                <Icon name="x" size="sm" className="mr-1" />
                Cancel
              </Button>
            )}
            <div className="flex-1" />

            {booking.status === 'pending' && (
              <Button onClick={() => {
                onStatusChange(booking.id, 'confirmed');
                onClose();
              }}>
                <Icon name="check" size="sm" className="mr-1" />
                Confirm
              </Button>
            )}

            {booking.status === 'confirmed' && (
              <Button onClick={() => {
                onStatusChange(booking.id, 'in_progress');
                onClose();
              }}>
                <Icon name="play" size="sm" className="mr-1" />
                Start Service
              </Button>
            )}

            {booking.status === 'in_progress' && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  onStatusChange(booking.id, 'completed');
                  onClose();
                }}
              >
                <Icon name="checkCircle" size="sm" className="mr-1" />
                Complete
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function BookingsPage() {
  const router = useRouter();
  const { business } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { bookings, loading, stats, updateStatus, refetch } = useBookings();

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = 
        booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.booking_number.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  // Group bookings
  const today = format(new Date(), 'yyyy-MM-dd');
  const upcomingBookings = filteredBookings.filter(b => 
    b.scheduled_date >= today && !['completed', 'cancelled'].includes(b.status)
  );
  const pastBookings = filteredBookings.filter(b => 
    b.scheduled_date < today || ['completed', 'cancelled'].includes(b.status)
  );

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    const success = await updateStatus(id, status);
    if (success) {
      toast.success(`Booking ${status}`);
    } else {
      toast.error('Failed to update booking');
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <Layout title="Bookings">
        <div className="flex items-center justify-center min-h-96">
          <Icon name="loader" size="xl" className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Bookings">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/20">
              <Icon name="briefcase" size="lg" className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Bookings</h1>
              <p className="text-sm text-muted-foreground">Manage cleaning appointments</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/bookings/calendar')}>
              <Icon name="calendar" size="sm" className="mr-1" />
              Calendar
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/bookings/customize')}>
              <Icon name="settings" size="sm" className="mr-1" />
              Widget
            </Button>
            <Button size="sm" onClick={() => router.push('/bookings/calendar')}>
              <Icon name="plus" size="sm" className="mr-1" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Icon name="calendar" size="sm" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-yellow-100 text-yellow-600">
                <Icon name="clock" size="sm" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.pending}</p>
                <p className="text-[10px] text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                <Icon name="checkCircle" size="sm" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.confirmed}</p>
                <p className="text-[10px] text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-100 text-green-600">
                <Icon name="check" size="sm" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.completed}</p>
                <p className="text-[10px] text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                <Icon name="dollarSign" size="sm" />
              </div>
              <div>
                <p className="text-lg font-bold">${stats.monthRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">This Month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => refetch()}>
            <Icon name="refresh" size="sm" />
          </Button>
        </div>

        {/* Bookings Table */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="h-9">
            <TabsTrigger value="upcoming" className="text-xs">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="text-xs">
              Past ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="calendar" size="xl" className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-medium">No upcoming bookings</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create a booking or share your booking widget
                  </p>
                  <Button className="mt-4" onClick={() => router.push('/bookings/calendar')}>
                    <Icon name="plus" size="sm" className="mr-2" />
                    New Booking
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingBookings.map((booking) => (
                      <BookingRow
                        key={booking.id}
                        booking={booking}
                        onView={() => {
                          setSelectedBooking(booking);
                          setDetailsOpen(true);
                        }}
                        onStatusChange={(status) => handleStatusChange(booking.id, status)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="history" size="xl" className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-medium">No past bookings</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Completed and cancelled bookings will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastBookings.map((booking) => (
                      <BookingRow
                        key={booking.id}
                        booking={booking}
                        onView={() => {
                          setSelectedBooking(booking);
                          setDetailsOpen(true);
                        }}
                        onStatusChange={(status) => handleStatusChange(booking.id, status)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </Layout>
  );
}
