"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface WaitlistCounterProps {
  refreshTrigger?: number;
  className?: string;
}

export function WaitlistCounter({
  refreshTrigger,
  className,
}: WaitlistCounterProps) {
  const [count, setCount] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(0);
  const animFrameRef = useRef<number>(0);

  // Fetch count from API
  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/waitlist");
      if (res.ok) {
        const data = await res.json();
        setCount(data.count || 0);
      }
    } catch {
      // Silently fail -- counter just won't show
    }
  }, []);

  // Fetch on mount and when refreshTrigger changes
  useEffect(() => {
    fetchCount();
  }, [fetchCount, refreshTrigger]);

  // Animate counter from 0 to target
  useEffect(() => {
    if (count === null || count === 0) return;

    const startTime = performance.now();
    const duration = 1500; // ms
    const startVal = displayCount;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (count! - startVal) * eased);
      setDisplayCount(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    }

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
    // Only re-run when count changes, not displayCount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // Don't show if count is 0 or not loaded
  if (count === null || count === 0) return null;

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
      <p className="text-text-secondary text-sm">
        <span className="text-gold font-bold tabular-nums">
          {displayCount.toLocaleString()}
        </span>{" "}
        {displayCount === 1 ? "revolutionary has" : "revolutionaries have"}{" "}
        joined
      </p>
    </div>
  );
}
