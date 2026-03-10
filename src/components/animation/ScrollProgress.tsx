"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Scroll progress indicator -- thin neon line at top of viewport.
 * Fills left-to-right as user scrolls through the page.
 *
 * Uses GSAP ScrollTrigger scrub to track scroll position.
 * Glows with brand accent color via mix-blend-mode: screen.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!barRef.current) return;

    gsap.fromTo(
      barRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      }
    );
  });

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none"
      style={{
        background:
          "linear-gradient(90deg, #00d4ff 0%, #8b5cf6 50%, #00d4ff 100%)",
        transformOrigin: "left center",
        transform: "scaleX(0)",
        boxShadow: "0 0 8px rgba(0, 212, 255, 0.5), 0 0 20px rgba(0, 212, 255, 0.2)",
        mixBlendMode: "screen",
      }}
    />
  );
}
