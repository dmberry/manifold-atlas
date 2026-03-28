"use client";

interface SimilarityBridgeProps {
  nameA: string;
  nameB: string;
  similarity: number;
  subtitle?: string;
}

function bridgeColor(similarity: number): string {
  if (similarity >= 0.85) return "#ef4444";
  if (similarity >= 0.7) return "#f97316";
  if (similarity >= 0.5) return "#eab308";
  return "#22c55e";
}

export function SimilarityBridge({ nameA, nameB, similarity, subtitle }: SimilarityBridgeProps) {
  const distance = 1 - similarity;
  const dashCount = Math.max(3, Math.round(Math.max(20, Math.min(80, distance * 200)) / 3));
  const dashes = "—".repeat(dashCount);
  const color = bridgeColor(similarity);

  return (
    <div>
      <div className="flex items-center justify-center gap-0 my-1">
        <span className="font-sans text-[13px] font-semibold text-foreground uppercase tracking-wide whitespace-nowrap">
          {nameA}
        </span>
        <span
          className="mx-1.5 text-[11px] tabular-nums tracking-tighter overflow-hidden whitespace-nowrap"
          style={{ color }}
        >
          {dashes}
        </span>
        <span
          className="font-sans text-[15px] font-bold tabular-nums flex-shrink-0"
          style={{ color }}
        >
          {similarity.toFixed(4)}
        </span>
        <span
          className="mx-1.5 text-[11px] tabular-nums tracking-tighter overflow-hidden whitespace-nowrap"
          style={{ color }}
        >
          {dashes}
        </span>
        <span className="font-sans text-[13px] font-semibold text-foreground uppercase tracking-wide whitespace-nowrap">
          {nameB}
        </span>
      </div>
      {subtitle && (
        <p className="text-center font-sans text-[10px]" style={{ color }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
