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

type TransitionEffect =
  | "curtain-reveal"
  | "scale-up"
  | "clip-expand"
  | "parallax-stack";

interface SectionTransitionProps {
  children: React.ReactNode;
  effect?: TransitionEffect;
  className?: string;
}

/**
 * Cinematic section transition effects driven by scroll position.
 * Each effect uses scrubbed ScrollTrigger for choreographed reveals.
 *
 * Effects:
 * - curtain-reveal: Content clips top-to-bottom like a curtain lifting
 * - scale-up: Section zooms from 85% to full size
 * - clip-expand: Circle expand from center
 * - parallax-stack: Overlapping card stack effect
 */
export function SectionTransition({
  children,
  effect = "curtain-reveal",
  className,
}: SectionTransitionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { shouldReduceAnimations } = usePerformance();

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const el = sectionRef.current;

      // Reduced motion: simple opacity fade for all effects
      if (shouldReduceAnimations) {
        gsap.from(el, {
          opacity: 0,
          duration: 0.5,
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
        return;
      }

      switch (effect) {
        case "curtain-reveal":
          applyCurtainReveal(el);
          break;
        case "scale-up":
          applyScaleUp(el);
          break;
        case "clip-expand":
          applyClipExpand(el);
          break;
        case "parallax-stack":
          applyParallaxStack(el);
          break;
      }
    },
    { scope: sectionRef, dependencies: [shouldReduceAnimations, effect] }
  );

  return (
    <div ref={sectionRef} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

/**
 * Curtain reveal: clips from bottom, reveals top-to-bottom
 * as user scrolls. Like a curtain being lifted.
 */
function applyCurtainReveal(el: HTMLElement) {
  gsap.fromTo(
    el,
    {
      clipPath: "inset(100% 0 0 0)",
    },
    {
      clipPath: "inset(0% 0 0 0)",
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        end: "top 20%",
        scrub: 1,
        pin: false,
      },
    }
  );
}

/**
 * Scale-up: section starts small and grows to full size
 * as it enters viewport center. Zooming-in effect.
 */
function applyScaleUp(el: HTMLElement) {
  gsap.fromTo(
    el,
    {
      scale: 0.85,
      opacity: 0.3,
    },
    {
      scale: 1,
      opacity: 1,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        end: "top 20%",
        scrub: 1,
        pin: false,
      },
    }
  );
}

/**
 * Clip-expand: content expands from a small center circle
 * to fill the entire section. Dramatic reveal.
 */
function applyClipExpand(el: HTMLElement) {
  gsap.fromTo(
    el,
    {
      clipPath: "circle(0% at 50% 50%)",
      opacity: 0.5,
    },
    {
      clipPath: "circle(75% at 50% 50%)",
      opacity: 1,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        end: "top 15%",
        scrub: 1,
        pin: false,
      },
    }
  );
}

/**
 * Parallax-stack: section overlaps previous content
 * creating a stacking card illusion. Uses negative margin
 * and z-index layering.
 */
function applyParallaxStack(el: HTMLElement) {
  // Slight overlap with previous section
  el.style.marginTop = "-5vh";
  el.style.position = "relative";
  el.style.zIndex = "2";

  gsap.fromTo(
    el,
    {
      y: 40,
      opacity: 0.7,
    },
    {
      y: 0,
      opacity: 1,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 95%",
        end: "top 30%",
        scrub: 1,
        pin: false,
      },
    }
  );
}
