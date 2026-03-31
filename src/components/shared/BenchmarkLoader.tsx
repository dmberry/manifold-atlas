"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, Upload, ChevronDown } from "lucide-react";
import { loadDefaultBenchmark, loadBenchmarkFromFile, getAllConcepts, type BenchmarkSet } from "@/lib/benchmark";

interface BenchmarkLoaderProps {
  onLoad: (concepts: string[]) => void;
  label?: string;
}

export function BenchmarkLoader({ onLoad, label = "Load Benchmark" }: BenchmarkLoaderProps) {
  const [open, setOpen] = useState(false);
  const [benchmark, setBenchmark] = useState<BenchmarkSet | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Load default benchmark on first open
  useEffect(() => {
    if (open && !benchmark) {
      setLoading(true);
      loadDefaultBenchmark()
        .then(b => setBenchmark(b))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, benchmark]);

  const handleLoadAll = () => {
    if (!benchmark) return;
    onLoad(getAllConcepts(benchmark));
    setOpen(false);
  };

  const handleLoadCategory = (categoryName: string) => {
    if (!benchmark) return;
    const cat = benchmark.categories.find(c => c.name === categoryName);
    if (cat) {
      onLoad(cat.concepts);
      setOpen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const custom = await loadBenchmarkFromFile(file);
      setBenchmark(custom);
      onLoad(getAllConcepts(custom));
      setOpen(false);
    } catch (err) {
      console.error("Failed to load benchmark file:", err);
    }
    // Reset file input
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="btn-editorial-ghost text-body-sm px-3 py-1.5 flex items-center gap-1.5"
      >
        <BookOpen size={14} />
        {label}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-[280px] card-editorial shadow-editorial-lg overflow-hidden">
          {loading ? (
            <div className="p-3 text-center font-sans text-caption text-muted-foreground">Loading benchmark...</div>
          ) : benchmark ? (
            <>
              <div className="px-3 py-2 border-b border-parchment">
                <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {benchmark.name}
                </p>
              </div>

              {/* Load all */}
              <button
                onClick={handleLoadAll}
                className="w-full text-left px-3 py-2 hover:bg-cream/50 transition-colors font-sans text-body-sm font-medium border-b border-parchment"
              >
                All categories ({getAllConcepts(benchmark).length} concepts)
              </button>

              {/* Per category */}
              <div className="max-h-[250px] overflow-y-auto divide-y divide-parchment">
                {benchmark.categories.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => handleLoadCategory(cat.name)}
                    className="w-full text-left px-3 py-1.5 hover:bg-cream/50 transition-colors"
                  >
                    <span className="font-sans text-body-sm">{cat.name}</span>
                    <span className="font-sans text-caption text-muted-foreground ml-1">({cat.concepts.length})</span>
                  </button>
                ))}
              </div>

              {/* Custom upload */}
              <div className="px-3 py-2 border-t border-parchment">
                <label className="flex items-center gap-1.5 cursor-pointer font-sans text-caption text-muted-foreground hover:text-foreground transition-colors">
                  <Upload size={12} />
                  Load custom .md file
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".md"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </>
          ) : (
            <div className="p-3 text-center font-sans text-caption text-error-500">Failed to load benchmark</div>
          )}
        </div>
      )}
    </div>
  );
}
