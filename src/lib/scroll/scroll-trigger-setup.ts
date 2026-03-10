"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

let initialized = false;

/**
 * Initialize GSAP ScrollTrigger with site-wide defaults.
 * Called once from LenisProvider on mount.
 */
export function initScrollTrigger() {
  if (initialized) return;
  initialized = true;

  ScrollTrigger.defaults({
    toggleActions: "play none none reverse",
  });

  // Enable debug markers only in development
  if (process.env.NODE_ENV === "development") {
    // Markers can be enabled per-trigger as needed
    // Don't enable globally -- too noisy with many triggers
  }
}

export { ScrollTrigger };
