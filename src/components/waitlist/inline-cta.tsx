"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { WaitlistForm } from "./waitlist-form";
import { useWaitlist } from "./waitlist-provider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function InlineCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const { handleSuccess } = useWaitlist();

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.from(ref.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: ref }
  );

  return (
    <Section background="darker" spacing="sm">
      <Container size="md">
        <div ref={ref} className="text-center py-8">
          <p className="text-display-sm text-text-primary mb-2">
            Seen enough?
          </p>
          <p className="text-body-md text-text-secondary mb-6">
            Stop scrolling. Start earning. Join now.
          </p>
          <WaitlistForm variant="inline" onSuccess={handleSuccess} />
        </div>
      </Container>
    </Section>
  );
}
