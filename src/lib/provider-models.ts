/**
 * Provider model list loader.
 *
 * Loads model definitions from /public/models/{provider}.md.
 * Format: `model-id | Display Name | dimensions` (one per line)
 * Lines starting with # are comments and are ignored.
 *
 * Edit the markdown files to add or remove models without touching source code.
 * openai-compatible uses a custom model ID input, not a markdown file.
 */

import type { EmbeddingModelSpec, EmbeddingProviderId } from "@/types/embeddings";

const MARKDOWN_PROVIDERS: EmbeddingProviderId[] = [
  "openai", "voyage", "google", "cohere", "huggingface", "ollama",
];

export function parseProviderModels(
  markdown: string,
  providerId: EmbeddingProviderId
): EmbeddingModelSpec[] {
  const models: EmbeddingModelSpec[] = [];

  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const parts = trimmed.split("|").map(s => s.trim());
    if (parts.length < 3) continue;

    const [id, name, dimsStr] = parts;
    const dimensions = parseInt(dimsStr, 10);
    if (!id || !name || isNaN(dimensions)) continue;

    models.push({ id, name, providerId, dimensions });
  }

  return models;
}

export async function loadAllProviderModels(): Promise<
  Partial<Record<EmbeddingProviderId, EmbeddingModelSpec[]>>
> {
  const results = await Promise.allSettled(
    MARKDOWN_PROVIDERS.map(async pid => {
      const response = await fetch(`/models/${pid}.md`);
      if (!response.ok) throw new Error(`Failed to load models for ${pid}`);
      const markdown = await response.text();
      return { pid, models: parseProviderModels(markdown, pid) };
    })
  );

  const providerModels: Partial<Record<EmbeddingProviderId, EmbeddingModelSpec[]>> = {};

  for (const result of results) {
    if (result.status === "fulfilled") {
      providerModels[result.value.pid] = result.value.models;
    } else {
      console.warn("Could not load provider model list:", result.reason);
    }
  }

  return providerModels;
}
