"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, X } from "lucide-react";
import type { GenerationParams } from "@/hooks/use-content-generation";
import type { Platform, ContentType, Tone } from "@/lib/utils/constants";

const TONES: { value: Tone; label: string; emoji: string }[] = [
  { value: "educational", label: "Educativo", emoji: "📚" },
  { value: "entertainment", label: "Entretenimiento", emoji: "🎬" },
  { value: "inspirational", label: "Inspiracional", emoji: "✨" },
  { value: "controversial", label: "Controversial", emoji: "🔥" },
  { value: "storytelling", label: "Storytelling", emoji: "📖" },
];

const CONTENT_TYPES: { value: ContentType; label: string; desc: string }[] = [
  { value: "reel", label: "Reel / TikTok", desc: "Video corto vertical" },
  { value: "video", label: "Video largo", desc: "Video >1 min" },
  { value: "image", label: "Imagen", desc: "Post con imagen" },
  { value: "carousel", label: "Carrusel", desc: "Múltiples imágenes" },
  { value: "story", label: "Story", desc: "Contenido efímero" },
];

const PLATFORMS: { value: Platform; label: string; color: string }[] = [
  { value: "facebook", label: "Facebook", color: "bg-blue-600" },
  { value: "tiktok", label: "TikTok", color: "bg-black" },
  { value: "instagram", label: "Instagram", color: "bg-pink-600" },
];

interface ContentFormProps {
  onGenerate: (params: GenerationParams) => void;
  isGenerating: boolean;
}

export function ContentForm({ onGenerate, isGenerating }: ContentFormProps) {
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState<Tone>("entertainment");
  const [targetAudience, setTargetAudience] = useState("");
  const [language, setLanguage] = useState("es");
  const [contentType, setContentType] = useState<ContentType>("reel");
  const [platforms, setPlatforms] = useState<Platform[]>(["facebook"]);
  const [topic, setTopic] = useState("");
  const [pillarInput, setPillarInput] = useState("");
  const [contentPillars, setContentPillars] = useState<string[]>([]);
  const [brandVoice, setBrandVoice] = useState("");

  function addPillar() {
    const trimmed = pillarInput.trim();
    if (trimmed && !contentPillars.includes(trimmed) && contentPillars.length < 10) {
      setContentPillars([...contentPillars, trimmed]);
      setPillarInput("");
    }
  }

  function removePillar(idx: number) {
    setContentPillars(contentPillars.filter((_, i) => i !== idx));
  }

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!niche || !targetAudience || contentPillars.length === 0 || platforms.length === 0)
      return;

    onGenerate({
      niche,
      tone,
      targetAudience,
      language,
      contentPillars,
      contentType,
      platforms,
      topic: topic || undefined,
      brandVoice: brandVoice || undefined,
    });
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          Generador de contenido
        </CardTitle>
        <CardDescription className="text-slate-400">
          Define los parámetros y la IA generará contenido optimizado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Niche + Audience */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Nicho *</Label>
              <Input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Ej: cocina saludable, fitness, finanzas..."
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Audiencia objetivo *</Label>
              <Input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Ej: mujeres 25-35, emprendedores..."
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label className="text-slate-300">
              Tema específico{" "}
              <span className="text-slate-500">(opcional)</span>
            </Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: 5 recetas en 15 minutos, cómo ahorrar $500/mes..."
              className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Content Pillars */}
          <div className="space-y-2">
            <Label className="text-slate-300">Pilares de contenido *</Label>
            <div className="flex gap-2">
              <Input
                value={pillarInput}
                onChange={(e) => setPillarInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPillar();
                  }
                }}
                placeholder="Escribe y presiona Enter..."
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addPillar}
                className="border-slate-700 text-slate-400 hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {contentPillars.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {contentPillars.map((p, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-indigo-600/20 text-indigo-300 cursor-pointer hover:bg-indigo-600/30"
                    onClick={() => removePillar(i)}
                  >
                    {p} <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label className="text-slate-300">Tono</Label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    tone === t.value
                      ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <Label className="text-slate-300">Tipo de contenido</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {CONTENT_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setContentType(ct.value)}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    contentType === ct.value
                      ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div className="font-medium">{ct.label}</div>
                  <div className="text-xs text-slate-500">{ct.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div className="space-y-2">
            <Label className="text-slate-300">Plataformas *</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlatform(p.value)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                    platforms.includes(p.value)
                      ? "border-indigo-500 bg-indigo-600/20 text-white"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      platforms.includes(p.value) ? p.color : "bg-slate-600"
                    }`}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language + Brand Voice */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Idioma</Label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">
                Voz de marca{" "}
                <span className="text-slate-500">(opcional)</span>
              </Label>
              <Input
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                placeholder="Ej: casual y divertido, profesional..."
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            size="lg"
            disabled={
              isGenerating ||
              !niche ||
              !targetAudience ||
              contentPillars.length === 0 ||
              platforms.length === 0
            }
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generar contenido
              </span>
            )}
          </Button>
          {/* Missing fields hint */}
          {!isGenerating &&
            (!niche || !targetAudience || contentPillars.length === 0 || platforms.length === 0) && (
              <p className="text-xs text-slate-500 text-center">
                Completa:{" "}
                {[
                  !niche && "Nicho",
                  !targetAudience && "Audiencia",
                  contentPillars.length === 0 && "Pilares (escribe y presiona Enter)",
                  platforms.length === 0 && "Plataformas",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
        </form>
      </CardContent>
    </Card>
  );
}
