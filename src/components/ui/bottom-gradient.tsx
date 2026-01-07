"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";
import { Input } from "./input";

// Bottom gradient effect for buttons
export const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-[#9D96FF] to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

// Enhanced input container with label
export const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

// Enhanced form input with gradient focus effect
export const GradientInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(({ className, label, id, ...props }, ref) => {
  return (
    <LabelInputContainer>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      <div className="relative group">
        <Input
          id={id}
          ref={ref}
          className={cn(
            "h-12 rounded-xl border-gray-200 bg-white transition-all duration-300",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            "group-hover:border-gray-300",
            className
          )}
          {...props}
        />
        <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition duration-300 group-focus-within:opacity-100" />
      </div>
    </LabelInputContainer>
  );
});

GradientInput.displayName = "GradientInput";

// Enhanced button with gradient effect
export const GradientButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "outline";
  }
>(({ className, children, variant = "primary", ...props }, ref) => {
  const variants = {
    primary: cn(
      "bg-gradient-to-br from-primary to-[#9D96FF] text-white",
      "shadow-[0px_1px_0px_0px_rgba(255,255,255,0.2)_inset,0px_-1px_0px_0px_rgba(255,255,255,0.2)_inset]",
      "hover:opacity-90"
    ),
    secondary: cn(
      "bg-gray-100 text-gray-900",
      "shadow-[0px_0px_1px_1px_rgba(0,0,0,0.05)]",
      "hover:bg-gray-200"
    ),
    outline: cn(
      "bg-white border-2 border-gray-200 text-gray-700",
      "hover:border-primary/40 hover:text-primary"
    ),
  };

  return (
    <button
      ref={ref}
      className={cn(
        "group/btn relative h-12 w-full rounded-xl font-medium transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
      <BottomGradient />
    </button>
  );
});

GradientButton.displayName = "GradientButton";

// Social login button
export const SocialButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: React.ReactNode;
    label: string;
  }
>(({ className, icon, label, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group/btn relative flex h-12 w-full items-center justify-center gap-3 rounded-xl",
        "bg-white border-2 border-gray-200 font-medium text-gray-700",
        "shadow-[0px_0px_1px_1px_rgba(0,0,0,0.02)]",
        "hover:border-gray-300 hover:bg-gray-50 transition-all duration-300",
        className
      )}
      {...props}
    >
      {icon}
      <span className="text-sm">{label}</span>
      <BottomGradient />
    </button>
  );
});

SocialButton.displayName = "SocialButton";

// Form divider with gradient
export const FormDivider = ({ text = "or" }: { text?: string }) => {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="px-4 bg-white text-gray-400 font-medium tracking-wider">
          {text}
        </span>
      </div>
    </div>
  );
};

export default BottomGradient;
