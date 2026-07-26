import Link from 'next/link';

import { DocsShell } from '@/components/v2/DocsShell';
import { groupByCategory, listDocs } from '@/lib/docs';

export const metadata = {
  title: 'Documentation — Selestial',
  description: 'How Selestial onboards clients, generates campaigns, and counts what it reports.',
};

export default function DocsIndexPage() {
  const docs = listDocs();
  const groups = groupByCategory(docs);

  return (
    <DocsShell docs={docs}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Documentation</h1>
        <p className="mt-2 text-zinc-600">
          How the reactivation engine works — what happens during onboarding, what the
          generated campaigns are doing, and exactly how every number on the dashboard is
          counted.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {groups.map((group) => (
          <section key={group.category}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {group.category}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {group.docs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <h3 className="text-sm font-semibold text-zinc-900">{doc.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{doc.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {docs.length === 0 ? (
        <p className="mt-10 text-sm text-zinc-500">No documentation pages were found.</p>
      ) : null}
    </DocsShell>
  );
}
