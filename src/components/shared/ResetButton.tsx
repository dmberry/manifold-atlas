"use client";

import { RotateCcw } from "lucide-react";

interface ResetButtonProps {
  onReset: () => void;
}

export function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <button
      onClick={onReset}
      className="btn-editorial-ghost text-body-sm px-3 py-1.5 flex items-center gap-1.5"
      title="Clear all inputs and results"
    >
      <RotateCcw size={14} />
      Reset
    </button>
  );
}
