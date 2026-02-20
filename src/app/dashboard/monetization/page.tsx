"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Users, Loader2, AlertTriangle, Star, Play, RefreshCw } from "lucide-react";
import { useMonetization } from "@/hooks/use-monetization";
import { MonetizationCard } from "./_components/monetization-card";
import { MONETIZATION_REQUIREMENTS } from "@/lib/utils/constants";

export default function MonetizationPage() {
  const { projections, loading, error } = useMonetization();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Monetización</h1>
        <p className="text-slate-400">
          Trackea tu progreso hacia la monetización en cada plataforma
        </p>
      </div>

      {/* Platform Requirements Reference */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-white">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            Requisitos por plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-yellow-400" />
                <p className="text-sm font-semibold text-yellow-400">
                  FB Estrellas
                </p>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li>
                  {MONETIZATION_REQUIREMENTS.facebook.followers.toLocaleString()}{" "}
                  seguidores
                </li>
                <li>
                  {MONETIZATION_REQUIREMENTS.facebook.consecutiveDays} días
                  consecutivos
                </li>
                <li>Cumplir políticas de monetización</li>
                <li>País elegible</li>
              </ul>
            </div>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5 text-blue-400" />
                <p className="text-sm font-semibold text-blue-400">
                  FB Contenido
                </p>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li>
                  {MONETIZATION_REQUIREMENTS.facebook.contentMonetization.followers.toLocaleString()}{" "}
                  seguidores
                </li>
                <li>
                  {MONETIZATION_REQUIREMENTS.facebook.contentMonetization.watchMinutes60d.toLocaleString()}{" "}
                  min. vistos (60d)
                </li>
                <li>
                  {MONETIZATION_REQUIREMENTS.facebook.contentMonetization.minVideos}{" "}
                  videos mín.
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
              <p className="mb-2 text-sm font-semibold text-cyan-400">TikTok</p>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li>
                  {MONETIZATION_REQUIREMENTS.tiktok.followers.toLocaleString()}{" "}
                  seguidores
                </li>
                <li>
                  {MONETIZATION_REQUIREMENTS.tiktok.views30d.toLocaleString()}{" "}
                  vistas (30d)
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-pink-500/20 bg-pink-500/5 p-3">
              <p className="mb-2 text-sm font-semibold text-pink-400">Instagram</p>
              <p className="text-[11px] text-slate-400">
                {MONETIZATION_REQUIREMENTS.instagram.note}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Projections */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-indigo-400" />
            Progreso de tus cuentas
          </CardTitle>
          <CardDescription className="text-slate-400">
            Proyecciones basadas en tu crecimiento actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : error ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : projections.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-slate-500">
              <Users className="h-8 w-8" />
              <p className="text-sm">
                Conecta una cuenta social desde la sección de Cuentas para ver tu
                progreso de monetización.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {projections.map((p) => (
                <MonetizationCard key={p.accountId} projection={p} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
