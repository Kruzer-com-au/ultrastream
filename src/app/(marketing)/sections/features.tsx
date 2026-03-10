"use client";

import { GridSystem, GridCell } from "@/components/layout/grid-system";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { HoverGlow } from "@/components/animations/hover-glow";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

const features = [
  {
    title: "Creators Earn More",
    description:
      "0-5% platform fee. Not 50%. Smart contracts replace corporate middlemen. Your content, your revenue.",
    glow: "purple" as const,
    hoverColor: "purple" as const,
    colSpan: { sm: 1, md: 6, lg: 8 },
    depth: "near" as const,
  },
  {
    title: "Viewers Get Rewarded",
    description:
      "Watch. Engage. Earn KZR. Every minute of attention has value -- and you keep it.",
    glow: "blue" as const,
    hoverColor: "blue" as const,
    colSpan: { sm: 1, md: 6, lg: 4 },
    depth: "far" as const,
  },
  {
    title: "Discovery Engine",
    description:
      "New creators get seen. Not buried beneath algorithm-chosen celebrities. Fair discovery, powered by community.",
    glow: "blue" as const,
    hoverColor: "blue" as const,
    colSpan: { sm: 1, md: 6, lg: 4 },
    depth: "mid" as const,
  },
  {
    title: "Censorship Resistant",
    description:
      "P2P mesh network. Decentralized storage. No single point of failure. No single authority. Your voice cannot be silenced.",
    glow: "gold" as const,
    hoverColor: "gold" as const,
    colSpan: { sm: 1, md: 6, lg: 8 },
    depth: "near" as const,
  },
];

export function FeaturesGrid() {
  return (
    <Section id="features" background="gradient" spacing="lg" divider>
      <Container size="full">
        <ScrollReveal animation="fadeUp" className="text-center mb-16">
          <p className="text-overline mb-3">What We&apos;re Building</p>
          <h2 className="text-display-lg text-text-primary">
            Streaming,{" "}
            <span className="text-gradient-neon">Unchained</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal stagger={0.15}>
          <GridSystem>
            {features.map((feature, i) => (
              <GridCell
                key={i}
                colSpan={feature.colSpan}
                depth={feature.depth}
                glow={feature.glow}
              >
                <HoverGlow color={feature.hoverColor} intensity="subtle">
                  <div className="p-2">
                    <h3 className="text-display-sm text-text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-body-md text-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                </HoverGlow>
              </GridCell>
            ))}
          </GridSystem>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
