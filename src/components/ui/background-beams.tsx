"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BackgroundBeamsProps {
  className?: string;
  children?: React.ReactNode;
}

export function BackgroundBeams({ className, children }: BackgroundBeamsProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Beam 1 */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
      {/* Beam 2 */}
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-l from-blue-500/30 to-primary/30 rounded-full blur-3xl animate-pulse delay-1000" />
      {/* Beam 3 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-primary/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function BackgroundGradientAnimation({
  className,
  children,
  containerClassName,
}: {
  className?: string;
  children?: React.ReactNode;
  containerClassName?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0",
          "bg-[linear-gradient(to_right,#4f46e5,#7c3aed,#a855f7,#7c3aed,#4f46e5)]",
          "bg-[length:200%_auto]",
          "animate-gradient-x",
          "opacity-20",
          className
        )}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
