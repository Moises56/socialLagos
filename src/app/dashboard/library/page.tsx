"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PenTool,
  Trash2,
  Copy,
  Check,
  Loader2,
  Library,
  Filter,
} from "lucide-react";

interface ContentItem {
  id: string;
  contentType: string;
  caption: string;
  hook?: string;
  hashtags: string[];
  status: string;
  qualityScore?: { overall: number; estimatedReach: string };
  platformVariants: Array<{ platform: string }>;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  reel: "Reel",
  video: "Video",
  image: "Imagen",
  carousel: "Carrusel",
  story: "Story",
};

const statusColors: Record<string, string> = {
  ready: "bg-green-500/20 text-green-400",
  draft: "bg-yellow-500/20 text-yellow-400",
  generating: "bg-blue-500/20 text-blue-400",
  published: "bg-indigo-500/20 text-indigo-400",
  failed: "bg-red-500/20 text-red-400",
  scheduled: "bg-purple-500/20 text-purple-400",
};

const platformColors: Record<string, string> = {
  facebook: "bg-blue-600/20 text-blue-400",
  tiktok: "bg-slate-600/20 text-slate-300",
  instagram: "bg-pink-600/20 text-pink-400",
};

export default function LibraryPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchContents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set("contentType", filter);
      const res = await fetch(`/api/content?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setContents(data.data.contents);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este contenido?")) return;
    try {
      const res = await fetch(`/api/content/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setContents((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      // silently fail
    }
  }

  async function handleCopy(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Biblioteca</h1>
          <p className="text-slate-400">
            Todo tu contenido generado en un solo lugar
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
          <Link href="/dashboard/create">
            <PenTool className="mr-2 h-4 w-4" />
            Crear nuevo
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <button
          onClick={() => setFilter("")}
          className={`rounded-md px-3 py-1 text-xs transition-colors ${
            !filter
              ? "bg-indigo-600/20 text-indigo-300"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          Todos
        </button>
        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-md px-3 py-1 text-xs transition-colors ${
              filter === key
                ? "bg-indigo-600/20 text-indigo-300"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        </div>
      ) : contents.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <Library className="h-12 w-12 text-slate-600" />
              <p className="text-slate-500">
                No hay contenido generado aún.
              </p>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                asChild
              >
                <Link href="/dashboard/create">Generar mi primer contenido</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contents.map((item) => (
            <Card
              key={item.id}
              className="group border-slate-800 bg-slate-900/50 transition-colors hover:border-slate-700 cursor-pointer"
              onClick={() => (window.location.href = `/dashboard/library/${item.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-slate-800 text-slate-300"
                    >
                      {typeLabels[item.contentType] ?? item.contentType}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={statusColors[item.status] ?? ""}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  {item.qualityScore && (
                    <span
                      className={`text-sm font-bold ${
                        item.qualityScore.overall >= 75
                          ? "text-green-400"
                          : item.qualityScore.overall >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {item.qualityScore.overall}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.hook && (
                  <p className="text-xs text-indigo-400 italic line-clamp-1">
                    &ldquo;{item.hook}&rdquo;
                  </p>
                )}
                <p className="text-sm text-slate-300 line-clamp-3">
                  {item.caption}
                </p>
                <div className="flex flex-wrap gap-1">
                  {item.platformVariants.map((v, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className={platformColors[v.platform] ?? ""}
                    >
                      {v.platform}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString("es")}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(item.id, item.caption); }}
                      className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white"
                      title="Copiar caption"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="rounded p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
