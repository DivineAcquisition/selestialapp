"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  action?: React.ReactNode;
  footer?: React.ReactNode;
}

export function ChartCard({ 
  title, 
  description, 
  children, 
  className,
  isLoading,
  action,
  footer
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          {action}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          ) : (
            children
          )}
        </CardContent>
        {footer && (
          <div className="border-t bg-muted/50 px-6 py-3">
            {footer}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
