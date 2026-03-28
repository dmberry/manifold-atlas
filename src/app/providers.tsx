"use client";

import { SettingsProvider } from "@/context/SettingsContext";
import { EmbeddingCacheProvider } from "@/context/EmbeddingCacheContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <EmbeddingCacheProvider>
        {children}
      </EmbeddingCacheProvider>
    </SettingsProvider>
  );
}
