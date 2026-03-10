"use client";

import { useState, useEffect } from "react";
import { getGPUTier, type TierResult } from "@pmndrs/detect-gpu";

interface GPUDetectResult {
  tier: number;
  isMobile: boolean;
  isLoading: boolean;
  gpu?: string;
}

// Module-level cache so re-renders don't re-detect
let cachedResult: GPUDetectResult | null = null;

/**
 * Detects GPU capability tier for rendering decisions.
 * Tier 0-1: Low (use CSS fallback)
 * Tier 2: Medium (R3F with reduced particles)
 * Tier 3: High (full experience)
 */
export function useGPUDetect(): GPUDetectResult {
  const [result, setResult] = useState<GPUDetectResult>(
    cachedResult || { tier: 2, isMobile: false, isLoading: true }
  );

  useEffect(() => {
    if (cachedResult) {
      setResult(cachedResult);
      return;
    }

    let cancelled = false;

    async function detect() {
      try {
        const gpuTier: TierResult = await getGPUTier({
          failIfMajorPerformanceCaveat: true,
        });

        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ) || "ontouchstart" in window;

        // Additional low-end signal: few CPU cores
        const lowCores =
          typeof navigator.hardwareConcurrency !== "undefined" &&
          navigator.hardwareConcurrency < 4;

        let tier = gpuTier.tier;

        // Downgrade if mobile + low cores
        if (isMobile && lowCores && tier > 1) {
          tier = 1;
        }

        // Force low on very weak GPUs
        if (lowCores && tier === 0) {
          tier = 0;
        }

        const detected: GPUDetectResult = {
          tier,
          isMobile,
          isLoading: false,
          gpu: gpuTier.gpu || undefined,
        };

        cachedResult = detected;
        if (!cancelled) {
          setResult(detected);
        }
      } catch {
        // If detection fails, assume medium-tier desktop
        const fallback: GPUDetectResult = {
          tier: 2,
          isMobile: false,
          isLoading: false,
        };
        cachedResult = fallback;
        if (!cancelled) {
          setResult(fallback);
        }
      }
    }

    detect();

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}
