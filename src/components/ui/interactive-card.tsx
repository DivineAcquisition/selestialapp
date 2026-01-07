"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Check } from "lucide-react";

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  hoverable?: boolean;
}

export const InteractiveCard = ({
  children,
  className,
  onClick,
  selected = false,
  hoverable = true,
}: InteractiveCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-white p-5 transition-all duration-300",
        hoverable && "hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 cursor-pointer",
        selected && "border-primary ring-2 ring-primary/20",
        className
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 p-1 bg-primary rounded-full">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
      {children}
    </div>
  );
};

interface ExpandableCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export const ExpandableCard = ({
  title,
  description,
  icon,
  children,
  defaultExpanded = false,
  className,
}: ExpandableCardProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white overflow-hidden transition-all duration-300",
        expanded && "ring-1 ring-primary/20 border-primary/30",
        className
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {icon && (
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-gray-400 transition-transform duration-300",
            expanded && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-gray-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface StepCardProps {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  completed?: boolean;
  active?: boolean;
  className?: string;
}

export const StepCard = ({
  step,
  title,
  description,
  children,
  completed = false,
  active = false,
  className,
}: StepCardProps) => {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-white p-5 transition-all duration-300",
        active && "border-primary ring-2 ring-primary/20 shadow-lg",
        completed && "border-emerald-200 bg-emerald-50/30",
        !active && !completed && "border-gray-200",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
            completed && "bg-emerald-500 text-white",
            active && "bg-primary text-white",
            !active && !completed && "bg-gray-100 text-gray-500"
          )}
        >
          {completed ? <Check className="h-4 w-4" /> : step}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </div>
  );
};

interface FeatureRowProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const FeatureRow = ({
  icon,
  title,
  description,
  action,
  className,
}: FeatureRowProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

interface NavigationCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  className?: string;
}

export const NavigationCard = ({
  icon,
  title,
  description,
  href,
  onClick,
  badge,
  className,
}: NavigationCardProps) => {
  const content = (
    <div
      className={cn(
        "group flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white",
        "hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5",
        "transition-all duration-300 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{title}</h4>
            {badge && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
};

export default InteractiveCard;
