---
phase: 04-launch-prep
plan: 01
subsystem: seo, performance, analytics, accessibility
tags: [next-metadata, og-image, json-ld, plausible, a11y, security-headers, structured-data]

# Dependency graph
requires:
  - phase: 03-content-waitlist
    provides: "All content sections, waitlist form, sticky CTA, inline CTA components"
  - phase: 02-hero-scroll
    provides: "3D hero scene with dynamic import, scroll animations"
  - phase: 01-foundation
    provides: "Design system, fonts, layout structure, Tailwind config"
provides:
  - "Centralized metadata config with generatePageMetadata helper"
  - "Dynamic OG and Twitter card images via next/og ImageResponse"
  - "JSON-LD structured data (Organization + WebSite schemas)"
  - "Sitemap.xml and robots.txt via Next.js App Router conventions"
  - "Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)"
  - "Image optimization (AVIF/WebP) and static asset caching"
  - "Plausible analytics provider with typed custom event system"
  - "Scroll depth tracking (25/50/75/100% milestones)"
  - "Waitlist form view and signup conversion tracking"
  - "Skip-to-content accessibility link"
  - "Focus-visible styles on all interactive elements"
  - "Enhanced footer with social links, brand attribution, and link columns"
affects: [deployment, monitoring]

# Tech tracking
tech-stack:
  added: [next/og ImageResponse, Plausible analytics (script tag)]
  patterns: [centralized metadata config, typed analytics events, InViewTrack hook, skip-to-content a11y]

key-files:
  created:
    - src/lib/metadata.ts
    - src/app/opengraph-image.tsx
    - src/app/twitter-image.tsx
    - src/app/sitemap.ts
    - src/app/robots.ts
    - src/components/seo/structured-data.tsx
    - src/components/analytics/plausible-provider.tsx
    - src/components/analytics/scroll-depth-tracker.tsx
    - src/lib/analytics.ts
  modified:
    - src/app/layout.tsx
    - src/app/(marketing)/layout.tsx
    - src/app/(marketing)/page.tsx
    - src/components/waitlist/waitlist-form.tsx
    - src/components/waitlist/sticky-cta.tsx
    - next.config.ts

key-decisions:
  - "Script tag approach for Plausible (next-plausible package had peer dependency conflicts with React 19/Next 16)"
  - "Production-only analytics (enabled flag based on NODE_ENV)"
  - "InViewTrack hook for form view tracking (IntersectionObserver, fires once)"
  - "Edge runtime for OG image generation (required by next/og ImageResponse)"
  - "Placeholder social URLs (twitter.com/ultrastream, discord.gg/ultrastream) -- replace when accounts exist"

patterns-established:
  - "Centralized metadata: all SEO values from src/lib/metadata.ts siteMetadata object"
  - "Typed analytics: AnalyticsEvents type constrains event names and props"
  - "trackEvent() safe to call anywhere -- no-ops when Plausible not loaded"
  - "useInViewTrack(callback) hook for viewport-triggered analytics"
  - "Focus-visible ring pattern: focus-visible:ring-2 focus-visible:ring-neon-blue"

# Metrics
duration: 8min
completed: 2026-02-28
---

# Phase 4 Plan 1: SEO, Performance, and Analytics Summary

**Full SEO metadata with dynamic OG images via next/og, Plausible analytics with typed scroll/waitlist/CTA event tracking, security headers, and WCAG accessibility improvements including skip-to-content and focus-visible styles**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-28T17:01:22Z
- **Completed:** 2026-02-28T17:09:24Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments

- Every page has comprehensive meta tags (title, description, keywords, OG, Twitter cards) with a branded dynamic 1200x630 OG image
- JSON-LD structured data for Organization and WebSite schemas renders in page source
- Sitemap.xml and robots.txt serve correctly via Next.js App Router conventions
- Security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy (no camera/mic/geo/FLoC)
- Image optimization with AVIF/WebP format negotiation and aggressive static asset caching
- Plausible analytics tracks page views in production; custom events fire for scroll depth milestones, waitlist form views, and waitlist signups
- Skip-to-content link, focus-visible neon glow rings, aria-labels, form labels, and semantic landmarks for accessibility
- Enhanced footer with brand description, ULTRAVERSE.games attribution, platform/company link columns, and social icons (X, Discord, YouTube)

## Task Commits

Each task was committed atomically:

1. **Task 1: SEO metadata, OG images, structured data, and crawlability** - `7b4c0f1` (feat)
2. **Task 2: Core Web Vitals performance optimization and security headers** - `400fdcd` (feat)
3. **Task 3: Plausible analytics, accessibility audit, and enhanced footer** - `ebe4629` (feat)

## Files Created/Modified

**Created:**
- `src/lib/metadata.ts` - Centralized metadata config with siteMetadata object and generatePageMetadata helper
- `src/app/opengraph-image.tsx` - Dynamic 1200x630 OG image with ULTRASTREAM branding via next/og
- `src/app/twitter-image.tsx` - Twitter card image (same branded design)
- `src/app/sitemap.ts` - Dynamic sitemap.xml generation
- `src/app/robots.ts` - Robots.txt allowing all crawlers, disallowing /api/
- `src/components/seo/structured-data.tsx` - JSON-LD Organization and WebSite schemas
- `src/components/analytics/plausible-provider.tsx` - Plausible script injection (production-only)
- `src/components/analytics/scroll-depth-tracker.tsx` - Client component activating scroll depth tracking
- `src/lib/analytics.ts` - Typed analytics events, trackEvent helper, useScrollDepth and useInViewTrack hooks

**Modified:**
- `src/app/layout.tsx` - Centralized metadata, PlausibleProvider, StructuredData, skip-to-content link
- `src/app/(marketing)/layout.tsx` - Enhanced footer, focus-visible styles on nav, semantic landmarks, social links
- `src/app/(marketing)/page.tsx` - ScrollDepthTracker, id="main-content"
- `src/components/waitlist/waitlist-form.tsx` - Form view/signup analytics, label elements, focus-visible, aria-hidden on SVGs
- `src/components/waitlist/sticky-cta.tsx` - CTA dismiss analytics, focus-visible, aria-hidden on SVG
- `next.config.ts` - Image formats, security headers, cache headers, console removal

## Decisions Made

1. **Script tag approach for Plausible** - The next-plausible npm package had peer dependency conflicts with React 19 and Next.js 16. Used the official Plausible script tag directly with a queue initialization pattern. This is actually simpler and more reliable.
2. **Production-only analytics** - Analytics script only loads when NODE_ENV=production, preventing noise during development and respecting developer experience.
3. **Placeholder social URLs** - Twitter/Discord/YouTube links use placeholder URLs (twitter.com/ultrastream, etc.). These should be updated when actual social accounts are created.
4. **Edge runtime for OG images** - Required by next/og ImageResponse. This disables static generation for the OG image route but that's expected -- OG images are server-rendered on demand.
5. **No bundle analyzer shipped** - Verified 3D scene is code-split via existing dynamic() import. Analyzer would be dev-only tooling that doesn't need to be committed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] next-plausible package peer dependency conflict**
- **Found during:** Task 3 (Plausible analytics integration)
- **Issue:** npm install next-plausible failed with "Cannot read properties of null (reading 'matches')" -- peer dependency conflict with React 19/Next.js 16
- **Fix:** Used official Plausible script tag approach with Next.js Script component instead. Created manual PlausibleProvider with queue initialization pattern for custom events.
- **Files modified:** src/components/analytics/plausible-provider.tsx
- **Verification:** Build passes, script tag renders correctly in production
- **Committed in:** ebe4629 (Task 3 commit)

**2. [Rule 2 - Missing Critical] Added form labels for accessibility**
- **Found during:** Task 3 (Accessibility audit)
- **Issue:** Waitlist form email inputs had no associated label elements -- screen readers cannot identify the input purpose
- **Fix:** Added sr-only label elements with htmlFor/id association on all email inputs
- **Files modified:** src/components/waitlist/waitlist-form.tsx
- **Verification:** Each input has a visible-to-screen-reader label
- **Committed in:** ebe4629 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both fixes necessary for functionality and accessibility. No scope creep.

## Issues Encountered

- npm peer dependency resolution failed for next-plausible with React 19 -- resolved by using manual script tag approach (simpler, zero dependencies)

## User Setup Required

**Plausible Analytics** requires manual configuration before tracking works:
- Sign up at https://plausible.io or self-host Plausible
- Add site domain (ultrastream.gg) in Plausible dashboard
- If self-hosted, set `NEXT_PUBLIC_PLAUSIBLE_HOST` env var to your Plausible instance URL
- If using a different domain, set `NEXT_PUBLIC_PLAUSIBLE_SITE` env var
- Analytics silently no-ops until configured -- no errors in the meantime

**Social Media Links** in footer use placeholder URLs:
- Update Twitter/X link when @ultrastream account exists
- Update Discord link when server is created
- Update YouTube link when channel is created

## Cross-Browser Testing Checklist

Manual verification recommended on:
- Chrome (latest) -- primary target
- Firefox (latest)
- Safari (latest, if macOS available)
- Edge (latest)
- Mobile Chrome (Android)
- Mobile Safari (iOS)

Key items per browser: 3D scene renders or gracefully degrades, animations play smoothly, waitlist form submits, fonts render correctly, OG preview works when sharing URL.

## Next Phase Readiness

This is the **FINAL PHASE**. The ULTRASTREAM marketing site is production-ready:
- SEO: Full metadata, OG images, structured data, sitemap, robots.txt
- Performance: Code-split 3D, optimized fonts, image format negotiation, security headers
- Analytics: Plausible ready for production tracking with typed custom events
- Accessibility: Skip-to-content, focus-visible, labels, aria attributes, semantic landmarks
- Content: All sections from Phases 1-3 are intact and enhanced

**Remaining before launch:**
- Configure Plausible account and add domain
- Set up Supabase for persistent waitlist storage (currently in-memory)
- Configure Resend API key for confirmation emails
- Replace placeholder social media URLs with real accounts
- Deploy to production hosting (Vercel recommended)

## Self-Check: PASSED

All 9 created files verified present on disk. All 3 task commits (7b4c0f1, 400fdcd, ebe4629) verified in git log. Build passes without errors.

---
*Phase: 04-launch-prep*
*Completed: 2026-02-28*
