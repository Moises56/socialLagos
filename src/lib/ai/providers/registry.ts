import type { AIProviderConfig } from "./types";

/**
 * Registry of all supported AI providers.
 * All use OpenAI-compatible API format.
 * Priority: Groq (fastest) > DeepSeek (best quality) > Gemini (high volume) > OpenRouter (fallback)
 */
export function getAvailableProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [];

  if (process.env.GROQ_API_KEY) {
    providers.push({
      name: "groq",
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
      defaultModel: "llama-3.3-70b-versatile",
      models: {
        fast: "llama-3.3-70b-versatile",
        creative: "llama-3.3-70b-versatile",
        reasoning: "deepseek-r1-distill-llama-70b",
      },
    });
  }

  if (process.env.DEEPSEEK_API_KEY) {
    providers.push({
      name: "deepseek",
      baseURL: "https://api.deepseek.com/v1",
      apiKey: process.env.DEEPSEEK_API_KEY,
      defaultModel: "deepseek-chat",
      models: {
        fast: "deepseek-chat",
        creative: "deepseek-chat",
        reasoning: "deepseek-reasoner",
      },
    });
  }

  if (process.env.GEMINI_API_KEY) {
    providers.push({
      name: "gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      apiKey: process.env.GEMINI_API_KEY,
      defaultModel: "gemini-2.5-flash",
      models: {
        fast: "gemini-2.5-flash-lite",
        creative: "gemini-2.5-flash",
        reasoning: "gemini-2.5-pro",
      },
    });
  }

  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      name: "openrouter",
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
      models: {
        fast: "meta-llama/llama-3.3-70b-instruct:free",
        creative: "google/gemini-2.0-flash-exp:free",
        reasoning: "deepseek/deepseek-r1:free",
      },
    });
  }

  return providers;
}

export function getPrimaryProvider(): AIProviderConfig | null {
  const providers = getAvailableProviders();
  return providers[0] ?? null;
}
