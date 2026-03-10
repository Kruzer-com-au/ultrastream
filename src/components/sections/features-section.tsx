"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { features, type Feature } from "@/lib/content/features";
import { cn } from "@/lib/utils/cn";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── Feature Icons ── */
function FeatureIcon({ type, className, color }: { type: string; className?: string; color: string }) {
  const base = cn("w-12 h-12", className);
  const style = { color };

  switch (type) {
    case "COINS":
      return (
        <svg viewBox="0 0 48 48" className={base} style={style} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="20" cy="24" r="12" />
          <circle cx="28" cy="20" r="12" />
          <text x="24" y="24" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="14" fontWeight="bold" stroke="none">$</text>
        </svg>
      );
    case "GEM":
      return (
        <svg viewBox="0 0 48 48" className={base} style={style} fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="24,4 40,18 24,44 8,18" />
          <polyline points="8,18 24,24 40,18" />
          <line x1="24" y1="4" x2="24" y2="24" />
        </svg>
      );
    case "RADAR":
      return (
        <svg viewBox="0 0 48 48" className={base} style={style} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="24" cy="24" r="4" fill="currentColor" />
          <circle cx="24" cy="24" r="10" />
          <circle cx="24" cy="24" r="16" />
          <circle cx="24" cy="24" r="22" />
          <line x1="24" y1="24" x2="38" y2="10" strokeWidth="2.5" />
        </svg>
      );
    case "MEGAPHONE":
      return (
        <svg viewBox="0 0 48 48" className={base} style={style} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 20v8l28 10V10L8 20z" />
          <rect x="4" y="18" width="6" height="12" rx="1" />
          <path d="M12 30v8a3 3 0 006 0v-6" />
          <circle cx="38" cy="14" r="2" fill="currentColor" />
          <circle cx="42" cy="20" r="1.5" fill="currentColor" />
        </svg>
      );
    case "LOCK":
      return (
        <svg viewBox="0 0 48 48" className={base} style={style} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="10" y="22" width="28" height="20" rx="3" />
          <path d="M16 22V16a8 8 0 0116 0v6" />
          <circle cx="24" cy="33" r="3" fill="currentColor" />
          <line x1="24" y1="36" x2="24" y2="39" strokeWidth="2.5" />
        </svg>
      );
    case "GALAXY":
      return (
        <svg viewBox="0 0 48 48" className={base} style={style} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="24" cy="24" r="4" fill="currentColor" />
          <ellipse cx="24" cy="24" rx="20" ry="8" />
          <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(60 24 24)" />
          <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(120 24 24)" />
        </svg>
      );
    default:
      return null;
  }
}

/* ── Feature Card ── */
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isEven = index % 2 === 0;

  useGSAP(
    () => {
      if (!cardRef.current) return;

      gsap.from(cardRef.current, {
        y: 60,
        x: isEven ? -30 : 30,
        opacity: 0,
        duration: 0.9,
        delay: (index % 2) * 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative rounded-xl p-6 md:p-8 border transition-all duration-500",
        "bg-obsidian/60 backdrop-blur-sm",
        "hover:-translate-y-1"
      )}
      style={{
        borderColor: `rgba(${feature.accentRgb}, 0.15)`,
        boxShadow: `0 0 20px rgba(${feature.accentRgb}, 0.05)`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `rgba(${feature.accentRgb}, 0.4)`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px rgba(${feature.accentRgb}, 0.15), 0 0 80px rgba(${feature.accentRgb}, 0.05)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `rgba(${feature.accentRgb}, 0.15)`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px rgba(${feature.accentRgb}, 0.05)`;
      }}
    >
      {/* Accent line at top */}
      <div
        className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${feature.accentColor}, transparent)`,
        }}
      />

      {/* Icon */}
      <div className="mb-5">
        <FeatureIcon type={feature.icon} color={feature.accentColor} />
      </div>

      {/* Title */}
      <h3 className="text-display-sm text-text-primary font-bold mb-2">
        {feature.title}
      </h3>

      {/* Tagline */}
      <p
        className="text-body-md font-semibold mb-4"
        style={{ color: feature.accentColor }}
      >
        {feature.tagline}
      </p>

      {/* Description */}
      <p className="text-body-md text-text-secondary leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

/* ── Features Showcase Section ── */
export function FeaturesShowcase() {
  const headingRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!headingRef.current) return;
      gsap.from(headingRef.current.children, {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: headingRef }
  );

  return (
    <Section id="features" background="default" spacing="lg">
      <Container size="lg">
        <div ref={headingRef} className="text-center mb-16 md:mb-20">
          <p className="text-overline mb-4 text-neon-purple tracking-[0.3em]">
            THE ARSENAL
          </p>
          <h2 className="text-display-lg md:text-display-hero text-text-primary mb-6">
            OUR{" "}
            <span className="text-gradient-neon">WEAPONS</span>
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            Six ways we&apos;re building the platform creators and viewers
            actually deserve. No gimmicks. No fine print. No corporate overlords.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
