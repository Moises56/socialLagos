import OpenAI from "openai";
import type {
  AIProviderConfig,
  ChatMessage,
  GenerationOptions,
  GenerationResult,
} from "./types";
import { getAvailableProviders } from "./registry";

const clientCache = new Map<string, OpenAI>();

function getClient(provider: AIProviderConfig): OpenAI {
  const cached = clientCache.get(provider.name);
  if (cached) return cached;

  const client = new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
    maxRetries: provider.maxRetries ?? 2,
    timeout: 60_000,
  });

  clientCache.set(provider.name, client);
  return client;
}

/**
 * Generate text using the best available free AI provider.
 * Automatically falls back to the next provider on failure.
 */
export async function generateText(
  messages: ChatMessage[],
  options: GenerationOptions = {}
): Promise<GenerationResult> {
  const providers = getAvailableProviders();

  if (providers.length === 0) {
    throw new Error(
      "No hay proveedores de IA configurados. Agrega al menos una API key (GROQ_API_KEY, DEEPSEEK_API_KEY, GEMINI_API_KEY, o OPENROUTER_API_KEY) en .env.local"
    );
  }

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const client = getClient(provider);
      const model = options.model ?? provider.defaultModel;

      const response = await client.chat.completions.create({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error("Respuesta vacía del proveedor");
      }

      return {
        content: choice.message.content,
        model: response.model ?? model,
        provider: provider.name,
        tokensUsed: {
          prompt: response.usage?.prompt_tokens ?? 0,
          completion: response.usage?.completion_tokens ?? 0,
          total: response.usage?.total_tokens ?? 0,
        },
        costUSD: 0, // Free tier
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to next provider
    }
  }

  throw new Error(
    `Todos los proveedores de IA fallaron. Último error: ${lastError?.message}`
  );
}

/**
 * Generate text with a specific provider by name.
 */
export async function generateWithProvider(
  providerName: string,
  messages: ChatMessage[],
  options: GenerationOptions = {}
): Promise<GenerationResult> {
  const providers = getAvailableProviders();
  const provider = providers.find((p) => p.name === providerName);

  if (!provider) {
    throw new Error(
      `Proveedor "${providerName}" no disponible. Proveedores configurados: ${providers.map((p) => p.name).join(", ")}`
    );
  }

  const client = getClient(provider);
  const model = options.model ?? provider.defaultModel;

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
    top_p: options.topP,
    frequency_penalty: options.frequencyPenalty,
    presence_penalty: options.presencePenalty,
  });

  const choice = response.choices[0];
  if (!choice?.message?.content) {
    throw new Error("Respuesta vacía del proveedor");
  }

  return {
    content: choice.message.content,
    model: response.model ?? model,
    provider: provider.name,
    tokensUsed: {
      prompt: response.usage?.prompt_tokens ?? 0,
      completion: response.usage?.completion_tokens ?? 0,
      total: response.usage?.total_tokens ?? 0,
    },
    costUSD: 0,
  };
}
