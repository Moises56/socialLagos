"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, ExternalLink, X, AlertTriangle } from "lucide-react";
import type { ScheduledItem } from "@/hooks/use-schedule";

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  scheduled: { label: "Programado", color: "text-yellow-400" },
  published: { label: "Publicado", color: "text-emerald-400" },
  failed: { label: "Fallido", color: "text-red-400" },
  publishing: { label: "Publicando...", color: "text-blue-400" },
};

interface DayDetailProps {
  date: Date;
  items: ScheduledItem[];
  onCancel: (id: string) => Promise<boolean>;
}

export function DayDetail({ date, items, onCancel }: DayDetailProps) {
  const dateStr = date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (items.length === 0) {
    return (
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-sm capitalize text-white">
            {dateStr}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            No hay publicaciones para este día.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-sm capitalize text-white">
          {dateStr} — {items.length} publicaci{items.length === 1 ? "ón" : "ones"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const statusCfg = STATUS_CONFIG[item.status];
          const time = item.scheduledAt
            ? new Date(item.scheduledAt).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : item.publishedAt
              ? new Date(item.publishedAt).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

          return (
            <div
              key={item.id}
              className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-800 text-slate-300 text-xs">
                    {PLATFORM_LABELS[item.platform] ?? item.platform}
                  </Badge>
                  <span className={`text-xs font-medium ${statusCfg?.color}`}>
                    {statusCfg?.label}
                  </span>
                </div>
                {time && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    {time}
                  </div>
                )}
              </div>

              {item.content && (
                <p className="mb-2 line-clamp-2 text-xs text-slate-400">
                  {item.content.hook ?? item.content.caption}
                </p>
              )}

              {item.account && (
                <p className="mb-2 text-[10px] text-slate-500">
                  Cuenta: {item.account.name}
                </p>
              )}

              {item.errorMessage && (
                <div className="mb-2 flex items-center gap-1 text-xs text-red-400">
                  <AlertTriangle className="h-3 w-3" />
                  {item.errorMessage}
                </div>
              )}

              <div className="flex gap-2">
                {item.platformPostUrl && (
                  <a
                    href={item.platformPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 border-slate-700 text-[10px] text-slate-400"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Ver post
                    </Button>
                  </a>
                )}
                {item.status === "scheduled" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-red-400 hover:bg-red-500/10"
                    onClick={() => onCancel(item.id)}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
