"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface RevenueBarProps {
  platform: string;
  creatorKeep: number;
  platformCut: number;
  color: string;
  colorRgb: string;
  isHero?: boolean;
  index: number;
  dollarAmount: number;
}

function RevenueBar({
  platform,
  creatorKeep,
  platformCut,
  color,
  colorRgb,
  isHero,
  index,
  dollarAmount,
}: RevenueBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!barRef.current || !numberRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: barRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // Bar grows from 0 to target width
      tl.from(barRef.current.querySelector(".bar-fill"), {
        width: "0%",
        duration: 1.2,
        delay: index * 0.25,
        ease: "power3.out",
      });

      // Animate the dollar counter
      const counter = { val: 0 };
      tl.to(
        counter,
        {
          val: dollarAmount,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => {
            if (numberRef.current) {
              numberRef.current.textContent = `$${Math.round(counter.val).toLocaleString()}`;
            }
          },
        },
        "<0.3"
      );
    },
    { scope: barRef }
  );

  return (
    <div ref={barRef} className="mb-8 last:mb-0">
      {/* Platform label */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-3">
        <div className="flex items-center gap-3">
          <span
            className={`text-display-sm font-bold ${isHero ? "text-gold" : "text-text-secondary"}`}
          >
            {platform}
          </span>
          {isHero && (
            <span className="text-xs bg-gold/15 text-gold border border-gold/30 px-2 py-0.5 rounded-full font-medium tracking-wider uppercase">
              You
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-body-sm text-text-muted">
            Creator keeps{" "}
            <span className={isHero ? "text-gold font-bold" : "text-text-secondary font-medium"}>
              {creatorKeep}%
            </span>
          </span>
          {platformCut > 0 && !isHero && (
            <span className="text-body-sm text-neon-red/70 ml-2">
              ({platformCut}% stolen)
            </span>
          )}
          {platformCut > 0 && isHero && (
            <span className="text-body-sm text-gold/60 ml-2">
              ({platformCut}% platform fee)
            </span>
          )}
        </div>
      </div>

      {/* Bar track */}
      <div className="relative h-12 md:h-14 bg-white/5 rounded-lg overflow-hidden border border-white/5">
        {/* Fill */}
        <div
          className="bar-fill absolute inset-y-0 left-0 rounded-lg flex items-center justify-end pr-4"
          style={{
            width: `${creatorKeep}%`,
            background: isHero
              ? `linear-gradient(90deg, rgba(184,134,11,0.8) 0%, rgba(255,215,0,0.9) 100%)`
              : `linear-gradient(90deg, rgba(${colorRgb},0.4) 0%, rgba(${colorRgb},0.7) 100%)`,
            boxShadow: isHero
              ? "0 0 20px rgba(255,215,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
              : `0 0 15px rgba(${colorRgb},0.2)`,
          }}
        >
          <span className="text-sm font-bold text-white/90 drop-shadow-md">
            {creatorKeep}%
          </span>
        </div>

        {/* Platform cut overlay (the stolen/fee part) */}
        {platformCut > 0 && (
          <div
            className="absolute inset-y-0 right-0 flex items-center justify-center"
            style={{
              width: `${platformCut}%`,
              background: isHero
                ? "repeating-linear-gradient(45deg, rgba(255,215,0,0.05), rgba(255,215,0,0.05) 4px, transparent 4px, transparent 8px)"
                : "repeating-linear-gradient(45deg, rgba(255,0,64,0.08), rgba(255,0,64,0.08) 4px, transparent 4px, transparent 8px)",
            }}
          >
            <span className={`text-xs font-medium ${isHero ? 'text-gold/40' : 'text-neon-red/50'}`}>
              {platformCut}%
            </span>
          </div>
        )}
      </div>

      {/* Dollar amount */}
      <div className="mt-2 text-right">
        <span className="text-body-sm text-text-muted">
          On $10,000 earned, you keep{" "}
        </span>
        <span
          ref={numberRef}
          className={`text-body-lg font-bold ${isHero ? "text-gold" : "text-text-secondary"}`}
        >
          $0
        </span>
      </div>
    </div>
  );
}

export function RevenueComparison() {
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

  const platforms = [
    {
      platform: "ULTRASTREAM",
      creatorKeep: 97,
      platformCut: 3,
      color: "#FFD700",
      colorRgb: "255, 215, 0",
      isHero: true,
      dollarAmount: 9700,
    },
    {
      platform: "YouTube",
      creatorKeep: 70,
      platformCut: 30,
      color: "#FF0000",
      colorRgb: "255, 0, 0",
      isHero: false,
      dollarAmount: 7000,
    },
    {
      platform: "Twitch",
      creatorKeep: 50,
      platformCut: 50,
      color: "#9146FF",
      colorRgb: "145, 70, 255",
      isHero: false,
      dollarAmount: 5000,
    },
  ];

  return (
    <Section id="revenue" background="gradient" spacing="lg" divider>
      <Container size="lg">
        <div ref={headingRef} className="text-center mb-16 md:mb-20">
          <p className="text-overline mb-4 text-gold tracking-[0.3em]">
            THE MONEY
          </p>
          <h2 className="text-display-lg md:text-display-hero text-text-primary mb-6">
            WHERE YOUR MONEY{" "}
            <span className="text-gradient-gold">ACTUALLY GOES</span>
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            They call it a &ldquo;partnership.&rdquo; We call it robbery. See how
            much of YOUR money each platform keeps for themselves.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {platforms.map((p, i) => (
            <RevenueBar key={p.platform} {...p} index={i} />
          ))}
        </div>

        {/* Callout stat */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-obsidian/60 border border-gold/20 rounded-xl px-8 py-6 md:px-12 md:py-8">
            <p className="text-body-lg text-text-secondary mb-2">
              If you make <span className="text-text-primary font-bold">$10,000/month</span> streaming:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-4">
              <div className="text-center">
                <p className="text-text-muted text-sm mb-1">On Twitch</p>
                <p className="text-2xl md:text-3xl font-display font-bold text-neon-red/80">
                  $5,000
                </p>
              </div>
              <div className="text-3xl text-text-muted hidden sm:block">&rarr;</div>
              <div className="text-center">
                <p className="text-gold text-sm mb-1 font-medium">On ULTRASTREAM</p>
                <p className="text-2xl md:text-3xl font-display font-bold text-gradient-gold">
                  $9,700
                </p>
              </div>
            </div>
            <p className="mt-4 text-text-muted text-sm">
              That&apos;s <span className="text-gold font-bold">$4,700</span> more in YOUR pocket. Every. Single. Month.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
