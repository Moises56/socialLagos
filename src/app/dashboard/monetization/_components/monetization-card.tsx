"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Calendar, CheckCircle2, Clock } from "lucide-react";
import type { MonetizationProjection } from "@/hooks/use-monetization";

const PLATFORM_STYLES: Record<
  string,
  { color: string; bgColor: string; borderColor: string; label: string }
> = {
  facebook: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    label: "Facebook",
  },
  instagram: {
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    label: "Instagram",
  },
  tiktok: {
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    label: "TikTok",
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  not_eligible: { label: "No elegible", color: "text-slate-400", bgColor: "bg-slate-500/20" },
  in_progress: { label: "En progreso", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  eligible: { label: "Elegible", color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
  active: { label: "Activa", color: "text-emerald-300", bgColor: "bg-emerald-400/20" },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("es-ES");
}

function getProgressColor(progress: number): string {
  if (progress >= 100) return "bg-emerald-500";
  if (progress >= 75) return "bg-yellow-500";
  if (progress >= 50) return "bg-orange-500";
  return "bg-red-500";
}

interface MonetizationCardProps {
  projection: MonetizationProjection;
}

export function MonetizationCard({ projection }: MonetizationCardProps) {
  const style = PLATFORM_STYLES[projection.platform] ?? PLATFORM_STYLES.facebook;
  const statusCfg = STATUS_CONFIG[projection.monetizationStatus];

  return (
    <Card className={`border ${style.borderColor} ${style.bgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {projection.avatarUrl ? (
              <img
                src={projection.avatarUrl}
                alt={projection.accountName}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/50 font-bold uppercase ${style.color}`}
              >
                {projection.accountName.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-base text-white">
                {projection.accountName}
              </CardTitle>
              <Badge className={`${style.bgColor} ${style.color} text-[10px]`}>
                {style.label}
              </Badge>
            </div>
          </div>
          <Badge className={`${statusCfg?.bgColor} ${statusCfg?.color}`}>
            {statusCfg?.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall progress */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">
              Progreso general
            </span>
            <span className="text-xs font-bold text-white">
              {Math.round(projection.overallProgress)}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${getProgressColor(projection.overallProgress)}`}
              style={{ width: `${Math.min(100, projection.overallProgress)}%` }}
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          {projection.milestones.map((m) => (
            <div key={m.metric}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {m.progress >= 100 ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-indigo-400" />
                  )}
                  <span className="text-[11px] text-slate-400">{m.metric}</span>
                </div>
                <span className="text-[11px] text-slate-300">
                  {formatNumber(m.current)} / {formatNumber(m.target)}
                </span>
              </div>
              <Progress
                value={Math.min(100, m.progress)}
                className="h-1.5"
              />
              {m.estimatedDays !== null && m.estimatedDays > 0 && (
                <p className="mt-0.5 text-[9px] text-slate-500">
                  ~{m.estimatedDays} días restantes
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Projection */}
        <div className="rounded-lg bg-slate-950/40 p-3">
          {projection.isEligible ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                Cumples los requisitos de monetización
              </span>
            </div>
          ) : projection.estimatedDate ? (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <div>
                <p className="text-xs font-medium text-slate-300">
                  Fecha estimada de elegibilidad
                </p>
                <p className="text-sm font-bold text-indigo-400">
                  {new Date(projection.estimatedDate).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <p className="text-xs text-slate-500">
                Se necesitan más datos para estimar la fecha de elegibilidad.
                Continúa publicando contenido.
              </p>
            </div>
          )}
        </div>

        {/* Growth rates */}
        {(projection.followersGrowthRate > 0 || projection.viewsGrowthRate > 0) && (
          <div className="flex gap-4 text-[10px] text-slate-500">
            {projection.followersGrowthRate > 0 && (
              <span>
                +{Math.round(projection.followersGrowthRate)} seguidores/día
              </span>
            )}
            {projection.viewsGrowthRate > 0 && (
              <span>
                +{Math.round(projection.viewsGrowthRate)} vistas/día
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
