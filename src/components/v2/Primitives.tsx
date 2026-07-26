import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl border border-zinc-200 bg-white', className)}>{children}</div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-zinc-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'positive' | 'warning';
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3.5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p
        className={cn(
          'mt-1.5 text-2xl font-semibold tabular-nums tracking-tight',
          tone === 'positive' && 'text-emerald-600',
          tone === 'warning' && 'text-amber-600',
          tone === 'default' && 'text-zinc-900'
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

const BADGE_TONES: Record<string, string> = {
  neutral: 'bg-zinc-100 text-zinc-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  violet: 'bg-primary/10 text-primary',
  blue: 'bg-sky-50 text-sky-700',
};

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: keyof typeof BADGE_TONES;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        BADGE_TONES[tone] ?? BADGE_TONES.neutral
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-zinc-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        variant === 'primary'
          ? 'bg-primary text-white hover:bg-primary/90'
          : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
      )}
    >
      {children}
    </Link>
  );
}

/** Formats a rate as a whole-number percentage, or an em dash when there is no base. */
export function percent(value: number, base: number): string {
  if (base <= 0) return '—';
  return `${Math.round(value * 100)}%`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
