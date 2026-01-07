"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form } from '@/components/ui/form';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Icon, IconName } from '@/components/ui/icon';
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
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuotes } from '@/hooks/useQuotes';
import { useMessages } from '@/hooks/useMessages';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { usePayments } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatPhone, formatDate, formatDateTime, getDaysSince, toE164 } from '@/lib/formatters';
import { LOST_REASONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const quoteId = params.id as string;
  
  const { quotes, updateQuote, loading: quotesLoading } = useQuotes();
  const { messages, loading: messagesLoading } = useMessages(quoteId);
  const { status: stripeStatus } = useStripeConnect();
  const { createPaymentLink } = usePayments();
  
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [resending, setResending] = useState(false);
  const [generatingPaymentLink, setGeneratingPaymentLink] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Find the quote
  const quote = quotes.find(q => q.id === quoteId);
  
  // Redirect if quote not found and not loading
  useEffect(() => {
    if (!quotesLoading && !quote) {
      router.push('/quotes');
    }
  }, [quote, quotesLoading, router]);
  
  if (quotesLoading) {
    return (
      <Layout title="Quote Details">
        <div className="flex items-center justify-center py-20">
          <Icon name="spinner" size="2xl" className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  if (!quote) {
    return null;
  }
  
  const daysSince = getDaysSince(quote.created_at);
  const lostReasonLabel = quote.lost_reason 
    ? LOST_REASONS.find(r => r.value === quote.lost_reason)?.label 
    : null;
  
  const handleStatusChange = async (status: 'won' | 'lost' | 'paused' | 'active', additionalData?: Record<string, unknown>) => {
    setUpdating(true);
    try {
      const updateData: Record<string, unknown> = { status };
      
      if (status === 'won') {
        updateData.won_at = new Date().toISOString();
        updateData.final_job_amount = additionalData?.final_job_amount || quote.quote_amount;
      } else if (status === 'lost') {
        updateData.lost_at = new Date().toISOString();
        updateData.lost_reason = additionalData?.lost_reason || 'other';
      }
      
      const { error } = await updateQuote(quoteId, updateData);
      if (error) throw error;
      
      toast({ title: `Quote marked as ${status}` });
    } catch (err) {
      toast({ 
        title: 'Failed to update status', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const handleMarkWon = () => {
    handleStatusChange('won', { final_job_amount: quote.quote_amount });
  };
  
  const handleMarkLost = () => {
    setShowLostDialog(true);
  };
  
  const confirmMarkLost = async () => {
    await handleStatusChange('lost', { lost_reason: lostReason || 'other' });
    setShowLostDialog(false);
    setLostReason('');
  };
  
  const handleTogglePause = () => {
    handleStatusChange(quote.status === 'paused' ? 'active' : 'paused');
  };
  
  const handleResendNotifications = async () => {
    setResending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-quote-notification', {
        body: { quoteId: quote.id },
      });
      
      if (error) throw error;
      
      toast({
        title: 'Notifications sent',
        description: `Email: ${data.email?.sent ? '✓' : '✗'}, SMS: ${data.sms?.sent ? '✓' : '✗'}`,
      });
    } catch (err) {
      toast({
        title: 'Failed to send',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };
  
  const handleGeneratePaymentLink = async () => {
    setGeneratingPaymentLink(true);
    try {
      const paymentUrl = await createPaymentLink(quote.id);
      
      toast({
        title: 'Payment link created',
        description: 'The payment link has been generated and is ready to share.',
      });
      
      if (paymentUrl) {
        await navigator.clipboard.writeText(paymentUrl);
        toast({
          title: 'Copied to clipboard',
          description: 'Payment link copied to your clipboard.',
        });
      }
    } catch (err) {
      toast({
        title: 'Failed to create payment link',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setGeneratingPaymentLink(false);
    }
  };
  
  const handleCopyPaymentLink = async () => {
    if (quote.payment_link_url) {
      await navigator.clipboard.writeText(quote.payment_link_url);
      toast({
        title: 'Copied',
        description: 'Payment link copied to clipboard.',
      });
    }
  };
  
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const customerName = formData.get('customer_name') as string;
    const customerPhone = formData.get('customer_phone') as string;
    const customerEmail = formData.get('customer_email') as string;
    const serviceType = formData.get('service_type') as string;
    const quoteAmount = formData.get('quote_amount') as string;
    const description = formData.get('description') as string;
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!customerName?.trim()) newErrors.customer_name = 'Name is required';
    if (!customerPhone?.trim()) newErrors.customer_phone = 'Phone is required';
    if (!serviceType?.trim()) newErrors.service_type = 'Service type is required';
    if (!quoteAmount || parseFloat(quoteAmount) <= 0) newErrors.quote_amount = 'Valid amount required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setUpdating(true);
    setErrors({});
    
    try {
      const { error } = await updateQuote(quoteId, {
        customer_name: customerName.trim(),
        customer_phone: toE164(customerPhone),
        customer_email: customerEmail?.trim() || null,
        service_type: serviceType.trim(),
        quote_amount: Math.round(parseFloat(quoteAmount) * 100),
        description: description?.trim() || null,
      });
      
      if (error) throw error;
      
      toast({ title: 'Quote updated successfully' });
      setIsEditing(false);
    } catch (err) {
      toast({
        title: 'Failed to update quote',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'won': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'lost': return 'bg-red-100 text-red-700 border-red-200';
      case 'paused': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getMessageIcon = (message: typeof messages[0]): { name: IconName; className: string } => {
    if (message.direction === 'inbound') {
      return { name: 'user', className: 'text-primary' };
    }
    if (message.status === 'delivered') {
      return { name: 'checkCircle', className: 'text-emerald-600' };
    }
    if (message.status === 'sent') {
      return { name: 'send', className: 'text-blue-600' };
    }
    if (message.status === 'failed') {
      return { name: 'alertCircle', className: 'text-red-600' };
    }
    return { name: 'clock', className: 'text-gray-500' };
  };

  const getMessageIconBg = (message: typeof messages[0]): string => {
    if (message.direction === 'inbound') {
      return 'bg-primary/10';
    }
    if (message.status === 'delivered') {
      return 'bg-emerald-100';
    }
    if (message.status === 'sent') {
      return 'bg-blue-100';
    }
    if (message.status === 'failed') {
      return 'bg-red-100';
    }
    return 'bg-gray-100';
  };
  
  return (
    <Layout title="Quote Details">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/quotes')} className="rounded-xl">
              <Icon name="arrowLeft" size="lg" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{quote.customer_name}</h1>
                <Badge className={cn("capitalize", getStatusColor(quote.status))}>
                  {quote.status}
                </Badge>
              </div>
              <p className="text-gray-500">{quote.service_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-xl"
            >
              {isEditing ? <Icon name="close" size="sm" className="mr-2" /> : <Icon name="edit" size="sm" className="mr-2" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quote Amount Card */}
            <Card className="card-elevated p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Quote Amount</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {formatCurrency(quote.quote_amount)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-[#9D96FF]/10">
                  <Icon name="dollarSign" size="2xl" className="text-primary" />
                </div>
              </div>
              {quote.final_job_amount && quote.final_job_amount !== quote.quote_amount && (
                <p className="text-sm text-emerald-600 mt-2">
                  Final amount: {formatCurrency(quote.final_job_amount)}
                </p>
              )}
            </Card>
            
            {/* Edit Form or Details */}
            {isEditing ? (
              <Card className="card-elevated p-6 rounded-2xl">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="edit" size="sm" className="text-primary" />
                  Edit Quote
                </h2>
                <Form onSubmit={handleEditSubmit}>
                  <Field name="customer_name">
                    <FieldLabel>Customer Name</FieldLabel>
                    <div className="relative">
                      <Icon name="user" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        name="customer_name"
                        defaultValue={quote.customer_name}
                        placeholder="Customer name"
                        disabled={updating}
                        className="pl-10 h-11 rounded-xl"
                      />
                    </div>
                    <FieldError show={!!errors.customer_name}>{errors.customer_name}</FieldError>
                  </Field>
                  
                  <Field name="customer_phone">
                    <FieldLabel>Phone</FieldLabel>
                    <div className="relative">
                      <Icon name="phone" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        name="customer_phone"
                        type="tel"
                        defaultValue={formatPhone(quote.customer_phone)}
                        placeholder="(555) 123-4567"
                        disabled={updating}
                        className="pl-10 h-11 rounded-xl"
                      />
                    </div>
                    <FieldError show={!!errors.customer_phone}>{errors.customer_phone}</FieldError>
                  </Field>
                  
                  <Field name="customer_email">
                    <FieldLabel>Email (optional)</FieldLabel>
                    <div className="relative">
                      <Icon name="email" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        name="customer_email"
                        type="email"
                        defaultValue={quote.customer_email || ''}
                        placeholder="customer@email.com"
                        disabled={updating}
                        className="pl-10 h-11 rounded-xl"
                      />
                    </div>
                  </Field>
                  
                  <Field name="service_type">
                    <FieldLabel>Service Type</FieldLabel>
                    <div className="relative">
                      <Icon name="fileText" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        name="service_type"
                        defaultValue={quote.service_type}
                        placeholder="Service type"
                        disabled={updating}
                        className="pl-10 h-11 rounded-xl"
                      />
                    </div>
                    <FieldError show={!!errors.service_type}>{errors.service_type}</FieldError>
                  </Field>
                  
                  <Field name="quote_amount">
                    <FieldLabel>Quote Amount ($)</FieldLabel>
                    <div className="relative">
                      <Icon name="dollarSign" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        name="quote_amount"
                        type="number"
                        step="0.01"
                        defaultValue={(quote.quote_amount / 100).toFixed(2)}
                        placeholder="0.00"
                        disabled={updating}
                        className="pl-10 h-11 rounded-xl"
                      />
                    </div>
                    <FieldError show={!!errors.quote_amount}>{errors.quote_amount}</FieldError>
                  </Field>
                  
                  <Field name="description">
                    <FieldLabel>Notes (optional)</FieldLabel>
                    <Textarea
                      name="description"
                      defaultValue={quote.description || ''}
                      placeholder="Additional notes..."
                      disabled={updating}
                      rows={3}
                      className="rounded-xl"
                    />
                  </Field>
                  
                  <Button
                    type="submit"
                    disabled={updating}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-[#9D96FF]"
                  >
                    {updating ? (
                      <Icon name="spinner" size="sm" className="animate-spin mr-2" />
                    ) : (
                      <Icon name="save" size="sm" className="mr-2" />
                    )}
                    Save Changes
                  </Button>
                </Form>
              </Card>
            ) : (
              <>
                {/* Contact Info */}
                <Card className="card-elevated p-6 rounded-2xl">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon name="user" size="sm" className="text-primary" />
                    Contact Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <a 
                      href={`tel:${quote.customer_phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon name="phone" size="sm" className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{formatPhone(quote.customer_phone)}</p>
                      </div>
                    </a>
                    {quote.customer_email && (
                      <a 
                        href={`mailto:${quote.customer_email}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon name="email" size="sm" className="text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{quote.customer_email}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </Card>
                
                {/* Quote Details */}
                <Card className="card-elevated p-6 rounded-2xl">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon name="fileText" size="sm" className="text-primary" />
                    Quote Details
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="calendar" size="sm" className="text-gray-400" />
                      <span className="text-gray-600">Created {formatDate(quote.created_at)} ({daysSince} days ago)</span>
                    </div>
                    {quote.next_message_at && quote.status === 'active' && (
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="clock" size="sm" className="text-gray-400" />
                        <span className="text-gray-600">Next message: {formatDateTime(quote.next_message_at)}</span>
                      </div>
                    )}
                    {quote.won_at && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <Icon name="trophy" size="sm" />
                        <span>Won on {formatDate(quote.won_at)}</span>
                      </div>
                    )}
                    {quote.lost_at && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <Icon name="xCircle" size="sm" />
                        <span>Lost on {formatDate(quote.lost_at)}{lostReasonLabel && ` - ${lostReasonLabel}`}</span>
                      </div>
                    )}
                  </div>
                  {quote.description && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                        <p className="text-sm text-gray-600">{quote.description}</p>
                      </div>
                    </>
                  )}
                </Card>
                
                {/* Message History */}
                <Card className="card-elevated p-6 rounded-2xl">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon name="message" size="sm" className="text-primary" />
                    Message History
                  </h2>
                  
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Icon name="spinner" size="lg" className="animate-spin text-gray-400" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Icon name="message" size="2xl" className="mx-auto mb-2 text-gray-300" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {messages.map((message) => {
                          const iconInfo = getMessageIcon(message);
                          const iconBg = getMessageIconBg(message);
                          return (
                            <div key={message.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                              <div className="shrink-0 mt-0.5">
                                <div className={cn("p-1.5 rounded-lg", iconBg)}>
                                  <Icon name={iconInfo.name} size="xs" className={iconInfo.className} />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{message.content}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDateTime(message.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </Card>
              </>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            {quote.status !== 'won' && quote.status !== 'lost' && (
              <Card className="card-elevated p-6 rounded-2xl">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50 rounded-xl"
                    onClick={handleMarkWon}
                    disabled={updating}
                  >
                    {updating ? (
                      <Icon name="spinner" size="sm" className="mr-2 animate-spin" />
                    ) : (
                      <Icon name="trophy" size="sm" className="mr-2" />
                    )}
                    Mark as Won
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
                    onClick={handleMarkLost}
                    disabled={updating}
                  >
                    <Icon name="xCircle" size="sm" className="mr-2" />
                    Mark as Lost
                  </Button>
                  {(quote.status === 'active' || quote.status === 'paused') && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start rounded-xl"
                      onClick={handleTogglePause}
                      disabled={updating}
                    >
                      {quote.status === 'paused' ? (
                        <>
                          <Icon name="play" size="sm" className="mr-2" />
                          Resume Sequence
                        </>
                      ) : (
                        <>
                          <Icon name="pause" size="sm" className="mr-2" />
                          Pause Sequence
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            )}
            
            {/* Notifications */}
            <Card className="card-elevated p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendNotifications}
                  disabled={resending}
                  className="h-8 rounded-lg"
                >
                  {resending ? (
                    <Icon name="spinner" size="xs" className="animate-spin" />
                  ) : (
                    <Icon name="refresh" size="xs" />
                  )}
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Icon name="email" size="sm" className="text-gray-400" />
                    <span>Email</span>
                  </div>
                  {quote.email_sent_at ? (
                    <span className="text-emerald-600 text-xs">
                      Sent {formatDistanceToNow(new Date(quote.email_sent_at), { addSuffix: true })}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Not sent</span>
                  )}
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Icon name="send" size="sm" className="text-gray-400" />
                    <span>SMS</span>
                  </div>
                  {quote.sms_sent_at ? (
                    <span className="text-emerald-600 text-xs">
                      Sent {formatDistanceToNow(new Date(quote.sms_sent_at), { addSuffix: true })}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Not sent</span>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Payment */}
            {stripeStatus.connected && stripeStatus.chargesEnabled && (
              <Card className="card-elevated p-6 rounded-2xl">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="creditCard" size="sm" className="text-primary" />
                  Payment
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    {quote.payment_status === 'paid' ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Paid</Badge>
                    ) : quote.payment_status === 'pending' ? (
                      <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                    ) : (
                      <Badge variant="outline">Not paid</Badge>
                    )}
                  </div>
                  
                  {quote.payment_link_url ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg"
                        onClick={handleCopyPaymentLink}
                      >
                        <Icon name="copy" size="xs" className="mr-1" />
                        Copy Link
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => window.open(quote.payment_link_url!, '_blank')}
                      >
                        <Icon name="externalLink" size="xs" />
                      </Button>
                    </div>
                  ) : quote.status !== 'won' && quote.status !== 'lost' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-lg"
                      onClick={handleGeneratePaymentLink}
                      disabled={generatingPaymentLink}
                    >
                      {generatingPaymentLink ? (
                        <Icon name="spinner" size="xs" className="animate-spin mr-1" />
                      ) : (
                        <Icon name="sparkles" size="xs" className="mr-1" />
                      )}
                      Generate Payment Link
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Lost Reason Dialog */}
      <Dialog open={showLostDialog} onOpenChange={setShowLostDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Mark Quote as Lost</DialogTitle>
            <DialogDescription>
              Why did this quote not convert? This helps track patterns.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Field name="lostReason">
              <FieldLabel>Reason (optional)</FieldLabel>
              <Select value={lostReason} onValueChange={setLostReason}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {LOST_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLostDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmMarkLost} disabled={updating} className="rounded-xl">
              {updating && <Icon name="spinner" size="sm" className="mr-2 animate-spin" />}
              Mark as Lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
