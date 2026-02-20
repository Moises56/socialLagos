import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import GeneratedContent from "@/lib/db/models/generated-content.model";
import Publication from "@/lib/db/models/publication.model";
import SocialAccount from "@/lib/db/models/social-account.model";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PenTool,
  CalendarDays,
  BarChart3,
  TrendingUp,
  Eye,
  Users,
} from "lucide-react";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  await connectDB();
  const userId = session.user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    contentCount,
    publishedCount,
    scheduledCount,
    accountsCount,
    recentPublications,
    recentContent,
  ] = await Promise.all([
    GeneratedContent.countDocuments({
      userId,
      createdAt: { $gte: startOfMonth },
    }),
    Publication.countDocuments({
      userId,
      status: "published",
      publishedAt: { $gte: startOfMonth },
    }),
    Publication.countDocuments({ userId, status: "scheduled" }),
    SocialAccount.countDocuments({ userId, isActive: true }),
    Publication.find({
      userId,
      status: "published",
      publishedAt: { $gte: thirtyDaysAgo },
    })
      .select("metrics platform publishedAt")
      .sort({ publishedAt: -1 })
      .limit(5)
      .lean(),
    GeneratedContent.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("contentType content.caption qualityScore status createdAt")
      .lean(),
  ]);

  const totalViews = recentPublications.reduce(
    (sum, p) => sum + (p.metrics?.views ?? 0),
    0
  );

  const stats = [
    {
      title: "Contenido generado",
      value: formatNumber(contentCount),
      description: "Este mes",
      icon: PenTool,
    },
    {
      title: "Posts publicados",
      value: formatNumber(publishedCount),
      description: "Este mes",
      icon: CalendarDays,
    },
    {
      title: "Vistas totales",
      value: formatNumber(totalViews),
      description: "Últimos 30 días",
      icon: Eye,
    },
    {
      title: "Cuentas conectadas",
      value: formatNumber(accountsCount),
      description: "Redes sociales",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bienvenido, {session.user.name}
        </h1>
        <p className="text-slate-400">
          Este es tu panel de control de SocialForge
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border-slate-800 bg-slate-900/50"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <CardDescription className="text-xs text-slate-500">
                {stat.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {scheduledCount > 0 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <CalendarDays className="h-5 w-5 text-yellow-400" />
            <p className="text-sm text-yellow-300">
              Tienes <span className="font-bold">{scheduledCount}</span>{" "}
              publicaci{scheduledCount === 1 ? "ón" : "ones"} programada
              {scheduledCount === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              Contenido reciente
            </CardTitle>
            <CardDescription className="text-slate-400">
              Tus últimas generaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentContent.length > 0 ? (
              <div className="space-y-3">
                {recentContent.map((c) => (
                  <div
                    key={c._id.toString()}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-white">
                        {c.content?.caption?.slice(0, 60) ?? "Sin caption"}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge className="bg-slate-800 text-[9px] text-slate-400">
                          {c.contentType}
                        </Badge>
                        <span className="text-[10px] text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    {c.qualityScore && (
                      <Badge
                        className={`ml-2 ${
                          c.qualityScore.overall >= 80
                            ? "bg-emerald-500/20 text-emerald-400"
                            : c.qualityScore.overall >= 60
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {c.qualityScore.overall}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-slate-500">
                No hay actividad reciente. Comienza creando contenido.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              Publicaciones recientes
            </CardTitle>
            <CardDescription className="text-slate-400">
              Rendimiento de tus últimos posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPublications.length > 0 ? (
              <div className="space-y-3">
                {recentPublications.map((p) => (
                  <div
                    key={p._id.toString()}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-800 capitalize text-[9px] text-slate-400">
                        {p.platform}
                      </Badge>
                      <span className="text-[10px] text-slate-500">
                        {new Date(p.publishedAt!).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>{formatNumber(p.metrics?.views ?? 0)} vistas</span>
                      <span>{formatNumber(p.metrics?.likes ?? 0)} likes</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-slate-500">
                Conecta tu primera cuenta social para comenzar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
