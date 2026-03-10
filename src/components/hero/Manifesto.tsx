"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Heavy-metal manifesto text -- aggressive character-by-character reveal.
 * "FOR THE PEOPLE. BY THE REBELS." + "AGAINST CORPORATE STREAMING."
 *
 * Uses manual character splitting (no SplitText plugin dependency).
 * GSAP stagger animation with power4.out easing for that heavy-metal snap.
 */
export function Manifesto() {
  const containerRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!line1Ref.current || !line2Ref.current) return;

      const chars1 = line1Ref.current.querySelectorAll(".char");
      const chars2 = line2Ref.current.querySelectorAll(".char");

      const tl = gsap.timeline({ delay: 1.8 });

      // Line 1: Aggressive character reveal
      tl.fromTo(
        chars1,
        {
          opacity: 0,
          y: 30,
          rotateX: -90,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.5,
          stagger: 0.02,
          ease: "power4.out",
        }
      );

      // Line 2: Slightly delayed, different accent color
      tl.fromTo(
        chars2,
        {
          opacity: 0,
          y: 30,
          rotateX: -90,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.5,
          stagger: 0.02,
          ease: "power4.out",
        },
        "-=0.3"
      );

      // Screen-shake impact on final reveal
      tl.to(
        containerRef.current,
        {
          x: () => gsap.utils.random(-2, 2),
          y: () => gsap.utils.random(-2, 2),
          duration: 0.05,
          repeat: 4,
          yoyo: true,
          ease: "none",
        },
        "-=0.1"
      ).to(containerRef.current, {
        x: 0,
        y: 0,
        duration: 0.1,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="text-center select-none">
      {/* Line 1: Main manifesto */}
      <div
        ref={line1Ref}
        className="text-2xl md:text-4xl lg:text-5xl font-display font-bold tracking-[0.12em] uppercase text-text-primary"
        style={{ perspective: "600px" }}
      >
        {splitToChars("FOR THE PEOPLE. BY THE REBELS.")}
      </div>

      {/* Line 2: Accent color tagline */}
      <div
        ref={line2Ref}
        className="mt-3 md:mt-4 text-xl md:text-3xl lg:text-4xl font-display font-bold tracking-[0.12em] uppercase"
        style={{
          perspective: "600px",
          color: "#ff3366",
          textShadow: "0 0 30px rgba(255, 51, 102, 0.3)",
        }}
      >
        {splitToChars("AGAINST CORPORATE STREAMING.")}
      </div>
    </div>
  );
}

/**
 * Split text into individual character spans for GSAP animation.
 * Preserves spaces as non-breaking spaces with proper spacing.
 */
function splitToChars(text: string) {
  return text.split("").map((char, i) => (
    <span
      key={i}
      className="char inline-block"
      style={{
        display: "inline-block",
        whiteSpace: "pre",
      }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}
