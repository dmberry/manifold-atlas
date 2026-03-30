"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useEmbedAll } from "@/components/shared/useEmbedAll";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { cosineSimilarity } from "@/lib/geometry/cosine";
import { generateNegation } from "@/lib/negation";
import { GaugeArc } from "@/components/viz/GaugeArc";
import { SimilarityBridge } from "@/components/viz/SimilarityBridge";
import { SimilarityMeter } from "@/components/viz/SimilarityMeter";
import { QueryHistory } from "@/components/shared/QueryHistory";
import { addHistoryEntry, type HistoryEntry } from "@/lib/history";
import { negationSimilarityLevel } from "@/lib/similarity-scale";
import { ResetButton } from "@/components/shared/ResetButton";
import { EMBEDDING_MODELS } from "@/types/embeddings";

const DEFAULT_STATEMENT = "This policy is fair";

interface NegationModelResult {
  modelId: string;
  modelName: string;
  providerId: string;
  cosineSimilarity: number;
  cosineDistance: number;
  angularDistance: number;
  collapsed: boolean;
  dimensions: number;
}

interface NegationFullResult {
  original: string;
  negated: string;
  threshold: number;
  models: NegationModelResult[];
}

function vectorNorm(v: number[]): number {
  return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
}

function negationVerdict(sim: number, threshold: number): { severity: string; explanation: string } {
  if (sim >= 0.98) return {
    severity: "Total collapse",
    explanation: "The claim and its negation occupy virtually the same geometric position. Negation produces no meaningful displacement. The few dimensions in which they might differ are overwhelmed by similarity across all others.",
  };
  if (sim >= threshold) return {
    severity: "Geometrically trivial",
    explanation: "Negation produces only a minor perturbation of the embedding, likely a small rotation in a few dimensions drowned out by similarity across all others. The geometric capacity for negation exists but is inadequate to the logical and dialectical weight that negation carries. The manifold was produced through negation (the loss function) but retains only a geometrically trivial trace of it.",
  };
  if (sim >= threshold - 0.07) return {
    severity: "Borderline",
    explanation: "The manifold maintains a narrow distinction between the claim and its negation, but the margin is thin. The negation likely operates in a small dimensional subspace while the overwhelming majority of dimensions remain unchanged. Small perturbations in context could collapse even this narrow separation.",
  };
  if (sim >= 0.5) return {
    severity: "Partial separation",
    explanation: "The manifold positions the claim and its negation in partially distinct regions. The negation shifts the embedding noticeably but does not create the categorical boundary that logical negation requires. The geometric distance is real but does not correspond to logical inversion.",
  };
  return {
    severity: "Adequate separation",
    explanation: "The manifold positions the statement and its negation in distinct regions. This is the minimum geometric condition for the distinction to be operationally meaningful, though geometric distance is never the same as logical negation. Distance measures proximity, not truth-value.",
  };
}

interface NegationGaugeProps {
  onQueryTime: (time: number) => void;
}

export function NegationGauge({ onQueryTime }: NegationGaugeProps) {
  const [statement, setStatement] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [result, setResult] = useState<NegationFullResult | null>(null);
  const { settings, getEnabledModels } = useSettings();
  const embedAll = useEmbedAll();

  const handleCompute = async (overrideStatement?: string) => {
    const effectiveStatement = overrideStatement || statement.trim() || DEFAULT_STATEMENT;
    if (!statement.trim() && !overrideStatement) setStatement(DEFAULT_STATEMENT);
    setLoading(true);
    setError(null);
    const start = performance.now();

    try {
      const original = effectiveStatement;
      const negated = generateNegation(original);
      const threshold = settings.negationThreshold;

      const modelVectors = await embedAll([original, negated]);
      const enabledModels = getEnabledModels();

      const models = enabledModels
        .filter(m => modelVectors.has(m.id))
        .map(m => {
          const vectors = modelVectors.get(m.id)!;
          const sim = cosineSimilarity(vectors[0], vectors[1]);
          const clampedSim = Math.max(-1, Math.min(1, sim));
          const spec = EMBEDDING_MODELS.find(s => s.id === m.id);
          return {
            modelId: m.id,
            modelName: spec?.name || m.id,
            providerId: m.providerId,
            cosineSimilarity: sim,
            cosineDistance: 1 - sim,
            angularDistance: (Math.acos(clampedSim) * 180) / Math.PI,
            collapsed: sim >= threshold,
            dimensions: vectors[0].length,
          };
        })
        .sort((a, b) => b.cosineSimilarity - a.cosineSimilarity);

      setResult({ original, negated, threshold, models });
      onQueryTime((performance.now() - start) / 1000);

      // Save to history
      addHistoryEntry({
        type: "negation",
        original,
        negated,
        results: models.map(m => ({
          modelName: m.modelName,
          similarity: m.cosineSimilarity,
          collapsed: m.collapsed,
        })),
      });
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStatement("");
    setResult(null);
    setError(null);
  };

  const handleHistorySelect = (entry: HistoryEntry) => {
    if (entry.original) setStatement(entry.original);
    handleCompute(entry.original);
  };

  const collapsedCount = result?.models.filter(m => m.collapsed).length ?? 0;
  const totalCount = result?.models.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="card-editorial p-6">
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-display text-display-md font-bold">Negation Gauge</h2>
          <div className="flex items-center gap-1">
            <ResetButton onReset={handleReset} />
            <QueryHistory type="negation" onSelect={handleHistorySelect} />
          </div>
        </div>
        <p className="font-sans text-body-sm text-slate mb-4">
          Measure the geometric adequacy of negation in the manifold. The manifold&apos;s
          representation of negation is structurally inadequate to the logical weight negation
          carries: a minor perturbation where logic requires categorical inversion.
          This gauge measures the empirical evidence for that deficit.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={statement}
            onChange={e => setStatement(e.target.value)}
            placeholder={DEFAULT_STATEMENT}
            className="input-editorial flex-1"
            onKeyDown={e => e.key === "Enter" && handleCompute()}
          />
          <button
            onClick={() => handleCompute()}
            disabled={loading}
            className="btn-editorial-primary flex-shrink-0 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Test"}
          </button>
        </div>
      </div>

      {error != null && <ErrorDisplay error={error} onRetry={() => handleCompute()} />}

      {result && (
        <div className="space-y-4">
          {/* Statement pair */}
          <div className="card-editorial p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-sm">
                <div className="font-sans text-caption text-muted-foreground uppercase tracking-wider mb-1">
                  Original
                </div>
                <p className="font-body text-body-md font-medium">{result.original}</p>
              </div>
              <div className="p-3 bg-muted rounded-sm">
                <div className="font-sans text-caption text-muted-foreground uppercase tracking-wider mb-1">
                  Negated
                </div>
                <p className="font-body text-body-md font-medium">{result.negated}</p>
              </div>
            </div>

            {/* Summary verdict */}
            <div className="mt-4 p-3 border border-parchment rounded-sm">
              <div className="flex items-center justify-between">
                <span className="font-sans text-caption text-muted-foreground uppercase tracking-wider font-semibold">
                  Summary
                </span>
                <span className={`font-sans text-body-sm font-bold ${collapsedCount > 0 ? "text-error-500" : "text-success-500"}`}>
                  {collapsedCount} of {totalCount} model{totalCount !== 1 ? "s" : ""} collapsed
                </span>
              </div>
              <p className="font-sans text-body-sm text-muted-foreground mt-1">
                Collapse threshold: cosine similarity &ge; {result.threshold} (configurable in Settings)
              </p>
            </div>
          </div>

          {/* Per-model results */}
          <div className="space-y-3">
            {result.models.map(m => {
              const verdict = negationVerdict(m.cosineSimilarity, result.threshold);

              return (
                <div key={m.modelId} className="card-editorial overflow-hidden">
                  {/* Model header */}
                  <div className="px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-body-sm font-semibold">{m.modelName}</span>
                      <span className="font-sans text-caption text-muted-foreground">{m.providerId}</span>
                      <span className="font-sans text-caption text-muted-foreground">&middot; {m.dimensions.toLocaleString()} dimensions</span>
                    </div>
                  </div>

                  <div className="thin-rule mx-5" />

                  {/* Geometric distance */}
                  <div className="px-5 py-5">
                    <h4 className="font-sans text-caption text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Geometric Distance
                    </h4>
                    <p className="font-sans text-caption text-muted-foreground mb-3">
                      How far apart are the claim and its negation in this model&apos;s embedding space?
                      The number is their cosine similarity: 1.0 means identical, 0.0 means orthogonal.
                    </p>
                    <SimilarityBridge
                      nameA={result.original}
                      nameB={result.negated}
                      similarity={m.cosineSimilarity}
                    />
                  </div>

                  <div className="thin-rule mx-5" />

                  {/* Diagnostic */}
                  <div className="px-5 py-5">
                    <h4 className="font-sans text-caption text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Diagnostic
                    </h4>
                    <p className="font-sans text-caption text-muted-foreground mb-3">
                      Where does this result fall on the scale from distinctive concepts to geometric collapse?
                      The marker shows the position; the colour indicates severity.
                    </p>
                    <SimilarityMeter
                      similarity={m.cosineSimilarity}
                      level={negationSimilarityLevel(m.cosineSimilarity, result.threshold)}
                    />
                  </div>

                  <div className="thin-rule mx-5" />

                  {/* Interpretation */}
                  <div className="px-5 py-5">
                    <h4 className="font-sans text-caption text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Interpretation
                    </h4>
                    <p className="font-body text-body-sm text-slate leading-relaxed">
                      {verdict.explanation}
                    </p>
                  </div>

                  <div className="thin-rule mx-5" />

                  {/* Technical detail */}
                  <div className="px-5 py-5">
                    <h4 className="font-sans text-caption text-muted-foreground uppercase tracking-wider font-semibold mb-3">
                      Technical Detail
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-muted rounded-sm p-2.5">
                        <div className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider">Cosine Similarity</div>
                        <div className="font-sans text-body-sm font-bold tabular-nums mt-0.5">{m.cosineSimilarity.toFixed(4)}</div>
                        <div className="font-sans text-[9px] text-muted-foreground mt-0.5">dot product / (norm A &times; norm B)</div>
                      </div>
                      <div className="bg-muted rounded-sm p-2.5">
                        <div className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider">Cosine Distance</div>
                        <div className="font-sans text-body-sm font-bold tabular-nums mt-0.5">{m.cosineDistance.toFixed(4)}</div>
                        <div className="font-sans text-[9px] text-muted-foreground mt-0.5">1 &minus; similarity</div>
                      </div>
                      <div className="bg-muted rounded-sm p-2.5">
                        <div className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider">Angular Separation</div>
                        <div className="font-sans text-body-sm font-bold tabular-nums mt-0.5">{m.angularDistance.toFixed(1)}&deg;</div>
                        <div className="font-sans text-[9px] text-muted-foreground mt-0.5">of 180&deg; maximum</div>
                      </div>
                      <div className="bg-muted rounded-sm p-2.5">
                        <div className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider">Collapse Threshold</div>
                        <div className="font-sans text-body-sm font-bold tabular-nums mt-0.5">{result.threshold}</div>
                        <div className="font-sans text-[9px] text-muted-foreground mt-0.5">configurable in settings</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Theoretical context */}
          <div className="card-editorial p-4 border-l-4 border-l-burgundy">
            <h4 className="font-display text-body-sm font-bold mb-2">On the Negation Deficit</h4>
            <p className="font-body text-body-sm text-slate mb-2">
              Natural-language negation in the manifold is likely an orthogonality rather than an
              inversion: a rotation in a small number of dimensions rather than a reversal across
              all dimensions. A claim and its negation share the overwhelming majority of their
              geometric coordinates and differ in only a small subspace. The deficit is not that
              the manifold has zero capacity for negation, but that its capacity is geometrically
              trivial relative to the conceptual work negation performs.
            </p>
            <p className="font-body text-body-sm text-slate mb-2">
              In logic, negation inverts the truth value entirely. In dialectics, negation is the
              motor of the argument. In the manifold, negation is a minor perturbation of an
              otherwise stable coordinate. The manifold was produced through negation (the loss
              function minimises error, a form of negation) but retains only a geometrically
              trivial trace of it.
            </p>
            <p className="font-body text-body-sm text-slate">
              A system that can position everything but negate only trivially is not neutral. It is
              a system whose political consequence is the geometric anaesthesia of opposition.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
