"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth, useBusiness } from '@/providers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const industries = [
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'painting', label: 'Painting' },
  { value: 'moving', label: 'Moving Services' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'pool_service', label: 'Pool Service' },
  { value: 'other', label: 'Other' },
];

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (AZ)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AK)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HI)' },
];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { business, updateBusiness, loading: businessLoading } = useBusiness();
  
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    website: '',
    industry: 'cleaning',
    timezone: 'America/New_York',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    if (business) {
      setFormData({
        businessName: business.name || '',
        ownerName: business.owner_name || '',
        email: business.email || '',
        phone: business.phone || '',
        website: (business as any).website || '',
        industry: business.industry || 'cleaning',
        timezone: business.timezone || 'America/New_York',
        address: (business as any).address || '',
        city: (business as any).city || '',
        state: (business as any).state || '',
        zipCode: (business as any).zip_code || '',
      });
    }
  }, [business]);

  const handleSave = async () => {
    if (!business) return;
    
    setSaving(true);
    try {
      await updateBusiness({
        name: formData.businessName,
        owner_name: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        industry: formData.industry,
        timezone: formData.timezone,
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your business profile has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error saving profile',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (businessLoading) {
    return (
      <Layout title="Profile Settings">
        <div className="flex items-center justify-center py-20">
          <Icon name="spinner" size="2xl" className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/settings')}
              className="rounded-xl"
            >
              <Icon name="arrowLeft" size="lg" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-500">Manage your business information</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 rounded-xl ring-2 ring-white/30"
          >
            {saving ? (
              <>
                <Icon name="spinner" size="sm" className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon name="check" size="sm" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Profile Picture */}
        <Card className="p-6 rounded-2xl ring-1 ring-white/50">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-[#9D96FF] flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg">
                {formData.businessName.charAt(0) || 'B'}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                <Icon name="camera" size="sm" className="text-gray-600" />
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{formData.businessName || 'Your Business'}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-0">
                <Icon name="verified" size="xs" className="mr-1" />
                Verified
              </Badge>
            </div>
          </div>
        </Card>

        {/* Business Information */}
        <Card className="p-6 rounded-2xl ring-1 ring-white/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Icon name="building" size="lg" className="text-primary" />
            Business Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Acme Cleaning Co."
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                placeholder="John Smith"
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="hello@acmecleaning.com"
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Business Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://www.acmecleaning.com"
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6 rounded-2xl ring-1 ring-white/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Icon name="mapPin" size="lg" className="text-primary" />
            Location
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main Street"
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Los Angeles"
                className="rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="CA"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="90210"
                  className="rounded-xl"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Account Info */}
        <Card className="p-6 rounded-2xl bg-gray-50 ring-1 ring-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="shield" size="lg" className="text-gray-600" />
            Account
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Account created on {business?.created_at ? new Date(business.created_at).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Business ID: {business?.id?.slice(0, 8)}...
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/settings')}
              className="rounded-xl"
            >
              <Icon name="settings" size="sm" className="mr-2" />
              More Settings
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
