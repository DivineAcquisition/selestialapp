import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ businessId: string }>;
}

// Legacy alias: /book/[businessId]/schedule -> /book/[businessId]/details
// Mirrors AlphaLuxClean's <Navigate to="/book/details" /> redirect.
export default async function ScheduleRedirect({ params }: PageProps) {
  const { businessId } = await params;
  redirect(`/book/${businessId}/details`);
}
