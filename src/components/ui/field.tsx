"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/lib/utils";

function Field({ className, ...props }: FieldPrimitive.Root.Props) {
  return (
    <FieldPrimitive.Root
      className={cn("flex flex-col items-start gap-2", className)}
      data-slot="field"
      {...props}
    />
  );
}

interface FieldLabelProps extends FieldPrimitive.Label.Props {
  required?: boolean;
}

function FieldLabel({ className, required, children, ...props }: FieldLabelProps) {
  return (
    <FieldPrimitive.Label
      className={cn(
        "inline-flex items-center gap-2 font-medium text-base/4.5 sm:text-sm/4",
        className,
      )}
      data-slot="field-label"
      {...props}
    >
      {children}
      {required && <span className="text-destructive">*</span>}
    </FieldPrimitive.Label>
  );
}

function FieldDescription({
  className,
  ...props
}: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      className={cn("text-muted-foreground text-xs", className)}
      data-slot="field-description"
      {...props}
    />
  );
}

// Extended FieldError with show prop for backward compatibility
interface FieldErrorProps extends Omit<FieldPrimitive.Error.Props, 'children'> {
  show?: boolean;
  children?: React.ReactNode;
  className?: string;
}

function FieldError({ className, show, children, ...props }: FieldErrorProps) {
  // If show is explicitly false, don't render
  if (show === false) {
    return null;
  }
  
  return (
    <FieldPrimitive.Error
      className={cn("text-destructive text-xs", className)}
      data-slot="field-error"
      {...props}
    >
      {children}
    </FieldPrimitive.Error>
  );
}

const FieldControl = FieldPrimitive.Control;
const FieldValidity = FieldPrimitive.Validity;

// Backward compatibility: FieldGroup is a styled container for grouping fields
function FieldGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("space-y-4", className)}
      data-slot="field-group"
      {...props}
    />
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldControl,
  FieldValidity,
  FieldGroup,
};
