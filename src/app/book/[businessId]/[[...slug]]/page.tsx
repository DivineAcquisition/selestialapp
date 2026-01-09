import { Metadata } from 'next';
import { PublicBookingWidget } from '@/components/booking/public-booking-widget';
import { getDefaultConfig, BookingWidgetConfig } from '@/lib/booking/types';
import { supabase } from '@/integrations/supabase/client';

interface PageProps {
  params: Promise<{
    businessId: string;
    slug?: string[];
  }>;
}

// Generate metadata dynamically
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { businessId } = await params;
  
  // In production, fetch business name from database
  const businessName = 'Book Your Cleaning';
  
  return {
    title: `Book Online | ${businessName}`,
    description: 'Schedule your professional cleaning service online. Easy booking, instant confirmation.',
    openGraph: {
      title: `Book Online | ${businessName}`,
      description: 'Schedule your professional cleaning service online.',
      type: 'website',
    },
  };
}

async function getBookingConfig(businessId: string): Promise<BookingWidgetConfig> {
  try {
    // Try to fetch custom config from database
    const { data, error } = await (supabase as any)
      .from('booking_widget_configs')
      .select('*')
      .eq('business_id', businessId)
      .single();
    
    if (data && !error) {
      return data.config as BookingWidgetConfig;
    }
    
    // Fall back to fetching business name for default config
    const { data: business } = await (supabase as any)
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .single();
    
    return getDefaultConfig(businessId, business?.name || 'Professional Cleaning');
  } catch (error) {
    // Return default config on error
    return getDefaultConfig(businessId, 'Professional Cleaning');
  }
}

export default async function PublicBookingPage({ params }: PageProps) {
  const { businessId } = await params;
  
  // Fetch the booking configuration
  const config = await getBookingConfig(businessId);
  
  return (
    <main className="min-h-screen">
      <PublicBookingWidget config={config} />
    </main>
  );
}
