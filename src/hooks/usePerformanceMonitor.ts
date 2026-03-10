"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import React from "react";

type PerformanceTier = "high" | "medium" | "low";

interface PerformanceState {
  fps: number;
  averageFps: number;
  tier: PerformanceTier;
  shouldReduceAnimations: boolean;
  shouldReduceParticles: boolean;
}

const defaultState: PerformanceState = {
  fps: 60,
  averageFps: 60,
  tier: "high",
  shouldReduceAnimations: false,
  shouldReduceParticles: false,
};

const PerformanceContext = createContext<PerformanceState>(defaultState);

/**
 * Tracks FPS using requestAnimationFrame and exposes tier-based
 * degradation flags for animation components.
 *
 * Tiers:
 * - high (>50fps): Full animations
 * - medium (30-50fps): Reduce particles
 * - low (<30fps): Simplify all animations
 *
 * Respects prefers-reduced-motion by forcing 'low' tier.
 */
export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PerformanceState>(defaultState);
  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number>(0);

  const computeTier = useCallback(
    (avgFps: number): PerformanceTier => {
      if (avgFps > 50) return "high";
      if (avgFps >= 30) return "medium";
      return "low";
    },
    []
  );

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setState({
        fps: 60,
        averageFps: 60,
        tier: "low",
        shouldReduceAnimations: true,
        shouldReduceParticles: true,
      });
      return;
    }

    function measureFrame(timestamp: number) {
      if (lastTimeRef.current > 0) {
        const delta = timestamp - lastTimeRef.current;
        const fps = Math.round(1000 / delta);

        const frameTimes = frameTimesRef.current;
        frameTimes.push(fps);

        // Keep rolling window of 60 frames
        if (frameTimes.length > 60) {
          frameTimes.shift();
        }

        // Calculate average every 30 frames to avoid excessive state updates
        if (frameTimes.length % 30 === 0) {
          const avgFps = Math.round(
            frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
          );
          const tier = computeTier(avgFps);

          setState({
            fps,
            averageFps: avgFps,
            tier,
            shouldReduceAnimations: tier === "low",
            shouldReduceParticles: tier === "low" || tier === "medium",
          });
        }
      }

      lastTimeRef.current = timestamp;
      rafIdRef.current = requestAnimationFrame(measureFrame);
    }

    rafIdRef.current = requestAnimationFrame(measureFrame);

    // Listen for reduced motion changes
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setState((prev) => ({
          ...prev,
          tier: "low",
          shouldReduceAnimations: true,
          shouldReduceParticles: true,
        }));
      }
    };
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, [computeTier]);

  return React.createElement(
    PerformanceContext.Provider,
    { value: state },
    children,
    // Dev-only FPS counter
    process.env.NODE_ENV === "development"
      ? React.createElement(FPSCounter, { state })
      : null
  );
}

/**
 * Access performance tier and degradation flags from any component.
 */
export function usePerformance(): PerformanceState {
  return useContext(PerformanceContext);
}

/** Dev-only FPS counter overlay */
function FPSCounter({ state }: { state: PerformanceState }) {
  const tierColor =
    state.tier === "high"
      ? "#00ff88"
      : state.tier === "medium"
        ? "#ffaa00"
        : "#ff4444";

  return React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 99999,
        padding: "6px 12px",
        borderRadius: 8,
        background: "rgba(0,0,0,0.85)",
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "monospace",
        fontSize: 11,
        color: "#aaa",
        pointerEvents: "none",
        lineHeight: 1.5,
        backdropFilter: "blur(8px)",
      },
    },
    React.createElement(
      "div",
      null,
      React.createElement(
        "span",
        { style: { color: tierColor, fontWeight: "bold" } },
        `${state.fps} FPS`
      ),
      ` | avg ${state.averageFps}`
    ),
    React.createElement(
      "div",
      { style: { color: tierColor, fontSize: 10 } },
      `TIER: ${state.tier.toUpperCase()}`
    )
  );
}
