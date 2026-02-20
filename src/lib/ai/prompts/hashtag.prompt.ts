import type { Platform } from "@/lib/utils/constants";

interface HashtagParams {
  niche: string;
  platform: Platform;
  contentDescription: string;
  language: string;
}

export function buildHashtagPrompt(params: HashtagParams): string {
  return `Eres un experto en estrategia de hashtags para redes sociales. Genera hashtags optimizados.

PARÁMETROS:
- Plataforma: ${params.platform}
- Nicho: ${params.niche}
- Idioma: ${params.language}
- Contenido: ${params.contentDescription}

Responde en JSON:
{
  "primary": ["3-5 hashtags principales con alto volumen"],
  "niche": ["5-7 hashtags de nicho específico"],
  "trending": ["3-5 hashtags trending relevantes"],
  "branded": ["1-2 hashtags de marca sugeridos"],
  "total": 15,
  "strategy": "Explicación breve de por qué esta combinación funciona"
}

REGLAS:
- Máximo 15 hashtags en total
- Mezcla de volumen alto (>100K posts) + nicho (<10K posts)
- NO usar hashtags banned o shadowbanned
- Incluir hashtags en el idioma del contenido
- Responde SOLO con el JSON.`;
}
