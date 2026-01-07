"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Gradient text
interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  gradient?: string;
  animate?: boolean;
}

export const GradientText = ({
  children,
  gradient = "from-primary via-[#9D96FF] to-primary",
  animate = false,
  className,
  ...props
}: GradientTextProps) => {
  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        gradient,
        animate && "bg-[length:200%_auto] animate-gradient",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Shimmer text
interface ShimmerTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const ShimmerText = ({
  children,
  className,
  ...props
}: ShimmerTextProps) => {
  return (
    <span
      className={cn(
        "inline-flex animate-shimmer-text bg-[linear-gradient(110deg,#5500FF,45%,#9D96FF,55%,#5500FF)] bg-[length:200%_100%] bg-clip-text text-transparent",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Blur reveal text
interface BlurRevealTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
}

export const BlurRevealText = ({
  children,
  delay = 0,
  className,
  ...props
}: BlurRevealTextProps) => {
  return (
    <div
      className={cn(
        "animate-blur-reveal",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
};

// Number counter animation
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter = ({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;
    
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Ease out quad
      const easeOut = 1 - (1 - progress) * (1 - progress);
      
      setCount(Math.floor(easeOut * (value - startValue) + startValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Typing effect
interface TypingEffectProps {
  text: string;
  speed?: number;
  className?: string;
}

export const TypingEffect = ({
  text,
  speed = 50,
  className,
}: TypingEffectProps) => {
  const [displayText, setDisplayText] = React.useState("");
  const [index, setIndex] = React.useState(0);
  
  React.useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[index]);
        setIndex(index + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);
  
  return (
    <span className={className}>
      {displayText}
      <span className="animate-blink">|</span>
    </span>
  );
};

// Word by word reveal
interface WordRevealProps {
  text: string;
  delay?: number;
  className?: string;
  wordClassName?: string;
}

export const WordReveal = ({
  text,
  delay = 50,
  className,
  wordClassName,
}: WordRevealProps) => {
  const words = text.split(" ");
  
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className={cn(
            "inline-block opacity-0 animate-slide-up",
            wordClassName
          )}
          style={{ animationDelay: `${i * delay}ms`, animationFillMode: "forwards" }}
        >
          {word}&nbsp;
        </span>
      ))}
    </span>
  );
};

// Letter by letter reveal
interface LetterRevealProps {
  text: string;
  delay?: number;
  className?: string;
}

export const LetterReveal = ({
  text,
  delay = 30,
  className,
}: LetterRevealProps) => {
  return (
    <span className={className}>
      {text.split("").map((letter, i) => (
        <span
          key={i}
          className="inline-block opacity-0 animate-scale-fade"
          style={{ animationDelay: `${i * delay}ms`, animationFillMode: "forwards" }}
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </span>
  );
};

// Highlight text (like a text marker)
interface HighlightTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  color?: string;
}

export const HighlightText = ({
  children,
  color = "rgba(85, 0, 255, 0.15)",
  className,
  ...props
}: HighlightTextProps) => {
  return (
    <span
      className={cn(
        "relative inline-block",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 -skew-x-2 rounded-sm"
        style={{ backgroundColor: color }}
      />
    </span>
  );
};

// Underline animation
interface AnimatedUnderlineProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const AnimatedUnderline = ({
  children,
  className,
  ...props
}: AnimatedUnderlineProps) => {
  return (
    <span
      className={cn(
        "relative inline-block group cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-[#9D96FF] group-hover:w-full transition-all duration-300" />
    </span>
  );
};

// Badge pulse
interface PulseBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger";
}

export const PulseBadge = ({
  children,
  variant = "primary",
  className,
  ...props
}: PulseBadgeProps) => {
  const variants = {
    primary: "bg-primary/10 text-primary ring-primary/30",
    success: "bg-emerald-100 text-emerald-700 ring-emerald-300",
    warning: "bg-amber-100 text-amber-700 ring-amber-300",
    danger: "bg-red-100 text-red-700 ring-red-300",
  };

  return (
    <span
      className={cn(
        "relative inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full",
        variants[variant],
        className
      )}
      {...props}
    >
      <span className="absolute -inset-0.5 rounded-full animate-ping opacity-30 ring-2 ring-current" />
      {children}
    </span>
  );
};
