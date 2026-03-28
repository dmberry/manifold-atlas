"use client";

import { cn } from "@/lib/utils";

interface SimilarityBarProps {
  modelName: string;
  providerId: string;
  similarity: number;
  threshold?: number;
  showLabel?: boolean;
}

function getBarColor(similarity: number, threshold: number): string {
  if (similarity >= threshold) return "bg-error-500";
  if (similarity >= threshold - 0.07) return "bg-warning-500";
  return "bg-success-500";
}

function getTextColor(similarity: number, threshold: number): string {
  if (similarity >= threshold) return "text-error-600";
  if (similarity >= threshold - 0.07) return "text-warning-600";
  return "text-success-600";
}

export function SimilarityBar({
  modelName,
  providerId,
  similarity,
  threshold = 0.92,
  showLabel = true,
}: SimilarityBarProps) {
  const percentage = Math.max(0, Math.min(100, similarity * 100));
  const barColor = getBarColor(similarity, threshold);
  const textColor = getTextColor(similarity, threshold);

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-sans text-body-sm font-medium">{modelName}</span>
            <span className="font-sans text-caption text-slate">{providerId}</span>
          </div>
          <span className={cn("font-sans text-body-sm font-semibold tabular-nums", textColor)}>
            {similarity.toFixed(4)}
          </span>
        </div>
      )}
      <div className="h-2.5 bg-parchment rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
