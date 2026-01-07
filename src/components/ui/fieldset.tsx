"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Fieldset = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  />
));
Fieldset.displayName = "Fieldset";

const FieldsetLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement>
>(({ className, ...props }, ref) => (
  <legend
    ref={ref}
    className={cn("text-sm font-medium leading-none", className)}
    {...props}
  />
));
FieldsetLegend.displayName = "FieldsetLegend";

export { Fieldset, FieldsetLegend };
