"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  radius?: number
  strokeWidth?: number
  variant?: "default" | "success" | "warning" | "error"
  showAnimation?: boolean
  children?: React.ReactNode
}

const variantColors = {
  default: {
    track: "stroke-gray-200",
    progress: "stroke-primary",
  },
  success: {
    track: "stroke-emerald-100",
    progress: "stroke-emerald-500",
  },
  warning: {
    track: "stroke-amber-100",
    progress: "stroke-amber-500",
  },
  error: {
    track: "stroke-red-100",
    progress: "stroke-red-500",
  },
}

export function ProgressCircle({
  value,
  radius = 40,
  strokeWidth = 8,
  variant = "default",
  showAnimation = true,
  className,
  children,
  ...props
}: ProgressCircleProps) {
  const normalizedValue = Math.min(100, Math.max(0, value))
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (normalizedValue / 100) * circumference
  const size = (radius + strokeWidth) * 2
  const colors = variantColors[variant]

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={colors.track}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            colors.progress,
            showAnimation && "transition-all duration-500 ease-out"
          )}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

// Preset sizes
export function ProgressCircleSmall(props: Omit<ProgressCircleProps, "radius" | "strokeWidth">) {
  return <ProgressCircle radius={24} strokeWidth={4} {...props} />
}

export function ProgressCircleLarge(props: Omit<ProgressCircleProps, "radius" | "strokeWidth">) {
  return <ProgressCircle radius={56} strokeWidth={10} {...props} />
}
