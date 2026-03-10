"use client";

import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { GradientText } from "@/components/ui/gradient-text";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { PulseGlow } from "@/components/animations/micro-interactions";

export function RebellionSection() {
  return (
    <Section id="revolution" background="darker" spacing="lg">
      <Container size="lg" className="text-center">
        <ScrollReveal animation="scaleUp">
          <PulseGlow color="purple" className="inline-block rounded-2xl p-2">
            <h2 className="text-display-lg md:text-display-hero leading-tight px-4">
              <GradientText variant="fire" as="span">
                WE&apos;RE TAKING
              </GradientText>
              <br />
              <GradientText variant="gold" as="span">
                STREAMING BACK
              </GradientText>
            </h2>
          </PulseGlow>
        </ScrollReveal>

        <ScrollReveal animation="fadeUp" delay={0.2}>
          <p className="mt-10 text-body-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            The streaming giants take 50% of creator revenue. They bury new
            voices under algorithmic gatekeeping. They censor, demonetize,
            and control.
          </p>
          <p className="mt-6 text-body-lg text-text-primary max-w-2xl mx-auto leading-relaxed font-medium">
            ULTRASTREAM is the answer. Built on NEAR Protocol, powered by
            the community, owned by the creators. This is not a platform --
            this is a movement.
          </p>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
