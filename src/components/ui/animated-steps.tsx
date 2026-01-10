"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  title: string;
  description?: string;
}

interface AnimatedStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function AnimatedSteps({ steps, currentStep, className }: AnimatedStepsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep - 1;
        const isCurrent = index === currentStep - 1;
        const isUpcoming = index > currentStep - 1;

        return (
          <React.Fragment key={index}>
            {/* Step indicator */}
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                  isCompleted && "bg-primary text-white",
                  isCurrent && "bg-primary text-white ring-4 ring-primary/20",
                  isUpcoming && "bg-gray-200 text-gray-500"
                )}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  index + 1
                )}
              </motion.div>
              
              {/* Step label (shown on larger screens) */}
              <span
                className={cn(
                  "hidden sm:block absolute -bottom-6 text-xs whitespace-nowrap font-medium transition-colors",
                  isCurrent ? "text-primary" : "text-gray-400"
                )}
              >
                {step.title}
              </span>
            </motion.div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="relative h-0.5 w-8 sm:w-12 bg-gray-200 mx-1">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={{ width: 0 }}
                  animate={{
                    width: isCompleted ? "100%" : isCurrent ? "50%" : "0%",
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Progress bar variant
export function AnimatedProgressBar({
  currentStep,
  totalSteps,
  className,
}: {
  currentStep: number;
  totalSteps: number;
  className?: string;
}) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
        <span className="text-gray-500">{Math.round(progress)}% Complete</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}
