import { generateText } from "./providers/client";
import { sanitizeAndParseJSON } from "./json-utils";
import type { Platform } from "@/lib/utils/constants";

export interface QualityScoreResult {
  overall: number;
  hookStrength: number;
  captionQuality: number;
  hashtagRelevance: number;
  estimatedReach: "low" | "medium" | "high";
  suggestions: string[];
}

export async function scoreContent(params: {
  hook: string;
  caption: string;
  hashtags: string[];
  platform: Platform;
  niche: string;
}): Promise<QualityScoreResult> {
  const prompt = `Eres un analista experto de contenido para redes sociales. Evalúa la calidad de este contenido.

PLATAFORMA: ${params.platform}
NICHO: ${params.niche}

CONTENIDO A EVALUAR:
- Hook: "${params.hook}"
- Caption: "${params.caption}"
- Hashtags: ${params.hashtags.join(" ")}

Evalúa cada aspecto de 0 a 100 y responde en JSON:
{
  "overall": <0-100>,
  "hookStrength": <0-100 - ¿Captura atención en 3 segundos?>,
  "captionQuality": <0-100 - ¿Es engaging, tiene CTA, formato correcto?>,
  "hashtagRelevance": <0-100 - ¿Mix correcto de trending + nicho?>,
  "estimatedReach": "low | medium | high",
  "suggestions": ["máximo 3 sugerencias concretas para mejorar"]
}

Sé crítico pero constructivo. Responde SOLO con el JSON.`;

  try {
    const result = await generateText(
      [{ role: "user", content: prompt }],
      { temperature: 0.3, maxTokens: 512 }
    );

    const data = sanitizeAndParseJSON(result.content) as {
      overall?: number;
      hookStrength?: number;
      captionQuality?: number;
      hashtagRelevance?: number;
      estimatedReach?: "low" | "medium" | "high";
      suggestions?: string[];
    };

    return {
      overall: Math.min(100, Math.max(0, data.overall ?? 50)),
      hookStrength: Math.min(100, Math.max(0, data.hookStrength ?? 50)),
      captionQuality: Math.min(100, Math.max(0, data.captionQuality ?? 50)),
      hashtagRelevance: Math.min(100, Math.max(0, data.hashtagRelevance ?? 50)),
      estimatedReach: data.estimatedReach ?? "medium",
      suggestions: data.suggestions ?? [],
    };
  } catch {
    // Fallback: basic heuristic scoring
    return heuristicScore(params);
  }
}

function heuristicScore(params: {
  hook: string;
  caption: string;
  hashtags: string[];
}): QualityScoreResult {
  let hookScore = 40;
  if (params.hook.length > 10) hookScore += 20;
  if (params.hook.includes("?") || params.hook.includes("!")) hookScore += 15;
  if (params.hook.length < 100) hookScore += 10;

  let captionScore = 40;
  if (params.caption.length > 50) captionScore += 15;
  if (params.caption.length < 500) captionScore += 10;
  if (/[?!]/.test(params.caption)) captionScore += 10;

  let hashtagScore = 40;
  if (params.hashtags.length >= 5 && params.hashtags.length <= 15) hashtagScore += 30;
  else if (params.hashtags.length > 0) hashtagScore += 15;

  const overall = Math.round(
    hookScore * 0.35 + captionScore * 0.35 + hashtagScore * 0.3
  );

  return {
    overall,
    hookStrength: hookScore,
    captionQuality: captionScore,
    hashtagRelevance: hashtagScore,
    estimatedReach: overall > 70 ? "high" : overall > 45 ? "medium" : "low",
    suggestions: [
      hookScore < 60 ? "Mejora el hook para capturar atención en 3 segundos" : "",
      captionScore < 60 ? "Agrega un call to action más claro en el caption" : "",
      hashtagScore < 60 ? "Usa entre 5 y 15 hashtags mezclando trending + nicho" : "",
    ].filter(Boolean),
  };
}
