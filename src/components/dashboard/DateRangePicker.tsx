import * as React from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DateRangePickerProps {
  className?: string;
  onRangeChange?: (range: { from: Date; to: Date; label: string }) => void;
}

// ── Preset definitions ─────────────────────────────────────────────────────
const buildPresets = () => [
  // Day
  {
    name: "Today",
    group: "day",
    getRange: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  // Week
  {
    name: "This Week",
    group: "week",
    getRange: () => ({
      from: startOfWeek(new Date()),
      to: endOfWeek(new Date()),
    }),
  },
  {
    name: "Last Week",
    group: "week",
    getRange: () => {
      const d = subWeeks(new Date(), 1);
      return { from: startOfWeek(d), to: endOfWeek(d) };
    },
  },
  // Month
  {
    name: "This Month",
    group: "month",
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    name: "Last Month",
    group: "month",
    getRange: () => {
      const d = subMonths(new Date(), 1);
      return { from: startOfMonth(d), to: endOfMonth(d) };
    },
  },
];

export function DateRangePicker({
  className,
  onRangeChange,
}: DateRangePickerProps) {
  const presets = React.useMemo(() => buildPresets(), []);

  // Default to "This Week"
  const initialRange = presets[1].getRange(); // "This Week"
  const [date, setDate] = React.useState<DateRange | undefined>(initialRange);
  const [label, setLabel] = React.useState("This Week");
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Sync initial range on mount so child components get data immediately
  React.useEffect(() => {
    onRangeChange?.({ ...initialRange, label: "This Week" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Preset selection ───────────────────────────────────────────────────────
  const handlePreset = (name: string) => {
    const preset = presets.find((p) => p.name === name);
    if (!preset) return;
    const range = preset.getRange();
    setDate(range);
    setLabel(name);
    onRangeChange?.({ ...range, label: name });
  };

  // ── Custom calendar selection (supports single-day pick) ───────────────────
  const handleCustom = (picked: DateRange | undefined) => {
    setDate(picked);
    if (!picked?.from) return;

    const to = picked.to ?? picked.from;
    const sameDay =
      format(picked.from, "yyyy-MM-dd") === format(to, "yyyy-MM-dd");

    const newLabel = sameDay
      ? format(picked.from, "LLL dd, y")
      : `${format(picked.from, "LLL dd")} – ${format(to, "LLL dd, y")}`;

    setLabel(newLabel);
    onRangeChange?.({
      from: startOfDay(picked.from),
      to: endOfDay(to),
      label: newLabel,
    });
  };

  // ── Group names for separators ─────────────────────────────────────────────
  let lastGroup = "";

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DropdownMenu>
          <div className="flex items-center gap-2">
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-fit justify-start text-left font-normal border-border bg-card hover:bg-secondary transition-colors h-10 px-3",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {label}
                <ChevronDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <PopoverTrigger asChild>
              <div className="hidden" />
            </PopoverTrigger>
          </div>

          <DropdownMenuContent align="end" className="w-44">
            {presets.map((p) => {
              const showSep = lastGroup !== "" && p.group !== lastGroup;
              lastGroup = p.group;
              return (
                <React.Fragment key={p.name}>
                  {showSep && <DropdownMenuSeparator />}
                  <DropdownMenuItem onClick={() => handlePreset(p.name)}>
                    {p.name}
                  </DropdownMenuItem>
                </React.Fragment>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsCalendarOpen(true)}>
              Custom
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleCustom}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
