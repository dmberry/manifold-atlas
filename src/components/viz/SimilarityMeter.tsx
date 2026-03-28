"use client";

import type { SimilarityLevel } from "@/lib/similarity-scale";

interface SimilarityMeterProps {
  similarity: number;
  level: SimilarityLevel;
}

export function SimilarityMeter({ similarity, level }: SimilarityMeterProps) {
  const markerPct = Math.max(2, Math.min(98, similarity * 100));

  return (
    <div className="space-y-1.5">
      {/* Level label */}
      <div className="flex items-center justify-between">
        <span className="font-sans text-body-sm font-semibold" style={{ color: level.color }}>
          {level.label}
        </span>
        <span className="font-sans text-body-sm font-bold tabular-nums" style={{ color: level.color }}>
          {similarity.toFixed(4)}
        </span>
      </div>

      {/* Gradient bar with marker */}
      <div className="relative pt-2 pb-1">
        <div
          className="h-3 rounded-full"
          style={{
            background: "linear-gradient(to right, #15803d 0%, #65a30d 30%, #d97706 50%, #ea580c 70%, #dc2626 85%, #991b1b 100%)",
          }}
        />
        {/* Marker: triangle pointer + vertical line */}
        <div
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${markerPct}%`, transform: "translateX(-50%)" }}
        >
          {/* Down-pointing triangle */}
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "7px solid hsl(var(--foreground))",
            }}
          />
          {/* Vertical line through the bar */}
          <div className="w-[2px] h-[14px] bg-foreground rounded-full" />
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between font-sans text-[9px] text-muted-foreground">
        <span>Distinctive</span>
        <span>Somewhat similar</span>
        <span>Indistinguishable</span>
      </div>
    </div>
  );
}
