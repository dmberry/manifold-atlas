/**
 * Client-side embedding function.
 * Calls the /api/embed route which proxies to provider APIs.
 */

import type { EmbeddingProviderId, EmbedResponse } from "@/types/embeddings";

export async function fetchEmbeddings(
  provider: EmbeddingProviderId,
  model: string,
  texts: string[],
  apiKey: string,
  baseUrl?: string
): Promise<EmbedResponse> {
  const response = await fetch("/api/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Embed-API-Key": apiKey,
    },
    body: JSON.stringify({ provider, model, texts, baseUrl }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return response.json();
}
