"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-sm",
        elevated: "bg-card border border-border shadow-md hover:shadow-lg",
        ghost: "bg-transparent hover:bg-accent/50",
        gradient: "bg-gradient-to-br from-card via-card to-accent/20 border border-border",
        glass: "bg-card/80 backdrop-blur-sm border border-border/50",
        glow: "bg-card border border-border shadow-md hover:shadow-primary/20",
        interactive: "bg-card border border-border shadow-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer hover:-translate-y-0.5",
      },
      size: {
        sm: "p-3",
        default: "p-4",
        lg: "p-5",
        xl: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);
EnhancedCard.displayName = "EnhancedCard";

// Stats Card
interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  onClick?: () => void;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, title, value, icon, change, changeType = "neutral", subtitle, onClick, ...props }, ref) => {
    return (
      <EnhancedCard
        ref={ref}
        variant={onClick ? "interactive" : "default"}
        className={cn("group", className)}
        onClick={onClick}
        {...props}
      >
        <div className="flex items-center justify-between mb-3">
          {icon && (
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              {icon}
            </div>
          )}
          {change && (
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                changeType === "positive" && "bg-emerald-100 text-emerald-700",
                changeType === "negative" && "bg-red-100 text-red-700",
                changeType === "neutral" && "bg-gray-100 text-gray-600"
              )}
            >
              {change}
            </span>
          )}
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && (
          <p className="text-xs text-primary font-medium mt-1">{subtitle}</p>
        )}
      </EnhancedCard>
    );
  }
);
StatsCard.displayName = "StatsCard";

// Feature Card
interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
  action?: React.ReactNode;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, title, description, icon, badge, action, ...props }, ref) => {
    return (
      <EnhancedCard
        ref={ref}
        variant="interactive"
        className={cn("group", className)}
        {...props}
      >
        <div className="flex items-start gap-4">
          {icon && (
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
          {action}
        </div>
      </EnhancedCard>
    );
  }
);
FeatureCard.displayName = "FeatureCard";

// Bento Card
interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  gradient?: boolean;
}

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, title, description, icon, header, footer, gradient = false, children, ...props }, ref) => {
    return (
      <EnhancedCard
        ref={ref}
        variant={gradient ? "gradient" : "elevated"}
        size="lg"
        className={cn(
          "group relative overflow-hidden",
          "hover:-translate-y-1 transition-transform duration-300",
          className
        )}
        {...props}
      >
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative">
          {header && <div className="mb-4">{header}</div>}
          
          <div className="flex items-start gap-4 mb-3">
            {icon && (
              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          
          {children}
          
          {footer && <div className="mt-4 pt-4 border-t border-border">{footer}</div>}
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </EnhancedCard>
    );
  }
);
BentoCard.displayName = "BentoCard";

export { EnhancedCard, StatsCard, FeatureCard, BentoCard, cardVariants };
