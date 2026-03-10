"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePerformance } from "@/hooks/usePerformanceMonitor";
import { cn } from "@/lib/utils/cn";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type RevealPreset =
  | "fade-up"
  | "fade-in"
  | "scale-in"
  | "slide-left"
  | "slide-right"
  | "blur-in";

const presetConfigs: Record<RevealPreset, gsap.TweenVars> = {
  "fade-up": { opacity: 0, y: 60 },
  "fade-in": { opacity: 0 },
  "scale-in": { opacity: 0, scale: 0.85 },
  "slide-left": { opacity: 0, x: -80 },
  "slide-right": { opacity: 0, x: 80 },
  "blur-in": { opacity: 0, filter: "blur(10px)" },
};

interface ScrollRevealProps {
  children: React.ReactNode;
  preset?: RevealPreset;
  delay?: number;
  duration?: number;
  stagger?: number;
  scrub?: boolean | number;
  start?: string;
  end?: string;
  once?: boolean;
  className?: string;
}

/**
 * Reusable scroll-triggered reveal component.
 * Wraps children and animates them into view when scrolled to.
 *
 * Supports 6 presets, staggered children, scrub mode, and
 * automatic performance degradation on slow devices.
 */
export function ScrollReveal({
  children,
  preset = "fade-up",
  delay = 0,
  duration = 0.8,
  stagger,
  scrub,
  start = "top 85%",
  end = "top 20%",
  once = true,
  className,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { shouldReduceAnimations } = usePerformance();

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // Determine animation values
      const fromVars: gsap.TweenVars = shouldReduceAnimations
        ? { opacity: 0 }
        : presetConfigs[preset] || presetConfigs["fade-up"];

      // Target children if stagger is set, otherwise target container
      const targets = stagger
        ? containerRef.current.children
        : containerRef.current;

      const scrollTriggerConfig: ScrollTrigger.Vars = {
        trigger: containerRef.current,
        start,
        end,
        toggleActions: once
          ? "play none none none"
          : "play none none reverse",
      };

      // Add scrub if specified
      if (scrub !== undefined) {
        scrollTriggerConfig.scrub = scrub === true ? 1 : scrub;
        // Remove toggleActions when scrubbing -- they conflict
        delete scrollTriggerConfig.toggleActions;
      }

      gsap.from(targets, {
        ...fromVars,
        duration: scrub ? undefined : duration,
        delay: scrub ? undefined : delay,
        stagger: stagger || 0,
        ease: scrub ? "none" : "power3.out",
        scrollTrigger: scrollTriggerConfig,
      });
    },
    { scope: containerRef, dependencies: [shouldReduceAnimations, preset] }
  );

  return (
    <div ref={containerRef} className={cn(className)}>
      {children}
    </div>
  );
}
