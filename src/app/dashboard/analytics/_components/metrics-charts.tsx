"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalyticsSnapshot, AnalyticsPublication } from "@/hooks/use-analytics";

const COLORS = ["#818cf8", "#22d3ee", "#f472b6", "#34d399", "#fbbf24"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

interface MetricsChartsProps {
  snapshots: AnalyticsSnapshot[];
  publications: AnalyticsPublication[];
}

export function MetricsCharts({ snapshots, publications }: MetricsChartsProps) {
  // Prepare followers chart data
  const followersData = snapshots.map((s) => ({
    date: formatDate(s.date),
    followers: s.followers,
    growth: s.followersGrowth,
  }));

  // Prepare views chart data
  const viewsData = snapshots.map((s) => ({
    date: formatDate(s.date),
    views: s.totalViews,
    engagement: s.avgEngagementRate,
  }));

  // Prepare content type distribution
  const contentTypeData = (() => {
    const totals = { reels: 0, videos: 0, images: 0 };
    for (const s of snapshots) {
      totals.reels += s.byContentType?.reels?.views ?? 0;
      totals.videos += s.byContentType?.videos?.views ?? 0;
      totals.images += s.byContentType?.images?.views ?? 0;
    }
    return [
      { name: "Reels", value: totals.reels },
      { name: "Videos", value: totals.videos },
      { name: "Imágenes", value: totals.images },
    ].filter((d) => d.value > 0);
  })();

  // Prepare publication performance
  const pubData = publications.slice(0, 20).map((p, i) => ({
    name: `Post ${i + 1}`,
    views: p.metrics.views,
    likes: p.metrics.likes,
    engagement: p.metrics.engagementRate,
  }));

  const hasSnapshots = snapshots.length > 0;
  const hasPublications = publications.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Followers Growth */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-sm text-white">
            Crecimiento de seguidores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasSnapshots ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={followersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="#818cf8"
                  fill="#818cf8"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-xs text-slate-500">
              Publica contenido para ver métricas de crecimiento
            </div>
          )}
        </CardContent>
      </Card>

      {/* Views Over Time */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-sm text-white">
            Vistas totales
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasSnapshots ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#22d3ee"
                  fill="#22d3ee"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-xs text-slate-500">
              Publica contenido para ver métricas de vistas
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publication Performance */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-sm text-white">
            Rendimiento de publicaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasPublications ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pubData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#64748b" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="views" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="likes" fill="#f472b6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-xs text-slate-500">
              Las métricas aparecerán al publicar contenido
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Type Distribution */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-sm text-white">
            Distribución por tipo de contenido
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contentTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={contentTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {contentTypeData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-xs text-slate-500">
              Publica diferentes tipos de contenido para ver la distribución
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
