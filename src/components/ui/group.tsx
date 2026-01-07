"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const Group = React.forwardRef<HTMLDivElement, GroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
);
Group.displayName = "Group";

export { Group };
