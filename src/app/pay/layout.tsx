import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment - Selestial',
  description: 'Secure payment processing by Selestial',
  robots: 'noindex, nofollow', // Payment pages should not be indexed
};

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
