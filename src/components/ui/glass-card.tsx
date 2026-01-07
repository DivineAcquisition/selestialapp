"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "bordered" | "gradient";
  glow?: boolean;
  hover?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, variant = "default", glow = false, hover = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl transition-all duration-300",
          {
            // Default glass
            "bg-white/80 backdrop-blur-sm border border-white/20 shadow-sm":
              variant === "default",
            // Elevated glass
            "bg-white/90 backdrop-blur-md border border-white/30 shadow-lg":
              variant === "elevated",
            // Bordered glass
            "bg-white/70 backdrop-blur-sm border-2 border-primary/10":
              variant === "bordered",
            // Gradient glass
            "bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md border border-white/40 shadow-md":
              variant === "gradient",
          },
          hover && "hover:shadow-xl hover:border-primary/20 hover:-translate-y-0.5",
          glow && "hover:shadow-[0_0_30px_rgba(85,0,255,0.15)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

// Bento Grid Item
interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  gradient?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, children, icon, title, description, header, gradient, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-2xl bg-white border border-gray-200/60",
          "transition-all duration-500 ease-out",
          "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
          "hover:-translate-y-1",
          {
            "p-4": size === "sm",
            "p-5": size === "md",
            "p-6": size === "lg",
            "p-8": size === "xl",
          },
          className
        )}
        {...props}
      >
        {/* Gradient Background */}
        {gradient && (
          <div
            className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              gradient
            )}
          />
        )}
        
        {/* Default gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Content */}
        <div className="relative z-10">
          {header && (
            <div className="mb-4">
              {header}
            </div>
          )}
          
          {icon && (
            <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              {icon}
            </div>
          )}
          
          {title && (
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
          )}
          
          {description && (
            <p className="text-sm text-gray-500 leading-relaxed">
              {description}
            </p>
          )}
          
          {children}
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    );
  }
);

BentoCard.displayName = "BentoCard";

// Stat Card with animation
interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  description?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, icon, title, value, change, changeType = "neutral", description, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-xl bg-white border border-gray-200/60 p-5",
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5",
          className
        )}
        {...props}
      >
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">{title}</span>
            {icon && (
              <div className="text-gray-400 group-hover:text-primary transition-colors">
                {icon}
              </div>
            )}
          </div>
          
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900 tabular-nums">
              {value}
            </span>
            {change && (
              <span
                className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded-full mb-1",
                  {
                    "text-emerald-700 bg-emerald-50": changeType === "positive",
                    "text-red-700 bg-red-50": changeType === "negative",
                    "text-gray-600 bg-gray-100": changeType === "neutral",
                  }
                )}
              >
                {change}
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";
