"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { initScrollTrigger, ScrollTrigger } from "./scroll-trigger-setup";

interface LenisContextValue {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextValue>({ lenis: null });

/**
 * Provides Lenis smooth scroll instance synced with GSAP ScrollTrigger.
 * Wraps the entire app at layout level for site-wide smooth scrolling.
 *
 * - Butter-smooth momentum scrolling (duration 1.2, exponential ease)
 * - GSAP ScrollTrigger kept in sync via lenis.on('scroll', ScrollTrigger.update)
 * - Respects prefers-reduced-motion (instant scroll, no smoothing)
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafCallbackRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    // Initialize ScrollTrigger defaults
    initScrollTrigger();

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Detect mobile for touch-specific tuning
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      || window.innerWidth < 768;

    // Initialize Lenis
    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !prefersReducedMotion,
      touchMultiplier: isMobile ? 1.2 : 2,
    });

    lenisRef.current = lenis;

    // Sync Lenis scroll position with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Use GSAP ticker for Lenis animation loop
    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    rafCallbackRef.current = rafCallback;
    gsap.ticker.add(rafCallback);

    // Disable GSAP lag compensation to prevent fighting with Lenis
    gsap.ticker.lagSmoothing(0);

    // Listen for reduced motion changes
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        lenis.options.duration = 0;
        lenis.options.smoothWheel = false;
      } else {
        lenis.options.duration = 1.2;
        lenis.options.smoothWheel = true;
      }
    };
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      if (rafCallbackRef.current) {
        gsap.ticker.remove(rafCallbackRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </LenisContext.Provider>
  );
}

/**
 * Access the Lenis smooth scroll instance from any child component.
 */
export function useLenis() {
  const context = useContext(LenisContext);
  return context.lenis;
}
