'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

/**
 * Motion utilities and variants following shadcn aesthetic
 * 
 * Key principles:
 * - Subtle, not flashy (0.2-0.3s durations, 8-16px movements)
 * - Consistent ease curve: [0.25, 0.1, 0.25, 1]
 * - No bounce - heavily damped springs
 * - Purposeful - only animate important changes
 */

// ============================================================================
// MOTION DIV WRAPPER
// ============================================================================

export const MotionDiv = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} {...props}>
      {children}
    </motion.div>
  )
);
MotionDiv.displayName = 'MotionDiv';

// ============================================================================
// ANIMATION VARIANTS (shadcn-style: subtle, refined)
// ============================================================================

// Fade in with subtle upward movement
export const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
};

// Simple fade
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

// Scale in (for modals, popovers)
export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
};

// Slide from right (for sidebars, drawers)
export const slideInFromRight = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
};

// Slide from left
export const slideInFromLeft = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
};

// Slide from bottom (for bottom sheets, toasts)
export const slideInFromBottom = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
};

// Slide from top
export const slideInFromTop = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
};

// ============================================================================
// STAGGER ANIMATIONS (for lists)
// ============================================================================

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
};

// Faster stagger for smaller items
export const staggerFast = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

// ============================================================================
// HOVER ANIMATIONS
// ============================================================================

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 400, damping: 20 },
};

export const hoverLift = {
  whileHover: { y: -2 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
};

// ============================================================================
// SPRING CONFIGURATIONS
// ============================================================================

export const springConfig = {
  default: { type: 'spring', stiffness: 400, damping: 30 },
  gentle: { type: 'spring', stiffness: 200, damping: 20 },
  bouncy: { type: 'spring', stiffness: 500, damping: 15 },
  stiff: { type: 'spring', stiffness: 700, damping: 40 },
};

// ============================================================================
// EASE CURVES
// ============================================================================

export const ease = {
  default: [0.25, 0.1, 0.25, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
};

// ============================================================================
// DURATION PRESETS
// ============================================================================

export const duration = {
  fast: 0.15,
  default: 0.2,
  medium: 0.3,
  slow: 0.4,
};
