/**
 * Client-side function to call the concept expansion API.
 * Uses the first available chat-capable provider from the user's settings.
 */

import type { AppSettings } from "@/types/settings";

// Map embedding providers to chat models
const CHAT_MODELS: Record<string, { provider: string; model: string }> = {
  openai: { provider: "openai", model: "gpt-4o-mini" },
  google: { provider: "google", model: "gemini-2.5-flash-lite" },
  ollama: { provider: "ollama", model: "llama3.2" },
};

export interface ExpandResult {
  seed: string;
  categories: Record<string, string[]>;
  allTerms: string[];
  totalCount: number;
}

export function getExpansionProvider(settings: AppSettings): {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
} | null {
  // Try providers in order of preference
  for (const embProv of ["openai", "google", "ollama"] as const) {
    const ps = settings.providers[embProv];
    if (ps.enabled && (ps.apiKey || embProv === "ollama")) {
      const chat = CHAT_MODELS[embProv];
      return {
        provider: chat.provider,
        model: chat.model,
        apiKey: ps.apiKey,
        baseUrl: ps.baseUrl,
      };
    }
  }
  return null;
}

export async function expandConcept(
  seed: string,
  count: number,
  provider: string,
  model: string,
  apiKey: string,
  baseUrl?: string
): Promise<ExpandResult> {
  const response = await fetch("/api/expand", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-LLM-API-Key": apiKey,
    },
    body: JSON.stringify({ seed, count, provider, model, baseUrl }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Expansion failed: ${response.status}`);
  }

  return response.json();
}
