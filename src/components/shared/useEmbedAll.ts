"use client";

import { useCallback } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useEmbeddingCache } from "@/context/EmbeddingCacheContext";
import { fetchEmbeddings } from "@/lib/embeddings/client";

export interface OllamaModelError {
  type: "ollama-model-not-found";
  modelName: string;
  baseUrl: string;
}

export function isOllamaModelError(error: unknown): error is OllamaModelError {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    (error as OllamaModelError).type === "ollama-model-not-found"
  );
}

/**
 * Hook that embeds texts through all enabled models,
 * using cache where available and fetching the rest.
 * Returns a map of modelId -> vector[] for each text.
 *
 * Throws OllamaModelError for Ollama model-not-found, which
 * operation components can catch to show the helper modal.
 */
export function useEmbedAll() {
  const { getEnabledModels } = useSettings();
  const cache = useEmbeddingCache();

  const embedAll = useCallback(
    async (
      texts: string[],
      onProgress?: (modelId: string, status: "loading" | "done" | "error") => void
    ): Promise<Map<string, number[][]>> => {
      const models = getEnabledModels();
      if (models.length === 0) {
        throw new Error("No models configured. Open Settings to enable at least one embedding provider.");
      }

      const results = new Map<string, number[][]>();

      await Promise.all(
        models.map(async model => {
          onProgress?.(model.id, "loading");
          try {
            // Check cache for each text
            const cached = await cache.getMany(model.id, texts);
            const uncachedTexts: string[] = [];

            texts.forEach((text) => {
              if (!cached.has(text)) {
                uncachedTexts.push(text);
              }
            });

            // Fetch uncached embeddings
            let fetchedVectors: number[][] = [];
            if (uncachedTexts.length > 0) {
              const response = await fetchEmbeddings(
                model.providerId,
                model.id,
                uncachedTexts,
                model.apiKey,
                model.baseUrl
              );
              fetchedVectors = response.vectors;

              // Cache the new vectors
              await cache.setMany(
                model.id,
                uncachedTexts.map((text, i) => ({ text, vector: fetchedVectors[i] }))
              );
            }

            // Assemble full result in original order
            const allVectors: number[][] = [];
            let fetchIdx = 0;
            for (let i = 0; i < texts.length; i++) {
              const cachedVec = cached.get(texts[i]);
              if (cachedVec) {
                allVectors.push(cachedVec);
              } else {
                allVectors.push(fetchedVectors[fetchIdx++]);
              }
            }

            results.set(model.id, allVectors);
            onProgress?.(model.id, "done");
          } catch (error) {
            onProgress?.(model.id, "error");

            // Detect Ollama model-not-found
            if (
              model.providerId === "ollama" &&
              error instanceof Error &&
              error.message.includes("not found")
            ) {
              const ollamaError: OllamaModelError = {
                type: "ollama-model-not-found",
                modelName: model.id,
                baseUrl: model.baseUrl || "http://localhost:11434",
              };
              throw ollamaError;
            }

            throw error;
          }
        })
      );

      return results;
    },
    [getEnabledModels, cache]
  );

  return embedAll;
}
