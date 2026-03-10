"use client";

import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { PressEffect } from "@/components/animations/micro-interactions";

export function CtaSection() {
  return (
    <Section id="join" background="accent" spacing="lg">
      <Container size="md" className="text-center">
        <ScrollReveal animation="scaleUp">
          <Badge variant="gold" className="mb-6">
            EARLY ACCESS
          </Badge>
          <h2 className="text-display-lg text-text-primary mb-4">
            Join the Revolution
          </h2>
          <p className="text-body-lg text-text-secondary max-w-lg mx-auto mb-10">
            Be among the first creators and viewers on ULTRASTREAM. Get early
            access, founding status, and bonus KZR tokens.
          </p>

          {/* Placeholder for waitlist form -- Phase 3 */}
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="warrior@revolution.gg"
                className="flex-1 px-5 py-3 bg-obsidian/80 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/30 transition-all"
                readOnly
              />
              <PressEffect>
                <Button variant="gold" size="lg" className="whitespace-nowrap">
                  Join Waitlist
                </Button>
              </PressEffect>
            </div>
            <p className="mt-4 text-text-muted text-xs">
              Waitlist functionality coming soon. No spam. No corporate
              overlords.
            </p>
          </div>
        </ScrollReveal>

        {/* Ambient glow decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(123,47,247,0.1)_0%,transparent_70%)]" />
        </div>
      </Container>
    </Section>
  );
}
