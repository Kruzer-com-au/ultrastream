---
phase: 03-content-waitlist
plan: 02
subsystem: waitlist-system
tags: [waitlist, email-capture, sticky-cta, social-proof, celebration, conversion-funnel]
dependency-graph:
  requires: [03-01]
  provides: [waitlist-api, waitlist-form, sticky-cta, waitlist-counter, celebration-overlay]
  affects: [hero-section, page-layout]
tech-stack:
  added: [react-hook-form, zod, "@hookform/resolvers"]
  patterns: [context-provider-state, intersection-observer, canvas-particles, rate-limiting]
key-files:
  created:
    - src/lib/validations/waitlist.ts
    - src/lib/email/confirmation.ts
    - src/app/api/waitlist/route.ts
    - src/components/waitlist/waitlist-form.tsx
    - src/components/waitlist/waitlist-provider.tsx
    - src/components/waitlist/hero-waitlist.tsx
    - src/components/waitlist/sticky-cta.tsx
    - src/components/waitlist/waitlist-counter.tsx
    - src/components/waitlist/celebration-overlay.tsx
    - src/components/waitlist/inline-cta.tsx
    - src/components/sections/cta-section.tsx
    - supabase/migrations/001_waitlist.sql
  modified:
    - src/components/hero/HeroSection.tsx
    - src/app/(marketing)/page.tsx
    - .env.example
    - package.json
decisions:
  - Used in-memory store instead of Supabase for dev (no env vars needed to run)
  - Used fetch API for Resend instead of SDK (avoids extra dependency)
  - WaitlistProvider context pattern instead of prop drilling for shared celebration state
  - Canvas confetti particles written from scratch instead of importing a library
  - Zod v4 installed (latest) with hookform/resolvers v5 compatibility
metrics:
  duration: ~5 minutes
  completed: 2026-02-28T16:57:00Z
---

# Phase 3 Plan 2: Waitlist System + Sticky CTA Summary

Complete waitlist conversion funnel with 3+ form placements, sticky CTA bar, canvas confetti celebration, animated social proof counter, and mock API with rate limiting.

## What Was Built

### Task 1: Waitlist Form, Validation, API Route

**Zod schema** (`src/lib/validations/waitlist.ts`): Email validation with Zod v4, exported `WaitlistFormData` type.

**Email confirmation** (`src/lib/email/confirmation.ts`): `sendConfirmationEmail()` with Resend API integration. Currently mocks when no API key set. Full HTML email template with ULTRASTREAM branding, rebellion copy, dark theme.

**API route** (`src/app/api/waitlist/route.ts`):
- POST: validates email, checks duplicates, stores in-memory, sends email (fire-and-forget)
- GET: returns current count for social proof
- Rate limiting: 5 signups per IP per hour via in-memory Map
- Status codes: 201 (success), 400 (validation), 409 (duplicate), 429 (rate limited)
- Ready for Supabase swap: migration file included, comments document the upgrade path

**WaitlistForm** (`src/components/waitlist/waitlist-form.tsx`):
- 3 variants: hero (large, prominent), inline (medium, horizontal), compact (minimal, for sticky bar)
- react-hook-form + zodResolver for client-side validation
- States: idle, submitting (spinner), success (checkmark + message), duplicate (info), error, rate-limited
- All feedback inline -- no alerts, no redirects, no page reloads

**WaitlistProvider** (`src/components/waitlist/waitlist-provider.tsx`): React context providing shared `handleSuccess`, `celebrating`, `clearCelebration`, and `refreshTrigger` across all form instances.

### Task 2: Sticky CTA, Counter, Celebration, Page Integration

**StickyCTA** (`src/components/waitlist/sticky-cta.tsx`):
- Fixed bottom bar with IntersectionObserver on hero section
- Slides up when hero leaves viewport, slides down when hero visible
- Contains compact WaitlistForm + CTA text + dismiss button
- CSS transform animation for smooth slide

**WaitlistCounter** (`src/components/waitlist/waitlist-counter.tsx`):
- Fetches from GET /api/waitlist on mount and on refreshTrigger change
- Animated number counter using requestAnimationFrame with ease-out cubic
- Hides when count is 0 or fetch fails
- "X revolutionaries have joined" rebellion copy

**CelebrationOverlay** (`src/components/waitlist/celebration-overlay.tsx`):
- Canvas-based confetti particle system (40 particles, brand colors)
- Physics-based: velocity, gravity, decay, rotation
- "WELCOME TO THE REVOLUTION" text flash with gold glow
- Auto-clears after 3 seconds, calls onComplete
- No external libraries -- hand-rolled minimal particle system

**CTASection** (`src/components/sections/cta-section.tsx`):
- "THE REVOLUTION NEEDS YOU" heading with gold gradient
- Hero-variant WaitlistForm + CelebrationOverlay + WaitlistCounter
- GSAP ScrollTrigger entrance animation
- Ambient background glow effects

**InlineCTA** (`src/components/waitlist/inline-cta.tsx`):
- "Seen enough? Stop scrolling. Start earning." mid-page CTA
- Inline-variant WaitlistForm with GSAP entrance

**HeroSection updated**: Added HeroWaitlist below Manifesto text in hero content overlay.

**Page integration** (`src/app/(marketing)/page.tsx`):
- WaitlistProvider wraps entire page
- Section order: Hero (with form) > Villains > Revenue > Features > InlineCTA > Ultraverse > CTASection
- StickyCTA rendered as fixed overlay
- 3+ form placements plus sticky bar, all sharing celebration state

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Supabase import removed from API route**
- **Found during:** Task 1
- **Issue:** `@supabase/supabase-js` not installed; dynamic import still checked by TypeScript
- **Fix:** Rewrote API route to use purely in-memory store with comments documenting Supabase upgrade path
- **Files modified:** src/app/api/waitlist/route.ts

**2. [Rule 3 - Blocking] npm package manager detection**
- **Found during:** Task 1 dependency installation
- **Issue:** npm install failed; project uses pnpm (detected via pnpm-lock.yaml)
- **Fix:** Used `pnpm add` instead of `npm install`

## Self-Check

- [x] src/components/waitlist/waitlist-form.tsx exists (3 variants working)
- [x] src/components/waitlist/sticky-cta.tsx exists (IntersectionObserver)
- [x] src/components/waitlist/waitlist-counter.tsx exists (animated counter)
- [x] src/components/waitlist/celebration-overlay.tsx exists (canvas particles)
- [x] src/components/sections/cta-section.tsx exists (final CTA)
- [x] src/app/api/waitlist/route.ts exists (POST + GET)
- [x] src/lib/validations/waitlist.ts exists (Zod schema)
- [x] supabase/migrations/001_waitlist.sql exists
- [x] 3+ form placements on page (hero, inline, bottom CTA, sticky bar)
- [x] TypeScript compiles without errors
- [x] Next.js build succeeds
- [x] Commits: 579ef64, cc9062d

## Self-Check: PASSED
