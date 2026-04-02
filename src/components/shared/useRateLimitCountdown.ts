"use client";

import { useState, useRef, useCallback } from "react";
import { RateLimitError } from "@/lib/embeddings/client";

/**
 * Hook for rate limit countdown on compute buttons.
 * When a RateLimitError is caught, call `startCountdown(error)`.
 * The hook provides `countdown` (seconds remaining, 0 = ready)
 * and `buttonLabel` (e.g. "Wait 33s..." or the normal label).
 */
export function useRateLimitCountdown() {
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((error: RateLimitError) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(error.waitSeconds);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const isWaiting = countdown > 0;

  return { countdown, isWaiting, startCountdown };
}
