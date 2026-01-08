'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// ANIMATED BUTTON (Wraps shadcn Button with motion)
// ============================================================================

interface AnimatedButtonProps extends ButtonProps {
  /** Enable scale animation on hover/tap */
  animate?: boolean;
  /** Scale factor on hover (default: 1.02) */
  hoverScale?: number;
  /** Scale factor on tap (default: 0.98) */
  tapScale?: number;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      children,
      className,
      animate = true,
      hoverScale = 1.02,
      tapScale = 0.98,
      ...props
    },
    ref
  ) => {
    if (!animate) {
      return (
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      );
    }

    return (
      <motion.div
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: tapScale }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="inline-block"
      >
        <Button ref={ref} className={cn('w-full', className)} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);
AnimatedButton.displayName = 'AnimatedButton';

// ============================================================================
// PULSE BUTTON (With subtle pulse animation)
// ============================================================================

interface PulseButtonProps extends ButtonProps {
  /** Pulse on hover only */
  pulseOnHover?: boolean;
}

const PulseButton = React.forwardRef<HTMLButtonElement, PulseButtonProps>(
  ({ children, className, pulseOnHover = true, ...props }, ref) => (
    <motion.div
      whileHover={pulseOnHover ? { scale: [1, 1.02, 1] } : undefined}
      transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
      className="inline-block"
    >
      <Button ref={ref} className={cn('w-full', className)} {...props}>
        {children}
      </Button>
    </motion.div>
  )
);
PulseButton.displayName = 'PulseButton';

// ============================================================================
// SHIMMER BUTTON (With shimmer effect)
// ============================================================================

interface ShimmerButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  children: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ children, className, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        'relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-3 font-medium text-primary-foreground shadow-lg',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
);
ShimmerButton.displayName = 'ShimmerButton';

// ============================================================================
// ICON BUTTON (Animated icon button)
// ============================================================================

interface AnimatedIconButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  children: React.ReactNode;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const AnimatedIconButton = React.forwardRef<HTMLButtonElement, AnimatedIconButtonProps>(
  ({ children, className, variant = 'ghost', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    };

    const sizes = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
AnimatedIconButton.displayName = 'AnimatedIconButton';

export { AnimatedButton, PulseButton, ShimmerButton, AnimatedIconButton };
