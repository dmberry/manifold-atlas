"use client";

import { useState } from "react";
import { isOllamaModelError, type OllamaModelError } from "./useEmbedAll";
import { OllamaHelper } from "./OllamaHelper";

interface ErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const [showOllamaHelper, setShowOllamaHelper] = useState(false);

  if (isOllamaModelError(error)) {
    return (
      <>
        <div className="card-editorial p-4 border-warning-500/30 bg-warning-50 dark:bg-warning-500/10">
          <p className="font-sans text-body-sm text-warning-600 mb-2">
            Ollama model <code className="px-1.5 py-0.5 bg-muted rounded-sm font-mono">{error.modelName}</code> is not installed locally.
          </p>
          <button
            onClick={() => setShowOllamaHelper(true)}
            className="btn-editorial-secondary text-body-sm px-3 py-1.5"
          >
            Pull Model...
          </button>
        </div>
        {showOllamaHelper && (
          <OllamaHelper
            modelName={error.modelName}
            baseUrl={error.baseUrl}
            onClose={() => setShowOllamaHelper(false)}
            onPulled={() => {
              setShowOllamaHelper(false);
              onRetry?.();
            }}
          />
        )}
      </>
    );
  }

  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="card-editorial p-4 border-error-500/30 bg-error-50 dark:bg-error-500/10">
      <p className="font-sans text-body-sm text-error-600">{message}</p>
    </div>
  );
}
