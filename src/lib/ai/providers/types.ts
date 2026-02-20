export interface AIProviderConfig {
  name: string;
  baseURL: string;
  apiKey: string;
  defaultModel: string;
  models: Record<string, string>;
  maxRetries?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface GenerationResult {
  content: string;
  model: string;
  provider: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  costUSD: number;
}
