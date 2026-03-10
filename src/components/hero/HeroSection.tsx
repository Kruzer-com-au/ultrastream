"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useGPUDetect } from "@/hooks/useGPUDetect";
import { HeroFallback } from "./HeroFallback";
import { LogoReveal } from "./LogoReveal";
import { Manifesto } from "./Manifesto";
import { HeroWaitlist } from "@/components/waitlist/hero-waitlist";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Dynamically import the R3F scene -- code-split Three.js bundle
// SSR disabled because R3F requires browser APIs
const DynamicHeroScene = dynamic(
  () => import("./HeroScene").then((mod) => ({ default: mod.HeroScene })),
  {
    ssr: false,
    loading: () => <HeroFallback />,
  }
);

/**
 * Orchestrator component for the hero section.
 * Routes to full 3D R3F scene or CSS fallback based on GPU tier.
 * Logo reveal and manifesto text overlay render on top of either background.
 * Scroll exit: fades + scales down as user scrolls past.
 */
export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const { tier, isLoading } = useGPUDetect();

  // Determine which background to render
  const showR3F = !isLoading && tier >= 2;

  // Scroll exit animation -- cinematic fade/scale as hero scrolls away
  useGSAP(
    () => {
      if (!heroRef.current || !contentRef.current || !bgRef.current) return;

      // Content overlay: translate up + fade out
      gsap.to(contentRef.current, {
        y: -80,
        opacity: 0,
        scale: 0.95,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Background: slight scale down + fade
      gsap.to(bgRef.current, {
        scale: 0.95,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "center top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden"
      id="hero"
    >
      {/* 3D Scene or CSS Fallback -- absolute, fills section */}
      <div ref={bgRef} className="absolute inset-0">
        {isLoading ? (
          // Loading state matches the fallback gradient to avoid flash
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 30%, rgba(0, 60, 120, 0.2) 0%, transparent 60%), #030305",
            }}
          />
        ) : showR3F ? (
          <DynamicHeroScene />
        ) : (
          <HeroFallback />
        )}
      </div>

      {/* Gradient overlay -- ensures text readability over 3D scene */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(5,5,5,0.8) 100%)",
        }}
      />

      {/* Content overlay -- centered, above 3D */}
      <div
        ref={contentRef}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4"
      >
        <LogoReveal />
        <Manifesto />
        <HeroWaitlist />
      </div>

      {/* Scroll indicator at bottom */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-text-muted text-xs tracking-[0.3em] uppercase font-body">
          Scroll
        </span>
        <div className="relative w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1">
          <div
            className="w-1 h-2 bg-neon-blue rounded-full"
            style={{
              animation: "scrollBounce 2s ease-in-out infinite",
            }}
          />
        </div>
        <style jsx>{`
          @keyframes scrollBounce {
            0%, 100% {
              transform: translateY(0);
              opacity: 1;
            }
            50% {
              transform: translateY(8px);
              opacity: 0.3;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
