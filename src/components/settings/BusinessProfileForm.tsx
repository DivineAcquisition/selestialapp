"use client";

import { useState } from 'react';
import { Business, IndustryType } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleForm as Form } from '@/components/ui/form';
import { Field, FieldLabel, FieldError, FieldDescription, FieldGroup } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INDUSTRIES } from '@/lib/constants';
import { formatPhone } from '@/lib/formatters';
import { Icon } from '@/components/ui/icon';

interface BusinessProfileFormProps {
  business: Business;
  onSave: (business: Business) => Promise<void>;
}

export default function BusinessProfileForm({ business, onSave }: BusinessProfileFormProps) {
  const [industry, setIndustry] = useState<IndustryType>(business.industry);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get('businessName') as string;
    const ownerName = formData.get('ownerName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!name?.trim()) newErrors.businessName = 'Business name is required';
    if (!ownerName?.trim()) newErrors.ownerName = 'Your name is required';
    if (!email?.trim()) newErrors.email = 'Email is required';
    if (!phone || phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Valid phone required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setSaving(true);
    setErrors({});
    
    try {
      await onSave({
        ...business,
        name: name.trim(),
        owner_name: ownerName.trim(),
        email: email.trim(),
        phone: phone.replace(/\D/g, ''),
        industry: industry,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Card className="card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon name="building" size="lg" className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Business Profile</h3>
          <p className="text-sm text-gray-500">Your business information for quotes and messages</p>
        </div>
      </div>
      
      <Form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field name="businessName">
            <FieldLabel required>Business Name</FieldLabel>
            <div className="relative">
              <Icon name="building" size="md" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                name="businessName"
                defaultValue={business.name}
                placeholder="Johnson Plumbing LLC"
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            <FieldError show={!!errors.businessName}>{errors.businessName}</FieldError>
          </Field>
          
          <Field name="ownerName">
            <FieldLabel required>Your Name</FieldLabel>
            <div className="relative">
              <Icon name="user" size="md" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                name="ownerName"
                defaultValue={business.owner_name}
                placeholder="Mike Johnson"
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            <FieldError show={!!errors.ownerName}>{errors.ownerName}</FieldError>
          </Field>
        </FieldGroup>
        
        <FieldGroup className="mt-4">
          <Field name="email">
            <FieldLabel required>Email</FieldLabel>
            <div className="relative">
              <Icon name="email" size="md" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                name="email"
                type="email"
                defaultValue={business.email}
                placeholder="mike@johnsonplumbing.com"
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            <FieldError show={!!errors.email}>{errors.email}</FieldError>
          </Field>
          
          <Field name="phone">
            <FieldLabel required>Phone Number</FieldLabel>
            <div className="relative">
              <Icon name="phone" size="md" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                name="phone"
                type="tel"
                defaultValue={formatPhone(business.phone)}
                placeholder="(555) 123-4567"
                onChange={(e) => {
                  e.target.value = formatPhoneInput(e.target.value);
                }}
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            <FieldError show={!!errors.phone}>{errors.phone}</FieldError>
          </Field>
        </FieldGroup>
        
        <Field name="industry" className="mt-4">
          <FieldLabel required>Industry</FieldLabel>
          <Select value={industry} onValueChange={(value) => setIndustry(value as IndustryType)}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind.value} value={ind.value}>
                  {ind.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            This determines the service type options when adding quotes
          </FieldDescription>
        </Field>
        
        <div className="flex items-center gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={saving} 
            className="h-11 gap-2 rounded-xl bg-gradient-to-r from-primary to-[#9D96FF]"
          >
            {saving ? (
              <Icon name="spinner" size="md" className="animate-spin" />
            ) : (
              <Icon name="save" size="md" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600 font-medium">✓ Changes saved!</span>
          )}
        </div>
      </Form>
    </Card>
  );
}
