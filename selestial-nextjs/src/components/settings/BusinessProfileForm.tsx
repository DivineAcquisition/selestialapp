import { useState } from 'react';
import { Business, IndustryType } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INDUSTRIES } from '@/lib/constants';
import { formatPhone } from '@/lib/formatters';
import { Building2, Save, Loader2 } from 'lucide-react';

interface BusinessProfileFormProps {
  business: Business;
  onSave: (business: Business) => Promise<void>;
}

export default function BusinessProfileForm({ business, onSave }: BusinessProfileFormProps) {
  const [formData, setFormData] = useState({
    name: business.name,
    owner_name: business.owner_name,
    email: business.email,
    phone: formatPhone(business.phone),
    industry: business.industry,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
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
    
    setFormData({ ...formData, phone: formatted });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await onSave({
        ...business,
        name: formData.name,
        owner_name: formData.owner_name,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''),
        industry: formData.industry,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Business Profile</h3>
          <p className="text-sm text-muted-foreground">Your business information for quotes and messages</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="business-name">Business Name</Label>
            <Input
              id="business-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Johnson Plumbing LLC"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="owner-name">Your Name</Label>
            <Input
              id="owner-name"
              value={formData.owner_name}
              onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              placeholder="Mike Johnson"
            />
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="mike@johnsonplumbing.com"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label>Industry</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => setFormData({ ...formData, industry: value as IndustryType })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            This determines the service type options when adding quotes
          </p>
        </div>
        
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600">Changes saved!</span>
          )}
        </div>
      </form>
    </Card>
  );
}
