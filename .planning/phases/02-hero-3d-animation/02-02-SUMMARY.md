---
phase: 02-hero-3d-animation
plan: 02
subsystem: scroll-engine
tags: [lenis, gsap, scrolltrigger, scroll-animations, performance, parallax, transitions]
dependency_graph:
  requires: [02-01]
  provides: [scroll-engine, section-transitions, parallax-layers, scroll-progress, performance-monitor]
  affects: [all-sections, hero-section, layout]
tech_stack:
  added: []
  patterns: [lenis-scrolltrigger-sync, fps-monitoring, tier-degradation, scrub-animations, client-provider-wrapping]
key_files:
  created:
    - src/lib/scroll/scroll-trigger-setup.ts
    - src/lib/scroll/lenis-provider.tsx
    - src/hooks/usePerformanceMonitor.ts
    - src/hooks/useScrollAnimation.ts
    - src/components/animation/ScrollReveal.tsx
    - src/components/animation/ParallaxLayer.tsx
    - src/components/animation/SectionTransition.tsx
    - src/components/animation/ScrollProgress.tsx
    - src/app/(marketing)/sections/section-wrappers.tsx
  modified:
    - src/app/layout.tsx
    - src/app/(marketing)/page.tsx
    - src/components/hero/HeroSection.tsx
decisions:
  - "Replaced GsapProvider with LenisProvider to centralize Lenis + ScrollTrigger sync"
  - "PerformanceProvider uses React.createElement to avoid JSX in non-component context"
  - "Dev FPS counter rendered conditionally via process.env.NODE_ENV check"
  - "SectionTransition uses pin:false explicitly to avoid Lenis scroll jank"
  - "Created SectionTransitionWrapper client component for server page imports"
  - "ScrollProgress uses mix-blend-mode:screen for neon glow over dark backgrounds"
  - "Removed JSX.IntrinsicElements type for React 19 compatibility"
metrics:
  duration: "~3 minutes"
  completed: "2026-02-28"
  tasks_completed: 2
  tasks_total: 2
  files_created: 9
  files_modified: 3
---

# Phase 2 Plan 2: Scroll Engine and Section Transition Animations Summary

Complete scroll animation infrastructure with Lenis smooth scroll, GSAP ScrollTrigger integration, 4 cinematic section transition effects, reusable animation primitives, FPS-based performance degradation, and hero scroll-exit animation.

## What Was Built

### Lenis + ScrollTrigger Integration (lenis-provider.tsx, scroll-trigger-setup.ts)
Centralized smooth scroll provider that:
- Initializes Lenis with 1.2s duration, exponential ease-out, responsive touch scrolling
- Syncs Lenis scroll position with GSAP ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`
- Uses GSAP ticker for Lenis RAF loop with `lagSmoothing(0)` to prevent desync
- Listens for `prefers-reduced-motion` changes and disables smoothing dynamically
- Exposes `useLenis()` hook for child components

### Performance Monitor (usePerformanceMonitor.ts)
FPS tracking system with React context:
- RAF-based frame timing with 60-frame rolling average
- Three tiers: high (>50fps), medium (30-50fps), low (<30fps)
- `shouldReduceAnimations` flag for low tier
- `shouldReduceParticles` flag for low + medium tiers
- Forces low tier when `prefers-reduced-motion` is active
- Dev-mode FPS counter: fixed overlay showing current FPS, average, and tier label with color coding

### Scroll Animation Hook (useScrollAnimation.ts)
Convenience wrapper for GSAP ScrollTrigger with:
- 5 animation presets (fade-up, fade-in, scale-in, slide-left, slide-right)
- Automatic performance degradation (falls back to opacity-only on low tier)
- Configurable trigger options, duration, delay, easing
- Automatic cleanup via `useGSAP`

### ScrollReveal Component (ScrollReveal.tsx)
Enhanced version of Phase 1's scroll-reveal with:
- 6 presets including blur-in
- Stagger support for direct children
- Scrub mode (ties animation to scroll position)
- Configurable start/end positions
- Performance-aware: reduces to opacity-only on low tier
- `once` flag for non-reversing animations

### ParallaxLayer Component (ParallaxLayer.tsx)
Depth effect wrapper:
- Speed multiplier (-1 to 1) controls parallax intensity
- Vertical or horizontal direction
- ScrollTrigger scrub on parent section (top-bottom to bottom-top range)
- `will-change: transform` for GPU acceleration
- Disabled entirely on low performance tier

### SectionTransition Component (SectionTransition.tsx)
Four cinematic transition effects, all scrub-driven:

1. **curtain-reveal**: clipPath `inset(100% 0 0 0)` -> `inset(0%)` -- content reveals top-to-bottom
2. **scale-up**: scale 0.85 + opacity 0.3 -> full -- zooming-in effect
3. **clip-expand**: clipPath `circle(0%)` -> `circle(75%)` -- dramatic circle reveal
4. **parallax-stack**: negative margin overlap + y-translate + z-index layering -- stacking cards

All effects use `scrub: 1` for 1-second smooth lag. All fall back to simple opacity fade when `shouldReduceAnimations` is true. Explicit `pin: false` to avoid Lenis conflicts.

### ScrollProgress (ScrollProgress.tsx)
Fixed position bar at viewport top (3px height, z-50):
- Gradient from neon-blue through purple back to blue
- `scaleX` animation from 0 to 1 scrubbed to full document scroll
- Glow via `box-shadow` with `mix-blend-mode: screen`

### Hero Scroll Exit (HeroSection.tsx updated)
Two scroll-triggered exit animations:
- Content overlay: translates up 80px + fades + scales 0.95 (scrubbed, start: top, end: bottom)
- Background (3D/fallback): scales 0.95 + fades (scrubbed, start: center, end: bottom)

### Layout Integration (layout.tsx updated)
Replaced `GsapProvider` with `LenisProvider > PerformanceProvider` wrapping. Both are client components imported into the server layout.

### Page Integration (page.tsx updated)
All existing sections (FeaturesGrid, RebellionSection, StatsRow, CtaSection) wrapped with `SectionTransitionWrapper` using different effects: curtain-reveal, scale-up, clip-expand, parallax-stack respectively. ScrollProgress added as first element.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created SectionTransitionWrapper client boundary**
- **Found during:** Task 2
- **Issue:** page.tsx is a server component but SectionTransition is a client component
- **Fix:** Created section-wrappers.tsx as a thin client component wrapper
- **Files modified:** src/app/(marketing)/sections/section-wrappers.tsx

**2. [Rule 1 - Bug] Removed JSX.IntrinsicElements type reference**
- **Found during:** Task 2
- **Issue:** `keyof JSX.IntrinsicElements` fails in React 19 TypeScript (JSX namespace not found)
- **Fix:** Removed the `as` prop from ScrollReveal, always renders a `div`
- **Files modified:** src/components/animation/ScrollReveal.tsx

**3. [Rule 2 - Missing critical functionality] Replaced GsapProvider instead of wrapping alongside**
- **Found during:** Task 1
- **Issue:** GsapProvider already initializes Lenis; adding LenisProvider would create dual Lenis instances
- **Fix:** LenisProvider supersedes GsapProvider entirely (same functionality + more)
- **Files modified:** src/app/layout.tsx
