import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-base transition-all duration-200",
          "placeholder:text-gray-400",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "focus:outline-none focus:bg-white focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(85,0,255,0.1)]",
          "hover:border-gray-300 hover:bg-white",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100",
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
