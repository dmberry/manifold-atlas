/**
 * Query history stored in localStorage.
 * Keeps the last N queries per operation type.
 */

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: "distance" | "negation";
  // Distance-specific
  termA?: string;
  termB?: string;
  // Negation-specific
  original?: string;
  negated?: string;
  // Summary result per model
  results: Array<{
    modelName: string;
    similarity: number;
    collapsed?: boolean;
  }>;
}

const STORAGE_KEY = "manifold-atlas-history";
const MAX_ENTRIES = 50;

function loadHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // localStorage full or unavailable
  }
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry {
  const history = loadHistory();

  // Deduplicate: if the most recent entry of the same type has the same query, skip
  const latest = history.find(h => h.type === entry.type);
  if (latest) {
    const sameQuery =
      (entry.type === "distance" && latest.termA === entry.termA && latest.termB === entry.termB) ||
      (entry.type === "negation" && latest.original === entry.original);
    if (sameQuery) {
      // Update the existing entry's results and timestamp instead
      latest.results = entry.results;
      latest.timestamp = Date.now();
      saveHistory(history);
      return latest;
    }
  }

  const full: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  history.unshift(full);
  saveHistory(history);
  return full;
}

export function getHistory(type?: "distance" | "negation"): HistoryEntry[] {
  const history = loadHistory();
  if (type) return history.filter(h => h.type === type);
  return history;
}

export function deleteHistoryEntry(id: string) {
  const history = loadHistory().filter(h => h.id !== id);
  saveHistory(history);
}

export function clearHistory(type?: "distance" | "negation") {
  if (type) {
    const history = loadHistory().filter(h => h.type !== type);
    saveHistory(history);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}
