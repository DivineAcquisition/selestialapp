import { BookingFlowProviders } from '@/components/booking/v2/BookingFlowProviders';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}

/**
 * Wraps every page under /book/[businessId]/(funnel)/* in the Selestial port
 * of the AlphaLuxClean booking flow. Provides:
 *  - Tenant config (brand, phone, deposit %, etc.)
 *  - Funnel state (BookingContext) namespaced per businessId
 */
export default async function FunnelLayout({ children, params }: LayoutProps) {
  const { businessId } = await params;
  return <BookingFlowProviders businessId={businessId}>{children}</BookingFlowProviders>;
}
