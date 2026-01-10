"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export function FloatingLabelInput({
  label,
  icon,
  error,
  className,
  ...props
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = props.value !== undefined && props.value !== "";
  const isActive = isFocused || hasValue;

  return (
    <div className="relative">
      <div
        className={cn(
          "relative flex items-center rounded-xl border-2 transition-all duration-300",
          isFocused
            ? "border-primary ring-4 ring-primary/10"
            : error
            ? "border-red-500 ring-4 ring-red-500/10"
            : "border-gray-200 hover:border-gray-300",
          className
        )}
      >
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              "pl-4 transition-colors",
              isFocused ? "text-primary" : "text-gray-400"
            )}
          >
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          {...props}
          className={cn(
            "peer w-full bg-transparent px-4 py-4 text-gray-900 outline-none placeholder-transparent",
            icon && "pl-2"
          )}
          placeholder={label}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />

        {/* Floating Label */}
        <motion.label
          className={cn(
            "absolute pointer-events-none transition-all duration-200 origin-left",
            icon ? "left-12" : "left-4",
            isActive
              ? "text-xs -translate-y-6 bg-white px-1"
              : "text-base text-gray-500"
          )}
          animate={{
            y: isActive ? -24 : 0,
            scale: isActive ? 0.85 : 1,
            color: isFocused ? "hsl(var(--primary))" : error ? "#ef4444" : "#6b7280",
          }}
        >
          {label}
        </motion.label>
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          className="mt-1 text-sm text-red-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Date picker variant
export function FloatingDateInput({
  label,
  icon,
  error,
  className,
  ...props
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <div
        className={cn(
          "relative flex items-center rounded-xl border-2 transition-all duration-300",
          isFocused
            ? "border-primary ring-4 ring-primary/10"
            : error
            ? "border-red-500"
            : "border-gray-200 hover:border-gray-300",
          className
        )}
      >
        {icon && (
          <div
            className={cn(
              "pl-4 transition-colors",
              isFocused ? "text-primary" : "text-gray-400"
            )}
          >
            {icon}
          </div>
        )}

        <div className="flex-1 relative">
          <label
            className={cn(
              "absolute text-xs font-medium transition-colors",
              icon ? "left-2" : "left-4",
              "top-2",
              isFocused ? "text-primary" : "text-gray-500"
            )}
          >
            {label}
          </label>
          <input
            {...props}
            type="date"
            className={cn(
              "w-full bg-transparent px-4 pt-6 pb-2 text-gray-900 outline-none",
              icon && "pl-2"
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
          />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
