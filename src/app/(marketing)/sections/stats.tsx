"use client";

import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { FloatEffect } from "@/components/animations/micro-interactions";

const stats = [
  {
    value: "0-5%",
    label: "Platform Fee",
    description: "Not 50%. Not 30%. Almost nothing.",
    glow: "purple" as const,
  },
  {
    value: "100%",
    label: "Creator Owned",
    description: "Your content. Your audience. Your revenue.",
    glow: "gold" as const,
  },
  {
    value: "0",
    label: "Censorship",
    description: "Decentralized. Unstoppable. Free.",
    glow: "blue" as const,
  },
];

export function StatsRow() {
  return (
    <Section background="default" spacing="lg" divider>
      <Container size="lg">
        <ScrollReveal stagger={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <FloatEffect key={i} delay={i * 0.3}>
              <Card variant="elevated" glow={stat.glow} hover className="text-center">
                <div className="text-5xl md:text-6xl font-display font-bold text-gradient-gold mb-2">
                  {stat.value}
                </div>
                <div className="text-display-sm text-text-primary mb-1">
                  {stat.label}
                </div>
                <p className="text-body-sm text-text-muted">
                  {stat.description}
                </p>
              </Card>
            </FloatEffect>
          ))}
        </ScrollReveal>
      </Container>
    </Section>
  );
}
