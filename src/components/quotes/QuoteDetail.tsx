import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import QuoteStatusBadge from './QuoteStatusBadge';
import { formatCurrency, formatPhone, formatDate, formatDateTime, getDaysSince } from '@/lib/formatters';
import { LOST_REASONS } from '@/lib/constants';
import { 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Edit2, 
  Trophy, 
  XCircle, 
  Pause, 
  Play,
  X,
  Loader2
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Quote = Tables<'quotes'>;

interface QuoteDetailProps {
  quote: Quote;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (status: 'won' | 'lost' | 'paused' | 'active', additionalData?: any) => Promise<void>;
}

export default function QuoteDetail({ quote, onClose, onEdit, onStatusChange }: QuoteDetailProps) {
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const daysSince = getDaysSince(quote.created_at);
  
  const lostReasonLabel = quote.lost_reason 
    ? LOST_REASONS.find(r => r.value === quote.lost_reason)?.label 
    : null;
  
  const handleStatusChange = async (status: 'won' | 'lost' | 'paused' | 'active', additionalData?: any) => {
    setUpdating(true);
    try {
      await onStatusChange(status, additionalData);
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
  
  return (
    <>
      <Card className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{quote.customer_name}</h2>
              <p className="text-muted-foreground">{quote.service_type}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mt-3">
            <QuoteStatusBadge status={quote.status} />
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(quote.quote_amount)}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Contact info */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact</h3>
            <div className="space-y-2">
              <a 
                href={`tel:${quote.customer_phone}`}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                {formatPhone(quote.customer_phone)}
              </a>
              {quote.customer_email && (
                <a 
                  href={`mailto:${quote.customer_email}`}
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {quote.customer_email}
                </a>
              )}
            </div>
          </div>
          
          {/* Quote details */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Created {formatDate(quote.created_at)} ({daysSince} days ago)
              </div>
              {quote.next_message_at && quote.status === 'active' && (
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Next message: {formatDateTime(quote.next_message_at)}
                </div>
              )}
              {quote.won_at && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <Trophy className="h-4 w-4" />
                  Won on {formatDate(quote.won_at)}
                </div>
              )}
              {quote.lost_at && (
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-4 w-4" />
                  Lost on {formatDate(quote.lost_at)}
                  {lostReasonLabel && ` - ${lostReasonLabel}`}
                </div>
              )}
            </div>
          </div>
          
          {/* Notes */}
          {quote.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
              <p className="text-sm text-foreground">{quote.description}</p>
            </div>
          )}
          
          <Separator />
          
          {/* Message timeline placeholder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              Message History
            </div>
            <p className="text-sm text-muted-foreground">
              Messages will appear here once SMS is connected.
            </p>
          </div>
        </div>
        
        {/* Footer actions */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Status actions */}
          {quote.status !== 'won' && quote.status !== 'lost' && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={handleMarkWon}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trophy className="h-4 w-4 mr-2" />
                )}
                Mark Won
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/10"
                onClick={handleMarkLost}
                disabled={updating}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark Lost
              </Button>
            </div>
          )}
          
          {/* Pause/Resume for active quotes */}
          {(quote.status === 'active' || quote.status === 'paused') && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleTogglePause}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : quote.status === 'paused' ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume Sequence
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Sequence
                </>
              )}
            </Button>
          )}
          
          {/* Edit button */}
          <Button variant="ghost" className="w-full" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Quote
          </Button>
        </div>
      </Card>
      
      {/* Lost reason dialog */}
      <Dialog open={showLostDialog} onOpenChange={setShowLostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Quote as Lost</DialogTitle>
            <DialogDescription>
              Why did this quote not convert? This helps track patterns.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Select value={lostReason} onValueChange={setLostReason}>
              <SelectTrigger>
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLostDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmMarkLost} disabled={updating}>
              {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Mark as Lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
