"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2 } from "lucide-react";
import type { Platform } from "@/lib/utils/constants";

const PLATFORM_CONFIG: Record<
  Platform,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
  }
> = {
  facebook: {
    label: "Facebook",
    description: "Páginas de Facebook para publicar videos, reels e imágenes",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: "f",
  },
  instagram: {
    label: "Instagram",
    description: "Cuentas Business de Instagram para reels, posts y stories",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    icon: "ig",
  },
  tiktok: {
    label: "TikTok",
    description: "Publica videos directamente en TikTok",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    icon: "tt",
  },
};

interface AccountConnectorProps {
  connectedPlatforms: Platform[];
}

export function AccountConnector({ connectedPlatforms }: AccountConnectorProps) {
  const [connecting, setConnecting] = useState<Platform | null>(null);

  const handleConnect = (platform: Platform) => {
    setConnecting(platform);
    window.location.href = `/api/social/connect/${platform}`;
  };

  const platforms = Object.entries(PLATFORM_CONFIG) as [
    Platform,
    (typeof PLATFORM_CONFIG)[Platform],
  ][];

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-white">Conectar plataforma</CardTitle>
        <CardDescription className="text-slate-400">
          Vincula tus cuentas de redes sociales para publicar contenido directamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map(([platform, config]) => {
            const isConnected = connectedPlatforms.includes(platform);

            return (
              <div
                key={platform}
                className={`relative rounded-xl border p-4 transition-colors ${config.borderColor} ${config.bgColor}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg font-bold ${config.color} bg-slate-950/50 text-sm uppercase`}
                    >
                      {config.icon}
                    </div>
                    <span className={`font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  {isConnected && (
                    <Badge className="bg-emerald-500/20 text-emerald-400">
                      Conectado
                    </Badge>
                  )}
                </div>

                <p className="mb-4 text-xs text-slate-400">
                  {config.description}
                </p>

                {isConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-700 text-slate-400"
                    disabled
                  >
                    Ya conectado
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleConnect(platform)}
                    disabled={connecting !== null}
                  >
                    {connecting === platform ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Conectar {config.label}
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
