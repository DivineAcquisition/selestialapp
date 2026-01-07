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
