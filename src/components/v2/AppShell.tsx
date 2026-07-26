import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { Workspace } from '@/lib/v2/types';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

export interface NavItem {
  href: string;
  label: string;
  /** Matches this item when the pathname starts with `href`. */
  exact?: boolean;
}

interface Props {
  workspaces: Workspace[];
  current: Workspace | null;
  isAgencyAdmin: boolean;
  nav: NavItem[];
  pathname: string;
  /** Deep link into the docs for the screen being shown. */
  docsHref?: string;
  docsLabel?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  workspaces,
  current,
  isAgencyAdmin,
  nav,
  pathname,
  docsHref,
  docsLabel = 'How this works',
  title,
  subtitle,
  actions,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex">
        <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-zinc-200 bg-white lg:flex">
          <div className="border-b border-zinc-200 px-4 py-4">
            <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-900">
              Selestial
            </Link>
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-zinc-400">
              Reactivation engine
            </p>
          </div>

          <div className="border-b border-zinc-200 p-3">
            <WorkspaceSwitcher
              workspaces={workspaces}
              current={current}
              isAgencyAdmin={isAgencyAdmin}
            />
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {nav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block rounded-lg px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-zinc-200 p-3">
            <Link
              href="/docs"
              className="block rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            >
              Documentation
            </Link>
          </div>
        </aside>

        <div className="flex-1 lg:pl-60">
          <header className="border-b border-zinc-200 bg-white">
            <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-900">
                  {title}
                </h1>
                {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
              </div>
              <div className="flex items-center gap-3">
                {docsHref ? (
                  <Link
                    href={docsHref}
                    className="text-sm text-zinc-500 underline-offset-4 hover:text-primary hover:underline"
                  >
                    {docsLabel}
                  </Link>
                ) : null}
                {actions}
              </div>
            </div>

            <nav className="flex gap-1 overflow-x-auto border-t border-zinc-100 px-4 py-2 lg:hidden">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
