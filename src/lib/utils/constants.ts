export const APP_NAME = "SocialForge";
export const APP_DESCRIPTION =
  "Plataforma SaaS de generación y publicación automatizada de contenido para redes sociales";

export const PLANS = {
  free: {
    name: "Free",
    contentPerMonth: 5,
    postsPerMonth: 10,
    storageMB: 100,
    socialAccounts: 1,
    price: 0,
  },
  starter: {
    name: "Starter",
    contentPerMonth: 30,
    postsPerMonth: 60,
    storageMB: 1000,
    socialAccounts: 3,
    price: 19,
  },
  growth: {
    name: "Growth",
    contentPerMonth: 100,
    postsPerMonth: 200,
    storageMB: 5000,
    socialAccounts: 10,
    price: 49,
  },
  agency: {
    name: "Agency",
    contentPerMonth: 500,
    postsPerMonth: 1000,
    storageMB: 25000,
    socialAccounts: 50,
    price: 149,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const PLATFORMS = ["facebook", "tiktok", "instagram"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const CONTENT_TYPES = [
  "reel",
  "video",
  "image",
  "carousel",
  "story",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const TONES = [
  "educational",
  "entertainment",
  "inspirational",
  "controversial",
  "storytelling",
] as const;
export type Tone = (typeof TONES)[number];

export const MONETIZATION_REQUIREMENTS = {
  facebook: {
    // Stars program: 500 followers + 500 for 30 consecutive days
    followers: 500,
    consecutiveDays: 30,
    watchMinutes60d: 0,
    minVideos: 0,
    minVideoDurationMin: 0,
    // Content Monetization (Ad Breaks replacement): 10K followers, 600K min
    contentMonetization: {
      followers: 10_000,
      watchMinutes60d: 600_000,
      minVideos: 5,
    },
  },
  tiktok: {
    followers: 10_000,
    views30d: 100_000,
    minVideoDurationMin: 1,
  },
  instagram: {
    followers: 0,
    note: "Programa por invitación, Reels con alto engagement son clave",
  },
} as const;

export const RATE_LIMITS = {
  free: { requestsPerMinute: 10 },
  starter: { requestsPerMinute: 30 },
  growth: { requestsPerMinute: 60 },
  agency: { requestsPerMinute: 120 },
} as const;

/**
 * AI Providers — all free, OpenAI-compatible API format.
 * Priority order: Groq > DeepSeek > Gemini > OpenRouter
 */
export const AI_PROVIDERS = {
  groq: {
    name: "Groq",
    baseURL: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    freeLimit: "~1,000 req/day",
    getKeyUrl: "https://console.groq.com",
  },
  deepseek: {
    name: "DeepSeek",
    baseURL: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    freeLimit: "5M tokens (30 days)",
    getKeyUrl: "https://platform.deepseek.com",
  },
  gemini: {
    name: "Google Gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    defaultModel: "gemini-2.5-flash",
    freeLimit: "1,000 req/day (flash-lite)",
    getKeyUrl: "https://aistudio.google.com/apikey",
  },
  openrouter: {
    name: "OpenRouter",
    baseURL: "https://openrouter.ai/api/v1",
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    freeLimit: "~200 req/day per model",
    getKeyUrl: "https://openrouter.ai/keys",
  },
} as const;
