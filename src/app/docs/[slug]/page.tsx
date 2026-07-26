import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DocsShell } from '@/components/v2/DocsShell';
import { getDoc, listDocs } from '@/lib/docs';

export function generateStaticParams() {
  return listDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return { title: 'Not found — Selestial docs' };

  return {
    title: `${doc.title} — Selestial docs`,
    description: doc.description,
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);

  if (!doc) notFound();

  const docs = listDocs();

  return (
    <DocsShell docs={docs} activeSlug={slug}>
      <div className="flex gap-10">
        <article
          className="doc-prose min-w-0 flex-1"
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />

        {doc.headings.length > 2 ? (
          <nav className="hidden w-48 shrink-0 xl:block">
            <div className="sticky top-10">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                On this page
              </p>
              <ul className="space-y-1">
                {doc.headings
                  .filter((heading) => heading.level === 2)
                  .map((heading) => (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        className="block text-sm leading-snug text-zinc-500 hover:text-primary"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          </nav>
        ) : null}
      </div>
    </DocsShell>
  );
}
