import type { Platform } from "@/lib/utils/constants";

interface PlatformAdapterParams {
  originalCaption: string;
  originalHashtags: string[];
  sourcePlatform: Platform;
  targetPlatform: Platform;
  language: string;
}

export function buildPlatformAdapterPrompt(
  params: PlatformAdapterParams
): string {
  return `Eres un experto en adaptar contenido entre plataformas de redes sociales. IMPORTANTE: NO copies el contenido, crea una VARIANTE única que mantenga la esencia pero sea diferente.

CONTENIDO ORIGINAL (${params.sourcePlatform}):
Caption: ${params.originalCaption}
Hashtags: ${params.originalHashtags.join(" ")}

ADAPTAR PARA: ${params.targetPlatform}
IDIOMA: ${params.language}

DIFERENCIAS CLAVE POR PLATAFORMA:
- Facebook: Captions largos, storytelling, preguntas para engagement, links permitidos
- TikTok: Captions cortos (150 chars ideal), trending references, emojis, hashtags en caption
- Instagram: Mix de largo/corto, primera línea hook, hashtags separados o en comentario

Responde en JSON:
{
  "caption": "Caption adaptado (DEBE ser diferente al original, no una copia)",
  "hashtags": ["hashtags", "adaptados", "para", "la", "plataforma"],
  "aspectRatio": "9:16 | 1:1 | 16:9 | 4:5",
  "adaptationNotes": "Qué cambios se hicieron y por qué"
}

Responde SOLO con el JSON.`;
}
