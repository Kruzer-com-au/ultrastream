"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { villains, type Villain } from "@/lib/content/villains";
import { cn } from "@/lib/utils/cn";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── Abstract icon SVGs — NO trademarked logos ── */
function VillainIcon({ type, className, style }: { type: string; className?: string; style?: React.CSSProperties }) {
  const base = cn("w-10 h-10", className);
  switch (type) {
    case "TV":
      return (
        <svg viewBox="0 0 40 40" className={base} style={style} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="10" width="32" height="22" rx="2" />
          <line x1="14" y1="4" x2="20" y2="10" />
          <line x1="26" y1="4" x2="20" y2="10" />
          <line x1="12" y1="36" x2="28" y2="36" />
        </svg>
      );
    case "EYE":
      return (
        <svg viewBox="0 0 40 40" className={base} style={style} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 20s6-12 18-12 18 12 18 12-6 12-18 12S2 20 2 20z" />
          <circle cx="20" cy="20" r="5" />
        </svg>
      );
    case "MASK":
      return (
        <svg viewBox="0 0 40 40" className={base} style={style} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 16c0-6 5-10 12-10s12 4 12 10v4c0 8-5 14-12 14S8 28 8 20v-4z" />
          <circle cx="14" cy="18" r="2" fill="currentColor" />
          <circle cx="26" cy="18" r="2" fill="currentColor" />
          <path d="M16 26c2 2 6 2 8 0" />
        </svg>
      );
    case "TOMB":
      return (
        <svg viewBox="0 0 40 40" className={base} style={style} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 36V14a10 10 0 0120 0v22" />
          <line x1="10" y1="36" x2="30" y2="36" />
          <line x1="20" y1="18" x2="20" y2="28" />
          <line x1="15" y1="23" x2="25" y2="23" />
        </svg>
      );
    default:
      return null;
  }
}

function SolutionIcon({ type, className }: { type: string; className?: string }) {
  const base = cn("w-10 h-10", className);
  switch (type) {
    case "VAULT":
      return (
        <svg viewBox="0 0 40 40" className={base} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="8" width="32" height="28" rx="3" />
          <circle cx="20" cy="22" r="6" />
          <circle cx="20" cy="22" r="2" fill="currentColor" />
          <line x1="20" y1="4" x2="20" y2="8" />
        </svg>
      );
    case "SIGNAL":
      return (
        <svg viewBox="0 0 40 40" className={base} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="20" cy="20" r="4" fill="currentColor" />
          <path d="M12 12a11.3 11.3 0 000 16" />
          <path d="M28 12a11.3 11.3 0 010 16" />
          <path d="M7 7a18 18 0 000 26" />
          <path d="M33 7a18 18 0 010 26" />
        </svg>
      );
    case "SHIELD":
      return (
        <svg viewBox="0 0 40 40" className={base} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 4L6 12v10c0 9 6 14 14 18 8-4 14-9 14-18V12L20 4z" />
          <polyline points="14,20 18,24 26,16" strokeWidth="2.5" />
        </svg>
      );
    case "COMPASS":
      return (
        <svg viewBox="0 0 40 40" className={base} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="20" cy="20" r="16" />
          <polygon points="20,8 24,18 20,16 16,18" fill="currentColor" />
          <polygon points="20,32 16,22 20,24 24,22" fill="currentColor" opacity="0.4" />
        </svg>
      );
    default:
      return null;
  }
}

/* ── Villain Card with flip animation ── */
function VillainCard({ villain, index }: { villain: Villain; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardRef.current) return;

      // Entrance animation: stagger from below
      gsap.from(cardRef.current, {
        y: 80,
        opacity: 0,
        duration: 0.9,
        delay: index * 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });

      // Inner card flip on further scroll
      const inner = cardRef.current.querySelector(".card-inner") as HTMLElement;
      if (inner) {
        gsap.to(inner, {
          rotateY: 180,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 40%",
            end: "top 10%",
            scrub: 1,
          },
        });
      }
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      className="villain-card-wrapper"
      style={{ perspective: "1200px" }}
    >
      <div
        className="card-inner relative w-full min-h-[320px] md:min-h-[360px]"
        style={{
          transformStyle: "preserve-3d",
          transition: "none",
        }}
      >
        {/* ── VILLAIN SIDE (Front) ── */}
        <div
          className="absolute inset-0 rounded-xl p-6 md:p-8 flex flex-col justify-between border"
          style={{
            backfaceVisibility: "hidden",
            background: `linear-gradient(135deg, rgba(${villain.colorRgb}, 0.12) 0%, rgba(10, 10, 10, 0.95) 70%)`,
            borderColor: `rgba(${villain.colorRgb}, 0.3)`,
            boxShadow: `0 0 30px rgba(${villain.colorRgb}, 0.1), inset 0 1px 0 rgba(${villain.colorRgb}, 0.15)`,
          }}
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <VillainIcon type={villain.icon} className="opacity-60" style={{ color: villain.color } as React.CSSProperties} />
              <span
                className="text-overline tracking-[0.25em]"
                style={{ color: villain.color }}
              >
                {villain.name}
              </span>
            </div>
            <h3 className="text-display-sm text-white font-bold leading-tight mb-4">
              {villain.painPoint}
            </h3>
          </div>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            {villain.details}
          </p>
        </div>

        {/* ── SOLUTION SIDE (Back) ── */}
        <div
          className="absolute inset-0 rounded-xl p-6 md:p-8 flex flex-col justify-between border"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background:
              "linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(10, 10, 10, 0.95) 70%)",
            borderColor: "rgba(255, 215, 0, 0.3)",
            boxShadow:
              "0 0 30px rgba(255, 215, 0, 0.1), inset 0 1px 0 rgba(255, 215, 0, 0.15)",
          }}
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <SolutionIcon type={villain.solutionIcon} className="text-gold" />
              <span className="text-overline tracking-[0.25em] text-gold">
                ULTRASTREAM
              </span>
            </div>
            <h3 className="text-display-sm text-gold font-bold leading-tight mb-4">
              THE ANSWER
            </h3>
          </div>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            {villain.solution}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main Villains Section ── */
export function VillainsSection() {
  const headingRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!headingRef.current) return;
      gsap.from(headingRef.current.children, {
        y: 40,
        opacity: 0,
        stagger: 0.12,
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
    <Section id="villains" background="darker" spacing="lg">
      <Container size="lg">
        <div ref={headingRef} className="text-center mb-16 md:mb-20">
          <p className="text-overline mb-4 text-neon-red tracking-[0.3em]">
            THE PROBLEM
          </p>
          <h2 className="text-display-lg md:text-display-hero text-text-primary mb-6">
            THEY&apos;VE BEEN{" "}
            <span className="text-gradient-gold">SCREWING YOU</span>
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            Every major platform takes your money, hides your content, or sells
            your data. We&apos;re done playing their game.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {villains.map((villain, i) => (
            <VillainCard key={villain.id} villain={villain} index={i} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-overline text-text-muted">
            SCROLL TO SEE HOW WE KILL EACH VILLAIN
          </p>
        </div>
      </Container>
    </Section>
  );
}
