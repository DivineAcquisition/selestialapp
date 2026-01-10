"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingDown, Check } from "lucide-react";

interface PriceDisplayProps {
  originalPrice: number;
  discountedPrice: number;
  savings?: string;
  perClean?: number;
  cleansPerMonth?: number;
  monthlyTotal?: number;
  depositAmount?: number;
  className?: string;
}

export function PriceDisplay({
  originalPrice,
  discountedPrice,
  savings,
  perClean,
  cleansPerMonth,
  monthlyTotal,
  depositAmount,
  className,
}: PriceDisplayProps) {
  const hasDiscount = originalPrice > discountedPrice;

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/10 p-5",
        "border border-primary/20",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-gray-600">Your Price</span>
        </div>

        {/* Main price */}
        <div className="flex items-end gap-3">
          <AnimatePresence mode="wait">
            <motion.span
              key={discountedPrice}
              className="text-4xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              ${discountedPrice.toFixed(2)}
            </motion.span>
          </AnimatePresence>
          
          {hasDiscount && (
            <motion.span
              className="text-lg text-gray-400 line-through mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ${originalPrice.toFixed(2)}
            </motion.span>
          )}
        </div>

        {/* Savings badge */}
        {savings && (
          <motion.div
            className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-green-100 text-green-700 rounded-full w-fit"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TrendingDown className="h-4 w-4" />
            <span className="text-sm font-medium">{savings}</span>
          </motion.div>
        )}

        {/* Recurring details */}
        {perClean && cleansPerMonth && (
          <div className="mt-4 pt-4 border-t border-primary/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Per clean</span>
              <span className="font-medium text-gray-900">${perClean.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">× {cleansPerMonth} cleans/month</span>
              {monthlyTotal && (
                <span className="font-semibold text-primary">${monthlyTotal.toFixed(2)}/mo</span>
              )}
            </div>
          </div>
        )}

        {/* Deposit */}
        {depositAmount && (
          <motion.div
            className="mt-4 pt-4 border-t border-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-gray-600">Deposit to confirm</span>
              </div>
              <span className="text-lg font-bold text-primary">${depositAmount.toFixed(2)}</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Compact price preview
export function CompactPricePreview({
  price,
  label,
  className,
}: {
  price: number;
  label?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className="text-sm text-gray-600">{label || "Estimated Price"}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={price}
          className="text-xl font-bold text-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          ${price.toFixed(2)}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
