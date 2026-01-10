"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardHoverEffectProps {
  items: {
    id: string;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    badge?: string;
    disabled?: boolean;
  }[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
  columns?: 1 | 2 | 3;
}

export function CardHoverEffect({
  items,
  selectedId,
  onSelect,
  className,
  columns = 2,
}: CardHoverEffectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid gap-3",
        {
          "grid-cols-1": columns === 1,
          "grid-cols-1 sm:grid-cols-2": columns === 2,
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3": columns === 3,
        },
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative group block h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Animated background */}
          {hoveredIndex === idx && (
            <motion.span
              className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary/10 to-purple-500/10 block rounded-2xl"
              layoutId="hoverBackground"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.15 },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.15, delay: 0.2 },
              }}
            />
          )}
          
          <HoverCard
            item={item}
            isSelected={selectedId === item.id}
            onClick={() => !item.disabled && onSelect?.(item.id)}
          />
        </div>
      ))}
    </div>
  );
}

function HoverCard({
  item,
  isSelected,
  onClick,
}: {
  item: CardHoverEffectProps["items"][0];
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={item.disabled}
      className={cn(
        "relative z-10 h-full w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300",
        "bg-white/80 backdrop-blur-sm",
        isSelected
          ? "border-primary ring-2 ring-primary ring-offset-2 shadow-lg shadow-primary/10"
          : "border-gray-200/60 hover:border-primary/30",
        item.disabled && "opacity-50 cursor-not-allowed",
        !item.disabled && "cursor-pointer"
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-[1.5s] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
      
      <div className="relative">
        {/* Icon and Badge row */}
        <div className="flex items-start justify-between mb-3">
          {item.icon && (
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                isSelected
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary"
              )}
            >
              {item.icon}
            </div>
          )}
          
          {item.badge && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
              {item.badge}
            </span>
          )}
        </div>
        
        {/* Title */}
        <h3
          className={cn(
            "font-semibold text-base transition-colors",
            isSelected ? "text-primary" : "text-gray-900"
          )}
        >
          {item.title}
        </h3>
        
        {/* Description */}
        {item.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {item.description}
          </p>
        )}
        
        {/* Selection indicator */}
        <div
          className={cn(
            "absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
            isSelected
              ? "border-primary bg-primary"
              : "border-gray-300 group-hover:border-primary/50"
          )}
        >
          {isSelected && (
            <motion.svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          )}
        </div>
      </div>
    </motion.button>
  );
}
