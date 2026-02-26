"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { type DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarRangeProps {
  date: DateRange | undefined;
  onSelect: (date: DateRange | undefined) => void;
  className?: string;
}

export function CalendarRange({
  date,
  onSelect,
  className,
}: CalendarRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-fit justify-start text-left font-normal h-9 text-xs border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shadow-sm",
              !date?.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd, y")} -{" "}
                  {format(date.to, "MMM dd, y")}
                </>
              ) : (
                format(date.from, "MMM dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 shadow-lg border-none"
          align="end"
          sideOffset={8}
        >
          <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={onSelect}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
