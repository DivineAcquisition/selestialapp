'use client';

import * as React from 'react';
import { motion, useInView, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// FADE IN (Scroll reveal animation)
// ============================================================================

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  once?: boolean;
  duration?: number;
}

export const FadeIn = React.forwardRef<HTMLDivElement, FadeInProps>(
  (
    {
      children,
      className,
      delay = 0,
      direction = 'up',
      distance = 16,
      once = true,
      duration = 0.4,
      ...props
    },
    forwardedRef
  ) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once, margin: '-50px' });

    // Combine refs
    React.useImperativeHandle(forwardedRef, () => ref.current!);

    const directions = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance },
      none: {},
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, ...directions[direction] }}
        animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{
          duration,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeIn.displayName = 'FadeIn';

// ============================================================================
// FADE IN STAGGER (Multiple items with stagger)
// ============================================================================

interface FadeInStaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  once?: boolean;
}

export function FadeInStagger({
  children,
  className,
  staggerDelay = 0.1,
  direction = 'up',
  distance = 16,
  once = true,
}: FadeInStaggerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return (
    <div ref={ref} className={cn(className)}>
      {React.Children.map(children, (child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, ...directions[direction] }}
          animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{
            duration: 0.4,
            delay: i * staggerDelay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// SLIDE IN (From edge of screen)
// ============================================================================

interface SlideInProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  direction?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  duration?: number;
}

export const SlideIn = React.forwardRef<HTMLDivElement, SlideInProps>(
  (
    {
      children,
      className,
      direction = 'left',
      delay = 0,
      duration = 0.3,
      ...props
    },
    ref
  ) => {
    const directions = {
      left: { x: '-100%' },
      right: { x: '100%' },
      top: { y: '-100%' },
      bottom: { y: '100%' },
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, ...directions[direction] }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, ...directions[direction] }}
        transition={{
          duration,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
SlideIn.displayName = 'SlideIn';

// ============================================================================
// SCALE IN (For modals, popovers)
// ============================================================================

interface ScaleInProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  delay?: number;
  duration?: number;
}

export const ScaleIn = React.forwardRef<HTMLDivElement, ScaleInProps>(
  ({ children, className, delay = 0, duration = 0.2, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
);
ScaleIn.displayName = 'ScaleIn';

// ============================================================================
// BLUR IN (Fade + blur effect)
// ============================================================================

interface BlurInProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  delay?: number;
  duration?: number;
}

export const BlurIn = React.forwardRef<HTMLDivElement, BlurInProps>(
  ({ children, className, delay = 0, duration = 0.4, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: 'blur(8px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(8px)' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
);
BlurIn.displayName = 'BlurIn';
