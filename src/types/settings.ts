// Settings types for provider configuration
import type { EmbeddingProviderId } from "./embeddings";

export interface ProviderSettings {
  enabled: boolean;
  apiKey: string;
  baseUrl?: string;
  selectedModels: string[]; // model IDs to use
  customModelId?: string;
}

export interface AppSettings {
  providers: Record<EmbeddingProviderId, ProviderSettings>;
  primaryModel: string | null; // model ID of the primary/default model, null = use all
  darkMode: boolean;
  negationThreshold: number; // default 0.92
}

export const DEFAULT_SETTINGS: AppSettings = {
  primaryModel: null,
  providers: {
    openai: {
      enabled: false,
      apiKey: "",
      selectedModels: ["text-embedding-3-small"],
    },
    voyage: {
      enabled: false,
      apiKey: "",
      selectedModels: ["voyage-3"],
    },
    google: {
      enabled: false,
      apiKey: "",
      selectedModels: ["gemini-embedding-001"],
    },
    cohere: {
      enabled: false,
      apiKey: "",
      selectedModels: ["embed-v3.0"],
    },
    huggingface: {
      enabled: false,
      apiKey: "",
      selectedModels: ["sentence-transformers/all-MiniLM-L6-v2"],
    },
    ollama: {
      enabled: false,
      apiKey: "",
      baseUrl: "http://localhost:11434",
      selectedModels: ["nomic-embed-text"],
    },
    "openai-compatible": {
      enabled: false,
      apiKey: "",
      baseUrl: "https://openrouter.ai/api",
      selectedModels: [],
      customModelId: "",
    },
  },
  darkMode: false,
  negationThreshold: 0.92,
};

export const STORAGE_KEY = "manifold-atlas-settings";
