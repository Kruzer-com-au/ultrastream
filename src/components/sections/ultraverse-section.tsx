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

export function UltraverseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      // Fade in the entire section
      gsap.from(sectionRef.current.querySelectorAll(".uv-animate"), {
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      // Animate the connecting lines between nodes
      if (nodesRef.current) {
        const lines = nodesRef.current.querySelectorAll(".connect-line");
        gsap.from(lines, {
          scaleX: 0,
          opacity: 0,
          stagger: 0.2,
          duration: 1,
          delay: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: nodesRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }
    },
    { scope: sectionRef }
  );

  return (
    <Section id="ultraverse" background="darker" spacing="lg">
      <div ref={sectionRef}>
        <Container size="lg">
          <div className="text-center mb-16 md:mb-20">
            <p className="uv-animate text-overline mb-4 text-electric-violet tracking-[0.3em]">
              THE ECOSYSTEM
            </p>
            <h2 className="uv-animate text-display-lg text-text-primary mb-6">
              BORN FROM{" "}
              <span className="text-gradient-neon">ULTRAVERSE.GAMES</span>
            </h2>
            <p className="uv-animate text-body-lg text-text-secondary max-w-2xl mx-auto">
              ULTRASTREAM isn&apos;t a solo project. It&apos;s a core pillar of
              the ULTRAVERSE.games ecosystem -- a connected universe where
              gaming, streaming, and community converge into something no
              corporation would ever build.
            </p>
          </div>

          {/* Network visualization */}
          <div
            ref={nodesRef}
            className="uv-animate relative max-w-3xl mx-auto py-8"
          >
            {/* Center hub: ULTRAVERSE */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">
              {/* Left node - ULTRAVERSE.games */}
              <div className="flex-shrink-0 w-36 sm:w-48 md:w-56">
                <div className="rounded-xl border border-electric-violet/30 bg-obsidian/80 p-5 text-center backdrop-blur-sm"
                  style={{ boxShadow: "0 0 30px rgba(139,92,246,0.1)" }}>
                  <p className="text-display-sm text-electric-violet font-bold mb-1">
                    ULTRAVERSE
                  </p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">
                    .games
                  </p>
                  <p className="text-body-sm text-text-secondary mt-2">
                    The parent universe
                  </p>
                </div>
              </div>

              {/* Connecting line */}
              <div className="connect-line hidden md:block w-16 lg:w-24 h-[2px] bg-gradient-to-r from-electric-violet/60 to-neon-blue/60 origin-left" />
              <div className="connect-line md:hidden w-[2px] h-8 bg-gradient-to-b from-electric-violet/60 to-neon-blue/60 origin-top" />

              {/* Center node - ULTRASTREAM (Hero) */}
              <div className="flex-shrink-0 w-44 sm:w-56 md:w-64">
                <div
                  className="rounded-xl border-2 border-gold/40 bg-obsidian/90 p-6 text-center backdrop-blur-sm relative"
                  style={{ boxShadow: "0 0 40px rgba(255,215,0,0.12), 0 0 80px rgba(255,215,0,0.05)" }}
                >
                  {/* Glow pulse */}
                  <div className="absolute inset-0 rounded-xl bg-gold/5 animate-pulse pointer-events-none" />
                  <p className="relative text-display-sm text-gold font-bold mb-1">
                    ULTRASTREAM
                  </p>
                  <p className="relative text-xs text-gold/60 uppercase tracking-wider">
                    Streaming Platform
                  </p>
                  <p className="relative text-body-sm text-text-secondary mt-2">
                    You are here
                  </p>
                </div>
              </div>

              {/* Connecting line */}
              <div className="connect-line hidden md:block w-16 lg:w-24 h-[2px] bg-gradient-to-r from-neon-blue/60 to-neon-purple/60 origin-left" />
              <div className="connect-line md:hidden w-[2px] h-8 bg-gradient-to-b from-neon-blue/60 to-neon-purple/60 origin-top" />

              {/* Right node - Future */}
              <div className="flex-shrink-0 w-36 sm:w-48 md:w-56">
                <div className="rounded-xl border border-neon-purple/20 bg-obsidian/60 p-5 text-center backdrop-blur-sm border-dashed"
                  style={{ boxShadow: "0 0 20px rgba(123,47,247,0.05)" }}>
                  <p className="text-display-sm text-neon-purple/70 font-bold mb-1">
                    MORE COMING
                  </p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">
                    2025+
                  </p>
                  <p className="text-body-sm text-text-muted mt-2">
                    Expanding the universe
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="uv-animate grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
            {[
              {
                label: "Shared Economy",
                desc: "KZR tokens work across the entire ULTRAVERSE ecosystem",
                color: "text-gold",
              },
              {
                label: "Unified Community",
                desc: "Your reputation and following carry everywhere",
                color: "text-neon-blue",
              },
              {
                label: "Cross-Platform Perks",
                desc: "Benefits earned anywhere unlock rewards everywhere",
                color: "text-electric-violet",
              },
            ].map((benefit) => (
              <div
                key={benefit.label}
                className="text-center p-4 rounded-lg bg-white/[0.02] border border-white/5"
              >
                <p className={`text-sm font-semibold ${benefit.color} mb-1`}>
                  {benefit.label}
                </p>
                <p className="text-body-sm text-text-muted">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </Section>
  );
}
