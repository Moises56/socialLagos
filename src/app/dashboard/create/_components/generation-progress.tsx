"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

interface GenerationProgressProps {
  step: string;
  stepLabel: string;
  isGenerating: boolean;
  error: string | null;
}

const STEPS = [
  { key: "validating", label: "Validando parámetros" },
  { key: "generating_script", label: "Generando contenido con IA" },
  { key: "generating_image", label: "Generando imagen" },
  { key: "generating_voiceover", label: "Generando voz (Edge-TTS)" },
  { key: "scoring_quality", label: "Evaluando calidad" },
  { key: "saving", label: "Guardando en biblioteca" },
  { key: "done", label: "Completado" },
];

export function GenerationProgress({
  step,
  stepLabel,
  isGenerating,
  error,
}: GenerationProgressProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === step);
  const progress =
    step === "done"
      ? 100
      : step === "error"
        ? 0
        : Math.max(0, ((currentIdx + 1) / STEPS.length) * 100);

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-300">
          Progreso de generación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />

        <div className="space-y-2">
          {STEPS.map((s, idx) => {
            const isComplete = currentIdx > idx || step === "done";
            const isActive =
              s.key === step ||
              (step === "generating_script" &&
                (s.key === "generating_script"));
            const isFailed = step === "error" && s.key === STEPS[currentIdx]?.key;

            return (
              <div
                key={s.key}
                className={`flex items-center gap-2 text-sm ${
                  isComplete
                    ? "text-green-400"
                    : isActive
                      ? "text-indigo-400"
                      : isFailed
                        ? "text-red-400"
                        : "text-slate-600"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isActive && isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFailed ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-slate-700" />
                )}
                {s.label}
              </div>
            );
          })}
        </div>

        {isGenerating && stepLabel && (
          <p className="text-xs text-indigo-400 animate-pulse">{stepLabel}</p>
        )}

        {error && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
