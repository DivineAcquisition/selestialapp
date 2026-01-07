"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost" | "gradient" | "glow";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    children, 
    variant = "default", 
    size = "md", 
    loading = false,
    icon,
    iconPosition = "left",
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center font-medium",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
          "active:scale-[0.98]",
          // Sizes
          {
            "h-8 px-3 text-xs rounded-lg gap-1.5": size === "sm",
            "h-10 px-4 text-sm rounded-lg gap-2": size === "md",
            "h-11 px-5 text-sm rounded-xl gap-2": size === "lg",
            "h-12 px-6 text-base rounded-xl gap-2.5": size === "xl",
          },
          // Variants
          {
            // Default - solid primary
            "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5":
              variant === "default",
            // Secondary
            "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-md hover:-translate-y-0.5":
              variant === "secondary",
            // Outline
            "border-2 border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary hover:shadow-md hover:-translate-y-0.5":
              variant === "outline",
            // Ghost
            "text-gray-600 hover:text-gray-900 hover:bg-gray-100":
              variant === "ghost",
            // Gradient
            "bg-gradient-to-r from-primary to-[#9D96FF] text-white hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5":
              variant === "gradient",
            // Glow
            "bg-primary text-white hover:shadow-[0_0_20px_rgba(85,0,255,0.4)] hover:-translate-y-0.5":
              variant === "glow",
          },
          className
        )}
        {...props}
      >
        {/* Shimmer effect for gradient variant */}
        {variant === "gradient" && (
          <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
            <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[100%] transition-transform duration-1000" />
          </span>
        )}
        
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="transition-transform group-hover:-translate-x-0.5">
                {icon}
              </span>
            )}
            <span>{children}</span>
            {icon && iconPosition === "right" && (
              <span className="transition-transform group-hover:translate-x-0.5">
                {icon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

// Magnetic Button - follows mouse slightly
interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ className, children, ...props }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current;
      if (!button) return;
      
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    };
    
    const handleMouseLeave = () => {
      const button = buttonRef.current;
      if (button) {
        button.style.transform = "translate(0, 0)";
      }
    };
    
    return (
      <button
        ref={(node) => {
          (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative inline-flex items-center justify-center",
          "h-10 px-6 text-sm font-medium rounded-lg",
          "bg-primary text-white",
          "transition-all duration-200 ease-out",
          "hover:shadow-lg hover:shadow-primary/25",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

MagneticButton.displayName = "MagneticButton";
