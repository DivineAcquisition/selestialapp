import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function FunnelRoot({ params }: PageProps) {
  const { businessId } = await params;
  redirect(`/book/${businessId}/zip`);
}
