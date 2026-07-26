import Link from 'next/link';
import type { ReactNode } from 'react';

import { groupByCategory, type DocMeta } from '@/lib/docs';

export function DocsShell({
  docs,
  activeSlug,
  children,
}: {
  docs: DocMeta[];
  activeSlug?: string;
  children: ReactNode;
}) {
  const groups = groupByCategory(docs);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/docs" className="text-sm font-semibold tracking-tight text-zinc-900">
            Selestial documentation
          </Link>
          <Link href="/" className="text-sm text-zinc-500 hover:text-primary">
            Back to the app
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-6 py-10">
        <nav className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-10 space-y-6">
            {groups.map((group) => (
              <div key={group.category}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  {group.category}
                </p>
                <ul className="space-y-0.5">
                  {group.docs.map((doc) => (
                    <li key={doc.slug}>
                      <Link
                        href={`/docs/${doc.slug}`}
                        className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                          doc.slug === activeSlug
                            ? 'bg-primary/10 font-medium text-primary'
                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                        }`}
                      >
                        {doc.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
