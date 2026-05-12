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
 *   --primary        #6428F9  (deep violet, primary actions)
 *   --primary-accent #9294FF  (light periwinkle, used for gradients + glow)
 *
 * Variants:
 *   - 'primary'  : solid violet → periwinkle gradient with subtle glow on
 *                  hover. Default for all hero / final CTAs.
 *   - 'solid'    : flat #6428F9, no gradient. For secondary placements where
 *                  a gradient would feel too loud (in-card CTAs, etc.).
 *   - 'outline'  : white background, violet border + text. Secondary action.
 *   - 'ghost'    : transparent + violet text underline on hover. Tertiary.
 *   - 'inverted' : white background, violet text. For use on dark / colored
 *                  backgrounds (final-CTA gradient blocks).
 */

type Variant = 'primary' | 'solid' | 'outline' | 'ghost' | 'inverted';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_STYLES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px] gap-1.5 rounded-md',
  md: 'h-10 px-5 text-sm gap-2 rounded-md',
  lg: 'h-11 px-6 text-sm gap-2 rounded-lg',
  xl: 'h-12 px-7 text-[15px] gap-2 rounded-lg',
};

const BASE =
  'group relative inline-flex items-center justify-center whitespace-nowrap font-semibold tracking-tight leading-none transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6428F9]/40 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    // Gradient #6428F9 → #9294FF with inner highlight + glow on hover.
    'text-white border border-[#4F1FD0]/40 ' +
    'bg-[linear-gradient(135deg,#6428F9_0%,#7B5BFB_55%,#9294FF_100%)] ' +
    'shadow-[0_4px_14px_-2px_rgba(100,40,249,0.40),inset_0_1px_0_0_rgba(255,255,255,0.22)] ' +
    'hover:shadow-[0_10px_28px_-6px_rgba(100,40,249,0.55),inset_0_1px_0_0_rgba(255,255,255,0.28)] ' +
    'hover:-translate-y-[1px] active:translate-y-0 ' +
    'active:shadow-[0_2px_8px_-2px_rgba(100,40,249,0.4),inset_0_1px_2px_0_rgba(0,0,0,0.15)]',
  solid:
    'bg-[#6428F9] text-white border border-[#4F1FD0] ' +
    'shadow-[0_2px_8px_-2px_rgba(100,40,249,0.35)] ' +
    'hover:bg-[#4F1FD0] hover:shadow-[0_4px_12px_-2px_rgba(100,40,249,0.45)] ' +
    'active:translate-y-[1px]',
  outline:
    'bg-white text-[#6428F9] border border-[#6428F9]/25 ' +
    'shadow-[0_1px_2px_-1px_rgba(0,0,0,0.05)] ' +
    'hover:border-[#6428F9] hover:bg-[#F2EFFF] ' +
    'active:translate-y-[1px]',
  ghost:
    'bg-transparent text-[#6428F9] border border-transparent ' +
    'hover:bg-[#F2EFFF] hover:text-[#4F1FD0]',
  inverted:
    'bg-white text-[#6428F9] border border-white/0 ' +
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
