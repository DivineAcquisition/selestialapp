import { Metadata } from 'next';
import { PublicBookingWidget } from '@/components/booking/public-booking-widget';
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

async function getBookingConfig(businessId: string) {
  try {
    // Try to fetch custom config from database
    const { data, error } = await (supabase as any)
      .from('booking_widget_configs')
      .select('*')
      .eq('business_id', businessId)
      .single();
    
    if (data && !error && data.config) {
      return data.config;
    }
    
    // Fall back to fetching business name for default config
    const { data: business } = await (supabase as any)
      .from('businesses')
      .select('name, phone')
      .eq('id', businessId)
      .single();
    
    // Return simplified config matching PublicBookingWidget's expected format
    return {
      niche: 'cleaning',
      businessName: business?.name || 'Professional Cleaning',
      phone: business?.phone || '(555) 123-4567',
      logoUrl: '',
      primaryColor: '#1E3A5F',
      accentColor: '#10B981',
      sqftTiers: [
        { id: '1', label: '1,000-1,500', minSqft: 1000, maxSqft: 1500, price: 189, enabled: true },
        { id: '2', label: '1,501-2,000', minSqft: 1501, maxSqft: 2000, price: 229, enabled: true },
        { id: '3', label: '2,001-2,500', minSqft: 2001, maxSqft: 2500, price: 269, enabled: true, popular: true },
        { id: '4', label: '2,501-3,000', minSqft: 2501, maxSqft: 3000, price: 309, enabled: true },
        { id: '5', label: '3,001-3,500', minSqft: 3001, maxSqft: 3500, price: 349, enabled: true },
        { id: '6', label: '3,501-4,000', minSqft: 3501, maxSqft: 4000, price: 389, enabled: true },
      ],
      services: [
        {
          id: '1',
          name: 'Tester Deep Clean',
          description: 'One-time intensive cleaning',
          features: ['40-point deep clean checklist', '2-person professional crew', '~4 hours of service', 'All supplies included'],
          basePrice: 269,
          discountPercent: 20,
          badge: 'Popular',
          popular: true,
          enabled: true,
        },
        {
          id: '2',
          name: '90-Day Reset & Maintain',
          description: '3 visits over 90 days',
          features: ['Initial deep clean + 2 maintenance visits', 'Save $180 vs individual bookings', 'Flexible monthly payments', 'Priority scheduling'],
          basePrice: 597,
          discountPercent: 0,
          badge: 'Best Value',
          popular: false,
          enabled: true,
        },
      ],
      promotionEnabled: true,
      promotionText: 'Get 20% Off Your First Deep Clean!',
      discountPercent: 20,
      depositPercent: 25,
      serviceZips: [],
    };
  } catch (error) {
    // Return default config on error
    return undefined;
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
