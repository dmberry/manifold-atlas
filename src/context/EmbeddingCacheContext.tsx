"use client";

import React, { createContext, useContext, useCallback, useRef, useState } from "react";
import { openDB, type IDBPDatabase } from "idb";

interface CacheEntry {
  modelId: string;
  text: string;
  vector: number[];
  timestamp: number;
}

interface EmbeddingCacheContextType {
  get: (modelId: string, text: string) => Promise<number[] | null>;
  set: (modelId: string, text: string, vector: number[]) => Promise<void>;
  getMany: (modelId: string, texts: string[]) => Promise<Map<string, number[]>>;
  setMany: (modelId: string, entries: Array<{ text: string; vector: number[] }>) => Promise<void>;
  cacheSize: number;
  clearCache: () => Promise<void>;
}

const EmbeddingCacheContext = createContext<EmbeddingCacheContextType | null>(null);

const DB_NAME = "manifold-atlas-cache";
const STORE_NAME = "embeddings";
const DB_VERSION = 1;

function cacheKey(modelId: string, text: string): string {
  return `${modelId}::${text}`;
}

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export function EmbeddingCacheProvider({ children }: { children: React.ReactNode }) {
  const dbRef = useRef<Promise<IDBPDatabase> | null>(null);
  const [cacheSize, setCacheSize] = useState(0);

  const ensureDB = useCallback(() => {
    if (!dbRef.current) {
      dbRef.current = getDB();
      // Count entries on init
      dbRef.current.then(async db => {
        const count = await db.count(STORE_NAME);
        setCacheSize(count);
      });
    }
    return dbRef.current;
  }, []);

  const get = useCallback(async (modelId: string, text: string): Promise<number[] | null> => {
    const db = await ensureDB();
    const entry: CacheEntry | undefined = await db.get(STORE_NAME, cacheKey(modelId, text));
    return entry?.vector ?? null;
  }, [ensureDB]);

  const set = useCallback(async (modelId: string, text: string, vector: number[]) => {
    const db = await ensureDB();
    const entry: CacheEntry = { modelId, text, vector, timestamp: Date.now() };
    await db.put(STORE_NAME, entry, cacheKey(modelId, text));
    setCacheSize(prev => prev + 1);
  }, [ensureDB]);

  const getMany = useCallback(async (modelId: string, texts: string[]): Promise<Map<string, number[]>> => {
    const db = await ensureDB();
    const results = new Map<string, number[]>();
    const tx = db.transaction(STORE_NAME, "readonly");
    for (const text of texts) {
      const entry: CacheEntry | undefined = await tx.store.get(cacheKey(modelId, text));
      if (entry?.vector) {
        results.set(text, entry.vector);
      }
    }
    await tx.done;
    return results;
  }, [ensureDB]);

  const setMany = useCallback(
    async (modelId: string, entries: Array<{ text: string; vector: number[] }>) => {
      const db = await ensureDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      for (const { text, vector } of entries) {
        const entry: CacheEntry = { modelId, text, vector, timestamp: Date.now() };
        await tx.store.put(entry, cacheKey(modelId, text));
      }
      await tx.done;
      setCacheSize(prev => prev + entries.length);
    },
    [ensureDB]
  );

  const clearCache = useCallback(async () => {
    const db = await ensureDB();
    await db.clear(STORE_NAME);
    setCacheSize(0);
  }, [ensureDB]);

  return (
    <EmbeddingCacheContext.Provider value={{ get, set, getMany, setMany, cacheSize, clearCache }}>
      {children}
    </EmbeddingCacheContext.Provider>
  );
}

export function useEmbeddingCache() {
  const ctx = useContext(EmbeddingCacheContext);
  if (!ctx) throw new Error("useEmbeddingCache must be used within EmbeddingCacheProvider");
  return ctx;
}
