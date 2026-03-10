"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * ULTRASTREAM animated logo reveal -- emerges from the void with metallic shimmer.
 * HTML overlay positioned over the 3D canvas for crisp text rendering.
 *
 * Animation sequence:
 * 1. Logo starts invisible, blurred, slightly scaled up
 * 2. Fades in with de-blur, scales to 1.0
 * 3. Metallic shimmer sweeps across the text
 * 4. Glow pulse radiates outward
 */
export function LogoReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!logoRef.current || !shimmerRef.current) return;

      const tl = gsap.timeline({ delay: 0.5 });

      // Phase 1: Emerge from the void (0-0.8s)
      tl.fromTo(
        logoRef.current,
        {
          opacity: 0,
          scale: 1.1,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
        }
      );

      // Phase 2: Metallic shimmer sweep (0.8-1.2s)
      tl.fromTo(
        shimmerRef.current,
        {
          x: "-100%",
          opacity: 0.8,
        },
        {
          x: "200%",
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
        },
        "-=0.1"
      );

      // Phase 3: Glow pulse (1.2-1.5s)
      tl.to(logoRef.current, {
        textShadow:
          "0 0 40px rgba(0, 212, 255, 0.6), 0 0 80px rgba(139, 92, 246, 0.3), 0 0 120px rgba(0, 212, 255, 0.1)",
        duration: 0.3,
        ease: "power2.in",
      }).to(logoRef.current, {
        textShadow:
          "0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)",
        duration: 0.5,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative mb-6 select-none">
      <h1
        ref={logoRef}
        className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-[0.15em] uppercase opacity-0"
        style={{
          background:
            "linear-gradient(90deg, #f0f0f0 0%, #d4a843 25%, #ffffff 50%, #d4a843 75%, #f0f0f0 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: "0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)",
          backgroundSize: "200% 100%",
        }}
      >
        ULTRASTREAM
      </h1>

      {/* Shimmer overlay -- sweeps left-to-right */}
      <div
        ref={shimmerRef}
        className="absolute inset-0 pointer-events-none opacity-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(212, 168, 67, 0.4) 30%, rgba(255, 255, 255, 0.6) 50%, rgba(212, 168, 67, 0.4) 70%, transparent 100%)",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
