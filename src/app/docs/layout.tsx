import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation - Selestial',
  description: 'Learn how to use Selestial to grow your home service business',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
