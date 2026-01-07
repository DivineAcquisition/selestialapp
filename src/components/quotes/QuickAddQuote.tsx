"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuotes } from '@/hooks/useQuotes';
import { useSequences } from '@/hooks/useSequences';
import { toE164, parseCurrencyToCents } from '@/lib/formatters';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface QuickAddQuoteProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QuickAddQuote({ open, onClose, onSuccess }: QuickAddQuoteProps) {
  const { createQuote } = useQuotes();
  const { sequences } = useSequences();
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addAnother, setAddAnother] = useState(false);
  
  // Get default sequence
  const defaultSequence = sequences.find(s => s.is_default);
  
  // Focus name input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [open]);
  
  // Reset form
  const resetForm = () => {
    setShowMore(false);
    setErrors({});
    setSuccess(false);
    // Reset form fields by resetting the form element
    const form = document.getElementById('quick-add-quote-form') as HTMLFormElement;
    if (form) form.reset();
  };
  
  // Handle close
  const handleClose = () => {
    resetForm();
    setAddAnother(false);
    onClose();
  };
  
  // Phone formatting helper
  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    
    return formatted;
  };
  
  // Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const amount = formData.get('amount') as string;
    const email = formData.get('email') as string;
    const serviceType = formData.get('serviceType') as string;
    const notes = formData.get('notes') as string;
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!name?.trim()) newErrors.name = 'Customer name is required';
    if (!phone || phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Valid phone number required';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setSaving(true);
    setErrors({});
    
    try {
      const { error: createError } = await createQuote({
        customer_name: name.trim(),
        customer_phone: toE164(phone),
        customer_email: email?.trim() || null,
        service_type: serviceType?.trim() || 'General Service',
        quote_amount: parseCurrencyToCents(amount),
        description: notes?.trim() || null,
        sequence_id: defaultSequence?.id || null,
        status: 'new',
      });
      
      if (createError) throw createError;
      
      setSuccess(true);
      onSuccess?.();
      
      // If "Add Another" is checked, reset and stay open
      if (addAnother) {
        setTimeout(() => {
          resetForm();
          nameInputRef.current?.focus();
        }, 500);
      } else {
        setTimeout(() => {
          handleClose();
        }, 800);
      }
      
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to add quote' });
    } finally {
      setSaving(false);
    }
  };
  
  // Keyboard shortcut: Cmd/Ctrl + Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      const form = document.getElementById('quick-add-quote-form') as HTMLFormElement;
      if (form) form.requestSubmit();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md rounded-2xl"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-[#9D96FF]/20">
              <Icon name="bolt" size="lg" className="text-primary" />
            </div>
            Quick Add Quote
          </DialogTitle>
        </DialogHeader>
        
        {/* Success state */}
        {success && (
          <div className="flex flex-col items-center justify-center py-8 animate-scale-fade">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <Icon name="check" size="2xl" className="text-emerald-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">Quote Added!</p>
            <p className="text-sm text-gray-500 mt-1">
              {addAnother ? 'Ready for the next one' : 'Closing...'}
            </p>
          </div>
        )}
        
        {/* Error */}
        {errors.form && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3 animate-fade-in">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold">!</span>
            </div>
            {errors.form}
          </div>
        )}
        
        {/* Form */}
        {!success && (
          <Form id="quick-add-quote-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <Field name="name">
              <FieldLabel required>Customer Name</FieldLabel>
              <div className="relative">
                <Icon name="user" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  ref={nameInputRef}
                  name="name"
                  placeholder="Sarah Williams"
                  disabled={saving}
                  autoComplete="off"
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              <FieldError show={!!errors.name}>{errors.name}</FieldError>
            </Field>
            
            {/* Phone */}
            <Field name="phone">
              <FieldLabel required>Phone</FieldLabel>
              <div className="relative">
                <Icon name="phone" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  name="phone"
                  placeholder="(555) 123-4567"
                  disabled={saving}
                  type="tel"
                  autoComplete="off"
                  onChange={(e) => {
                    e.target.value = formatPhoneInput(e.target.value);
                  }}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              <FieldError show={!!errors.phone}>{errors.phone}</FieldError>
            </Field>
            
            {/* Amount */}
            <Field name="amount">
              <FieldLabel required>Quote Amount</FieldLabel>
              <div className="relative">
                <Icon name="dollar" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  name="amount"
                  placeholder="250.00"
                  disabled={saving}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              <FieldError show={!!errors.amount}>{errors.amount}</FieldError>
            </Field>
            
            {/* Expandable section toggle */}
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors w-full justify-center py-2 rounded-xl",
                showMore 
                  ? "text-primary bg-primary/5" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon name={showMore ? "chevronUp" : "chevronDown"} size="sm" />
              {showMore ? 'Less options' : 'More options'}
            </button>
            
            {showMore && (
              <div className="space-y-4 pt-2 animate-fade-in">
                {/* Email */}
                <Field name="email">
                  <FieldLabel>Email</FieldLabel>
                  <FieldDescription>Optional - for email notifications</FieldDescription>
                  <div className="relative">
                    <Icon name="email" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="sarah@email.com"
                      disabled={saving}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </Field>
                
                {/* Service Type */}
                <Field name="serviceType">
                  <FieldLabel>Service Type</FieldLabel>
                  <div className="relative">
                    <Icon name="fileText" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      name="serviceType"
                      placeholder="Deep Clean"
                      disabled={saving}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </Field>
                
                {/* Notes */}
                <Field name="notes">
                  <FieldLabel>Notes</FieldLabel>
                  <Input
                    name="notes"
                    placeholder="Any notes..."
                    disabled={saving}
                    className="h-11 rounded-xl"
                  />
                </Field>
              </div>
            )}
            
            {/* Add Another checkbox */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200/50">
              <Checkbox
                id="add-another"
                checked={addAnother}
                onCheckedChange={(checked) => setAddAnother(checked === true)}
              />
              <label htmlFor="add-another" className="text-sm text-gray-600 cursor-pointer">
                Add another after saving
              </label>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-11 rounded-xl"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary to-[#9D96FF]"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Icon name="spinner" size="sm" className="animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Icon name="plus" size="sm" className="mr-2" />
                    Add Quote
                  </>
                )}
              </Button>
            </div>
            
            {/* Keyboard hint */}
            <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
              Press
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono text-[10px]">⌘</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono text-[10px]">↵</kbd>
              to save
            </p>
          </Form>
        )}
        
        {/* Success state actions */}
        {success && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11 rounded-xl"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
