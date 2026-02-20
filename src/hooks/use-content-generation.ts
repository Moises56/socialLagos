"use client";

import { useState, useCallback } from "react";
import type { Platform, ContentType, Tone } from "@/lib/utils/constants";

export interface GenerationParams {
  niche: string;
  tone: Tone;
  targetAudience: string;
  language: string;
  contentPillars: string[];
  contentType: ContentType;
  platforms: Platform[];
  topic?: string;
  brandVoice?: string;
}

interface PlatformVariant {
  platform: Platform;
  caption: string;
  hashtags: string[];
  aspectRatio: string;
}

interface QualityScore {
  overall: number;
  hookStrength: number;
  captionQuality: number;
  hashtagRelevance: number;
  estimatedReach: "low" | "medium" | "high";
  suggestions: string[];
}

export interface GeneratedContent {
  id: string;
  contentType: ContentType;
  script?: string;
  hook: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  platformVariants: PlatformVariant[];
  qualityScore: QualityScore;
  generation: {
    provider: string;
    model: string;
  };
  mediaUrls?: Array<{
    type: "image" | "video" | "audio";
    url: string;
    width?: number;
    height?: number;
    sizeBytes: number;
  }>;
  voiceover?: {
    url: string;
    text: string;
    voice: string;
    durationSeconds: number;
  } | null;
  subtitles?: {
    url: string;
    language: string;
  } | null;
}

type GenerationStep =
  | "idle"
  | "validating"
  | "generating_script"
  | "generating_hooks"
  | "generating_image"
  | "generating_voiceover"
  | "adapting_platforms"
  | "scoring_quality"
  | "saving"
  | "done"
  | "error";

const STEP_LABELS: Record<GenerationStep, string> = {
  idle: "",
  validating: "Validando parámetros...",
  generating_script: "Generando contenido con IA...",
  generating_hooks: "Creando hooks virales...",
  generating_image: "Generando imagen con IA...",
  generating_voiceover: "Generando voz con Edge-TTS...",
  adapting_platforms: "Adaptando para cada plataforma...",
  scoring_quality: "Evaluando calidad del contenido...",
  saving: "Guardando en tu biblioteca...",
  done: "Contenido generado exitosamente",
  error: "Error al generar contenido",
};

export function useContentGeneration() {
  const [step, setStep] = useState<GenerationStep>("idle");
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async (params: GenerationParams) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setImageWarning(null);

    try {
      setStep("validating");
      await delay(300);

      setStep("generating_script");

      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message ?? "Error al generar contenido");
      }

      setStep("generating_image");
      await delay(400);

      setStep("generating_voiceover");
      await delay(400);

      setStep("scoring_quality");
      await delay(500);

      setStep("saving");
      await delay(300);

      setStep("done");
      setResult(data.data.content);
      if (data.data.content.imageWarning) {
        setImageWarning(data.data.content.imageWarning);
      }
    } catch (err) {
      setStep("error");
      setError(
        err instanceof Error ? err.message : "Error desconocido"
      );
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setStep("idle");
    setResult(null);
    setError(null);
    setImageWarning(null);
    setIsGenerating(false);
  }, []);

  return {
    generate,
    reset,
    step,
    stepLabel: STEP_LABELS[step],
    result,
    error,
    imageWarning,
    isGenerating,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
