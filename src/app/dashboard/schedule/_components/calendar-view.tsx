"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import type { ScheduledItem } from "@/hooks/use-schedule";

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-blue-500",
  instagram: "bg-pink-500",
  tiktok: "bg-cyan-500",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface CalendarViewProps {
  items: ScheduledItem[];
  currentMonth: Date;
  onSelectDay: (date: Date) => void;
  selectedDate: Date | null;
}

export function CalendarView({
  items,
  currentMonth,
  onSelectDay,
  selectedDate,
}: CalendarViewProps) {
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Previous month padding
    for (let i = startPad - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      });
    }

    // Fill remaining to complete 6 weeks
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, ScheduledItem[]>();
    for (const item of items) {
      const d = item.scheduledAt ?? item.publishedAt ?? item.createdAt;
      const key = new Date(d).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [items]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-slate-500"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
          const key = date.toISOString().slice(0, 10);
          const dayItems = itemsByDate.get(key) ?? [];
          const isToday = key === today;
          const isSelected =
            selectedDate && key === selectedDate.toISOString().slice(0, 10);

          return (
            <button
              key={idx}
              onClick={() => onSelectDay(date)}
              className={`relative min-h-[80px] rounded-lg border p-1.5 text-left transition-colors ${
                isCurrentMonth
                  ? "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                  : "border-transparent bg-slate-950/30"
              } ${isToday ? "ring-1 ring-indigo-500/50" : ""} ${
                isSelected ? "border-indigo-500 bg-indigo-500/10" : ""
              }`}
            >
              <span
                className={`text-xs ${
                  isCurrentMonth ? "text-slate-300" : "text-slate-600"
                } ${isToday ? "font-bold text-indigo-400" : ""}`}
              >
                {date.getDate()}
              </span>

              <div className="mt-1 space-y-0.5">
                {dayItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-1"
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        PLATFORM_COLORS[item.platform] ?? "bg-slate-500"
                      }`}
                    />
                    <Badge
                      className={`h-4 truncate text-[8px] leading-none ${
                        STATUS_COLORS[item.status] ?? ""
                      }`}
                    >
                      {item.account?.name?.slice(0, 8) ?? item.platform}
                    </Badge>
                  </div>
                ))}
                {dayItems.length > 3 && (
                  <span className="text-[9px] text-slate-500">
                    +{dayItems.length - 3} más
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
