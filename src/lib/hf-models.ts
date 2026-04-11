/**
 * Hugging Face model list loader.
 *
 * Loads model definitions from /public/models/huggingface.md.
 * Format: `model-id | Display Name | dimensions` (one per line)
 * Lines starting with # are comments and are ignored.
 *
 * Edit public/models/huggingface.md to add or remove models
 * without touching source code.
 */

import type { EmbeddingModelSpec } from "@/types/embeddings";

export function parseHuggingFaceModels(markdown: string): EmbeddingModelSpec[] {
  const models: EmbeddingModelSpec[] = [];

  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const parts = trimmed.split("|").map(s => s.trim());
    if (parts.length < 3) continue;

    const [id, name, dimsStr] = parts;
    const dimensions = parseInt(dimsStr, 10);
    if (!id || !name || isNaN(dimensions)) continue;

    models.push({ id, name, providerId: "huggingface", dimensions });
  }

  return models;
}

export async function loadHuggingFaceModels(): Promise<EmbeddingModelSpec[]> {
  try {
    const response = await fetch("/models/huggingface.md");
    if (!response.ok) throw new Error("Failed to load HuggingFace model list");
    const markdown = await response.text();
    return parseHuggingFaceModels(markdown);
  } catch (e) {
    console.warn("Could not load HuggingFace model list:", e);
    return [];
  }
}
