"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  shimmerColor?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
}

export function ShimmerButton({
  children,
  shimmerColor = "#ffffff",
  shimmerDuration = "2s",
  borderRadius = "12px",
  background = "linear-gradient(110deg, #5500FF, 45%, #7c3aed, 55%, #5500FF)",
  className,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative cursor-pointer overflow-hidden whitespace-nowrap px-6 py-3 font-medium text-white transition-all",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        className
      )}
      style={{
        background,
        borderRadius,
      }}
      {...props}
    >
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <div
          className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            animationDuration: shimmerDuration,
          }}
        />
      </div>
      
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${shimmerColor}40 0%, transparent 70%)`,
          borderRadius,
        }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}

// Variant: Outline shimmer button
export function ShimmerOutlineButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "group relative cursor-pointer overflow-hidden whitespace-nowrap rounded-xl px-6 py-3 font-medium",
        "border-2 border-primary/20 bg-white text-gray-900",
        "transition-all duration-300",
        "hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/10",
        "active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      </div>
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
