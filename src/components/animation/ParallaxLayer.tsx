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

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number; // -1 to 1 (negative = opposite scroll direction)
  direction?: "vertical" | "horizontal";
  className?: string;
}

/**
 * Parallax speed layer for depth effects within sections.
 * Wraps content and shifts it at a different rate than scroll.
 *
 * speed = 0.5 means layer moves 50% slower than scroll (appears further back)
 * speed = -0.3 means layer moves 30% opposite to scroll
 */
export function ParallaxLayer({
  children,
  speed = 0.3,
  direction = "vertical",
  className,
}: ParallaxLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const { shouldReduceAnimations } = usePerformance();

  useGSAP(
    () => {
      if (!layerRef.current || shouldReduceAnimations) return;

      const prop = direction === "vertical" ? "yPercent" : "xPercent";
      const offset = speed * -50;

      gsap.to(layerRef.current, {
        [prop]: offset,
        ease: "none",
        scrollTrigger: {
          trigger: layerRef.current.parentElement || layerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: layerRef, dependencies: [shouldReduceAnimations, speed, direction] }
  );

  return (
    <div
      ref={layerRef}
      className={cn(className)}
      style={{ willChange: shouldReduceAnimations ? "auto" : "transform" }}
    >
      {children}
    </div>
  );
}
