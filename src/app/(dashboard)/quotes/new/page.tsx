"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuotes } from '@/hooks/useQuotes';
import { useCustomers } from '@/hooks/useCustomers';
import { useSequences } from '@/hooks/useSequences';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  FileText,
  Sparkles,
  Loader2,
  Plus,
  X,
  Wand2,
  Calculator,
  Zap,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { TablesInsert } from '@/integrations/supabase/types';

type QuoteInsert = TablesInsert<'quotes'>;

// Service types by industry
const serviceTypesByIndustry: Record<string, string[]> = {
  cleaning: [
    'Deep Clean',
    'Regular Cleaning',
    'Move-Out Clean',
    'Post-Construction',
    'Carpet Cleaning',
    'Window Cleaning',
    'Office Cleaning',
  ],
  landscaping: [
    'Lawn Mowing',
    'Landscape Design',
    'Tree Trimming',
    'Irrigation Installation',
    'Mulching',
    'Leaf Removal',
    'Hardscaping',
  ],
  hvac: [
    'AC Repair',
    'Furnace Repair',
    'HVAC Installation',
    'Duct Cleaning',
    'Maintenance Plan',
    'Thermostat Install',
    'Air Quality Test',
  ],
  plumbing: [
    'Drain Cleaning',
    'Pipe Repair',
    'Water Heater',
    'Faucet Install',
    'Toilet Repair',
    'Sewer Line',
    'Emergency Service',
  ],
  electrical: [
    'Panel Upgrade',
    'Outlet Install',
    'Lighting',
    'Rewiring',
    'Generator Install',
    'EV Charger',
    'Inspection',
  ],
  roofing: [
    'Roof Inspection',
    'Shingle Repair',
    'Full Replacement',
    'Gutter Install',
    'Leak Repair',
    'Skylight Install',
    'Maintenance',
  ],
  other: [
    'General Service',
    'Consultation',
    'Installation',
    'Repair',
    'Maintenance',
    'Emergency',
  ],
};

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NewQuotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { business } = useBusiness();
  const { createQuote, loading: quoteLoading } = useQuotes();
  const { customers } = useCustomers();
  const { sequences } = useSequences();

  // Customer fields
  const [customerMode, setCustomerMode] = useState<'new' | 'existing'>('new');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Quote fields
  const [serviceType, setServiceType] = useState('');
  const [customServiceType, setCustomServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [sequenceId, setSequenceId] = useState('');
  
  // AI pricing
  const [generatingPrice, setGeneratingPrice] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);

  // Get service types based on industry
  const industry = business?.industry || 'other';
  const serviceTypes = serviceTypesByIndustry[industry] || serviceTypesByIndustry.other;

  // Calculate total
  const total = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Default sequence
  useEffect(() => {
    const defaultSeq = sequences.find(s => s.is_default);
    if (defaultSeq && !sequenceId) {
      setSequenceId(defaultSeq.id);
    }
  }, [sequences, sequenceId]);

  // Auto-fill when selecting existing customer
  useEffect(() => {
    if (customerMode === 'existing' && selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone);
        setCustomerEmail(customer.email || '');
        setCustomerAddress(customer.address || '');
      }
    }
  }, [customerMode, selectedCustomerId, customers]);

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleGeneratePrice = async () => {
    if (!serviceType && !customServiceType) {
      toast({ title: 'Please select a service type first', variant: 'destructive' });
      return;
    }

    setGeneratingPrice(true);
    try {
      const response = await fetch('/api/ai/generate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: serviceType || customServiceType,
          description,
          industry: business?.industry,
          businessName: business?.name,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate price');

      const data = await response.json();
      setSuggestedPrice(data.suggestedPrice);
      
      // Update the first line item with the suggested price
      if (lineItems.length > 0) {
        handleLineItemChange(lineItems[0].id, 'unitPrice', data.suggestedPrice / 100);
        handleLineItemChange(lineItems[0].id, 'description', serviceType || customServiceType);
      }
      
      toast({ title: 'Price suggestion generated!' });
    } catch (error) {
      toast({ title: 'Failed to generate price', variant: 'destructive' });
    } finally {
      setGeneratingPrice(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!customerName.trim()) {
      toast({ title: 'Customer name is required', variant: 'destructive' });
      return;
    }
    if (!customerPhone.trim()) {
      toast({ title: 'Customer phone is required', variant: 'destructive' });
      return;
    }
    if (!serviceType && !customServiceType) {
      toast({ title: 'Service type is required', variant: 'destructive' });
      return;
    }
    if (total <= 0) {
      toast({ title: 'Quote amount must be greater than 0', variant: 'destructive' });
      return;
    }

    try {
      const quote: Omit<QuoteInsert, 'business_id'> = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        service_type: serviceType || customServiceType,
        quote_amount: Math.round(total * 100), // Convert to cents
        description: description || null,
        sequence_id: sequenceId || null,
        status: 'new',
      };

      const { error } = await createQuote(quote);

      if (error) throw error;

      toast({ 
        title: 'Quote created!',
        description: 'Follow-up sequence will start automatically.' 
      });
      router.push('/quotes');
    } catch (err) {
      toast({ 
        title: 'Failed to create quote', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive' 
      });
    }
  };

  return (
    <Layout title="New Quote">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Create New Quote</h1>
              <p className="text-sm text-muted-foreground">
                Add customer details and pricing
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-primary">
            <Zap className="h-3 w-3 mr-1" />
            Auto-follow-up enabled
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Customer Information
                </h2>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setCustomerMode('new')}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors rounded-l-lg",
                      customerMode === 'new' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    New Customer
                  </button>
                  <button
                    onClick={() => setCustomerMode('existing')}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors rounded-r-lg",
                      customerMode === 'existing' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Existing
                  </button>
                </div>
              </div>

              {customerMode === 'existing' && (
                <div className="mb-4">
                  <Label>Select Customer</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Search customers..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Name *</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Smith"
                      className="pl-9"
                      disabled={customerMode === 'existing' && !!selectedCustomerId}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="customerPhone">Phone *</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="pl-9"
                      disabled={customerMode === 'existing' && !!selectedCustomerId}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="john@email.com"
                      className="pl-9"
                      disabled={customerMode === 'existing' && !!selectedCustomerId}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="customerAddress">Address</Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customerAddress"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="123 Main St, City"
                      className="pl-9"
                      disabled={customerMode === 'existing' && !!selectedCustomerId}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Service Section */}
            <Card className="p-6">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-primary" />
                Service Details
              </h2>

              <div className="space-y-4">
                <div>
                  <Label>Service Type *</Label>
                  <Select value={serviceType} onValueChange={(value) => {
                    setServiceType(value);
                    if (value !== 'custom') setCustomServiceType('');
                  }}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">+ Custom Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {serviceType === 'custom' && (
                  <div>
                    <Label>Custom Service Name</Label>
                    <Input
                      value={customServiceType}
                      onChange={(e) => setCustomServiceType(e.target.value)}
                      placeholder="Enter custom service type"
                      className="mt-1.5"
                    />
                  </div>
                )}

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of the work..."
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </Card>

            {/* Pricing Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  Pricing
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePrice}
                  disabled={generatingPrice || (!serviceType && !customServiceType)}
                  className="gap-2"
                >
                  {generatingPrice ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Wand2 className="h-3 w-3" />
                  )}
                  AI Suggest Price
                </Button>
              </div>

              {suggestedPrice && (
                <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    AI suggested price: <strong>${(suggestedPrice / 100).toFixed(2)}</strong>
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        value={item.description}
                        onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                      />
                    </div>
                    <div className="w-28 relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice || ''}
                        onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                    <div className="w-24 text-right font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                    {lineItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLineItem(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAddLineItem}
                className="mt-3 gap-2"
              >
                <Plus className="h-3 w-3" />
                Add Line Item
              </Button>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sequence Selection */}
            <Card className="p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-primary" />
                Follow-up Sequence
              </h3>
              
              <Select value={sequenceId} onValueChange={setSequenceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sequence" />
                </SelectTrigger>
                <SelectContent>
                  {sequences.filter(s => s.is_active).map((seq) => (
                    <SelectItem key={seq.id} value={seq.id}>
                      {seq.name}
                      {seq.is_default && ' (Default)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground mt-2">
                The sequence will start automatically when you create this quote.
              </p>
            </Card>

            {/* Quick Tips */}
            <Card className="p-6 bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-primary" />
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Add accurate phone numbers for SMS follow-ups</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Use AI to suggest competitive pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Detailed descriptions help AI personalize messages</span>
                </li>
              </ul>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleSubmit}
                disabled={quoteLoading}
              >
                {quoteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Create Quote
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
