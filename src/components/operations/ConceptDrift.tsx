"use client";

import { useState } from "react";
import { Loader2, Waypoints } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useEmbedAll } from "@/components/shared/useEmbedAll";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { cosineSimilarity } from "@/lib/geometry/cosine";
import { SimilarityBridge } from "@/components/viz/SimilarityBridge";
import { EMBEDDING_MODELS } from "@/types/embeddings";
import { similarityColor } from "@/lib/similarity-scale";
import { ResetButton } from "@/components/shared/ResetButton";

const DEFAULT_CONCEPT = "justice";
const DEFAULT_CONTEXTS = [
  "justice",
  "justice in the context of punishment",
  "justice in the context of mercy",
  "justice in the context of economics",
  "justice in the context of war",
  "justice in the context of technology",
];

interface DriftResult {
  concept: string;
  variants: string[];
  models: Array<{
    modelId: string;
    modelName: string;
    // Similarity of each variant to the bare concept
    drifts: Array<{
      variant: string;
      similarity: number;
      displacement: number; // 1 - similarity
    }>;
    // Pairwise similarities between all variants
    pairwise: number[][];
  }>;
}

interface ConceptDriftProps {
  onQueryTime: (time: number) => void;
}

export function ConceptDrift({ onQueryTime }: ConceptDriftProps) {
  const [concept, setConcept] = useState("");
  const [contextsText, setContextsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [result, setResult] = useState<DriftResult | null>(null);
  const { getEnabledModels } = useSettings();
  const embedAll = useEmbedAll();

  const handleCompute = async () => {
    const effectiveConcept = concept.trim() || DEFAULT_CONCEPT;
    if (!concept.trim()) setConcept(DEFAULT_CONCEPT);

    let variants: string[];
    if (contextsText.trim()) {
      variants = contextsText.split("\n").map(s => s.trim()).filter(s => s.length > 0);
      // Ensure bare concept is first
      if (!variants.includes(effectiveConcept)) {
        variants.unshift(effectiveConcept);
      }
    } else {
      variants = DEFAULT_CONTEXTS.map(c =>
        c === DEFAULT_CONCEPT ? effectiveConcept : c.replace(DEFAULT_CONCEPT, effectiveConcept)
      );
      setContextsText(variants.join("\n"));
    }

    setLoading(true);
    setError(null);
    const start = performance.now();

    try {
      const modelVectors = await embedAll(variants);
      const enabledModels = getEnabledModels();

      const models = enabledModels
        .filter(m => modelVectors.has(m.id))
        .map(m => {
          const vectors = modelVectors.get(m.id)!;
          const baseVec = vectors[0]; // bare concept

          const drifts = variants.map((variant, i) => {
            const sim = cosineSimilarity(baseVec, vectors[i]);
            return {
              variant,
              similarity: sim,
              displacement: 1 - sim,
            };
          });

          // Pairwise similarity matrix
          const pairwise: number[][] = [];
          for (let i = 0; i < vectors.length; i++) {
            pairwise[i] = [];
            for (let j = 0; j < vectors.length; j++) {
              pairwise[i][j] = cosineSimilarity(vectors[i], vectors[j]);
            }
          }

          const spec = EMBEDDING_MODELS.find(s => s.id === m.id);
          return {
            modelId: m.id,
            modelName: spec?.name || m.id,
            drifts,
            pairwise,
          };
        });

      setResult({ concept: effectiveConcept, variants, models });
      onQueryTime((performance.now() - start) / 1000);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-editorial p-6">
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-display text-display-md font-bold">Concept Drift</h2>
          <ResetButton onReset={() => { setConcept(""); setContextsText(""); setResult(null); setError(null); }} />
        </div>
        <p className="font-sans text-body-sm text-slate mb-4">
          How much does context warp the manifold&apos;s positioning of a concept?
          Embed the same term with different contextual framings and measure how far
          each context displaces it from its bare position. Large displacement means
          the manifold is context-sensitive; small displacement means the concept
          is geometrically rigid.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Waypoints size={20} className="text-slate flex-shrink-0" />
            <input
              type="text"
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder={DEFAULT_CONCEPT}
              className="input-editorial flex-1"
            />
          </div>
          <textarea
            value={contextsText}
            onChange={e => setContextsText(e.target.value)}
            placeholder={DEFAULT_CONTEXTS.join("\n")}
            className="input-editorial min-h-[120px] resize-y text-body-sm"
            rows={6}
          />
          <div className="flex items-center justify-between">
            <p className="font-sans text-caption text-muted-foreground">
              One variant per line. The first line should be the bare concept.
            </p>
            <button
              onClick={handleCompute}
              disabled={loading}
              className="btn-editorial-primary disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Test Drift"}
            </button>
          </div>
        </div>
      </div>

      {error != null && <ErrorDisplay error={error} onRetry={handleCompute} />}

      {result && result.models.map(m => (
        <div key={m.modelId} className="card-editorial overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <span className="font-sans text-body-sm font-semibold">{m.modelName}</span>
          </div>

          <div className="thin-rule mx-5" />

          {/* Drift from base */}
          <div className="px-5 py-5">
            <h4 className="font-sans text-caption text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Displacement from &ldquo;{result.concept}&rdquo;
            </h4>
            <p className="font-sans text-caption text-muted-foreground mb-4">
              How far does each contextual framing move the concept from its bare position?
              Larger bars mean more geometric displacement.
            </p>

            <div className="space-y-2">
              {m.drifts.slice(1).map((d, i) => {
                const maxDisplacement = Math.max(...m.drifts.slice(1).map(x => x.displacement));
                const barWidth = maxDisplacement > 0 ? (d.displacement / maxDisplacement) * 100 : 0;
                const color = similarityColor(d.similarity);

                return (
                  <div key={i} className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-body-sm">{d.variant}</span>
                      <span className="font-sans text-caption tabular-nums font-semibold" style={{ color }}>
                        {d.displacement.toFixed(4)} displaced
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="thin-rule mx-5" />

          {/* Most and least displaced */}
          <div className="px-5 py-5">
            <h4 className="font-sans text-caption text-muted-foreground uppercase tracking-wider font-semibold mb-3">
              Displacement Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const sorted = [...m.drifts.slice(1)].sort((a, b) => b.displacement - a.displacement);
                const most = sorted[0];
                const least = sorted[sorted.length - 1];
                return (
                  <>
                    <div className="bg-muted rounded-sm p-3">
                      <div className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider">
                        Most displaced context
                      </div>
                      <div className="font-sans text-body-sm font-bold mt-1">{most.variant}</div>
                      <div className="font-sans text-caption text-muted-foreground mt-0.5 tabular-nums">
                        displacement: {most.displacement.toFixed(4)} (similarity: {most.similarity.toFixed(4)})
                      </div>
                    </div>
                    <div className="bg-muted rounded-sm p-3">
                      <div className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider">
                        Least displaced context
                      </div>
                      <div className="font-sans text-body-sm font-bold mt-1">{least.variant}</div>
                      <div className="font-sans text-caption text-muted-foreground mt-0.5 tabular-nums">
                        displacement: {least.displacement.toFixed(4)} (similarity: {least.similarity.toFixed(4)})
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <p className="font-sans text-caption text-muted-foreground mt-3 italic">
              The difference between most and least displaced contexts reveals how
              unevenly the manifold distributes contextual sensitivity. Contexts that
              produce large displacement are geometrically powerful: they restructure
              the concept&apos;s neighbourhood.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
