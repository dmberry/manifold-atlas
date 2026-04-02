/**
 * Client-side embedding function.
 * Calls the /api/embed route which proxies to provider APIs.
 * On 429 rate limit, throws a RateLimitError with the wait time.
 */

import type { EmbeddingProviderId, EmbedResponse } from "@/types/embeddings";

export class RateLimitError extends Error {
  public waitSeconds: number;
  public provider: string;
  constructor(message: string, waitSeconds: number, provider: string) {
    super(message);
    this.waitSeconds = waitSeconds;
    this.provider = provider;
  }
}

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
    const message = data.error || `API error: ${response.status}`;

    if (response.status === 429) {
      // Extract retry delay
      let waitSeconds = 35;
      const match = message.match(/retry in ([\d.]+)s/i);
      if (match) waitSeconds = Math.ceil(Number(match[1]));
      const retryHeader = response.headers.get("Retry-After");
      if (retryHeader) waitSeconds = Math.ceil(Number(retryHeader)) || 35;
      throw new RateLimitError(message, waitSeconds, provider);
    }

    throw new Error(message);
  }

  return response.json();
}
