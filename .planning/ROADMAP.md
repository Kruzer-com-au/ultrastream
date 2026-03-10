# Roadmap: ULTRASTREAM Marketing Website

## Overview

Build an epic, 3D-immersive marketing website that rallies creators and gamers to ULTRASTREAM's anti-corporate rebellion. Four phases take us from scaffolded design system to deployed, SEO-optimized hype machine with a live waitlist -- shipping in hours, not weeks. The visual system IS the product: every phase treats animation and 3D as structural, not decorative.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (e.g., 2.1): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation + Design System** - Scaffold project, deploy to Vercel, and build the dark heavy-metal design system that defines every pixel
- [ ] **Phase 2: Hero + 3D + Animation Engine** - Build the "holy shit" first impression and the scroll-driven animation infrastructure for all sections
- [ ] **Phase 3: Content Sections + Waitlist** - All marketing content (pain points, features, social proof) and the email capture conversion funnel
- [ ] **Phase 4: Launch Prep** - SEO, Core Web Vitals, analytics, and final validation before driving traffic

## Phase Details

### Phase 1: Foundation + Design System
**Goal**: Visitors see a deployed site with ULTRASTREAM's unmistakable dark, heavy-metal, gaming-first visual identity -- responsive, fast, and alive with micro-interactions
**Depends on**: Nothing (first phase)
**Requirements**: BRAND-01, BRAND-02, BRAND-03, BRAND-04, BRAND-05, BRAND-06, TECH-01, TECH-04, ANIM-04
**Success Criteria** (what must be TRUE):
  1. Site is live on Vercel with working CI/CD pipeline (push to deploy)
  2. Dark premium color palette, bold display typography, and metallic accents are visible across all components -- looks like a gaming rebellion, not a crypto template
  3. 3D grid layout system renders sections in spatial composition on desktop and gracefully adapts to single-column on mobile
  4. Custom cursor, hover effects, and micro-interactions respond to user input on every interactive element
  5. A loading/preloader screen sets the epic tone before content appears
**Plans**: 2 plans in 2 waves

Plans:
- [ ] 01-01-PLAN.md (Wave 1) -- Next.js 16 scaffold with Tailwind v4 dark theme, (marketing)/(portal) route groups, 3D grid layout system, epic preloader, Vercel deployment with CI/CD
- [ ] 01-02-PLAN.md (Wave 2, depends on 01-01) -- Design token system (CSS + TypeScript), typography scale, brand UI components (Button/Card/Section/Container/Badge/GradientText), custom cursor, hover effects, micro-interactions (press/float/pulse), GSAP + Lenis smooth scroll, scroll-reveal animations

### Phase 2: Hero + 3D + Animation Engine
**Goal**: The first 5 seconds hook visitors with an immersive 3D hero experience, and smooth scroll-driven animations carry them through the entire page
**Depends on**: Phase 1
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04, ANIM-01, ANIM-02, ANIM-03, ANIM-05
**Success Criteria** (what must be TRUE):
  1. 3D hero section renders an immersive scene (React Three Fiber) that makes visitors stop and pay attention -- first impression is "this is different"
  2. ULTRASTREAM logo animates into view with 3D elements and a heavy-metal manifesto tagline communicates the anti-corporate mission immediately
  3. Smooth scroll (Lenis) with GSAP ScrollTrigger powers cinematic section-to-section transitions -- parallax, reveal, scale, morph effects
  4. 3D elements respond to both scroll position and mouse movement throughout the page
  5. On mobile and low-end GPUs, 3D degrades gracefully to CSS/video fallbacks without breaking layout or killing FPS
**Plans**: TBD

Plans:
- [ ] 02-01: 3D hero scene, logo reveal, and manifesto
- [ ] 02-02: Scroll engine and section transition animations

### Phase 3: Content Sections + Waitlist
**Goal**: Visitors understand exactly why ULTRASTREAM exists (the villains), what it offers (the weapons), and can join the revolution (waitlist signup) from multiple points on the page
**Depends on**: Phase 2
**Requirements**: PAIN-01, PAIN-02, PAIN-03, PAIN-04, FEAT-01, FEAT-02, FEAT-03, FEAT-04, FEAT-05, FEAT-06, WAIT-01, WAIT-02, WAIT-03, WAIT-04
**Success Criteria** (what must be TRUE):
  1. "The Problem" section viscerally communicates how Twitch/YouTube/TikTok/Discord screw creators -- each pain point paired with ULTRASTREAM's solution
  2. Revenue comparison (ULTRASTREAM 0-5% vs Twitch 50% vs YouTube 30%) is immediately understandable through visual or interactive display
  3. All six platform features (creator monetization, viewer rewards, discovery engine, censorship resistance, privacy age verification, ULTRAVERSE ecosystem) have dedicated showcase sections with human-language explanations
  4. Email waitlist form is accessible from at least 3 scroll positions (hero area, mid-page, bottom) plus a sticky CTA bar that follows the user
  5. Successful waitlist signup triggers a confirmation email via Resend and shows a celebration state on the page
**Plans**: TBD

Plans:
- [ ] 03-01: Pain point storytelling and feature showcase sections
- [ ] 03-02: Waitlist system, sticky CTA, and email flow

### Phase 4: Launch Prep
**Goal**: The site is findable by search engines, measurable with privacy-respecting analytics, and performs within Core Web Vitals targets -- ready for traffic
**Depends on**: Phase 3
**Requirements**: TECH-02, TECH-03, TECH-05
**Success Criteria** (what must be TRUE):
  1. Meta tags, Open Graph images, and structured data render correctly when shared on Twitter/Discord/social platforms
  2. Core Web Vitals pass targets: LCP < 2.5s, FID < 100ms, CLS < 0.1 on both desktop and mobile
  3. Plausible analytics tracks page views, scroll depth, and waitlist conversion events
**Plans**: TBD

Plans:
- [ ] 04-01: SEO, performance, and analytics

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Foundation + Design System | 0/2 | Planned | - |
| 2. Hero + 3D + Animation Engine | 0/2 | Not started | - |
| 3. Content Sections + Waitlist | 0/2 | Not started | - |
| 4. Launch Prep | 0/1 | Not started | - |
