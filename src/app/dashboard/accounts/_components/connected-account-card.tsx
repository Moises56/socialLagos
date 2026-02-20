"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Unplug, TrendingUp } from "lucide-react";
import type { SocialAccountData } from "@/hooks/use-social-accounts";

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

const MONETIZATION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  not_eligible: { label: "No elegible", color: "text-slate-400" },
  in_progress: { label: "En progreso", color: "text-yellow-400" },
  eligible: { label: "Elegible", color: "text-emerald-400" },
  active: { label: "Monetización activa", color: "text-emerald-300" },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

interface ConnectedAccountCardProps {
  account: SocialAccountData;
  onDisconnect: (id: string) => Promise<boolean>;
  disconnecting: boolean;
}

export function ConnectedAccountCard({
  account,
  onDisconnect,
  disconnecting,
}: ConnectedAccountCardProps) {
  const [open, setOpen] = useState(false);
  const style = PLATFORM_STYLES[account.platform] ?? PLATFORM_STYLES.facebook;
  const monStatus = MONETIZATION_STATUS_LABELS[account.monetization.status];

  const followersPercent =
    account.monetization.targetFollowers > 0
      ? Math.min(
          100,
          (account.monetization.currentFollowers /
            account.monetization.targetFollowers) *
            100
        )
      : 0;

  const handleDisconnect = async () => {
    const ok = await onDisconnect(account.id);
    if (ok) setOpen(false);
  };

  return (
    <Card className={`border ${style.borderColor} ${style.bgColor}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {account.avatarUrl ? (
              <img
                src={account.avatarUrl}
                alt={account.accountName}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/50 font-bold uppercase ${style.color}`}
              >
                {account.accountName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-white">{account.accountName}</p>
              <div className="flex items-center gap-2">
                <Badge className={`${style.bgColor} ${style.color} text-[10px]`}>
                  {style.label}
                </Badge>
                <span className="text-xs capitalize text-slate-500">
                  {account.accountType}
                </span>
              </div>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
            Activo
          </Badge>
        </div>

        {/* Monetization progress */}
        <div className="mb-3 rounded-lg bg-slate-950/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-slate-300">
                Monetización
              </span>
            </div>
            <span className={`text-xs font-medium ${monStatus?.color}`}>
              {monStatus?.label}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="mb-1 flex justify-between text-[10px] text-slate-400">
                <span>Seguidores</span>
                <span>
                  {formatNumber(account.monetization.currentFollowers)} /{" "}
                  {formatNumber(account.monetization.targetFollowers)}
                </span>
              </div>
              <Progress value={followersPercent} className="h-1.5" />
            </div>

            <div className="flex gap-4 text-[10px] text-slate-500">
              <span>
                Vistas 30d:{" "}
                {formatNumber(account.monetization.currentViews30d)}
              </span>
              <span>
                Watch min:{" "}
                {formatNumber(account.monetization.currentWatchMinutes60d)}
              </span>
            </div>
          </div>
        </div>

        {/* Connected date + disconnect */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Conectado:{" "}
            {new Date(account.connectedAt).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Unplug className="mr-1 h-3 w-3" />
                Desconectar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-slate-800 bg-slate-900">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Desconectar {account.accountName}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Se desvinculará esta cuenta de {style.label}. No se eliminarán
                  las publicaciones ya realizadas. Podrás reconectar en cualquier
                  momento.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-slate-700 text-slate-400">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDisconnect}
                  className="bg-red-600 text-white hover:bg-red-700"
                  disabled={disconnecting}
                >
                  {disconnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Desconectando...
                    </>
                  ) : (
                    "Sí, desconectar"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
