import type { Tone } from "@/lib/utils/constants";

interface HookParams {
  niche: string;
  tone: Tone;
  contentDescription: string;
  language: string;
  targetAudience: string;
}

export function buildHookPrompt(params: HookParams): string {
  return `Eres un experto en crear hooks virales para videos cortos. Los primeros 3 segundos determinan si el usuario se queda o hace scroll.

PARÁMETROS:
- Nicho: ${params.niche}
- Tono: ${params.tone}
- Audiencia: ${params.targetAudience}
- Idioma: ${params.language}
- Contenido: ${params.contentDescription}

Genera 5 hooks diferentes usando estas técnicas probadas:

Responde en JSON:
{
  "hooks": [
    {
      "text": "El texto del hook",
      "technique": "Nombre de la técnica (curiosity gap, controversy, shock, question, story)",
      "whyItWorks": "Por qué este hook funciona para esta audiencia",
      "visualSuggestion": "Qué mostrar visualmente durante el hook"
    }
  ],
  "bestHook": 0
}

TÉCNICAS A USAR:
1. Curiosity gap: "Nadie te dice esto sobre..."
2. Controversy: Una opinión fuerte que genera debate
3. Shock/surprise: Dato o hecho inesperado
4. Direct question: Pregunta que la audiencia quiere resolver
5. Story opening: Inicio de historia que engancha

Responde SOLO con el JSON.`;
}
