'use client';

import * as React from 'react';
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// ANIMATED LIST (Static - staggers on mount)
// ============================================================================

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({ 
  children, 
  className,
  staggerDelay = 0.05,
}: AnimatedListProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      className={cn('space-y-2', className)}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.2,
            delay: i * staggerDelay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// ANIMATED LIST ITEM (For dynamic lists with add/remove)
// ============================================================================

interface AnimatedListItemProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  layoutId?: string;
}

export const AnimatedListItem = React.forwardRef<HTMLDivElement, AnimatedListItemProps>(
  ({ children, className, layoutId, ...props }, ref) => (
    <motion.div
      ref={ref}
      layout
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
AnimatedListItem.displayName = 'AnimatedListItem';

// ============================================================================
// ANIMATED LIST CONTAINER (For AnimatePresence wrapper)
// ============================================================================

interface AnimatedListContainerProps {
  children: React.ReactNode;
  className?: string;
  mode?: 'sync' | 'wait' | 'popLayout';
}

export function AnimatedListContainer({
  children,
  className,
  mode = 'popLayout',
}: AnimatedListContainerProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <AnimatePresence mode={mode}>
        {children}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// STAGGER GRID (For grid layouts)
// ============================================================================

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerGrid({
  children,
  className,
  staggerDelay = 0.05,
}: StaggerGridProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      className={cn('grid', className)}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: i * staggerDelay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
