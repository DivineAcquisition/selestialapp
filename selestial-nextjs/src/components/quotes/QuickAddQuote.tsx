import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuotes } from '@/hooks/useQuotes';
import { useSequences } from '@/hooks/useSequences';
import { toE164, parseCurrencyToCents } from '@/lib/formatters';
import { 
  Plus, 
  Loader2, 
  Check, 
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface QuickAddQuoteProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QuickAddQuote({ open, onClose, onSuccess }: QuickAddQuoteProps) {
  const { createQuote } = useQuotes();
  const { sequences } = useSequences();
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Core fields (always visible)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  
  // Optional fields (expandable)
  const [showMore, setShowMore] = useState(false);
  const [email, setEmail] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');
  
  // State
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setName('');
    setPhone('');
    setAmount('');
    setEmail('');
    setServiceType('');
    setNotes('');
    setShowMore(false);
    setError(null);
    setSuccess(false);
  };
  
  // Handle close
  const handleClose = () => {
    resetForm();
    setAddAnother(false);
    onClose();
  };
  
  // Phone formatting
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
    
    setPhone(formatted);
  };
  
  // Validate
  const isValid = () => {
    if (!name.trim()) return false;
    if (phone.replace(/\D/g, '').length < 10) return false;
    if (!amount || parseFloat(amount) <= 0) return false;
    return true;
  };
  
  // Submit
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!isValid()) {
      setError('Please fill in name, phone, and amount');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const { error: createError } = await createQuote({
        customer_name: name.trim(),
        customer_phone: toE164(phone),
        customer_email: email.trim() || null,
        service_type: serviceType.trim() || 'General Service',
        quote_amount: parseCurrencyToCents(amount),
        description: notes.trim() || null,
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
      setError(err instanceof Error ? err.message : 'Failed to add quote');
    } finally {
      setSaving(false);
    }
  };
  
  // Keyboard shortcut: Cmd/Ctrl + Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Add Quote
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Success state */}
          {success && (
            <div className="flex items-center justify-center py-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}
          
          {/* Form fields */}
          {!success && (
            <>
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="quick-name" className="text-sm">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  ref={nameInputRef}
                  id="quick-name"
                  placeholder="Sarah Williams"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  autoComplete="off"
                />
              </div>
              
              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="quick-phone" className="text-sm">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quick-phone"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  disabled={saving}
                  type="tel"
                  autoComplete="off"
                />
              </div>
              
              {/* Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="quick-amount" className="text-sm">
                  Quote Amount <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="quick-amount"
                    placeholder="250"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={saving}
                    className="pl-7"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                  />
                </div>
              </div>
              
              {/* Expandable section */}
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showMore ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {showMore ? 'Less options' : 'More options'}
              </button>
              
              {showMore && (
                <div className="space-y-4 pt-2 border-t border-border">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="quick-email" className="text-sm">
                      Email (optional)
                    </Label>
                    <Input
                      id="quick-email"
                      type="email"
                      placeholder="sarah@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  
                  {/* Service Type */}
                  <div className="space-y-1.5">
                    <Label htmlFor="quick-service" className="text-sm">
                      Service Type
                    </Label>
                    <Input
                      id="quick-service"
                      placeholder="Deep Clean"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  
                  {/* Notes */}
                  <div className="space-y-1.5">
                    <Label htmlFor="quick-notes" className="text-sm">
                      Notes
                    </Label>
                    <Input
                      id="quick-notes"
                      placeholder="Any notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                </div>
              )}
              
              {/* Add Another checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="add-another"
                  checked={addAnother}
                  onCheckedChange={(checked) => setAddAnother(checked === true)}
                />
                <Label htmlFor="add-another" className="text-sm text-muted-foreground cursor-pointer">
                  Add another after saving
                </Label>
              </div>
            </>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={saving}
            >
              {success ? 'Close' : 'Cancel'}
            </Button>
            {!success && (
              <Button
                type="submit"
                className="flex-1"
                disabled={saving || !isValid()}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Quote
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Keyboard hint */}
          {!success && (
            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground">Enter</kbd> to save
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
