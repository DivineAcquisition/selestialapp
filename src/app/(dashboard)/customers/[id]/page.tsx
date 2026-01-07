"use client";

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCustomerDetail } from '@/hooks/useCustomerDetail';
import { useRetentionSequences } from '@/hooks/useRetentionSequences';
import { useReviewRequests } from '@/hooks/useReviewRequests';
import { formatPhone, formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Heart,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Play,
  Save,
  Loader2,
  Clock,
  RefreshCw,
  User,
  ThumbsUp,
} from 'lucide-react';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { customer, quotes, activities, loading, updateNotes, updateCustomerType, startRetentionSequence } = useCustomerDetail(id || null);
  const { sequences } = useRetentionSequences();
  const { sendReviewRequest } = useReviewRequests();
  
  const [notes, setNotes] = useState('');
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState('');
  const [startingSequence, setStartingSequence] = useState(false);
  const [showSequenceDialog, setShowSequenceDialog] = useState(false);
  const [sendingReview, setSendingReview] = useState(false);

  // Initialize notes when customer loads
  if (customer && !notesLoaded) {
    setNotes(customer.notes || '');
    setNotesLoaded(true);
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateNotes(notes);
      toast.success('Notes saved');
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleTypeChange = async (type: string) => {
    try {
      await updateCustomerType(type);
      toast.success('Customer type updated');
    } catch (err) {
      toast.error('Failed to update customer type');
    }
  };

  const handleStartSequence = async () => {
    if (!selectedSequence) return;
    
    setStartingSequence(true);
    try {
      const { error } = await startRetentionSequence(selectedSequence);
      if (error) throw error;
      toast.success('Retention sequence started');
      setShowSequenceDialog(false);
    } catch (err) {
      toast.error('Failed to start sequence');
    } finally {
      setStartingSequence(false);
    }
  };

  const handleRequestReview = async () => {
    if (!customer) return;
    setSendingReview(true);
    try {
      const { error } = await sendReviewRequest(customer.id);
      if (error) throw error;
      toast.success('Review request sent!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send review request');
    } finally {
      setSendingReview(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-500/10';
    if (score >= 50) return 'text-yellow-600 bg-yellow-500/10';
    if (score >= 30) return 'text-orange-600 bg-orange-500/10';
    return 'text-red-600 bg-red-500/10';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-4 w-4" />;
    if (score >= 40) return <Heart className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-500/10 text-blue-600',
      active: 'bg-amber-500/10 text-amber-600',
      won: 'bg-green-500/10 text-green-600',
      lost: 'bg-red-500/10 text-red-600',
      paused: 'bg-gray-500/10 text-gray-600',
    };
    return <Badge className={styles[status] || 'bg-muted'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Layout title="Customer Details">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout title="Customer Not Found">
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Customer not found</h3>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={customer.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRequestReview} disabled={sendingReview}>
              {sendingReview ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              Request Review
            </Button>
            <Dialog open={showSequenceDialog} onOpenChange={setShowSequenceDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Start Retention Sequence
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Retention Sequence</DialogTitle>
                  <DialogDescription>
                    Select a sequence to start for this customer
                  </DialogDescription>
                </DialogHeader>
                <Select value={selectedSequence} onValueChange={setSelectedSequence}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sequence" />
                  </SelectTrigger>
                  <SelectContent>
                    {sequences.filter(s => s.is_active).map((seq) => (
                      <SelectItem key={seq.id} value={seq.id}>
                        {seq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSequenceDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStartSequence} disabled={!selectedSequence || startingSequence}>
                    {startingSequence && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Start Sequence
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{customer.name}</CardTitle>
                    <CardDescription>
                      Customer since {format(new Date(customer.created_at), 'MMMM yyyy')}
                    </CardDescription>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getHealthColor(customer.health_score)}`}>
                    {getHealthIcon(customer.health_score)}
                    <span className="font-semibold">{customer.health_score}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{formatPhone(customer.phone)}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.address}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <DollarSign className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-lg font-bold">{formatCurrency(customer.total_spent / 100)}</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Briefcase className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-lg font-bold">{customer.total_jobs}</p>
                    <p className="text-xs text-muted-foreground">Jobs</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <TrendingUp className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-lg font-bold">{formatCurrency(customer.average_job_value / 100)}</p>
                    <p className="text-xs text-muted-foreground">Avg Job</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <RefreshCw className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-lg font-bold">{customer.referral_count}</p>
                    <p className="text-xs text-muted-foreground">Referrals</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Customer Type</p>
                    <Select value={customer.customer_type} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">One-time</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="at_risk">At Risk</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {customer.is_recurring && customer.recurring_frequency && (
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Recurring</p>
                      <Badge variant="outline" className="capitalize">
                        {customer.recurring_frequency}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job History */}
            <Card>
              <CardHeader>
                <CardTitle>Job History</CardTitle>
              </CardHeader>
              <CardContent>
                {quotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No jobs found for this customer
                  </p>
                ) : (
                  <div className="space-y-3">
                    {quotes.map((quote) => (
                      <div 
                        key={quote.id} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{quote.service_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(quote.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {formatCurrency(quote.quote_amount / 100)}
                          </span>
                          {getStatusBadge(quote.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this customer..."
                  rows={5}
                />
                <Button 
                  onClick={handleSaveNotes} 
                  disabled={savingNotes || notes === (customer.notes || '')}
                  className="w-full"
                >
                  {savingNotes ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notes
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {customer.last_service_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Last service: {format(new Date(customer.last_service_at), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {customer.next_service_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Next service: {format(new Date(customer.next_service_at), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {customer.last_contact_at && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>Last contact: {format(new Date(customer.last_contact_at), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {customer.first_service_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>First service: {format(new Date(customer.first_service_at), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="text-sm">
                        <p>{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
