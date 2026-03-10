# Requirements: ULTRASTREAM Website

**Defined:** 2026-02-28
**Core Value:** A marketing website that makes creators and gamers feel like they've found their rebellion -- ULTRASTREAM is the weapon against corporate streaming platforms.

## v1 Requirements

Requirements for the marketing/landing website. Each maps to roadmap phases.

### Design System & Brand Identity

- [ ] **BRAND-01**: Dark, premium color palette -- deep blacks, electric accents (neon blue/purple/red), metallic golds -- Web3-native but gaming-first, NOT generic crypto
- [ ] **BRAND-02**: Typography system with bold, aggressive display fonts (heavy metal energy) paired with clean readable body text
- [ ] **BRAND-03**: 3D grid layout system -- sections arranged in a grid-like spatial composition, not standard vertical scroll
- [ ] **BRAND-04**: Complex, clean section transition animations (GSAP-powered) -- smooth but impactful, premium feel like abyssinecator.com
- [ ] **BRAND-05**: Responsive design -- epic on desktop, still powerful on mobile with graceful 3D degradation
- [ ] **BRAND-06**: Custom cursor, hover effects, and micro-interactions that feel alive and reactive

### Hero & 3D Experience

- [ ] **HERO-01**: Immersive 3D hero section (React Three Fiber) -- first impression must be "holy shit this is different"
- [ ] **HERO-02**: Tagline/manifesto in 1980s heavy metal rally-the-troops tone -- "We're taking streaming back" energy
- [ ] **HERO-03**: Animated ULTRASTREAM logo reveal with 3D elements
- [ ] **HERO-04**: Immediate visual communication: this is FOR gamers, BY rebels, AGAINST corporate streaming

### Pain Point Storytelling (The Villains)

- [ ] **PAIN-01**: "The Problem" section -- visceral showcase of how Twitch/YouTube/TikTok/Discord screw creators (50% cuts, broken discovery, DMCA terror, burnout, no viewer rewards)
- [ ] **PAIN-02**: Competitor comparison -- revenue split calculator or visual showing ULTRASTREAM 0-5% vs Twitch 50% vs YouTube 30%
- [ ] **PAIN-03**: Anti-corporate messaging -- "built for the people, by the people who are tired of being screwed" tone
- [ ] **PAIN-04**: Each pain point paired with ULTRASTREAM's solution (the hero kills the villain)

### Platform Features Showcase

- [ ] **FEAT-01**: Creator monetization section -- smart subscriptions, P2P tipping, 0-5% fee, smart contracts explained in human language
- [ ] **FEAT-02**: Viewer rewards section -- KZR Proof-of-Engagement, earn while you watch, bandwidth rewards
- [ ] **FEAT-03**: Discovery engine section -- social-proof algorithm, new creator boosting, "your content will be seen"
- [ ] **FEAT-04**: Censorship resistance section -- P2P mesh, decentralized storage, DAO governance (The Architects)
- [ ] **FEAT-05**: Privacy-respecting age verification section -- "verify without surrendering your identity"
- [ ] **FEAT-06**: ULTRAVERSE.games ecosystem connection -- parent platform relationship, cross-platform benefits

### Waitlist & Conversion

- [ ] **WAIT-01**: Email capture waitlist form -- prominent, accessible from multiple scroll positions
- [ ] **WAIT-02**: Sticky CTA bar that follows scroll -- "Join the Revolution" or similar rally call
- [ ] **WAIT-03**: Social proof elements -- waitlist counter, community size, testimonials or endorsements
- [ ] **WAIT-04**: Confirmation email via Resend after signup

### Animation & Interaction

- [ ] **ANIM-01**: Smooth scroll experience (Lenis) with GSAP ScrollTrigger animations on every section
- [ ] **ANIM-02**: Section-to-section transitions that feel cinematic -- parallax, reveal, scale, morph effects
- [ ] **ANIM-03**: 3D elements that respond to scroll position and mouse movement
- [ ] **ANIM-04**: Loading/preloader screen that sets the epic tone immediately
- [ ] **ANIM-05**: Performance optimization -- 3D degrades gracefully, animations don't kill mobile FPS

### Technical Foundation

- [ ] **TECH-01**: Next.js 16 with App Router, Tailwind v4, TypeScript
- [ ] **TECH-02**: SEO optimization -- meta tags, OG images, structured data for social sharing
- [ ] **TECH-03**: Core Web Vitals targets -- LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] **TECH-04**: Vercel deployment with CI/CD
- [ ] **TECH-05**: Analytics integration (Plausible -- privacy-respecting, matches brand values)

## v2 Requirements

Deferred to portal evolution phase.

### Portal Features
- **PORT-01**: NEAR wallet connect integration (full, not teaser)
- **PORT-02**: Live stream player and chat
- **PORT-03**: Creator dashboard
- **PORT-04**: KZR token transactions and wallet
- **PORT-05**: Content feed (short-form + live)
- **PORT-06**: User profiles with NEAR Named Accounts

### Community
- **COMM-01**: Discord/community channel launch (after waitlist has critical mass)
- **COMM-02**: Blog/content marketing section
- **COMM-03**: Creator onboarding flow

## Out of Scope

| Feature | Reason |
|---------|--------|
| Actual streaming functionality | Platform team builds this separately |
| Smart contract deployment | Backend/blockchain team |
| KZR token transactions | Platform launch feature |
| Native mobile apps | Future milestone |
| Full NEAR wallet dApp | Portal phase, not landing page |
| Community Discord/Telegram at launch | Dead channels kill trust -- launch after waitlist mass |
| Token sale / ICO messaging | Legal minefield, alienates gamers, invites securities scrutiny |
| NFT integration | Anti-feature -- alienates mainstream gamers |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BRAND-01 | Phase 1 | Pending |
| BRAND-02 | Phase 1 | Pending |
| BRAND-03 | Phase 1 | Pending |
| BRAND-04 | Phase 1 | Pending |
| BRAND-05 | Phase 1 | Pending |
| BRAND-06 | Phase 1 | Pending |
| TECH-01 | Phase 1 | Pending |
| TECH-04 | Phase 1 | Pending |
| ANIM-04 | Phase 1 | Pending |
| HERO-01 | Phase 2 | Pending |
| HERO-02 | Phase 2 | Pending |
| HERO-03 | Phase 2 | Pending |
| HERO-04 | Phase 2 | Pending |
| ANIM-01 | Phase 2 | Pending |
| ANIM-02 | Phase 2 | Pending |
| ANIM-03 | Phase 2 | Pending |
| ANIM-05 | Phase 2 | Pending |
| PAIN-01 | Phase 3 | Pending |
| PAIN-02 | Phase 3 | Pending |
| PAIN-03 | Phase 3 | Pending |
| PAIN-04 | Phase 3 | Pending |
| FEAT-01 | Phase 3 | Pending |
| FEAT-02 | Phase 3 | Pending |
| FEAT-03 | Phase 3 | Pending |
| FEAT-04 | Phase 3 | Pending |
| FEAT-05 | Phase 3 | Pending |
| FEAT-06 | Phase 3 | Pending |
| WAIT-01 | Phase 3 | Pending |
| WAIT-02 | Phase 3 | Pending |
| WAIT-03 | Phase 3 | Pending |
| WAIT-04 | Phase 3 | Pending |
| TECH-02 | Phase 4 | Pending |
| TECH-03 | Phase 4 | Pending |
| TECH-05 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0

---
*Requirements defined: 2026-02-28*
*Last updated: 2026-02-28 after roadmap creation*
