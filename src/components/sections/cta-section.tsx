"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { WaitlistCounter } from "@/components/waitlist/waitlist-counter";
import { CelebrationOverlay } from "@/components/waitlist/celebration-overlay";
import { useWaitlist } from "@/components/waitlist/waitlist-provider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { handleSuccess, celebrating, clearCelebration, refreshTrigger } =
    useWaitlist();

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      gsap.from(sectionRef.current.querySelectorAll(".cta-animate"), {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <Section id="join" background="accent" spacing="lg">
      <div ref={sectionRef} className="relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,rgba(255,215,0,0.06)_0%,transparent_60%)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(123,47,247,0.08)_0%,transparent_70%)]" />
        </div>

        <Container size="md" className="relative text-center">
          <div className="cta-animate">
            <p className="text-overline mb-4 text-gold tracking-[0.3em]">
              THE FINAL CALL
            </p>
          </div>

          <h2 className="cta-animate text-display-lg md:text-display-hero text-text-primary mb-6">
            THE REVOLUTION{" "}
            <span className="text-gradient-gold">NEEDS YOU</span>
          </h2>

          <p className="cta-animate text-body-lg text-text-secondary max-w-xl mx-auto mb-10">
            Join creators and viewers building the future of streaming. No spam.
            No corporate BS. Just updates on when you can start earning what you
            deserve.
          </p>

          {/* Waitlist form */}
          <div className="cta-animate relative">
            <CelebrationOverlay
              active={celebrating}
              onComplete={clearCelebration}
            />
            <WaitlistForm variant="hero" onSuccess={handleSuccess} />
          </div>

          {/* Counter */}
          <div className="cta-animate mt-8">
            <WaitlistCounter refreshTrigger={refreshTrigger} />
          </div>
        </Container>
      </div>
    </Section>
  );
}
