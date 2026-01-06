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
  ChevronUp,
  User,
  Phone,
  DollarSign,
  Mail,
  FileText,
  Sparkles
} from 'lucide-react';
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
          <DialogTitle className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            Quick Add Quote
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Success state */}
          {success && (
            <div className="flex flex-col items-center justify-center py-8 animate-scale-in">
              <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <p className="text-lg font-semibold text-foreground">Quote Added!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {addAnother ? 'Ready for the next one' : 'Closing...'}
              </p>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm flex items-start gap-3 animate-fade-in">
              <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}
          
          {/* Form fields */}
          {!success && (
            <>
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="quick-name" className="text-sm font-medium">
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
                  icon={<User className="w-4 h-4" />}
                />
              </div>
              
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="quick-phone" className="text-sm font-medium">
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
                  icon={<Phone className="w-4 h-4" />}
                />
              </div>
              
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="quick-amount" className="text-sm font-medium">
                  Quote Amount <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quick-amount"
                  placeholder="250.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={saving}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  icon={<DollarSign className="w-4 h-4" />}
                />
              </div>
              
              {/* Expandable section toggle */}
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors w-full justify-center py-2 rounded-lg",
                  showMore 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {showMore ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {showMore ? 'Less options' : 'More options'}
              </button>
              
              {showMore && (
                <div className="space-y-4 pt-2 animate-fade-in-up">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="quick-email" className="text-sm font-medium">
                      Email <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="quick-email"
                      type="email"
                      placeholder="sarah@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={saving}
                      icon={<Mail className="w-4 h-4" />}
                    />
                  </div>
                  
                  {/* Service Type */}
                  <div className="space-y-2">
                    <Label htmlFor="quick-service" className="text-sm font-medium">
                      Service Type
                    </Label>
                    <Input
                      id="quick-service"
                      placeholder="Deep Clean"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      disabled={saving}
                      icon={<Sparkles className="w-4 h-4" />}
                    />
                  </div>
                  
                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="quick-notes" className="text-sm font-medium">
                      Notes
                    </Label>
                    <Input
                      id="quick-notes"
                      placeholder="Any notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={saving}
                      icon={<FileText className="w-4 h-4" />}
                    />
                  </div>
                </div>
              )}
              
              {/* Add Another checkbox */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
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
              className="flex-1 h-11"
              disabled={saving}
            >
              {success ? 'Close' : 'Cancel'}
            </Button>
            {!success && (
              <Button
                type="submit"
                variant="gradient"
                className="flex-1 h-11"
                disabled={saving || !isValid()}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Quote
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Keyboard hint */}
          {!success && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
              Press
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/50 font-mono text-[10px]">⌘</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/50 font-mono text-[10px]">↵</kbd>
              to save
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
