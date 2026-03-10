"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import {
  FloatEffect,
  PulseGlow,
} from "@/components/animations/micro-interactions";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(123,47,247,0.15)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,212,255,0.08)_0%,transparent_50%)]" />

      {/* Ambient floating particles (CSS-only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-neon-purple/30 rounded-full animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-neon-blue/20 rounded-full animate-[float_8s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-gold/20 rounded-full animate-[float_7s_ease-in-out_infinite_2s]" />
        <div className="absolute top-2/3 right-1/4 w-0.5 h-0.5 bg-neon-purple/40 rounded-full animate-[float_5s_ease-in-out_infinite_0.5s]" />
      </div>

      <ScrollReveal animation="fadeUp" className="relative z-10 text-center px-4">
        <FloatEffect delay={0.2}>
          <Badge variant="neon" className="mb-6">
            COMING SOON
          </Badge>
        </FloatEffect>

        <h1 className="text-display-hero mb-4">
          <span className="text-gradient-gold">ULTRA</span>
          <span className="text-text-primary">STREAM</span>
        </h1>

        <PulseGlow color="purple" className="inline-block rounded-lg">
          <p className="text-display-md text-neon-blue font-display tracking-[0.15em] uppercase px-4">
            The Streaming Revolution
          </p>
        </PulseGlow>

        <p className="mt-6 text-body-lg text-text-secondary max-w-xl mx-auto">
          For the people. By the people. Against the machine.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="gold" size="xl">
            Join the Revolution
          </Button>
          <Button variant="secondary" size="lg">
            Learn More
          </Button>
        </div>
      </ScrollReveal>
    </section>
  );
}
