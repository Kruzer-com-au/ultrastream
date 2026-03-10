"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGPUDetect } from "@/hooks/useGPUDetect";
import { StargateFallback } from "./StargateFallback";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";

// Dynamically import the R3F scene -- code-split Three.js bundle
// SSR disabled because R3F requires browser APIs
const DynamicStargateScene = dynamic(
  () =>
    import("./StargateScene").then((mod) => ({
      default: mod.StargateScene,
    })),
  {
    ssr: false,
    loading: () => <StargateFallback />,
  }
);

interface StargateHeroProps {
  /** 0-1 scroll progress driven by PortalJourney orchestrator */
  scrollProgress?: number;
}

/**
 * Visual-only Stargate hero component.
 *
 * Renders the 3D portal scene + overlaid text content.
 * Scroll handling is entirely managed by PortalJourney -- this component
 * just receives scrollProgress as a prop and reacts visually.
 *
 * Mount animations (GSAP timeline, plays once):
 *   - Staggered letter reveal for ULTRASTREAM logo
 *   - Tagline fade-in with upward slide
 *   - CTA button scale entrance
 *   - Scroll indicator gentle fade-in
 *
 * Scroll-driven effects (from scrollProgress prop):
 *   - Scroll indicator fades out early (0-8%)
 *   - Text content fades out with scale + blur (20-50%)
 *   - scrollProgress passed to StargateScene for camera zoom
 */
export function StargateHero({ scrollProgress = 0 }: StargateHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { tier, isLoading } = useGPUDetect();
  const showR3F = !isLoading && tier >= 2;

  // === TEXT REVEAL ANIMATION (plays once on mount) ===
  useGSAP(
    () => {
      if (!heroRef.current) return;

      const revealTl = gsap.timeline({ delay: 0.6 });

      // Logo: stagger letter reveal
      if (logoRef.current) {
        const chars = logoRef.current.querySelectorAll(".sg-char");
        revealTl.fromTo(
          chars,
          {
            opacity: 0,
            y: 40,
            rotateX: -90,
            filter: "blur(8px)",
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 0.6,
            stagger: 0.04,
            ease: "power4.out",
          }
        );

        // Glow pulse after logo appears
        revealTl.to(
          logoRef.current,
          {
            textShadow:
              "0 0 60px rgba(255, 215, 0, 0.7), 0 0 120px rgba(184, 134, 11, 0.4), 0 0 200px rgba(255, 215, 0, 0.15)",
            duration: 0.4,
            ease: "power2.in",
          },
          "-=0.1"
        );
        revealTl.to(logoRef.current, {
          textShadow:
            "0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(184, 134, 11, 0.15)",
          duration: 0.6,
          ease: "power2.out",
        });
      }

      // Tagline: fade in with upward slide
      if (taglineRef.current) {
        revealTl.fromTo(
          taglineRef.current,
          { opacity: 0, y: 20, filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.3"
        );
      }

      // CTA: scale + fade entrance
      if (ctaRef.current) {
        revealTl.fromTo(
          ctaRef.current,
          { opacity: 0, scale: 0.9, y: 15 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.5)",
          },
          "-=0.4"
        );
      }

      // Scroll indicator: delayed gentle entrance
      if (scrollRef.current) {
        revealTl.fromTo(
          scrollRef.current,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.1"
        );
      }
    },
    { scope: heroRef }
  );

  // === SCROLL-DRIVEN EFFECTS (reactive to scrollProgress prop) ===
  // Uses gsap.set() for immediate property application without animation.
  // Only activates once scrolling has begun (avoids interfering with reveal).
  useEffect(() => {
    if (scrollProgress <= 0.005) return;

    // Scroll indicator: fades out quickly (0-8%)
    if (scrollRef.current) {
      const fade = Math.min(1, scrollProgress / 0.08);
      gsap.set(scrollRef.current, {
        opacity: 1 - fade,
        y: -10 * fade,
      });
    }

    // Text content: fades out 20-50% with scale + blur
    if (contentRef.current) {
      const textFade = Math.max(
        0,
        Math.min(1, (scrollProgress - 0.2) / 0.3)
      );
      gsap.set(contentRef.current, {
        y: -120 * textFade,
        opacity: 1 - textFade,
        scale: 1 - textFade * 0.2,
        filter: `blur(${textFade * 8}px)`,
      });
    }
  }, [scrollProgress]);

  return (
    <div ref={heroRef} className="absolute inset-0">
      {/* Layer 1: 3D Scene or CSS Fallback -- absolute, fills container */}
      <div className="absolute inset-0">
        {isLoading ? (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(0, 60, 120, 0.15) 0%, transparent 60%), #050505",
            }}
          />
        ) : showR3F ? (
          <DynamicStargateScene scrollProgress={scrollProgress} />
        ) : (
          <StargateFallback />
        )}
      </div>

      {/* Layer 2: Gradient overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom,
              rgba(5, 5, 5, 0.3) 0%,
              transparent 20%,
              transparent 60%,
              rgba(5, 5, 5, 0.7) 85%,
              rgba(5, 5, 5, 1) 100%
            )
          `,
        }}
      />

      {/* Layer 3: Content overlay -- centered, above everything */}
      <div
        ref={contentRef}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4"
      >
        {/* ULTRASTREAM logo with staggered letter animation */}
        <h1
          ref={logoRef}
          className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-[0.15em] uppercase select-none mb-6"
          style={{
            perspective: "800px",
            textShadow:
              "0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(184, 134, 11, 0.2)",
          }}
        >
          {splitToChars("ULTRASTREAM", "sg-char", {
            background:
              "linear-gradient(90deg, #b8860b 0%, #ffd700 30%, #fff5c2 50%, #ffd700 70%, #b8860b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            backgroundSize: "200% 100%",
          })}
        </h1>

        {/* Tagline in gold gradient */}
        <p
          ref={taglineRef}
          className="text-xl md:text-3xl lg:text-4xl font-display font-bold tracking-[0.2em] uppercase mb-10 opacity-0 select-none"
          style={{
            background:
              "linear-gradient(90deg, #b8860b 0%, #ffd700 30%, #fff5c2 50%, #ffd700 70%, #b8860b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            backgroundSize: "200% 100%",
            textShadow: "none",
          }}
        >
          THE REVOLUTION BEGINS HERE
        </p>

        {/* CTA Button */}
        <button
          ref={ctaRef}
          className="group relative px-8 py-4 md:px-12 md:py-5 opacity-0 select-none"
          style={{
            background: "rgba(0, 0, 0, 0.6)",
            border: "none",
            cursor: "pointer",
            borderRadius: 6,
          }}
          onClick={() => {
            const target = document.getElementById("waitlist");
            if (target) {
              target.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          {/* Button border glow — gold */}
          <span
            className="absolute inset-0 rounded-md"
            style={{
              border: "2px solid rgba(255, 215, 0, 0.7)",
              boxShadow:
                "0 0 20px rgba(255, 215, 0, 0.25), inset 0 0 20px rgba(255, 215, 0, 0.08)",
              transition: "all 0.3s ease",
            }}
          />
          {/* Hover fill */}
          <span
            className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(184, 134, 11, 0.15) 100%)",
            }}
          />
          {/* Button text — gold gradient for readability */}
          <span
            className="relative text-base md:text-lg font-display font-black tracking-[0.3em] uppercase"
            style={{
              background:
                "linear-gradient(90deg, #b8860b 0%, #ffd700 30%, #fff5c2 50%, #ffd700 70%, #b8860b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.5))",
            }}
          >
            STEP THROUGH THE PORTAL
          </span>
        </button>

        {/* Waitlist form - join immediately */}
        <div className="mt-8 w-full max-w-md mx-auto">
          <WaitlistForm variant="portal" className="w-full" />
        </div>
      </div>

      {/* Layer 4: Scroll indicator at bottom */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
      >
        <span
          className="text-xs tracking-[0.3em] uppercase font-body"
          style={{ color: "rgba(255, 255, 255, 0.4)" }}
        >
          Scroll
        </span>
        <div className="relative w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1">
          <div
            className="w-1 h-2 rounded-full"
            style={{
              background: "#00d4ff",
              animation: "stargateScrollBounce 2s ease-in-out infinite",
            }}
          />
        </div>
        <style jsx>{`
          @keyframes stargateScrollBounce {
            0%,
            100% {
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
    </div>
  );
}

/**
 * Split text into individual character spans for GSAP stagger animation.
 * Each character gets the provided className and inline styles.
 */
function splitToChars(
  text: string,
  className: string,
  style?: React.CSSProperties
) {
  return text.split("").map((char, i) => (
    <span
      key={i}
      className={`${className} inline-block opacity-0`}
      style={{
        display: "inline-block",
        whiteSpace: "pre",
        ...style,
      }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}
