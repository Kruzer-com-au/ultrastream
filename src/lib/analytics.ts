"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Typed custom event definitions for Plausible analytics.
 * Each key maps to a custom event name, and the value is the props shape.
 */
export type AnalyticsEvents = {
  "Scroll Depth": { depth: "25" | "50" | "75" | "100" };
  "Waitlist Form View": { location: string };
  "Waitlist Signup": { location: string };
  "CTA Click": { label: string; location: string };
};

// Extend window to include plausible
declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string> }
    ) => void;
  }
}

/**
 * Track a custom event via Plausible.
 * Safe to call anywhere -- no-ops gracefully if Plausible isn't loaded
 * (e.g., in development or if user has an ad blocker).
 */
export function trackEvent<E extends keyof AnalyticsEvents>(
  event: E,
  props?: AnalyticsEvents[E]
) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(event, { props: props as Record<string, string> });
  }
}

/**
 * Hook that tracks scroll depth milestones (25%, 50%, 75%, 100%).
 * Each threshold fires only once per page load.
 *
 * Usage: Call in a client component that mounts on the page.
 */
export function useScrollDepth() {
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const thresholds = [25, 50, 75, 100] as const;

    function handleScroll() {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;

      for (const threshold of thresholds) {
        const key = String(threshold);
        if (scrollPercent >= threshold && !firedRef.current.has(key)) {
          firedRef.current.add(key);
          trackEvent("Scroll Depth", {
            depth: key as "25" | "50" | "75" | "100",
          });
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
}

/**
 * Hook that tracks when an element enters the viewport.
 * Fires the callback once per mount.
 *
 * Usage:
 *   const ref = useInViewTrack(() => trackEvent('Waitlist Form View', { location: 'hero' }));
 *   <div ref={ref}>...</div>
 */
export function useInViewTrack(onInView: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const stableCallback = useCallback(onInView, [onInView]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          stableCallback();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stableCallback]);

  return ref;
}
