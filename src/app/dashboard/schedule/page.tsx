"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useSchedule } from "@/hooks/use-schedule";
import { CalendarView } from "./_components/calendar-view";
import { DayDetail } from "./_components/day-detail";

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const from = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).toISOString();
  const to = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).toISOString();

  const { items, loading, error, cancelScheduled } = useSchedule(from, to);

  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );

  const monthLabel = currentMonth.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    const key = selectedDate.toISOString().slice(0, 10);
    return items.filter((item) => {
      const d = item.scheduledAt ?? item.publishedAt ?? item.createdAt;
      return new Date(d).toISOString().slice(0, 10) === key;
    });
  }, [items, selectedDate]);

  const stats = useMemo(() => {
    const scheduled = items.filter((i) => i.status === "scheduled").length;
    const published = items.filter((i) => i.status === "published").length;
    const failed = items.filter((i) => i.status === "failed").length;
    return { scheduled, published, failed };
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Programar</h1>
        <p className="text-slate-400">
          Calendario de publicaciones programadas
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.scheduled}</p>
            <p className="text-xs text-slate-500">Programados</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.published}</p>
            <p className="text-xs text-slate-500">Publicados</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
            <p className="text-xs text-slate-500">Fallidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <CalendarDays className="h-5 w-5 text-indigo-400" />
              Calendario
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevMonth}
                className="h-8 w-8 p-0 text-slate-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[140px] text-center text-sm font-medium capitalize text-white">
                {monthLabel}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                className="h-8 w-8 p-0 text-slate-400"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-slate-400">
            Haz clic en un día para ver los detalles de las publicaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center text-sm text-red-400">
              {error}
            </div>
          ) : (
            <CalendarView
              items={items}
              currentMonth={currentMonth}
              onSelectDay={setSelectedDate}
              selectedDate={selectedDate}
            />
          )}
        </CardContent>
      </Card>

      {/* Day detail */}
      {selectedDate && (
        <DayDetail
          date={selectedDate}
          items={selectedDayItems}
          onCancel={cancelScheduled}
        />
      )}
    </div>
  );
}
