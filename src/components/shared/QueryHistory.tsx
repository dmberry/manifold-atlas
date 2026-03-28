"use client";

import { useState, useEffect } from "react";
import { Clock, Trash2, X } from "lucide-react";
import { getHistory, deleteHistoryEntry, clearHistory, type HistoryEntry } from "@/lib/history";

interface QueryHistoryProps {
  type: "distance" | "negation";
  onSelect: (entry: HistoryEntry) => void;
}

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function summaryLabel(entry: HistoryEntry): string {
  if (entry.type === "distance") {
    return `${entry.termA} ↔ ${entry.termB}`;
  }
  return entry.original || "";
}

function summaryValue(entry: HistoryEntry): { text: string; color: string } {
  if (entry.results.length === 0) return { text: "", color: "" };

  if (entry.type === "negation") {
    const collapsed = entry.results.filter(r => r.collapsed).length;
    if (collapsed > 0) return { text: `${collapsed} collapsed`, color: "text-error-500" };
    return { text: "no collapse", color: "text-success-600" };
  }

  // Distance: show the first model's similarity
  const sim = entry.results[0].similarity;
  return { text: sim.toFixed(4), color: sim >= 0.7 ? "text-error-500" : sim >= 0.5 ? "text-warning-500" : "text-success-600" };
}

export function QueryHistory({ type, onSelect }: QueryHistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const refresh = () => setEntries(getHistory(type));

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [type]);

  // Also refresh when the component becomes visible
  useEffect(() => {
    if (open) refresh();
  }, [open]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryEntry(id);
    refresh();
  };

  const handleClear = () => {
    clearHistory(type);
    refresh();
  };

  if (!mounted) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-editorial-ghost text-body-sm px-3 py-1.5 flex items-center gap-1.5"
      >
        <Clock size={14} />
        History ({entries.length})
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-40 w-[380px] max-h-[400px] overflow-y-auto card-editorial shadow-editorial-lg">
            <div className="p-3 border-b border-parchment flex items-center justify-between">
              <span className="font-sans text-caption text-muted-foreground uppercase tracking-wider font-semibold">
                {type === "distance" ? "Distance" : "Negation"} History
              </span>
              <div className="flex items-center gap-1">
                {entries.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="font-sans text-caption text-muted-foreground hover:text-error-500 transition-colors px-1.5 py-0.5"
                  >
                    Clear all
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-0.5">
                  <X size={14} />
                </button>
              </div>
            </div>

            {entries.length === 0 ? (
              <div className="p-4 text-center font-sans text-body-sm text-muted-foreground">
                No queries yet
              </div>
            ) : (
              <div className="divide-y divide-parchment">
                {entries.map(entry => {
                  const val = summaryValue(entry);
                  return (
                    <div
                      key={entry.id}
                      onClick={() => { onSelect(entry); setOpen(false); }}
                      className="w-full text-left px-3 py-2.5 hover:bg-cream/50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-body-sm font-medium text-foreground truncate mr-2">
                          {summaryLabel(entry)}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`font-sans text-caption font-semibold tabular-nums ${val.color}`}>
                            {val.text}
                          </span>
                          <span
                            role="button"
                            onClick={e => handleDelete(entry.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-error-500 transition-all p-0.5 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-sans text-caption text-muted-foreground">
                          {formatTime(entry.timestamp)}
                        </span>
                        <span className="font-sans text-caption text-muted-foreground">
                          {entry.results.length} model{entry.results.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
