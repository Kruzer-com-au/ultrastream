---
phase: 03-content-waitlist
plan: 01
subsystem: content-sections
tags: [villains, revenue, features, ultraverse, gsap, scroll-animation]
dependency-graph:
  requires: [01-01, 01-02, 02-01, 02-02]
  provides: [villain-cards, revenue-comparison, feature-showcase, ultraverse-section]
  affects: [page-layout, navigation-anchors]
tech-stack:
  added: []
  patterns: [gsap-scrolltrigger, data-driven-sections, card-flip-animation, animated-counter]
key-files:
  created:
    - src/lib/content/villains.ts
    - src/lib/content/features.ts
    - src/components/sections/villains-section.tsx
    - src/components/sections/revenue-section.tsx
    - src/components/sections/features-section.tsx
    - src/components/sections/ultraverse-section.tsx
  modified:
    - src/app/(marketing)/page.tsx
decisions:
  - Used abstract SVG icons instead of trademarked logos for competitor representation
  - Revenue bars show 97% for ULTRASTREAM (midpoint of 95-100% range) for cleaner visual
  - Villain card flip triggered by scroll position (ScrollTrigger scrub) rather than click
  - All crypto terminology translated to human language throughout
metrics:
  duration: ~8 minutes
  completed: 2026-02-28T16:52:00Z
---

# Phase 3 Plan 1: Pain Point Storytelling + Feature Showcase Summary

Villain pain points with competitor-specific data, animated revenue comparison bars, 6 feature showcase cards, and ULTRAVERSE ecosystem section -- all with GSAP ScrollTrigger animations and anti-corporate rebellion tone.

## What Was Built

### Task 1: Villain Pain Point Cards and Revenue Comparison

**Villains data** (`src/lib/content/villains.ts`): Typed array of 4 villains (Twitch, YouTube, TikTok, Discord) each with pain point, details with real data, and ULTRASTREAM solution in human language.

**VillainsSection** (`src/components/sections/villains-section.tsx`):
- "THEY'VE BEEN SCREWING YOU" heading with staggered GSAP entrance
- 4 VillainCard components in responsive 2x2 grid
- Each card has villain side (pain point) and solution side (ULTRASTREAM answer)
- GSAP ScrollTrigger flip animation: card rotates to reveal solution as user scrolls deeper
- Abstract SVG icons (TV, Eye, Mask, Tomb) -- no trademarked logos
- Brand-colored borders and glows per villain

**RevenueComparison** (`src/components/sections/revenue-section.tsx`):
- "WHERE YOUR MONEY ACTUALLY GOES" heading
- 3 animated horizontal bars: ULTRASTREAM 97%, YouTube 70%, Twitch 50%
- Bar fills animate from 0% to target width via GSAP ScrollTrigger
- Dollar counter animation (requestAnimationFrame via GSAP) showing $9,700 / $7,000 / $5,000
- Callout stat card: "$4,500+ more in YOUR pocket. Every. Single. Month."
- Platform cut shown as hatched overlay section on each bar

### Task 2: Feature Showcase + ULTRAVERSE Section

**Features data** (`src/lib/content/features.ts`): Typed array of 6 features with human-language titles, taglines, descriptions, and accent colors.

**FeaturesShowcase** (`src/components/sections/features-section.tsx`):
- "OUR WEAPONS" heading with neon gradient
- 6 FeatureCards in responsive 2-column grid
- Each card: custom SVG icon, title, colored tagline, description
- GSAP ScrollTrigger entrance: slide up + side offset, staggered
- Hover glow intensification via CSS transitions
- Accent line at top of each card matching feature color

**UltraverseSection** (`src/components/sections/ultraverse-section.tsx`):
- "BORN FROM ULTRAVERSE.GAMES" heading with neon gradient
- Network visualization: three connected nodes (ULTRAVERSE.games, ULTRASTREAM, MORE COMING)
- Connecting lines animate in via GSAP
- 3 benefit cards: Shared Economy, Unified Community, Cross-Platform Perks
- ULTRASTREAM node highlighted with gold border and pulse glow

**Page integration**: All sections wired into `page.tsx` with SectionTransition wrappers:
Hero > Villains (curtain-reveal) > Revenue (scale-up) > Features (clip-expand) > Ultraverse (parallax-stack)

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check

- [x] src/lib/content/villains.ts exists (4 villains)
- [x] src/lib/content/features.ts exists (6 features)
- [x] src/components/sections/villains-section.tsx exists (236 lines)
- [x] src/components/sections/revenue-section.tsx exists (205 lines)
- [x] src/components/sections/features-section.tsx exists (218 lines)
- [x] src/components/sections/ultraverse-section.tsx exists (167 lines)
- [x] TypeScript compiles without errors
- [x] No crypto jargon in user-facing copy
- [x] No trademarked logos imported
- [x] All sections have id attributes for navigation anchoring
- [x] Commit: 69a6d81

## Self-Check: PASSED
