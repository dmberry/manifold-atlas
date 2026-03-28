"use client";

interface GaugeArcProps {
  modelName: string;
  providerId: string;
  similarity: number;
  threshold: number;
  collapsed: boolean;
}

export function GaugeArc({ modelName, providerId, similarity, threshold, collapsed }: GaugeArcProps) {
  // Simple horizontal bar gauge instead of arc - cleaner and more readable
  const percentage = similarity * 100;
  const thresholdPct = threshold * 100;

  // Colour scale: high similarity = bad (for negation), low = good
  let color = "#22c55e";
  let zoneName = "Separated";
  if (similarity >= 0.85) { color = "#ef4444"; zoneName = collapsed ? "Collapsed" : "Near-collapse"; }
  else if (similarity >= 0.7) { color = "#f97316"; zoneName = "High overlap"; }
  else if (similarity >= 0.5) { color = "#eab308"; zoneName = "Partial separation"; }

  return (
    <div className="w-[180px] flex-shrink-0">
      <div className="text-center mb-2">
        <span className="font-sans text-body-sm font-semibold">{modelName}</span>
      </div>

      {/* Value */}
      <div className="text-center mb-2">
        <span className="font-sans text-[28px] font-bold tabular-nums" style={{ color }}>
          {similarity.toFixed(3)}
        </span>
        <div className="font-sans text-caption font-semibold" style={{ color }}>
          {zoneName}
        </div>
      </div>

      {/* Bar gauge */}
      <div className="relative h-3 bg-parchment rounded-full overflow-visible mx-2">
        {/* Danger zone */}
        <div
          className="absolute top-0 h-full rounded-r-full"
          style={{
            left: `${thresholdPct}%`,
            width: `${100 - thresholdPct}%`,
            backgroundColor: "rgba(239,68,68,0.1)",
          }}
        />
        {/* Value fill */}
        <div
          className="absolute top-0 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
        {/* Threshold tick */}
        <div
          className="absolute top-[-3px] w-[2px] h-[18px] rounded-full"
          style={{
            left: `${thresholdPct}%`,
            backgroundColor: "hsl(var(--foreground))",
            opacity: 0.4,
          }}
        />
      </div>

      {/* Scale */}
      <div className="flex justify-between mx-2 mt-1">
        <span className="font-sans text-[9px] text-muted-foreground">0</span>
        <span className="font-sans text-[9px] text-muted-foreground">threshold</span>
        <span className="font-sans text-[9px] text-muted-foreground">1</span>
      </div>
    </div>
  );
}
