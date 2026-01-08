'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NumberTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
  delay?: number;
}

/**
 * Animated number counter with spring physics
 * 
 * @example
 * <NumberTicker value={12450} prefix="$" className="text-2xl font-bold" />
 * <NumberTicker value={34.5} suffix="%" decimals={1} />
 */
export function NumberTicker({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  duration = 1,
  delay = 0,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  });
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(value);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, value, motionValue, delay]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        const formatted = Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(latest);
        ref.current.textContent = prefix + formatted + suffix;
      }
    });
    return unsubscribe;
  }, [springValue, prefix, suffix, decimals]);

  return (
    <span
      ref={ref}
      className={cn('tabular-nums tracking-tight', className)}
    >
      {prefix}0{suffix}
    </span>
  );
}

// ============================================================================
// CURRENCY TICKER (Pre-configured for money)
// ============================================================================

interface CurrencyTickerProps {
  value: number;
  className?: string;
  duration?: number;
  delay?: number;
  showCents?: boolean;
}

export function CurrencyTicker({
  value,
  className,
  duration = 1,
  delay = 0,
  showCents = false,
}: CurrencyTickerProps) {
  return (
    <NumberTicker
      value={value}
      prefix="$"
      decimals={showCents ? 2 : 0}
      className={className}
      duration={duration}
      delay={delay}
    />
  );
}

// ============================================================================
// PERCENTAGE TICKER (Pre-configured for percentages)
// ============================================================================

interface PercentageTickerProps {
  value: number;
  className?: string;
  duration?: number;
  delay?: number;
  decimals?: number;
}

export function PercentageTicker({
  value,
  className,
  duration = 1,
  delay = 0,
  decimals = 0,
}: PercentageTickerProps) {
  return (
    <NumberTicker
      value={value}
      suffix="%"
      decimals={decimals}
      className={className}
      duration={duration}
      delay={delay}
    />
  );
}
