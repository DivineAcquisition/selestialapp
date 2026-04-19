'use client';

/**
 * Marquee — vendored from Magic UI (MIT).
 * https://magicui.design/docs/components/marquee
 *
 * Used on the landing page to scroll testimonial logos / industry tags /
 * customer cards horizontally without manual JS.
 */

import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  /** Reverse the animation direction. */
  reverse?: boolean;
  /** Pause animation on hover. */
  pauseOnHover?: boolean;
  /** Children to scroll. Repeated `repeat` times so the loop is seamless. */
  children: React.ReactNode;
  /** Vertical instead of horizontal marquee. */
  vertical?: boolean;
  /** How many times to repeat the children. */
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        'group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]',
        {
          'flex-row': !vertical,
          'flex-col': vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn('flex shrink-0 justify-around [gap:var(--gap)]', {
              'animate-marquee flex-row': !vertical,
              'animate-marquee-vertical flex-col': vertical,
              'group-hover:[animation-play-state:paused]': pauseOnHover,
              '[animation-direction:reverse]': reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
