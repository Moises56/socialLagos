import { generateText } from "./providers/client";
import type { ChatMessage } from "./providers/types";

const DIMENSIONS: Record<string, { width: number; height: number }> = {
  "16:9": { width: 1200, height: 675 },
  "1:1": { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "4:5": { width: 1080, height: 1350 },
};

const GEMINI_IMAGE_MODELS = [
  "gemini-2.0-flash-exp-image-generation",
  "gemini-2.5-flash-image",
];

/**
 * Use the existing text AI to generate an optimized image prompt in English.
 */
export async function generateImagePrompt(params: {
  niche: string;
  topic?: string;
  caption: string;
  tone: string;
}): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You create image generation prompts for social media.
Respond with ONLY the prompt text, no JSON, no quotes, no explanation.
Write in English. Keep under 200 characters.
NEVER include text, words, or letters in the image. Focus on visual elements only.
Make it vivid, eye-catching, and professional.`,
    },
    {
      role: "user",
      content: `Create an image prompt for:
Niche: ${params.niche}
Topic: ${params.topic || "general"}
Caption: ${params.caption.slice(0, 200)}
Tone: ${params.tone}`,
    },
  ];

  const result = await generateText(messages, {
    temperature: 0.7,
    maxTokens: 150,
  });

  return result.content.trim().replace(/^["']|["']$/g, "");
}

/**
 * Generate an image using available providers in priority order:
 * 1. Together.ai FLUX.1 Schnell Free (if key configured)
 * 2. Google Gemini Image Generation (free tier)
 * 3. Pollinations.ai (free, no API key)
 * 4. Stable Horde (free, community GPUs, no API key)
 * 5. Local OG image generation (always works, no external API)
 */
export async function generateImage(
  prompt: string,
  aspectRatio: string = "16:9",
  context?: { hook?: string; niche?: string; contentType?: string }
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const dims = DIMENSIONS[aspectRatio] ?? DIMENSIONS["16:9"];
  const errors: string[] = [];
  let result: { buffer: Buffer; width: number; height: number } | null = null;

  // 1. Try Together.ai (most reliable free option)
  const togetherKey = process.env.TOGETHER_API_KEY;
  if (!result && togetherKey) {
    try {
      result = await generateImageWithTogether(togetherKey, prompt, dims);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[image-gen] Together.ai failed:", msg);
      errors.push(`Together: ${msg}`);
    }
  }

  // 2. Try Gemini image generation
  if (!result) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      for (const model of GEMINI_IMAGE_MODELS) {
        try {
          const buf = await generateImageWithGemini(geminiKey, model, prompt);
          if (buf) {
            result = { buffer: buf, width: dims.width, height: dims.height };
            break;
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[image-gen] Gemini ${model} failed:`, msg);
          errors.push(`Gemini(${model}): ${msg}`);
        }
      }
    }
  }

  // 3. Pollinations.ai
  if (!result) {
    try {
      result = await generateImageWithPollinations(prompt, dims);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[image-gen] Pollinations failed:", msg);
      errors.push(`Pollinations: ${msg}`);
    }
  }

  // 4. Stable Horde (free community-powered Stable Diffusion)
  if (!result) {
    try {
      result = await generateImageWithStableHorde(prompt, dims);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[image-gen] Stable Horde failed:", msg);
      errors.push(`StableHorde: ${msg}`);
    }
  }

  // 5. Local fallback: generate a branded social media image
  if (!result) {
    console.warn(
      "[image-gen] All AI providers failed, using local image generator. Errors:",
      errors.join(" | ")
    );
    result = await generateLocalImage(prompt, dims, context);
  }

  // Add text overlay with hook if available
  if (context?.hook) {
    try {
      result.buffer = Buffer.from(
        await addTextOverlay(result.buffer, context.hook, result.width, result.height)
      );
    } catch (err) {
      console.warn("[image-gen] Text overlay failed, using image as-is:", err);
    }
  }

  return result;
}

/**
 * Generate image using Together.ai's free FLUX.1 Schnell model.
 */
async function generateImageWithTogether(
  apiKey: string,
  prompt: string,
  dims: { width: number; height: number }
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const response = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt: `${prompt}. No text, no words, no letters in the image.`,
      width: dims.width,
      height: dims.height,
      steps: 4,
      n: 1,
      response_format: "b64_json",
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ?? `Together.ai HTTP ${response.status}`
    );
  }

  const data = await response.json();
  const b64 = data?.data?.[0]?.b64_json;

  if (!b64) {
    throw new Error("Together.ai returned no image data");
  }

  const buffer = Buffer.from(b64, "base64");
  if (buffer.length < 1000) {
    throw new Error("Together.ai image too small");
  }

  return { buffer, width: dims.width, height: dims.height };
}

/**
 * Generate image using Google Gemini's image generation models.
 */
async function generateImageWithGemini(
  apiKey: string,
  model: string,
  prompt: string
): Promise<Buffer | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Generate a high-quality social media image: ${prompt}. No text or words in the image.`,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Gemini: ${msg}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!parts || !Array.isArray(parts)) {
    throw new Error("No parts in Gemini response");
  }

  for (const part of parts) {
    if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith("image/")) {
      const buffer = Buffer.from(part.inlineData.data, "base64");
      if (buffer.length < 1000) {
        throw new Error("Gemini returned image too small");
      }
      return buffer;
    }
  }

  return null;
}

/**
 * Generate image using Stable Horde (free, community-powered Stable Diffusion).
 * Anonymous access: max 512x512, upscaled to target with sharp.
 */
async function generateImageWithStableHorde(
  prompt: string,
  dims: { width: number; height: number }
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const HORDE_API = "https://stablehorde.net/api/v2";
  const ANON_KEY = "0000000000";
  // Anonymous max is 512x512; pick closest aspect ratio
  const ratio = dims.width / dims.height;
  let genW: number, genH: number;
  if (ratio > 1.3) {
    genW = 512; genH = 320; // landscape ~16:10
  } else if (ratio < 0.7) {
    genW = 320; genH = 512; // portrait ~9:16
  } else {
    genW = 512; genH = 512; // square-ish
  }

  // Submit async generation
  const submitRes = await fetch(`${HORDE_API}/generate/async`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
    },
    body: JSON.stringify({
      prompt: `${prompt}, highly detailed, cinematic lighting, professional quality, no text no words no letters`,
      params: {
        steps: 20,
        width: genW,
        height: genH,
        cfg_scale: 7,
        sampler_name: "k_euler",
      },
      nsfw: true,
      censor_nsfw: false,
      r2: true,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!submitRes.ok) {
    const errData = await submitRes.json().catch(() => ({}));
    throw new Error(errData?.message ?? `Stable Horde submit HTTP ${submitRes.status}`);
  }

  const { id: jobId } = (await submitRes.json()) as { id: string };
  if (!jobId) throw new Error("Stable Horde returned no job ID");

  // Poll until done (max ~120 seconds)
  const maxPollTime = 120_000;
  const pollInterval = 4_000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxPollTime) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const checkRes = await fetch(`${HORDE_API}/generate/check/${jobId}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!checkRes.ok) continue;

    const check = (await checkRes.json()) as {
      done: boolean;
      faulted: boolean;
      is_possible: boolean;
    };

    if (check.faulted) throw new Error("Stable Horde generation faulted");
    if (!check.is_possible) throw new Error("Stable Horde: no workers available");
    if (check.done) break;
  }

  // Get result
  const statusRes = await fetch(`${HORDE_API}/generate/status/${jobId}`, {
    signal: AbortSignal.timeout(10_000),
  });

  if (!statusRes.ok) {
    throw new Error(`Stable Horde status HTTP ${statusRes.status}`);
  }

  const status = (await statusRes.json()) as {
    done: boolean;
    generations: Array<{ img: string; censored?: boolean }>;
  };

  // Detect censored (NSFW-filtered) images
  if (status.generations?.[0]?.censored) {
    throw new Error("Stable Horde: image was censored by NSFW filter");
  }

  if (!status.done || !status.generations?.length) {
    throw new Error("Stable Horde generation not complete");
  }

  const imgUrl = status.generations[0].img;
  if (!imgUrl) throw new Error("Stable Horde no image URL");

  // Fetch the generated image
  const imgRes = await fetch(imgUrl, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!imgRes.ok) throw new Error(`Failed to fetch Stable Horde image: ${imgRes.status}`);

  const arrayBuffer = await imgRes.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);

  if (buffer.length < 1000) {
    throw new Error("Stable Horde image too small");
  }

  // Upscale to target dimensions using sharp
  if (genW !== dims.width || genH !== dims.height) {
    try {
      const sharp = (await import("sharp")).default;
      const resized = await sharp(buffer)
        .resize(dims.width, dims.height, { fit: "cover" })
        .png()
        .toBuffer();
      buffer = Buffer.from(resized);
    } catch {
      // If sharp fails, return as-is at generated dimensions
      return { buffer, width: genW, height: genH };
    }
  }

  return { buffer, width: dims.width, height: dims.height };
}

/**
 * Fetch an AI-generated image from Pollinations.ai with retry logic.
 */
async function generateImageWithPollinations(
  prompt: string,
  dims: { width: number; height: number },
  maxRetries: number = 1
): Promise<{ buffer: Buffer; width: number; height: number }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const seed = Math.floor(Math.random() * 100000);
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dims.width}&height=${dims.height}&seed=${seed}&model=flux&nologo=true`;

      const response = await fetch(url, {
        signal: AbortSignal.timeout(90_000),
      });

      if (!response.ok) {
        throw new Error(`Pollinations failed: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length < 1000) {
        throw new Error("Generated image too small");
      }

      return { buffer, width: dims.width, height: dims.height };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, (attempt + 1) * 2000));
      }
    }
  }

  throw lastError ?? new Error("Pollinations failed after retries");
}

/**
 * Generate a branded social media image locally using SVG → PNG.
 * This is the ultimate fallback that always works without any external API.
 */
async function generateLocalImage(
  prompt: string,
  dims: { width: number; height: number },
  context?: { hook?: string; niche?: string; contentType?: string }
): Promise<{ buffer: Buffer; width: number; height: number }> {
  // Pick a random gradient theme
  const themes = [
    { from: "#6366f1", to: "#a855f7", accent: "#c4b5fd" }, // indigo → purple
    { from: "#0ea5e9", to: "#6366f1", accent: "#93c5fd" }, // sky → indigo
    { from: "#f43f5e", to: "#f97316", accent: "#fda4af" }, // rose → orange
    { from: "#10b981", to: "#0ea5e9", accent: "#6ee7b7" }, // emerald → sky
    { from: "#8b5cf6", to: "#ec4899", accent: "#c084fc" }, // violet → pink
    { from: "#f59e0b", to: "#ef4444", accent: "#fcd34d" }, // amber → red
  ];
  const theme = themes[Math.floor(Math.random() * themes.length)];

  // Pick emoji based on niche/content
  const nicheEmojis: Record<string, string> = {
    gaming: "🎮", tecnologia: "💻", fitness: "💪", cocina: "🍳",
    musica: "🎵", viajes: "✈️", moda: "👗", educacion: "📚",
    finanzas: "💰", salud: "🏥", deportes: "⚽", arte: "🎨",
  };
  const niche = (context?.niche ?? "").toLowerCase();
  const emoji = nicheEmojis[niche] ?? "✨";

  // Build hook text (truncated for display)
  const hookText = context?.hook
    ? context.hook.slice(0, 80) + (context.hook.length > 80 ? "..." : "")
    : prompt.slice(0, 80);

  const contentLabel = context?.contentType?.toUpperCase() ?? "CONTENT";

  // Create SVG
  const svg = `<svg width="${dims.width}" height="${dims.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${theme.from}"/>
      <stop offset="100%" style="stop-color:${theme.to}"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" style="stop-color:rgba(0,0,0,0.6)"/>
      <stop offset="50%" style="stop-color:rgba(0,0,0,0.1)"/>
      <stop offset="100%" style="stop-color:rgba(0,0,0,0)"/>
    </linearGradient>
  </defs>
  <!-- Background gradient -->
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <!-- Decorative circles -->
  <circle cx="${dims.width * 0.8}" cy="${dims.height * 0.2}" r="${dims.height * 0.35}" fill="${theme.accent}" opacity="0.15"/>
  <circle cx="${dims.width * 0.15}" cy="${dims.height * 0.75}" r="${dims.height * 0.25}" fill="${theme.accent}" opacity="0.1"/>
  <circle cx="${dims.width * 0.5}" cy="${dims.height * 0.5}" r="${dims.height * 0.15}" fill="white" opacity="0.05"/>
  <!-- Dark overlay for text readability -->
  <rect width="100%" height="100%" fill="url(#overlay)"/>
  <!-- Content type badge -->
  <rect x="40" y="30" width="${contentLabel.length * 14 + 30}" height="36" rx="18" fill="rgba(255,255,255,0.2)"/>
  <text x="55" y="54" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" letter-spacing="2">${contentLabel}</text>
  <!-- Emoji -->
  <text x="${dims.width / 2}" y="${dims.height * 0.38}" font-size="${Math.min(dims.width, dims.height) * 0.15}" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  <!-- Hook text -->
  <text x="${dims.width / 2}" y="${dims.height * 0.58}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.min(28, dims.width * 0.025)}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
    ${escapeXml(hookText)}
  </text>
  <!-- Branding -->
  <text x="${dims.width / 2}" y="${dims.height - 25}" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.5)" text-anchor="middle">SocialForge AI</text>
</svg>`;

  // Convert SVG to PNG using sharp
  try {
    const sharp = (await import("sharp")).default;
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    return { buffer: pngBuffer, width: dims.width, height: dims.height };
  } catch {
    // Fallback: return SVG as-is (Cloudinary can handle SVG upload)
    return {
      buffer: Buffer.from(svg),
      width: dims.width,
      height: dims.height,
    };
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Add attention-grabbing text overlay on an image using sharp + SVG.
 * Creates a gradient bar at the bottom with the hook text.
 */
async function addTextOverlay(
  imageBuffer: Buffer,
  hookText: string,
  width: number,
  height: number
): Promise<Buffer> {
  const sharp = (await import("sharp")).default;

  // Calculate text sizing
  const fontSize = Math.max(24, Math.min(48, Math.floor(width * 0.04)));
  const padding = Math.floor(width * 0.05);
  const maxCharsPerLine = Math.floor((width - padding * 2) / (fontSize * 0.55));

  // Word-wrap the hook text
  const words = hookText.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).trim().length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + " " + word : word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  // Limit to 4 lines max
  const displayLines = lines.slice(0, 4);
  const lineHeight = fontSize * 1.3;
  const textBlockHeight = displayLines.length * lineHeight + padding * 2;
  const gradientHeight = Math.min(textBlockHeight + padding * 2, height * 0.5);

  // Build SVG overlay
  const textY = height - textBlockHeight + padding;
  const textElements = displayLines
    .map((line, i) => {
      const y = textY + i * lineHeight + fontSize;
      return `<text x="${padding}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" filter="url(#shadow)">${escapeXml(line)}</text>`;
    })
    .join("\n    ");

  const overlaySvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0" y1="${height - gradientHeight}" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="rgba(0,0,0,0)" />
      <stop offset="40%" stop-color="rgba(0,0,0,0.6)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.85)" />
    </linearGradient>
    <filter id="shadow" x="-2%" y="-2%" width="104%" height="104%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="black" flood-opacity="0.8"/>
    </filter>
  </defs>
  <rect y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#grad)" />
  ${textElements}
</svg>`;

  const overlayBuffer = Buffer.from(overlaySvg);

  const result = await sharp(imageBuffer)
    .composite([{ input: overlayBuffer, top: 0, left: 0 }])
    .png()
    .toBuffer();

  return Buffer.from(result);
}
