"use client";

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AnimatedCounter } from '@/components/ui/text-effects';
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
import { cn } from '@/lib/utils';
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
  Sparkles,
  ArrowRight,
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
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleTypeChange = async (type: string) => {
    try {
      await updateCustomerType(type);
      toast.success('Customer type updated');
    } catch {
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
    } catch {
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
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (score >= 30) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-4 w-4" />;
    if (score >= 40) return <Heart className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700 border-0',
      active: 'bg-amber-100 text-amber-700 border-0',
      won: 'bg-emerald-100 text-emerald-700 border-0',
      lost: 'bg-red-100 text-red-700 border-0',
      paused: 'bg-gray-100 text-gray-700 border-0',
    };
    return <Badge className={styles[status] || 'bg-gray-100'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Layout title="Customer Details">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout title="Customer Not Found">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer not found</h3>
          <p className="text-gray-500 mb-6">The customer you&apos;re looking for doesn&apos;t exist.</p>
          <Button variant="outline" onClick={() => router.push('/customers')} className="rounded-xl">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => router.push('/customers')} className="w-fit rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRequestReview} disabled={sendingReview} className="rounded-xl">
              {sendingReview ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              Request Review
            </Button>
            <Dialog open={showSequenceDialog} onOpenChange={setShowSequenceDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl">
                  <Play className="h-4 w-4 mr-2" />
                  Start Sequence
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Start Retention Sequence</DialogTitle>
                  <DialogDescription>
                    Select a sequence to start for this customer
                  </DialogDescription>
                </DialogHeader>
                <Select value={selectedSequence} onValueChange={setSelectedSequence}>
                  <SelectTrigger className="rounded-xl">
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
                  <Button variant="outline" onClick={() => setShowSequenceDialog(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button onClick={handleStartSequence} disabled={!selectedSequence || startingSequence} className="rounded-xl">
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
            {/* Profile Card */}
            <Card className="card-elevated p-6 rounded-2xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#9D96FF] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                    <p className="text-gray-500">
                      Customer since {format(new Date(customer.created_at), 'MMMM yyyy')}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border",
                  getHealthColor(customer.health_score)
                )}>
                  {getHealthIcon(customer.health_score)}
                  <span className="font-semibold">{customer.health_score}</span>
                  <span className="text-sm">Health</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{formatPhone(customer.phone)}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 truncate">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl col-span-2">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{customer.address}</span>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="group text-center p-4 bg-gray-50 rounded-xl hover:bg-primary/5 transition-colors">
                  <DollarSign className="h-6 w-6 mx-auto text-gray-400 group-hover:text-primary mb-2 transition-colors" />
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(customer.total_spent / 100)}
                  </p>
                  <p className="text-xs text-gray-500">Total Spent</p>
                </div>
                <div className="group text-center p-4 bg-gray-50 rounded-xl hover:bg-primary/5 transition-colors">
                  <Briefcase className="h-6 w-6 mx-auto text-gray-400 group-hover:text-primary mb-2 transition-colors" />
                  <p className="text-xl font-bold text-gray-900">
                    <AnimatedCounter value={customer.total_jobs} />
                  </p>
                  <p className="text-xs text-gray-500">Jobs</p>
                </div>
                <div className="group text-center p-4 bg-gray-50 rounded-xl hover:bg-primary/5 transition-colors">
                  <TrendingUp className="h-6 w-6 mx-auto text-gray-400 group-hover:text-primary mb-2 transition-colors" />
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(customer.average_job_value / 100)}
                  </p>
                  <p className="text-xs text-gray-500">Avg Job</p>
                </div>
                <div className="group text-center p-4 bg-gray-50 rounded-xl hover:bg-primary/5 transition-colors">
                  <RefreshCw className="h-6 w-6 mx-auto text-gray-400 group-hover:text-primary mb-2 transition-colors" />
                  <p className="text-xl font-bold text-gray-900">
                    <AnimatedCounter value={customer.referral_count} />
                  </p>
                  <p className="text-xs text-gray-500">Referrals</p>
                </div>
              </div>

              {/* Customer Type */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">Customer Type</p>
                  <Select value={customer.customer_type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="rounded-xl">
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
                    <p className="text-sm text-gray-500 mb-2">Recurring</p>
                    <Badge variant="outline" className="capitalize rounded-lg px-4 py-2">
                      {customer.recurring_frequency}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>

            {/* Job History */}
            <Card className="card-elevated p-0 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Job History</h2>
              </div>
              <div className="p-5">
                {quotes.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No jobs found for this customer</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quotes.map((quote) => (
                      <div 
                        key={quote.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => router.push(`/quotes?id=${quote.id}`)}
                      >
                        <div>
                          <p className="font-medium text-gray-900">{quote.service_type}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(quote.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(quote.quote_amount / 100)}
                          </span>
                          {getStatusBadge(quote.status)}
                          <ArrowRight className="h-4 w-4 text-gray-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notes */}
            <Card className="card-elevated p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-gray-900">Notes</h3>
              </div>
              <div className="space-y-3">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this customer..."
                  rows={5}
                  className="rounded-xl resize-none"
                />
                <Button 
                  onClick={handleSaveNotes} 
                  disabled={savingNotes || notes === (customer.notes || '')}
                  className="w-full rounded-xl"
                >
                  {savingNotes ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notes
                </Button>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="card-elevated p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-gray-900">Timeline</h3>
              </div>
              <div className="space-y-4">
                {customer.last_service_at && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">Last service</p>
                      <p className="text-xs text-gray-500">{format(new Date(customer.last_service_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                )}
                {customer.next_service_at && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-gray-900">Next service</p>
                      <p className="text-xs text-primary">{format(new Date(customer.next_service_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                )}
                {customer.last_contact_at && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">Last contact</p>
                      <p className="text-xs text-gray-500">{format(new Date(customer.last_contact_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                )}
                {customer.first_service_at && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Sparkles className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">First service</p>
                      <p className="text-xs text-gray-500">{format(new Date(customer.first_service_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Activity */}
            <Card className="card-elevated p-5 rounded-2xl">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {activities.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-700">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
