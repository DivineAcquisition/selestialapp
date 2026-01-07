"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cn } from "@/lib/utils"

const RadioCardGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-3", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioCardGroup.displayName = "RadioCardGroup"

interface RadioCardItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  children: React.ReactNode
}

const RadioCardItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioCardItemProps
>(({ className, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "relative rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200",
        "hover:border-gray-300 hover:shadow-sm",
        "focus:outline-none focus-visible:border-primary/50 focus-visible:shadow-[0_0_0_3px_rgba(85,0,255,0.1)]",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary/5",
        "data-[state=checked]:shadow-[0_0_0_1px_rgba(85,0,255,0.3)]",
        "cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  )
})
RadioCardItem.displayName = "RadioCardItem"

const RadioCardIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 transition-all duration-200",
      "group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary",
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <div className="h-2 w-2 rounded-full bg-white" />
    </RadioGroupPrimitive.Indicator>
  </div>
))
RadioCardIndicator.displayName = "RadioCardIndicator"

// Enhanced version with built-in layout
interface RadioCardProps {
  value: string
  title: string
  description?: string
  icon?: React.ReactNode
  badge?: string
  disabled?: boolean
}

const RadioCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioCardProps
>(({ value, title, description, icon, badge, disabled }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      value={value}
      disabled={disabled}
      className={cn(
        "group relative rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200",
        "hover:border-gray-300 hover:shadow-sm",
        "focus:outline-none focus-visible:border-primary/50 focus-visible:shadow-[0_0_0_3px_rgba(85,0,255,0.1)]",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary/5",
        "data-[state=checked]:shadow-[0_0_0_1px_rgba(85,0,255,0.3)]",
        "cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Indicator */}
        <div className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 transition-all duration-200 mt-0.5",
          "group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary"
        )}>
          <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-white" />
          </RadioGroupPrimitive.Indicator>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {icon && <span className="text-gray-500 group-data-[state=checked]:text-primary">{icon}</span>}
            <span className="font-medium text-gray-900 group-data-[state=checked]:text-primary">{title}</span>
            {badge && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </RadioGroupPrimitive.Item>
  )
})
RadioCard.displayName = "RadioCard"

export { RadioCardGroup, RadioCardItem, RadioCardIndicator, RadioCard }
