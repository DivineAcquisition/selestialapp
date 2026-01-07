"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form } from '@/components/ui/form';
import { Field, FieldLabel, FieldError, FieldDescription, FieldGroup } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icon } from '@/components/ui/icon';
import { useQuotes } from '@/hooks/useQuotes';
import { useCustomers } from '@/hooks/useCustomers';
import { useSequences } from '@/hooks/useSequences';
import { useBusiness } from '@/contexts/BusinessContext';
import { usePricingWizard } from '@/hooks/usePricingWizard';
import { useToast } from '@/hooks/use-toast';
import { toE164 } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { TablesInsert } from '@/integrations/supabase/types';

type QuoteInsert = TablesInsert<'quotes'>;

// Service types by industry
const serviceTypesByIndustry: Record<string, string[]> = {
  cleaning: ['Deep Clean', 'Regular Cleaning', 'Move-Out Clean', 'Post-Construction', 'Carpet Cleaning', 'Window Cleaning', 'Office Cleaning'],
  landscaping: ['Lawn Mowing', 'Landscape Design', 'Tree Trimming', 'Irrigation Installation', 'Mulching', 'Leaf Removal', 'Hardscaping'],
  hvac: ['AC Repair', 'Furnace Repair', 'HVAC Installation', 'Duct Cleaning', 'Maintenance Plan', 'Thermostat Install', 'Air Quality Test'],
  plumbing: ['Drain Cleaning', 'Pipe Repair', 'Water Heater', 'Faucet Install', 'Toilet Repair', 'Sewer Line', 'Emergency Service'],
  electrical: ['Panel Upgrade', 'Outlet Install', 'Lighting', 'Rewiring', 'Generator Install', 'EV Charger', 'Inspection'],
  roofing: ['Roof Inspection', 'Shingle Repair', 'Full Replacement', 'Gutter Install', 'Leak Repair', 'Skylight Install', 'Maintenance'],
  other: ['General Service', 'Consultation', 'Installation', 'Repair', 'Maintenance', 'Emergency'],
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
  const { 
    config: wizardConfig, 
    isConfigured: isWizardConfigured, 
    hourlyRate: wizardHourlyRate,
    jobPrice: wizardJobPrice,
    isLoaded: isWizardLoaded,
  } = usePricingWizard();

  // Form state
  const [customerMode, setCustomerMode] = useState<'new' | 'existing'>('new');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [sequenceId, setSequenceId] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
    if (!serviceType) {
      toast({ title: 'Please select a service type first', variant: 'destructive' });
      return;
    }

    setGeneratingPrice(true);
    try {
      const response = await fetch('/api/ai/generate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
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
        handleLineItemChange(lineItems[0].id, 'description', serviceType);
      }
      
      toast({ title: 'Price suggestion generated!' });
    } catch {
      toast({ title: 'Failed to generate price', variant: 'destructive' });
    } finally {
      setGeneratingPrice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const customerName = formData.get('customerName') as string;
    const customerPhone = formData.get('customerPhone') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const description = formData.get('description') as string;

    // Validation
    const newErrors: Record<string, string> = {};
    if (!customerName?.trim()) newErrors.customerName = 'Customer name is required';
    if (!customerPhone?.trim()) newErrors.customerPhone = 'Phone number is required';
    if (!serviceType) newErrors.serviceType = 'Service type is required';
    if (total <= 0) newErrors.total = 'Quote amount must be greater than 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const quote: Omit<QuoteInsert, 'business_id'> = {
        customer_name: customerName.trim(),
        customer_phone: toE164(customerPhone),
        customer_email: customerEmail?.trim() || null,
        service_type: serviceType,
        quote_amount: Math.round(total * 100),
        description: description?.trim() || null,
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

  // Auto-fill when selecting existing customer
  useEffect(() => {
    if (customerMode === 'existing' && selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        const nameInput = document.querySelector('input[name="customerName"]') as HTMLInputElement;
        const phoneInput = document.querySelector('input[name="customerPhone"]') as HTMLInputElement;
        const emailInput = document.querySelector('input[name="customerEmail"]') as HTMLInputElement;
        
        if (nameInput) nameInput.value = customer.name;
        if (phoneInput) phoneInput.value = customer.phone;
        if (emailInput && customer.email) emailInput.value = customer.email;
      }
    }
  }, [customerMode, selectedCustomerId, customers]);

  return (
    <Layout title="New Quote">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
              <Icon name="arrowLeft" size="lg" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Create New Quote</h1>
              <p className="text-sm text-gray-500">Add customer details and pricing</p>
            </div>
          </div>
          <Badge variant="outline" className="text-primary border-primary/30 rounded-lg">
            <Icon name="bolt" size="xs" className="mr-1" />
            Auto-follow-up enabled
          </Badge>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Section */}
              <Card className="card-elevated p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Icon name="user" size="sm" className="text-primary" />
                    Customer Information
                  </h2>
                  <div className="flex items-center border rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setCustomerMode('new')}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium transition-colors",
                        customerMode === 'new' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      New Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerMode('existing')}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium transition-colors",
                        customerMode === 'existing' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      Existing
                    </button>
                  </div>
                </div>

                {customerMode === 'existing' && (
                  <div className="mb-4">
                    <Field name="existingCustomer">
                      <FieldLabel>Select Customer</FieldLabel>
                      <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                        <SelectTrigger className="rounded-xl h-11">
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
                    </Field>
                  </div>
                )}

                <FieldGroup>
                  <Field name="customerName">
                    <FieldLabel required>Name</FieldLabel>
                    <div className="relative">
                      <Icon name="user" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        name="customerName"
                        placeholder="John Smith"
                        className="pl-10 h-11 rounded-xl"
                        disabled={customerMode === 'existing' && !!selectedCustomerId}
                      />
                    </div>
                    <FieldError show={!!errors.customerName}>{errors.customerName}</FieldError>
                  </Field>
                  
                  <Field name="customerPhone">
                    <FieldLabel required>Phone</FieldLabel>
                    <div className="relative">
                      <Icon name="phone" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        name="customerPhone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="pl-10 h-11 rounded-xl"
                        disabled={customerMode === 'existing' && !!selectedCustomerId}
                        onChange={(e) => {
                          e.target.value = formatPhoneInput(e.target.value);
                        }}
                      />
                    </div>
                    <FieldError show={!!errors.customerPhone}>{errors.customerPhone}</FieldError>
                  </Field>
                </FieldGroup>
                
                <FieldGroup className="mt-4">
                  <Field name="customerEmail">
                    <FieldLabel>Email</FieldLabel>
                    <div className="relative">
                      <Icon name="email" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        name="customerEmail"
                        type="email"
                        placeholder="john@email.com"
                        className="pl-10 h-11 rounded-xl"
                        disabled={customerMode === 'existing' && !!selectedCustomerId}
                      />
                    </div>
                  </Field>
                  
                  <Field name="customerAddress">
                    <FieldLabel>Address</FieldLabel>
                    <div className="relative">
                      <Icon name="mapPin" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        name="customerAddress"
                        placeholder="123 Main St, City"
                        className="pl-10 h-11 rounded-xl"
                        disabled={customerMode === 'existing' && !!selectedCustomerId}
                      />
                    </div>
                  </Field>
                </FieldGroup>
              </Card>

              {/* Service Section */}
              <Card className="card-elevated p-6 rounded-2xl">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Icon name="fileText" size="sm" className="text-primary" />
                  Service Details
                </h2>

                <div className="space-y-4">
                  <Field name="serviceType">
                    <FieldLabel required>Service Type</FieldLabel>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger className="rounded-xl h-11">
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
                    <FieldError show={!!errors.serviceType}>{errors.serviceType}</FieldError>
                  </Field>

                  <Field name="description">
                    <FieldLabel>Description</FieldLabel>
                    <FieldDescription>Detailed description helps AI personalize messages</FieldDescription>
                    <Textarea
                      name="description"
                      placeholder="Detailed description of the work..."
                      rows={3}
                      className="rounded-xl"
                    />
                  </Field>
                </div>
              </Card>

              {/* Pricing Section */}
              <Card className="card-elevated p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Icon name="calculator" size="sm" className="text-primary" />
                    Pricing
                  </h2>
                  <div className="flex items-center gap-2">
                    {isWizardConfigured && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (lineItems.length > 0 && wizardJobPrice > 0) {
                            handleLineItemChange(lineItems[0].id, 'unitPrice', wizardJobPrice);
                            handleLineItemChange(lineItems[0].id, 'description', serviceType || 'Service');
                            toast({ title: `Applied wizard price: $${wizardJobPrice.toFixed(0)}` });
                          }
                        }}
                        disabled={!wizardJobPrice}
                        className="gap-2 rounded-xl"
                      >
                        <Icon name="wand" size="xs" />
                        Use Wizard Price
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGeneratePrice}
                      disabled={generatingPrice || !serviceType}
                      className="gap-2 rounded-xl"
                    >
                      {generatingPrice ? (
                        <Icon name="spinner" size="xs" className="animate-spin" />
                      ) : (
                        <Icon name="sparkles" size="xs" />
                      )}
                      AI Suggest
                    </Button>
                  </div>
                </div>

                {/* Wizard Price Reference */}
                {isWizardConfigured && wizardJobPrice > 0 && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="wand" size="sm" className="text-emerald-600" />
                      <span className="text-sm text-emerald-700">
                        Wizard price: <strong>${wizardJobPrice.toFixed(0)}</strong> ({wizardConfig.targetMargin}% margin)
                      </span>
                    </div>
                    <Link href="/pricing/wizard" className="text-xs text-emerald-600 hover:underline">
                      Edit wizard
                    </Link>
                  </div>
                )}

                {suggestedPrice && (
                  <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2">
                    <Icon name="sparkles" size="sm" className="text-primary" />
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
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          placeholder="Qty"
                          className="h-11 rounded-xl text-center"
                        />
                      </div>
                      <div className="w-28 relative">
                        <Icon name="dollarSign" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice || ''}
                          onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="pl-8 h-11 rounded-xl"
                        />
                      </div>
                      <div className="w-24 text-right font-medium text-gray-900">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                      {lineItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="text-gray-400 hover:text-red-500 rounded-xl"
                        >
                          <Icon name="close" size="sm" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLineItem}
                  className="mt-3 gap-2 rounded-xl"
                >
                  <Icon name="plus" size="xs" />
                  Add Line Item
                </Button>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>
                {errors.total && (
                  <p className="text-xs font-medium text-destructive flex items-center gap-1.5 mt-2">
                    <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.total}
                  </p>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sequence Selection */}
              <Card className="card-elevated p-6 rounded-2xl">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Icon name="bolt" size="sm" className="text-primary" />
                  Follow-up Sequence
                </h3>
                
                <Field name="sequence">
                  <Select value={sequenceId} onValueChange={setSequenceId}>
                    <SelectTrigger className="rounded-xl h-11">
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
                  <FieldDescription>
                    The sequence will start automatically when you create this quote.
                  </FieldDescription>
                </Field>
              </Card>

              {/* Pricing Wizard Status */}
              {isWizardLoaded && (
                isWizardConfigured ? (
                  <Card className="card-elevated p-4 rounded-2xl border-emerald-200 bg-emerald-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="checkCircle" size="sm" className="text-emerald-600" />
                      <h3 className="font-semibold text-emerald-800 text-sm">Pricing Wizard Active</h3>
                    </div>
                    <div className="space-y-1 text-xs text-emerald-700">
                      <p>Target: ${wizardHourlyRate.toFixed(0)}/hr</p>
                      <p>Job price: ${wizardJobPrice.toFixed(0)}</p>
                      <p>Margin: {wizardConfig.targetMargin}%</p>
                    </div>
                    <Link href="/pricing/wizard" className="text-xs text-emerald-600 hover:underline mt-2 block">
                      Edit settings →
                    </Link>
                  </Card>
                ) : (
                  <Card className="card-elevated p-4 rounded-2xl border-dashed border-2 border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="wand" size="sm" className="text-primary" />
                      <h3 className="font-semibold text-sm">Set Up Pricing Wizard</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Configure your costs and margins for smarter pricing suggestions
                    </p>
                    <Link href="/pricing/wizard">
                      <Button variant="outline" size="sm" className="w-full gap-2 rounded-xl border-primary/30 hover:bg-primary/10">
                        <Icon name="arrowRight" size="xs" />
                        Configure Now
                      </Button>
                    </Link>
                  </Card>
                )
              )}

              {/* Quick Tips */}
              <Card className="card-elevated p-6 rounded-2xl bg-gray-50/50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <Icon name="info" size="sm" className="text-primary" />
                  Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Icon name="checkCircle" size="sm" className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Add accurate phone numbers for SMS follow-ups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="checkCircle" size="sm" className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Use AI to suggest competitive pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="checkCircle" size="sm" className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Detailed descriptions help AI personalize messages</span>
                  </li>
                </ul>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-12 gap-2 rounded-xl bg-gradient-to-r from-primary to-[#9D96FF]"
                  size="lg"
                  disabled={quoteLoading}
                >
                  {quoteLoading ? (
                    <Icon name="spinner" size="sm" className="animate-spin" />
                  ) : (
                    <Icon name="checkCircle" size="sm" />
                  )}
                  Create Quote
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </Layout>
  );
}
