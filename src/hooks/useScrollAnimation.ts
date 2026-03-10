"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePerformance } from "./usePerformanceMonitor";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type AnimationPreset =
  | "fade-up"
  | "fade-in"
  | "scale-in"
  | "slide-left"
  | "slide-right";

const presets: Record<AnimationPreset, gsap.TweenVars> = {
  "fade-up": { opacity: 0, y: 60 },
  "fade-in": { opacity: 0 },
  "scale-in": { opacity: 0, scale: 0.8 },
  "slide-left": { opacity: 0, x: -100 },
  "slide-right": { opacity: 0, x: 100 },
};

interface UseScrollAnimationOptions {
  preset?: AnimationPreset;
  animation?: gsap.TweenVars;
  trigger?: ScrollTrigger.Vars;
  duration?: number;
  delay?: number;
  ease?: string;
}

/**
 * Convenience hook for scroll-triggered GSAP animations.
 * Wraps ScrollTrigger with preset support and automatic performance degradation.
 *
 * Usage:
 * ```tsx
 * const ref = useRef(null);
 * useScrollAnimation(ref, { preset: 'fade-up' });
 * ```
 */
export function useScrollAnimation(
  ref: React.RefObject<HTMLElement | null>,
  options: UseScrollAnimationOptions = {}
) {
  const { shouldReduceAnimations } = usePerformance();

  const {
    preset,
    animation,
    trigger,
    duration = 0.8,
    delay = 0,
    ease = "power3.out",
  } = options;

  useGSAP(
    () => {
      if (!ref.current) return;

      // Determine animation values
      let fromVars: gsap.TweenVars;

      if (shouldReduceAnimations) {
        // Simplified: just opacity fade
        fromVars = { opacity: 0 };
      } else if (animation) {
        fromVars = animation;
      } else if (preset && presets[preset]) {
        fromVars = presets[preset];
      } else {
        fromVars = presets["fade-up"];
      }

      gsap.from(ref.current, {
        ...fromVars,
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          toggleActions: "play none none none",
          ...trigger,
        },
      });
    },
    { scope: ref, dependencies: [shouldReduceAnimations] }
  );
}
