import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base transition-all duration-200",
        "placeholder:text-gray-400",
        "focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(85,0,255,0.1)]",
        "hover:border-gray-300",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        "md:text-sm",
        "resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
