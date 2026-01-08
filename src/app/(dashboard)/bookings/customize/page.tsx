'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceAreaManager } from '@/components/admin/booking/service-area-manager';
import { PricingModelEditor } from '@/components/admin/booking/pricing-model-editor';
import { PromotionManager } from '@/components/admin/booking/promotion-manager';
import { BrandingEditor } from '@/components/admin/booking/branding-editor';
import Layout from '@/components/layout/Layout';
import { Icon } from '@/components/ui/icon';
import { useBusiness } from '@/contexts/BusinessContext';

export default function BookingCustomizePage() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);
  const [serviceTypes, setServiceTypes] = React.useState<any[]>([]);
  const { business } = useBusiness();
  
  const businessId = business?.id || '';

  React.useEffect(() => {
    // Fetch customization data
    async function loadData() {
      if (!businessId) return;
      
      try {
        // Get service types
        const servicesRes = await fetch(`/api/booking/${businessId}/config`);
        const config = await servicesRes.json();
        setServiceTypes(config.serviceTypes || []);

        // Get customization
        const customRes = await fetch(`/api/booking/${businessId}/customization`);
        const customization = await customRes.json();
        setData(customization);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [businessId]);

  const saveCustomization = async (type: string, newData: any) => {
    await fetch(`/api/booking/${businessId}/customization`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data: newData }),
    });
  };

  if (loading) {
    return (
      <Layout title="Booking Customization">
        <div className="flex items-center justify-center min-h-[400px]">
          <Icon name="spinner" size="2xl" className="animate-spin text-violet-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Booking Customization">
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Booking Widget Customization</h1>
          <p className="text-muted-foreground">
            Customize every aspect of your booking experience
          </p>
        </div>

        <Tabs defaultValue="areas" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="areas" className="flex items-center gap-2">
              <Icon name="mapPin" size="sm" />
              Service Areas
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Icon name="calculator" size="sm" />
              Pricing Model
            </TabsTrigger>
            <TabsTrigger value="promos" className="flex items-center gap-2">
              <Icon name="tag" size="sm" />
              Promotions
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Icon name="palette" size="sm" />
              Branding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="areas">
            <ServiceAreaManager
              businessId={businessId}
              areas={data?.service_areas || []}
              onSave={(areas) => saveCustomization('service_areas', areas)}
            />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingModelEditor
              businessId={businessId}
              model={data?.pricing_model || {}}
              serviceTypes={serviceTypes}
              onSave={(model) => saveCustomization('pricing_model', model)}
            />
          </TabsContent>

          <TabsContent value="promos">
            <PromotionManager
              businessId={businessId}
              promotions={data?.promotions || []}
              serviceTypes={serviceTypes}
              onSave={(promos) => saveCustomization('promotions', promos)}
            />
          </TabsContent>

          <TabsContent value="branding">
            <BrandingEditor
              businessId={businessId}
              branding={data?.branding || {}}
              onSave={(branding) => saveCustomization('branding', branding)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
