import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Default ScrollTrigger settings for section reveals
 */
export const defaultScrollTrigger = (trigger: string | Element) => ({
  trigger,
  start: "top 80%",
  end: "top 20%",
  toggleActions: "play none none reverse" as const,
});

/**
 * Preset: Fade up and in
 */
export const fadeUpPreset = {
  from: { opacity: 0, y: 60 },
  to: { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
};

/**
 * Preset: Fade in from left
 */
export const fadeLeftPreset = {
  from: { opacity: 0, x: -60 },
  to: { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
};

/**
 * Preset: Fade in from right
 */
export const fadeRightPreset = {
  from: { opacity: 0, x: 60 },
  to: { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
};

/**
 * Preset: Scale up and in
 */
export const scaleUpPreset = {
  from: { opacity: 0, scale: 0.9 },
  to: { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" },
};

/**
 * Preset: Staggered children reveal
 */
export const staggerPreset = {
  from: { opacity: 0, y: 40 },
  to: {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out",
    stagger: 0.1,
  },
};
