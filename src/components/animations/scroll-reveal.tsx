"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils/cn";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: "fadeUp" | "fadeLeft" | "fadeRight" | "scaleUp";
  delay?: number;
  duration?: number;
  stagger?: number;
  once?: boolean;
  className?: string;
}

const animationConfigs = {
  fadeUp: { y: 60, opacity: 0 },
  fadeLeft: { x: -60, opacity: 0 },
  fadeRight: { x: 60, opacity: 0 },
  scaleUp: { scale: 0.9, opacity: 0 },
};

export function ScrollReveal({
  children,
  animation = "fadeUp",
  delay = 0,
  duration = 0.8,
  stagger,
  once = true,
  className,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const targets = stagger
        ? containerRef.current.children
        : containerRef.current;

      gsap.from(targets, {
        ...animationConfigs[animation],
        duration,
        delay,
        stagger: stagger || 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: once
            ? "play none none none"
            : "play none none reverse",
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={cn(className)}>
      {children}
    </div>
  );
}
