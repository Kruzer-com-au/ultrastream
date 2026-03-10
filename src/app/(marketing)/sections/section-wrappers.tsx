"use client";

import { SectionTransition } from "@/components/animation/SectionTransition";

interface SectionTransitionWrapperProps {
  children: React.ReactNode;
  effect?: "curtain-reveal" | "scale-up" | "clip-expand" | "parallax-stack";
}

/**
 * Client component wrapper for SectionTransition.
 * Allows server components (page.tsx) to use animated transitions
 * around section components.
 */
export function SectionTransitionWrapper({
  children,
  effect = "curtain-reveal",
}: SectionTransitionWrapperProps) {
  return <SectionTransition effect={effect}>{children}</SectionTransition>;
}
