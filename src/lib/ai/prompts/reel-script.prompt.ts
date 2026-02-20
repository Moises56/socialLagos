import type { Tone } from "@/lib/utils/constants";

interface ReelScriptParams {
  niche: string;
  tone: Tone;
  targetAudience: string;
  language: string;
  contentPillars: string[];
  topic?: string;
  duration?: number;
}

export function buildReelScriptPrompt(params: ReelScriptParams): string {
  const durationSec = params.duration ?? 60;

  return `Eres un experto creador de contenido viral para redes sociales. Genera un script completo para un Reel/TikTok.

PARÁMETROS:
- Nicho: ${params.niche}
- Tono: ${params.tone}
- Audiencia: ${params.targetAudience}
- Idioma: ${params.language}
- Pilares de contenido: ${params.contentPillars.join(", ")}
${params.topic ? `- Tema específico: ${params.topic}` : ""}
- Duración objetivo: ${durationSec} segundos

ESTRUCTURA REQUERIDA (responde en JSON):
{
  "hook": "Los primeros 3 segundos que capturan atención (DEBE ser impactante, polémico o intrigante)",
  "script": "El script completo con indicaciones de timing [0:00-0:03], [0:03-0:15], etc.",
  "caption": "Caption optimizado para engagement (incluye call to action)",
  "hashtags": ["lista", "de", "hashtags", "relevantes", "máximo", "15"],
  "callToAction": "Frase de cierre que invite a interactuar",
  "estimatedDuration": ${durationSec},
  "tipsForRecording": "Consejos breves para grabar este contenido"
}

REGLAS:
- El hook DEBE capturar atención en los primeros 3 segundos
- El script debe mantener engagement constante (sin momentos muertos)
- Los hashtags deben mezclar trending + nicho específico
- El caption debe incluir emoji y call to action
- Responde SOLO con el JSON, sin texto adicional`;
}
