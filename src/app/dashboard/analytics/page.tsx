"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { MetricsCharts } from "./_components/metrics-charts";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("es-ES");
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>();

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const { accounts, publications, snapshots, loading, error, refetch } =
    useAnalytics(selectedAccount, days);

  const handleSync = useCallback(async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);
      const body: Record<string, string> = {};
      if (selectedAccount) body.accountId = selectedAccount;
      const res = await fetch("/api/metrics/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) {
        setSyncMessage(json.error?.message ?? "Error al sincronizar");
        return;
      }
      const { posts, accounts: accs } = json.data;
      const parts: string[] = [];
      if (posts.discovered > 0) parts.push(`${posts.discovered} descubiertos`);
      parts.push(`${posts.synced} posts sincronizados`);
      parts.push(`${accs.synced} cuentas`);
      // Show actual metric totals from sync
      if (posts.details?.length > 0) {
        const totalViews = posts.details.reduce((s: number, d: { views: number }) => s + d.views, 0);
        const totalLikes = posts.details.reduce((s: number, d: { likes: number }) => s + d.likes, 0);
        parts.push(`${totalViews} vistas, ${totalLikes} likes obtenidos`);
      }
      if (posts.errors?.length > 0) {
        parts.push(`${posts.failed} errores`);
        console.log("[Analytics Sync] Errors:", posts.errors);
      }
      if (accs.errors?.length > 0) {
        console.log("[Analytics Sync] Account errors:", accs.errors);
      }
      setSyncMessage(parts.join(", "));
      await refetch();
    } catch {
      setSyncMessage("Error de conexión al sincronizar");
    } finally {
      setSyncing(false);
    }
  }, [selectedAccount, refetch]);

  const aggregatedMetrics = useMemo(() => {
    const totals = {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      impressions: 0,
      avgEngagement: 0,
    };
    for (const p of publications) {
      totals.views += p.metrics.views;
      totals.likes += p.metrics.likes;
      totals.comments += p.metrics.comments;
      totals.shares += p.metrics.shares;
      totals.impressions += p.metrics.impressions;
    }
    if (publications.length > 0) {
      totals.avgEngagement =
        publications.reduce((s, p) => s + p.metrics.engagementRate, 0) /
        publications.length;
    }
    return totals;
  }, [publications]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400">
            Métricas de rendimiento de tu contenido
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing || loading}
            className="border-slate-700 text-slate-400 hover:text-white"
          >
            <RefreshCw
              className={`mr-1 h-3 w-3 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Sincronizando..." : "Sincronizar"}
          </Button>
          <div className="h-4 w-px bg-slate-700" />
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(d)}
              className={
                days === d
                  ? ""
                  : "border-slate-700 text-slate-400"
              }
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Sync feedback */}
      {syncMessage && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            syncMessage.startsWith("Error")
              ? "bg-red-500/10 text-red-400"
              : "bg-green-500/10 text-green-400"
          }`}
        >
          {syncMessage}
        </div>
      )}

      {/* Account filter */}
      {accounts.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedAccount ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedAccount(undefined)}
            className={!selectedAccount ? "" : "border-slate-700 text-slate-400"}
          >
            Todas
          </Button>
          {accounts.map((a) => (
            <Button
              key={a.id}
              variant={selectedAccount === a.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAccount(a.id)}
              className={
                selectedAccount === a.id
                  ? ""
                  : "border-slate-700 text-slate-400"
              }
            >
              {a.accountName}
              <Badge className="ml-1 text-[9px]">{a.platform}</Badge>
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-slate-400">
                  Vistas
                </CardTitle>
                <Eye className="h-4 w-4 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-white">
                  {formatNumber(aggregatedMetrics.views)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-slate-400">
                  Likes
                </CardTitle>
                <Heart className="h-4 w-4 text-pink-400" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-white">
                  {formatNumber(aggregatedMetrics.likes)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-slate-400">
                  Comentarios
                </CardTitle>
                <MessageCircle className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-white">
                  {formatNumber(aggregatedMetrics.comments)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-slate-400">
                  Compartidos
                </CardTitle>
                <Share2 className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-white">
                  {formatNumber(aggregatedMetrics.shares)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-slate-400">
                  Engagement
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-white">
                  {aggregatedMetrics.avgEngagement.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <MetricsCharts snapshots={snapshots} publications={publications} />
        </>
      )}
    </div>
  );
}
