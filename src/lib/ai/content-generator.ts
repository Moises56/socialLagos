import { generateText } from "./providers/client";
import { sanitizeAndParseJSON } from "./json-utils";
import type { ChatMessage, GenerationResult } from "./providers/types";
import type { Tone, Platform, ContentType } from "@/lib/utils/constants";
import { buildReelScriptPrompt } from "./prompts/reel-script.prompt";
import { buildCaptionPrompt } from "./prompts/caption.prompt";
import { buildHashtagPrompt } from "./prompts/hashtag.prompt";
import { buildHookPrompt } from "./prompts/hook.prompt";
import { buildPlatformAdapterPrompt } from "./prompts/platform-adapter.prompt";

export interface ContentGenerationParams {
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

export interface GeneratedContentResult {
  script?: string;
  hook: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  platformVariants: Array<{
    platform: Platform;
    caption: string;
    hashtags: string[];
    aspectRatio: "9:16" | "1:1" | "16:9" | "4:5";
  }>;
  generation: {
    provider: string;
    model: string;
    tokensUsed: number;
    costUSD: number;
  };
}



export async function generateContent(
  params: ContentGenerationParams
): Promise<GeneratedContentResult> {
  const primaryPlatform = params.platforms[0] ?? "facebook";

  // Step 1: Generate main script/caption based on content type
  let scriptResult: GenerationResult;
  let scriptData: Record<string, unknown>;

  if (
    params.contentType === "reel" ||
    params.contentType === "video" ||
    params.contentType === "story"
  ) {
    const prompt = buildReelScriptPrompt({
      niche: params.niche,
      tone: params.tone,
      targetAudience: params.targetAudience,
      language: params.language,
      contentPillars: params.contentPillars,
      topic: params.topic,
    });

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: params.brandVoice
          ? `Usa esta voz de marca: ${params.brandVoice}`
          : "Eres un experto creador de contenido viral.",
      },
      { role: "user", content: prompt },
    ];

    scriptResult = await generateText(messages, {
      temperature: 0.8,
      maxTokens: 2048,
    });
    scriptData = sanitizeAndParseJSON(scriptResult.content);
  } else {
    // Image/carousel — generate caption + hashtags
    const prompt = buildCaptionPrompt({
      niche: params.niche,
      tone: params.tone,
      platform: primaryPlatform,
      contentDescription: params.topic ?? params.contentPillars.join(", "),
      language: params.language,
      targetAudience: params.targetAudience,
    });

    const messages: ChatMessage[] = [
      { role: "user", content: prompt },
    ];

    scriptResult = await generateText(messages, {
      temperature: 0.8,
      maxTokens: 1024,
    });
    scriptData = sanitizeAndParseJSON(scriptResult.content);
  }

  // Step 2: Generate hooks if not already included
  let hookText = (scriptData.hook as string) ?? "";
  if (!hookText) {
    const hookPrompt = buildHookPrompt({
      niche: params.niche,
      tone: params.tone,
      contentDescription: (scriptData.caption as string) ?? "",
      language: params.language,
      targetAudience: params.targetAudience,
    });

    const hookResult = await generateText(
      [{ role: "user", content: hookPrompt }],
      { temperature: 0.9, maxTokens: 1024 }
    );
    const hookData = sanitizeAndParseJSON(hookResult.content);
    const hooks = hookData.hooks as Array<{ text: string }>;
    const bestIdx = (hookData.bestHook as number) ?? 0;
    hookText = hooks[bestIdx]?.text ?? hooks[0]?.text ?? "";
  }

  // Step 3: Generate platform variants for additional platforms
  const platformVariants: GeneratedContentResult["platformVariants"] = [];
  const mainCaption = (scriptData.caption as string) ?? "";
  const mainHashtags = (scriptData.hashtags as string[]) ?? [];

  // Add primary platform
  platformVariants.push({
    platform: primaryPlatform,
    caption: mainCaption,
    hashtags: mainHashtags,
    aspectRatio: primaryPlatform === "facebook" ? "16:9" : "9:16",
  });

  // Generate variants for other platforms
  for (const platform of params.platforms.slice(1)) {
    try {
      const adapterPrompt = buildPlatformAdapterPrompt({
        originalCaption: mainCaption,
        originalHashtags: mainHashtags,
        sourcePlatform: primaryPlatform,
        targetPlatform: platform,
        language: params.language,
      });

      const adapterResult = await generateText(
        [{ role: "user", content: adapterPrompt }],
        { temperature: 0.7, maxTokens: 1024 }
      );
      const adapterData = sanitizeAndParseJSON(adapterResult.content);

      platformVariants.push({
        platform,
        caption: (adapterData.caption as string) ?? mainCaption,
        hashtags: (adapterData.hashtags as string[]) ?? mainHashtags,
        aspectRatio: (adapterData.aspectRatio as "9:16" | "1:1" | "16:9" | "4:5") ?? "9:16",
      });
    } catch {
      // Fallback: use main content with minor adjustments
      platformVariants.push({
        platform,
        caption: mainCaption,
        hashtags: mainHashtags,
        aspectRatio: "9:16",
      });
    }
  }

  return {
    script: scriptData.script as string | undefined,
    hook: hookText,
    caption: mainCaption,
    hashtags: mainHashtags,
    callToAction:
      (scriptData.callToAction as string) ?? "¡Déjame tu opinión en los comentarios!",
    platformVariants,
    generation: {
      provider: scriptResult.provider,
      model: scriptResult.model,
      tokensUsed: scriptResult.tokensUsed.total,
      costUSD: 0,
    },
  };
}

/**
 * Generate only hashtags for a given content description.
 */
export async function generateHashtags(
  niche: string,
  platform: Platform,
  contentDescription: string,
  language: string = "es"
): Promise<{ primary: string[]; niche: string[]; trending: string[]; all: string[] }> {
  const prompt = buildHashtagPrompt({
    niche,
    platform,
    contentDescription,
    language,
  });

  const result = await generateText(
    [{ role: "user", content: prompt }],
    { temperature: 0.6, maxTokens: 512 }
  );

  const data = sanitizeAndParseJSON(result.content);

  const primary = (data.primary as string[]) ?? [];
  const nicheHashtags = (data.niche as string[]) ?? [];
  const trending = (data.trending as string[]) ?? [];

  return {
    primary,
    niche: nicheHashtags,
    trending,
    all: [...primary, ...nicheHashtags, ...trending].slice(0, 15),
  };
}
