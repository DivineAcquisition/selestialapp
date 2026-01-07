"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Info, AlertTriangle, CheckCircle, XCircle, Lightbulb, Bot } from "lucide-react"

type CalloutVariant = "default" | "success" | "warning" | "error" | "info" | "ai"

interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  variant?: CalloutVariant
  icon?: React.ReactNode
}

const variantStyles: Record<CalloutVariant, { container: string; icon: React.ReactNode; iconColor: string }> = {
  default: {
    container: "bg-gray-50 border-gray-200 text-gray-900",
    icon: <Info className="h-5 w-5" />,
    iconColor: "text-gray-500",
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-900",
    icon: <Info className="h-5 w-5" />,
    iconColor: "text-blue-500",
  },
  success: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-900",
    icon: <CheckCircle className="h-5 w-5" />,
    iconColor: "text-emerald-500",
  },
  warning: {
    container: "bg-amber-50 border-amber-200 text-amber-900",
    icon: <AlertTriangle className="h-5 w-5" />,
    iconColor: "text-amber-500",
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-900",
    icon: <XCircle className="h-5 w-5" />,
    iconColor: "text-red-500",
  },
  ai: {
    container: "bg-gradient-to-r from-primary/5 to-[#9D96FF]/5 border-primary/20 text-gray-900",
    icon: <Bot className="h-5 w-5" />,
    iconColor: "text-primary",
  },
}

export function Callout({
  title,
  variant = "default",
  icon,
  className,
  children,
  ...props
}: CalloutProps) {
  const styles = variantStyles[variant]
  
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-4",
        styles.container,
        className
      )}
      {...props}
    >
      <div className={cn("flex-shrink-0 mt-0.5", styles.iconColor)}>
        {icon || styles.icon}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1">{title}</h4>
        )}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  )
}

// AI-specific callout with extra styling
export function AICallout({
  title = "AI Suggestion",
  className,
  children,
  ...props
}: Omit<CalloutProps, "variant">) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-primary/20 p-4",
        "bg-gradient-to-r from-primary/5 via-white to-[#9D96FF]/5",
        className
      )}
      {...props}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-[#9D96FF]/10 opacity-50 animate-pulse" style={{ animationDuration: '3s' }} />
      
      <div className="relative flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          )}
          <div className="text-sm text-gray-600">{children}</div>
        </div>
      </div>
    </div>
  )
}

// Tip callout
export function TipCallout({
  className,
  children,
  ...props
}: Omit<CalloutProps, "variant" | "title" | "icon">) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4",
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Lightbulb className="h-5 w-5 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0 text-sm text-amber-900">{children}</div>
    </div>
  )
}
