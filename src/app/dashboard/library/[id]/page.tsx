"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformPreview } from "../../create/_components/platform-preview";
import { QualityScoreBadge } from "../../create/_components/quality-score-badge";
import { useSocialAccounts } from "@/hooks/use-social-accounts";
import { usePublish } from "@/hooks/use-publish";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Cpu,
} from "lucide-react";
import type { Platform } from "@/lib/utils/constants";

interface ContentDetail {
  id: string;
  contentType: string;
  content: {
    script?: string;
    hook?: string;
    caption: string;
    hashtags: string[];
    callToAction?: string;
    mediaUrls: Array<{ type: string; url: string }>;
    voiceover?: {
      url: string;
      text: string;
      voice: string;
      durationSeconds: number;
    };
  };
  platformVariants: Array<{
    platform: Platform;
    caption: string;
    hashtags: string[];
    aspectRatio: string;
  }>;
  generation: {
    model: string;
    generatedAt: string;
  };
  status: string;
  qualityScore?: {
    overall: number;
    hookStrength: number;
    captionQuality: number;
    hashtagRelevance: number;
    estimatedReach: "low" | "medium" | "high";
  };
  createdAt: string;
}

export default function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { accounts } = useSocialAccounts();
  const { publishStates, publish } = usePublish();

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/content/${id}`);
      const data = await res.json();
      if (data.success) {
        setContent(data.data);
      } else {
        setError(data.error?.message ?? "Error al cargar contenido");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handlePublish = useCallback(
    (socialAccountId: string) => {
      if (content?.id) {
        publish(content.id, socialAccountId);
      }
    },
    [content?.id, publish]
  );

  const handleRegenerateImage = useCallback(
    async (contentId: string) => {
      const res = await fetch(`/api/content/${contentId}/regenerate-image`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setContent((prev) =>
          prev
            ? {
                ...prev,
                content: {
                  ...prev.content,
                  mediaUrls: [data.data.mediaUrl],
                },
              }
            : prev
        );
      } else {
        throw new Error(data.error?.message ?? "Error al regenerar imagen");
      }
    },
    []
  );

  const handleUploadImage = useCallback(
    async (contentId: string, file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`/api/content/${contentId}/upload-image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setContent((prev) =>
          prev
            ? {
                ...prev,
                content: {
                  ...prev.content,
                  mediaUrls: [data.data.mediaUrl],
                },
              }
            : prev
        );
      } else {
        throw new Error(data.error?.message ?? "Error al subir imagen");
      }
    },
    []
  );

  const handleRegenerateVoice = useCallback(
    async (contentId: string, voice: string) => {
      const res = await fetch(`/api/content/${contentId}/regenerate-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice }),
      });
      const data = await res.json();
      if (data.success) {
        setContent((prev) =>
          prev
            ? {
                ...prev,
                content: {
                  ...prev.content,
                  voiceover: data.data.voiceover,
                },
              }
            : prev
        );
        return data.data.voiceover;
      }
      throw new Error(data.error?.message ?? "Error al regenerar voz");
    },
    []
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-white"
          asChild
        >
          <Link href="/dashboard/library">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a biblioteca
          </Link>
        </Button>
        <div className="flex h-40 flex-col items-center justify-center gap-2">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-red-400">{error ?? "Contenido no encontrado"}</p>
        </div>
      </div>
    );
  }

  // Determine provider name from model string
  const providerName = content.generation.model.includes("llama")
    ? "groq"
    : content.generation.model.includes("deepseek")
      ? "deepseek"
      : content.generation.model.includes("gemini")
        ? "google"
        : "ai";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
            asChild
          >
            <Link href="/dashboard/library">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Biblioteca
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {content.content.hook ?? content.content.caption.slice(0, 60) + "..."}
            </h1>
            <p className="text-sm text-slate-400">
              Creado el{" "}
              {new Date(content.createdAt).toLocaleDateString("es", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Preview with publish */}
        <div className="lg:col-span-2 space-y-6">
          {/* Provider info */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-green-500/50 text-green-400"
            >
              <Cpu className="mr-1 h-3 w-3" />
              {providerName} / {content.generation.model}
            </Badge>
            <Badge
              variant="outline"
              className="border-slate-700 text-slate-400 capitalize"
            >
              {content.contentType}
            </Badge>
            <Badge
              variant="outline"
              className={
                content.status === "published"
                  ? "border-indigo-500/50 text-indigo-400"
                  : content.status === "ready"
                    ? "border-green-500/50 text-green-400"
                    : "border-slate-700 text-slate-400"
              }
            >
              {content.status}
            </Badge>
          </div>

          <PlatformPreview
            variants={content.platformVariants}
            hook={content.content.hook ?? ""}
            script={content.content.script}
            callToAction={content.content.callToAction ?? ""}
            mediaUrls={content.content.mediaUrls}
            voiceover={content.content.voiceover}
            contentId={content.id}
            accounts={accounts}
            publishStates={publishStates}
            onPublish={handlePublish}
            onRegenerateImage={handleRegenerateImage}
            onUploadImage={handleUploadImage}
            onRegenerateVoice={handleRegenerateVoice}
          />
        </div>

        {/* Right column: Quality */}
        <div className="space-y-6">
          {content.qualityScore && (
            <QualityScoreBadge
              score={{ ...content.qualityScore, suggestions: [] }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
