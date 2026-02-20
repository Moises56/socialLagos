import type { Tone, Platform } from "@/lib/utils/constants";

interface CaptionParams {
  niche: string;
  tone: Tone;
  platform: Platform;
  contentDescription: string;
  language: string;
  targetAudience: string;
}

export function buildCaptionPrompt(params: CaptionParams): string {
  const platformGuidelines: Record<Platform, string> = {
    facebook:
      "Captions más largos funcionan bien. Usa storytelling. Incluye pregunta para generar comentarios.",
    tiktok:
      "Captions cortos y directos. Usa trending sounds reference. Máximo 2-3 líneas.",
    instagram:
      "Mix de caption largo y corto. Primera línea debe enganchar. Usa saltos de línea para legibilidad.",
  };

  return `Eres un experto en copywriting para redes sociales. Genera un caption optimizado.

PARÁMETROS:
- Plataforma: ${params.platform}
- Nicho: ${params.niche}
- Tono: ${params.tone}
- Audiencia: ${params.targetAudience}
- Idioma: ${params.language}
- Descripción del contenido: ${params.contentDescription}

GUIDELINES DE LA PLATAFORMA:
${platformGuidelines[params.platform]}

Responde en JSON:
{
  "caption": "El caption completo con emojis y formato",
  "hashtags": ["máximo", "15", "hashtags", "relevantes"],
  "callToAction": "Frase que invite a interactuar",
  "alternativeCaption": "Una variante diferente del caption"
}

Responde SOLO con el JSON.`;
}
