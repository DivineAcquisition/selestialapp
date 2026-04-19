'use client';

import Link from 'next/link';
import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * BrandButton — the single CTA component used across every Selestial
 * marketing page (/demo, /retarget, /offer, /offer/get-started, /book-demo,
 * /demo-booked).
 *
 * Designed against the Selestial brand colors:
 *   --primary       #5500FF  (deep violet, primary actions)
 *   --primary-accent #9D96FF (light accent, used for gradients + glow)
 *
 * Variants:
 *   - 'primary'  : solid violet → light-violet gradient with subtle glow on
 *                  hover. Default for all hero / final CTAs.
 *   - 'solid'    : flat #5500FF, no gradient. For secondary placements where
 *                  a gradient would feel too loud (in-card CTAs, etc.).
 *   - 'outline'  : white background, violet border + text. Secondary action.
 *   - 'ghost'    : transparent + violet text underline on hover. Tertiary.
 *   - 'inverted' : white background, violet text. For use on dark / colored
 *                  backgrounds (final-CTA gradient blocks).
 */

type Variant = 'primary' | 'solid' | 'outline' | 'ghost' | 'inverted';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_STYLES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-1.5',
  lg: 'px-6 py-3 text-sm gap-2',
  xl: 'px-7 py-3.5 text-base gap-2',
};

const BASE =
  'group relative inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold tracking-tight transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5500FF]/40 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    // Gradient #5500FF → #9D96FF with inner highlight + glow on hover.
    'text-white border border-[#4400D6]/40 ' +
    'bg-[linear-gradient(135deg,#5500FF_0%,#7D6CFF_55%,#9D96FF_100%)] ' +
    'shadow-[0_4px_14px_-2px_rgba(85,0,255,0.45),inset_0_1px_0_0_rgba(255,255,255,0.2)] ' +
    'hover:shadow-[0_8px_24px_-4px_rgba(85,0,255,0.55),inset_0_1px_0_0_rgba(255,255,255,0.25)] ' +
    'hover:-translate-y-[1px] active:translate-y-0 ' +
    'active:shadow-[0_2px_8px_-2px_rgba(85,0,255,0.4),inset_0_1px_2px_0_rgba(0,0,0,0.15)]',
  solid:
    'bg-[#5500FF] text-white border border-[#4400D6] ' +
    'shadow-[0_2px_8px_-2px_rgba(85,0,255,0.35)] ' +
    'hover:bg-[#4400D6] hover:shadow-[0_4px_12px_-2px_rgba(85,0,255,0.45)] ' +
    'active:translate-y-[1px]',
  outline:
    'bg-white text-[#5500FF] border border-[#5500FF]/30 ' +
    'shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)] ' +
    'hover:border-[#5500FF] hover:bg-[#F3F0FF] ' +
    'active:translate-y-[1px]',
  ghost:
    'bg-transparent text-[#5500FF] border border-transparent ' +
    'hover:bg-[#F3F0FF] hover:text-[#4400D6]',
  inverted:
    'bg-white text-[#5500FF] border border-white/0 ' +
    'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.18)] ' +
    'hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.25)] ' +
    'hover:-translate-y-[1px] active:translate-y-0',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

interface AnchorProps extends CommonProps {
  href: string;
  external?: boolean;
  type?: never;
  onClick?: never;
  disabled?: never;
}

interface ButtonElementProps
  extends CommonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> {
  href?: never;
  external?: never;
}

type BrandButtonProps = AnchorProps | ButtonElementProps;

export function BrandButton(props: BrandButtonProps) {
  const { variant = 'primary', size = 'md', className, children } = props;
  const composed = cn(BASE, SIZE_STYLES[size], VARIANT_STYLES[variant], className);

  if ('href' in props && props.href) {
    const { href, external } = props;
    if (external || /^https?:\/\//i.test(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={composed}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={composed}>
        {children}
      </Link>
    );
  }

  // Strip `href` / `external` (which can't appear on the button branch) so
  // they don't end up on the underlying <button>. We discard them via a
  // rest pattern rather than naming them, which keeps eslint quiet.
  const buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {
    ...(props as ButtonElementProps),
  };
  delete (buttonProps as { href?: unknown }).href;
  delete (buttonProps as { external?: unknown }).external;
  return (
    <button {...buttonProps} className={composed}>
      {children}
    </button>
  );
}
