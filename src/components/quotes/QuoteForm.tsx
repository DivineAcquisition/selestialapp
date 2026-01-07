import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { SERVICE_TYPES } from '@/lib/constants';
import { formatPhone, toE164, parseCurrencyToCents } from '@/lib/formatters';
import { useBusiness } from '@/contexts/BusinessContext';
import { useSequences } from '@/hooks/useSequences';
import { Icon } from '@/components/ui/icon';
import type { Tables } from '@/integrations/supabase/types';

type Quote = Tables<'quotes'>;

interface QuoteFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (quote: any) => Promise<void>;
  editQuote?: Quote | null;
}

export default function QuoteForm({ open, onClose, onSave, editQuote }: QuoteFormProps) {
  const { business } = useBusiness();
  const { sequences } = useSequences();
  
  const isEditing = !!editQuote;
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_type: '',
    quote_amount: '',
    description: '',
    sequence_id: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  
  // Get default sequence
  const defaultSequence = sequences.find(s => s.is_default);
  
  // Reset form when opening/closing or when editQuote changes
  useEffect(() => {
    if (open) {
      if (editQuote) {
        setFormData({
          customer_name: editQuote.customer_name,
          customer_phone: formatPhone(editQuote.customer_phone),
          customer_email: editQuote.customer_email || '',
          service_type: editQuote.service_type,
          quote_amount: (editQuote.quote_amount / 100).toString(),
          description: editQuote.description || '',
          sequence_id: editQuote.sequence_id || '',
        });
      } else {
        setFormData({
          customer_name: '',
          customer_phone: '',
          customer_email: '',
          service_type: '',
          quote_amount: '',
          description: '',
          sequence_id: defaultSequence?.id || '',
        });
      }
      setErrors({});
    }
  }, [open, editQuote, defaultSequence?.id]);
  
  const serviceTypes = business 
    ? (SERVICE_TYPES[business.industry] || SERVICE_TYPES.other)
    : SERVICE_TYPES.other;
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }
    
    const phoneDigits = formData.customer_phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      newErrors.customer_phone = 'Valid phone number is required';
    }
    
    if (!formData.service_type) {
      newErrors.service_type = 'Service type is required';
    }
    
    const amount = parseFloat(formData.quote_amount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.quote_amount = 'Valid quote amount is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      await onSave({
        customer_name: formData.customer_name.trim(),
        customer_phone: toE164(formData.customer_phone),
        customer_email: formData.customer_email.trim() || null,
        service_type: formData.service_type,
        quote_amount: parseCurrencyToCents(formData.quote_amount),
        description: formData.description.trim() || null,
        sequence_id: formData.sequence_id || null,
      });
      
      handleClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleClose = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      service_type: '',
      quote_amount: '',
      description: '',
      sequence_id: defaultSequence?.id || '',
    });
    setErrors({});
    onClose();
  };
  
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    
    setFormData({ ...formData, customer_phone: formatted });
  };
  
  const activeSequences = sequences.filter(s => s.is_active);
  
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Quote' : 'Add New Quote'}</SheetTitle>
          <SheetDescription>
            {isEditing 
              ? 'Update the quote details below.' 
              : 'Enter the customer and quote details. The follow-up sequence will start automatically.'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-4">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-name">
              Customer Name *
            </Label>
            <Input
              id="customer-name"
              placeholder="Sarah Williams"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className={errors.customer_name ? 'border-destructive' : ''}
            />
            {errors.customer_name && (
              <p className="text-sm text-destructive">{errors.customer_name}</p>
            )}
          </div>
          
          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-phone">
              Phone Number *
            </Label>
            <Input
              id="customer-phone"
              placeholder="(555) 123-4567"
              value={formData.customer_phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={errors.customer_phone ? 'border-destructive' : ''}
            />
            {errors.customer_phone && (
              <p className="text-sm text-destructive">{errors.customer_phone}</p>
            )}
          </div>
          
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-email">Email (optional)</Label>
            <Input
              id="customer-email"
              type="email"
              placeholder="customer@email.com"
              value={formData.customer_email}
              onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
            />
          </div>
          
          {/* Service Type */}
          <div className="space-y-1.5">
            <Label>
              Service Type *
            </Label>
            <Select
              value={formData.service_type}
              onValueChange={(value) => setFormData({ ...formData, service_type: value })}
            >
              <SelectTrigger className={errors.service_type ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.service_type && (
              <p className="text-sm text-destructive">{errors.service_type}</p>
            )}
          </div>
          
          {/* Quote Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="quote-amount">
              Quote Amount *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="quote-amount"
                type="number"
                step="0.01"
                placeholder="2500"
                value={formData.quote_amount}
                onChange={(e) => setFormData({ ...formData, quote_amount: e.target.value })}
                className={`pl-7 ${errors.quote_amount ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.quote_amount && (
              <p className="text-sm text-destructive">{errors.quote_amount}</p>
            )}
          </div>
          
          {/* Sequence (only for new quotes) */}
          {!isEditing && activeSequences.length > 0 && (
            <div className="space-y-1.5">
              <Label>Follow-Up Sequence</Label>
              <Select
                value={formData.sequence_id}
                onValueChange={(value) => setFormData({ ...formData, sequence_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sequence" />
                </SelectTrigger>
                <SelectContent>
                  {activeSequences.map((seq) => (
                    <SelectItem key={seq.id} value={seq.id}>
                      {seq.name} {seq.is_default && '(Default)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Sequence will start automatically when you add the quote.
              </p>
            </div>
          )}
          
          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Notes (optional)</Label>
            <Textarea
              id="description"
              placeholder="Any additional notes about this quote..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        
        <SheetFooter className="gap-3">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Icon name="spinner" size="md" className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Add Quote'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
