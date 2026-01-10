"use client";

import { ChartCard } from "@/components/ui/chart-card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

interface WeeklyHeatmapProps {
  data: HeatmapData[];
  isLoading?: boolean;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

const getIntensity = (value: number, max: number) => {
  if (value === 0) return "bg-muted";
  const intensity = value / max;
  if (intensity < 0.25) return "bg-violet-200 dark:bg-violet-900";
  if (intensity < 0.5) return "bg-violet-400 dark:bg-violet-700";
  if (intensity < 0.75) return "bg-violet-500 dark:bg-violet-600";
  return "bg-violet-600 dark:bg-violet-500";
};

export function WeeklyHeatmap({ data, isLoading }: WeeklyHeatmapProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  const getValue = (day: string, hour: number) => {
    const item = data.find(d => d.day === day && d.hour === hour);
    return item?.value || 0;
  };

  return (
    <ChartCard
      title="Booking Heatmap"
      description="Busiest times of the week"
      isLoading={isLoading}
    >
      <div className="mt-4 overflow-x-auto">
        <TooltipProvider>
          <div className="min-w-[500px]">
            {/* Hour labels */}
            <div className="flex mb-2 ml-10">
              {HOURS.map(hour => (
                <div key={hour} className="flex-1 text-xs text-muted-foreground text-center">
                  {hour > 12 ? `${hour - 12}p` : hour === 12 ? '12p' : `${hour}a`}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-2 mb-1">
                <div className="w-8 text-xs text-muted-foreground">{day}</div>
                <div className="flex flex-1 gap-1">
                  {HOURS.map(hour => {
                    const value = getValue(day, hour);
                    return (
                      <Tooltip key={hour}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "flex-1 h-6 rounded cursor-pointer transition-all hover:scale-110",
                              getIntensity(value, maxValue)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm font-medium">{day} at {hour > 12 ? `${hour - 12}pm` : hour === 12 ? '12pm' : `${hour}am`}</p>
                          <p className="text-sm text-muted-foreground">{value} bookings</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4">
              <span className="text-xs text-muted-foreground">Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-muted" />
                <div className="w-4 h-4 rounded bg-violet-200 dark:bg-violet-900" />
                <div className="w-4 h-4 rounded bg-violet-400 dark:bg-violet-700" />
                <div className="w-4 h-4 rounded bg-violet-500 dark:bg-violet-600" />
                <div className="w-4 h-4 rounded bg-violet-600 dark:bg-violet-500" />
              </div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </ChartCard>
  );
}
