"use client";

import { useContentGeneration } from "@/hooks/use-content-generation";
import { useSocialAccounts } from "@/hooks/use-social-accounts";
import { usePublish } from "@/hooks/use-publish";
import { ContentForm } from "./_components/content-form";
import { GenerationProgress } from "./_components/generation-progress";
import { PlatformPreview } from "./_components/platform-preview";
import { QualityScoreBadge } from "./_components/quality-score-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Cpu, AlertTriangle } from "lucide-react";
import { useCallback, useState } from "react";

export default function CreateContentPage() {
  const {
    generate,
    reset,
    step,
    stepLabel,
    result,
    error,
    imageWarning,
    isGenerating,
  } = useContentGeneration();

  const [regeneratedMediaUrls, setRegeneratedMediaUrls] = useState<
    Array<{ type: string; url: string; width?: number; height?: number }> | null
  >(null);

  const { accounts } = useSocialAccounts();
  const { publishStates, publish, resetPublish } = usePublish();

  const handleReset = useCallback(() => {
    reset();
    resetPublish();
    setRegeneratedMediaUrls(null);
  }, [reset, resetPublish]);

  const handleRegenerateImage = useCallback(
    async (contentId: string) => {
      const res = await fetch(`/api/content/${contentId}/regenerate-image`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setRegeneratedMediaUrls([data.data.mediaUrl]);
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
        setRegeneratedMediaUrls([data.data.mediaUrl]);
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
        return data.data.voiceover;
      }
      throw new Error(data.error?.message ?? "Error al regenerar voz");
    },
    []
  );

  const handlePublish = useCallback(
    (socialAccountId: string) => {
      if (result?.id) {
        publish(result.id, socialAccountId);
      }
    },
    [result?.id, publish]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Crear contenido</h1>
          <p className="text-slate-400">
            Genera contenido optimizado con inteligencia artificial
          </p>
        </div>
        {result && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Nueva generación
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Form or Results */}
        <div className="lg:col-span-2 space-y-6">
          {!result ? (
            <ContentForm onGenerate={generate} isGenerating={isGenerating} />
          ) : (
            <>
              {/* Provider info */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-green-500/50 text-green-400"
                >
                  <Cpu className="mr-1 h-3 w-3" />
                  {result.generation.provider} / {result.generation.model}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-700 text-slate-400"
                >
                  Costo: $0.00
                </Badge>
              </div>

              {/* Image warning */}
              {imageWarning && !regeneratedMediaUrls && (
                <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                  <p className="text-sm text-yellow-300">{imageWarning}</p>
                </div>
              )}

              <PlatformPreview
                variants={result.platformVariants}
                hook={result.hook}
                script={result.script}
                callToAction={result.callToAction}
                mediaUrls={regeneratedMediaUrls ?? result.mediaUrls}
                voiceover={result.voiceover}
                contentId={result.id}
                accounts={accounts}
                publishStates={publishStates}
                onPublish={handlePublish}
                onRegenerateImage={handleRegenerateImage}
                onUploadImage={handleUploadImage}
                onRegenerateVoice={handleRegenerateVoice}
              />
            </>
          )}
        </div>

        {/* Right column: Progress / Quality */}
        <div className="space-y-6">
          {(isGenerating || step === "error") && (
            <GenerationProgress
              step={step}
              stepLabel={stepLabel}
              isGenerating={isGenerating}
              error={error}
            />
          )}

          {result?.qualityScore && (
            <QualityScoreBadge score={result.qualityScore} />
          )}
        </div>
      </div>
    </div>
  );
}
