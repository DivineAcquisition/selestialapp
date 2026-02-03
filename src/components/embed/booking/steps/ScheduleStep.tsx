"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useBooking } from "../BookingContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import {
  format,
  addDays,
  isWeekend,
  isBefore,
  startOfDay,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  getDay,
} from "date-fns";

interface ScheduleStepProps {
  onContinue?: () => void;
  showContinue?: boolean;
  minDaysAhead?: number;
  maxDaysAhead?: number;
  excludeWeekends?: boolean;
  availability?: Record<string, Record<string, { available: boolean; capacity: number; booked: number }>>;
  isLoadingAvailability?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PERIOD_CONFIG = {
  morning: { label: "Morning", iconName: "sun" as const, colorClass: "text-amber-500" },
  afternoon: { label: "Afternoon", iconName: "sun" as const, colorClass: "text-orange-500" },
  evening: { label: "Evening", iconName: "moon" as const, colorClass: "text-indigo-500" },
};

export function ScheduleStep({
  onContinue,
  showContinue = true,
  minDaysAhead = 3,
  maxDaysAhead = 60,
  excludeWeekends = true,
  availability = {},
  isLoadingAvailability = false,
}: ScheduleStepProps) {
  const { config, bookingData, updateBookingData, goToNextStep } = useBooking();
  const { theme } = config;

  const minDate = addDays(new Date(), minDaysAhead);
  const maxDate = addDays(new Date(), maxDaysAhead);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(minDate));

  // Parse selected date
  const selectedDate = bookingData.serviceDate
    ? new Date(bookingData.serviceDate + 'T12:00:00')
    : undefined;

  // Group time slots by period
  const slotsByPeriod = useMemo(() => {
    return config.timeSlots.reduce((acc, slot) => {
      if (!acc[slot.period]) acc[slot.period] = [];
      acc[slot.period].push(slot);
      return acc;
    }, {} as Record<string, typeof config.timeSlots>);
  }, [config.timeSlots]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPadding = getDay(monthStart);
    const paddingDays = Array(startPadding).fill(null);
    return [...paddingDays, ...days];
  }, [currentMonth]);

  const isDateDisabled = (date: Date) => {
    const beforeMin = isBefore(startOfDay(date), startOfDay(minDate));
    const afterMax = isBefore(maxDate, date);
    const isWeekendDay = excludeWeekends && isWeekend(date);
    return beforeMin || afterMax || isWeekendDay;
  };

  const getSlotStatus = (slotId: string) => {
    if (!bookingData.serviceDate) return { available: true, label: "Available" };
    const dateSlots = availability[bookingData.serviceDate];
    if (!dateSlots) return { available: true, label: "Available" };
    const slot = dateSlots[slotId];
    if (!slot) return { available: true, label: "Available" };
    if (!slot.available) return { available: false, label: "Unavailable" };
    const remaining = slot.capacity - slot.booked;
    if (remaining <= 2) return { available: true, label: "Few left" };
    return { available: true, label: "Available" };
  };

  const handleDateSelect = (date: Date) => {
    updateBookingData({
      serviceDate: format(date, 'yyyy-MM-dd'),
      timeSlot: '', // Reset time when date changes
    });
  };

  const handleTimeSelect = (slot: typeof config.timeSlots[0]) => {
    updateBookingData({
      timeSlot: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      goToNextStep();
    }
  };

  const goToPreviousMonth = () => {
    const prevMonth = addMonths(currentMonth, -1);
    if (!isBefore(endOfMonth(prevMonth), minDate)) {
      setCurrentMonth(prevMonth);
    }
  };

  const goToNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    if (isBefore(startOfMonth(nextMonth), maxDate)) {
      setCurrentMonth(nextMonth);
    }
  };

  const isScheduleComplete = bookingData.serviceDate && bookingData.timeSlot;

  return (
    <Card
      className="overflow-hidden shadow-lg"
      style={{ borderColor: `${theme.primaryColor}30`, borderWidth: '2px' }}
    >
      <CardHeader
        className="pb-4"
        style={{
          background: `linear-gradient(135deg, ${theme.primaryColor}10, transparent)`
        }}
      >
        <CardTitle className="text-xl flex items-center gap-2">
          <Icon name="calendar" size="lg" style={{ color: theme.primaryColor }} />
          Pick Your Date & Time
        </CardTitle>
        <CardDescription>
          Select a convenient appointment slot ({minDaysAhead}+ days advance booking required)
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {/* Step 1: Date Selection */}
        <div className="p-4 md:p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: theme.primaryColor }}
              >
                1
              </span>
              Select Date
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={goToPreviousMonth}
                disabled={isBefore(endOfMonth(addMonths(currentMonth, -1)), minDate)}
              >
                <Icon name="chevronLeft" size="sm" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={goToNextMonth}
                disabled={!isBefore(startOfMonth(addMonths(currentMonth, 1)), maxDate)}
              >
                <Icon name="chevronRight" size="sm" />
              </Button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`padding-${idx}`} className="aspect-square" />;
              }

              const disabled = isDateDisabled(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !disabled && handleDateSelect(day)}
                  disabled={disabled}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all relative",
                    "hover:bg-gray-100 focus:outline-none focus:ring-2",
                    disabled && "opacity-30 cursor-not-allowed hover:bg-transparent",
                    !isCurrentMonth && "opacity-50",
                    isSelected && "text-white shadow-md hover:opacity-90",
                    isToday && !isSelected && "ring-2 font-bold",
                    !disabled && !isSelected && "hover:scale-105"
                  )}
                  style={{
                    backgroundColor: isSelected ? theme.primaryColor : undefined,
                    // @ts-expect-error - CSS custom property for ring color
                    '--tw-ring-color': isToday && !isSelected ? `${theme.primaryColor}30` : `${theme.primaryColor}50`,
                  }}
                >
                  <span>{format(day, "d")}</span>
                  {isToday && !isSelected && (
                    <span
                      className="absolute bottom-1 w-1 h-1 rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Time Selection */}
        <div className="p-4 md:p-6">
          <p className="text-sm font-semibold flex items-center gap-2 mb-4">
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                selectedDate ? "text-white" : "bg-gray-200 text-gray-500"
              )}
              style={{
                backgroundColor: selectedDate ? theme.primaryColor : undefined
              }}
            >
              2
            </span>
            Select Time
          </p>

          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Icon name="clock" size="3xl" className="mb-3 opacity-30" />
              <p className="text-sm">Select a date first to see available times</p>
            </div>
          ) : isLoadingAvailability ? (
            <div className="space-y-4">
              {(["morning", "afternoon", "evening"] as const).map((period) => (
                <div key={period} className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 rounded-lg" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(["morning", "afternoon", "evening"] as const).map((period) => {
                const periodConfig = PERIOD_CONFIG[period];
                const slots = slotsByPeriod[period] || [];

                if (slots.length === 0) return null;

                return (
                  <div key={period} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                      <Icon name={periodConfig.iconName} size="sm" className={periodConfig.colorClass} />
                      {periodConfig.label}
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {slots.map((slot) => {
                        const status = getSlotStatus(slot.id);
                        const isSelected = bookingData.timeSlot === slot.id;

                        return (
                          <button
                            key={slot.id}
                            onClick={() => status.available && handleTimeSelect(slot)}
                            disabled={!status.available}
                            className={cn(
                              "relative py-2.5 px-2 rounded-lg border text-sm font-medium transition-all",
                              "focus:outline-none focus:ring-2",
                              isSelected
                                ? "border-transparent text-white shadow-md"
                                : "border-gray-200 hover:bg-gray-50",
                              !status.available && "opacity-40 cursor-not-allowed bg-gray-100 hover:bg-gray-100",
                              !isSelected && status.available && "hover:scale-105"
                            )}
                            style={{
                              backgroundColor: isSelected ? theme.primaryColor : undefined,
                              // @ts-expect-error - CSS custom property for ring color
                              '--tw-ring-color': `${theme.primaryColor}50`,
                              borderColor: isSelected ? theme.primaryColor : undefined,
                            }}
                          >
                            {slot.label}
                            {status.label === "Few left" && status.available && !isSelected && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selection Summary & Continue */}
        {showContinue && (
          <div
            className="border-t p-4 md:p-6"
            style={{ background: `linear-gradient(90deg, ${theme.primaryColor}05, ${theme.primaryColor}02)` }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                {isScheduleComplete ? (
                  <div className="flex items-center gap-3 text-sm animate-in fade-in">
                    <Badge
                      className="py-1.5 px-3 border-0"
                      style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
                    >
                      <Icon name="calendar" size="xs" className="mr-1.5" />
                      {format(selectedDate!, "EEE, MMM d, yyyy")}
                    </Badge>
                    <Badge
                      className="py-1.5 px-3 border-0"
                      style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
                    >
                      <Icon name="clock" size="xs" className="mr-1.5" />
                      {config.timeSlots.find(s => s.id === bookingData.timeSlot)?.label || bookingData.timeSlot}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {selectedDate ? "Now select a time slot above" : "Select a date and time to continue"}
                  </p>
                )}
              </div>
              <Button
                size="lg"
                className={cn(
                  "w-full md:w-auto font-semibold min-w-[200px] transition-all rounded-xl ring-2 ring-white/30",
                  !isScheduleComplete && "bg-gray-200 text-gray-500"
                )}
                style={{
                  background: isScheduleComplete ? theme.primaryGradient : undefined
                }}
                onClick={handleContinue}
                disabled={!isScheduleComplete}
              >
                Continue to Checkout
                <Icon name="chevronRight" size="sm" className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
