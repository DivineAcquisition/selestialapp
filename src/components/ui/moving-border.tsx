"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";

export function MovingBorder({
  children,
  duration = 2000,
  rx = "16",
  ry = "16",
  className,
  containerClassName,
  borderClassName,
  as: Component = "button",
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  as?: React.ElementType;
  [key: string]: unknown;
}) {
  const pathRef = useRef<SVGRectElement | null>(null);
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(progress, (val) => {
    const rect = pathRef.current;
    if (!rect) return 0;
    const point = rect.getPointAtLength(val);
    return point.x;
  });

  const y = useTransform(progress, (val) => {
    const rect = pathRef.current;
    if (!rect) return 0;
    const point = rect.getPointAtLength(val);
    return point.y;
  });

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <Component
      className={cn(
        "relative h-16 w-40 overflow-hidden bg-transparent text-xl p-[1px]",
        containerClassName
      )}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `${rx}px` }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="absolute h-full w-full"
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <rect
            fill="none"
            width="100%"
            height="100%"
            rx={rx}
            ry={ry}
            ref={pathRef}
          />
        </svg>
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            display: "inline-block",
            transform,
          }}
        >
          <div
            className={cn(
              "h-20 w-20 rounded-full opacity-[0.8] bg-[radial-gradient(hsl(var(--primary))_40%,transparent_60%)]",
              borderClassName
            )}
          />
        </motion.div>
      </div>
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center antialiased backdrop-blur-xl bg-white/80",
          className
        )}
        style={{ borderRadius: `calc(${rx}px * 0.96)` }}
      >
        {children}
      </div>
    </Component>
  );
}

// Button variant with moving border
export function MovingBorderButton({
  children,
  className,
  containerClassName,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  [key: string]: unknown;
}) {
  return (
    <MovingBorder
      containerClassName={cn(
        "h-12 cursor-pointer rounded-xl",
        containerClassName
      )}
      className={cn(
        "font-medium text-gray-900 hover:text-primary transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </MovingBorder>
  );
}

// Card variant with moving border
export function MovingBorderCard({
  children,
  className,
  containerClassName,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  [key: string]: unknown;
}) {
  return (
    <MovingBorder
      as="div"
      containerClassName={cn(
        "h-auto w-full rounded-xl cursor-default",
        containerClassName
      )}
      className={cn(
        "p-5 flex flex-col bg-white",
        className
      )}
      rx="12"
      ry="12"
      duration={3000}
      {...props}
    >
      {children}
    </MovingBorder>
  );
}

export default MovingBorder;
