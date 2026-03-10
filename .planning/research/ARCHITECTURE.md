# Architecture Research

**Domain:** Web3 gaming streaming platform marketing website (evolving to full web portal)
**Researched:** 2026-02-28
**Confidence:** HIGH

## System Overview

```
ULTRASTREAM Website Architecture
=================================

PHASE 1: Marketing/Landing Site          PHASE 2+: Portal Evolution
================================         ================================

Browser (User)                           Browser (User)
    |                                        |
    v                                        v
+----------------------------------+     +----------------------------------+
|        Vercel Edge Network       |     |        Vercel Edge Network       |
|  (CDN, Edge Functions, SSL)      |     |  (CDN, Edge Functions, SSL)      |
+----------------------------------+     +----------------------------------+
    |                                        |
    v                                        v
+----------------------------------+     +----------------------------------+
|   Next.js App Router             |     |   Next.js App Router             |
|                                  |     |                                  |
|  src/app/                        |     |  src/app/                        |
|  +-- (marketing)/                |     |  +-- (marketing)/   [SSG]       |
|  |   +-- page.tsx    [SSG]       |     |  +-- (portal)/      [SSR]       |
|  |   +-- features/              |     |  |   +-- dashboard/             |
|  |   +-- about/                 |     |  |   +-- wallet/                |
|  +-- layout.tsx                  |     |  |   +-- streams/               |
|  +-- api/                        |     |  +-- layout.tsx                  |
|      +-- waitlist/               |     |  +-- api/                        |
|      +-- analytics/              |     |      +-- waitlist/               |
+----------------------------------+     |      +-- auth/                   |
    |          |         |               |      +-- near/                   |
    v          v         v               +----------------------------------+
+--------+ +-------+ +--------+             |        |         |        |
| Resend | | Redis | | Plausi-|             v        v         v        v
| (email)| | (rate | | ble/   |         +------+ +------+ +------+ +------+
|        | | limit)| | PostHog|         | NEAR | | Auth | |  DB  | | CDN  |
+--------+ +-------+ +--------+         | RPC  | | Svc  | |      | | Media|
                                         +------+ +------+ +------+ +------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Vercel Edge Network** | CDN delivery, SSL termination, edge functions, preview deployments | Vercel platform (automatic with Next.js) |
| **Next.js App Router** | Routing, rendering (SSG/SSR/ISR), API routes, server components | Next.js 15+ with App Router, TypeScript |
| **(marketing) Route Group** | Landing page, feature showcase, waitlist, about pages | Static Generation (SSG), server components |
| **(portal) Route Group** | Dashboard, wallet connection, stream management (Phase 2+) | Server-Side Rendering (SSR), client components where needed |
| **API Routes** | Waitlist submission, email capture, analytics events, NEAR proxy | Next.js Route Handlers (`route.ts` files) |
| **Resend** | Transactional email (waitlist confirmation, welcome emails) | Resend SDK via API route |
| **Upstash Redis** | Rate limiting for waitlist, waitlist storage, session data | `@upstash/redis` + `@upstash/ratelimit` |
| **Plausible/PostHog** | Privacy-respecting analytics, funnel tracking | Script tag (Plausible) or SDK (PostHog) |
| **NEAR Wallet Selector** | Wallet connection preview (Phase 1 teaser), full auth (Phase 2) | `@near-wallet-selector/core` + modal UI |
| **3D/Animation Layer** | Hero animations, particle effects, scroll-driven visuals | React Three Fiber + Motion (Framer Motion) |

## Recommended Project Structure

```
src/
+-- app/                              # Next.js App Router (routing only)
|   +-- layout.tsx                    # Root layout: fonts, metadata, providers
|   +-- page.tsx                      # Redirect or root handler
|   +-- (marketing)/                  # Route group: marketing pages (no URL prefix)
|   |   +-- layout.tsx               # Marketing layout: nav, footer, CTA bar
|   |   +-- page.tsx                 # Landing/home page
|   |   +-- features/
|   |   |   +-- page.tsx             # Feature showcase page
|   |   +-- about/
|   |   |   +-- page.tsx             # About/team page
|   |   +-- ecosystem/
|   |       +-- page.tsx             # ULTRAVERSE ecosystem page
|   +-- (portal)/                     # Route group: portal pages (Phase 2+)
|   |   +-- layout.tsx               # Portal layout: sidebar, wallet status
|   |   +-- dashboard/
|   |   |   +-- page.tsx             # User dashboard
|   |   +-- wallet/
|   |       +-- page.tsx             # Wallet management
|   +-- api/                          # API route handlers
|   |   +-- waitlist/
|   |   |   +-- route.ts             # POST: join waitlist
|   |   +-- waitlist-count/
|   |   |   +-- route.ts             # GET: waitlist count
|   |   +-- og/
|   |       +-- route.tsx            # Dynamic OG image generation
|   +-- sitemap.ts                    # Generated sitemap
|   +-- robots.ts                     # Generated robots.txt
|   +-- not-found.tsx                 # Custom 404
|   +-- error.tsx                     # Global error boundary
|   +-- loading.tsx                   # Global loading state
+-- components/                       # Shared UI components
|   +-- ui/                           # Primitive UI components
|   |   +-- button.tsx
|   |   +-- input.tsx
|   |   +-- card.tsx
|   |   +-- modal.tsx
|   |   +-- badge.tsx
|   +-- layout/                       # Layout components
|   |   +-- header.tsx               # Site header/nav
|   |   +-- footer.tsx               # Site footer
|   |   +-- mobile-nav.tsx           # Mobile navigation drawer
|   |   +-- cta-bar.tsx              # Sticky CTA/waitlist bar
|   +-- marketing/                    # Marketing-specific components
|   |   +-- hero-section.tsx         # Hero with 3D background
|   |   +-- feature-card.tsx         # Feature showcase card
|   |   +-- comparison-table.tsx     # vs-competitors table
|   |   +-- waitlist-form.tsx        # Email capture form
|   |   +-- social-proof.tsx         # Testimonials/stats
|   |   +-- tokenomics-preview.tsx   # KZR token overview
|   |   +-- ecosystem-map.tsx        # ULTRAVERSE connection visual
|   +-- three/                        # 3D/WebGL components (client-only)
|   |   +-- hero-scene.tsx           # Main hero 3D scene
|   |   +-- particle-field.tsx       # Background particles
|   |   +-- canvas-wrapper.tsx       # R3F Canvas with Suspense
|   +-- wallet/                       # NEAR wallet components (Phase 2+)
|   |   +-- connect-button.tsx       # Wallet connect trigger
|   |   +-- wallet-modal.tsx         # Wallet selector modal
|   |   +-- account-display.tsx      # Connected account display
|   +-- animations/                   # Animation wrappers
|       +-- scroll-reveal.tsx        # Scroll-triggered reveal
|       +-- fade-in.tsx              # Fade-in on mount
|       +-- section-transition.tsx   # Section scroll transitions
+-- lib/                              # Utilities and business logic
|   +-- near/                         # NEAR Protocol integration
|   |   +-- config.ts               # Network config (testnet/mainnet)
|   |   +-- wallet.ts               # Wallet selector setup
|   |   +-- provider.tsx            # NearProvider context wrapper
|   +-- email/                        # Email service
|   |   +-- resend.ts               # Resend client config
|   |   +-- templates.ts            # Email template definitions
|   +-- analytics/                    # Analytics abstraction
|   |   +-- events.ts               # Event tracking functions
|   |   +-- provider.tsx            # Analytics provider wrapper
|   +-- utils/                        # General utilities
|   |   +-- cn.ts                   # className merge utility
|   |   +-- constants.ts            # App constants, URLs
|   |   +-- validators.ts           # Input validation (email, etc.)
|   +-- hooks/                        # Custom React hooks
|       +-- use-waitlist.ts          # Waitlist submission hook
|       +-- use-scroll-position.ts   # Scroll position tracking
|       +-- use-media-query.ts       # Responsive breakpoint hook
+-- styles/                           # Global styles
|   +-- globals.css                  # Tailwind directives, CSS variables
|   +-- fonts.ts                     # Font configuration
+-- types/                            # TypeScript type definitions
|   +-- index.ts                     # Shared types
|   +-- near.ts                      # NEAR-specific types
+-- public/                           # Static assets
|   +-- images/                      # Optimized images
|   +-- videos/                      # Preview video clips
|   +-- models/                      # 3D model files (.glb)
|   +-- fonts/                       # Custom font files
+-- content/                          # Static content data
    +-- features.ts                  # Feature list data
    +-- competitors.ts               # Competitor comparison data
    +-- faq.ts                       # FAQ content
```

### Structure Rationale

- **`src/app/` with route groups:** The `(marketing)` and `(portal)` route groups are the cornerstone of the evolution strategy. They allow completely separate layouts (marketing has full-width hero + footer, portal has sidebar + header) while sharing the same codebase and root layout. No URL prefix is added. This is the official Next.js pattern for partitioning an application into sections with different UI/UX.

- **`components/` outside `app/`:** Keeps the `app/` directory focused purely on routing. Components are organized by domain (marketing, wallet, three, ui) rather than by page, which supports reuse across both marketing and portal sections.

- **`lib/` for business logic:** Separates integration code (NEAR, email, analytics) from UI components. Each integration gets its own subdirectory with config, client, and provider files. This makes swapping providers straightforward.

- **`content/` for static data:** Feature lists, competitor comparisons, and FAQ content live as typed data files rather than hardcoded in components. This enables future CMS migration without component changes.

- **`components/three/` isolated:** 3D components are always client-side and heavy. Isolating them makes it easy to dynamically import with `ssr: false` and wrap in Suspense boundaries, preventing them from blocking the critical rendering path.

## Architectural Patterns

### Pattern 1: Route Group Separation for Evolution

**What:** Use Next.js route groups `(marketing)` and `(portal)` with separate `layout.tsx` files to partition the application into two distinct experiences that share the same deployment.

**When to use:** When building a site that starts as marketing but must evolve into an authenticated application without a rewrite.

**Trade-offs:** Slightly more complex folder structure upfront, but eliminates the need to migrate to a separate codebase later. Both sections share components, utilities, and the build pipeline.

**Example:**
```typescript
// src/app/(marketing)/layout.tsx — Full-width marketing layout
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CtaBar } from '@/components/layout/cta-bar'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header variant="marketing" />
      <main className="min-h-screen">{children}</main>
      <CtaBar />
      <Footer />
    </>
  )
}

// src/app/(portal)/layout.tsx — Dashboard layout with sidebar (Phase 2+)
import { Sidebar } from '@/components/layout/sidebar'
import { WalletStatus } from '@/components/wallet/account-display'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <header className="flex items-center justify-between p-4">
          <WalletStatus />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
```

### Pattern 2: Server Components Default, Client Islands for Interactivity

**What:** Keep all components as server components by default. Only add `'use client'` to the smallest possible leaf components that require browser APIs, state, or event handlers.

**When to use:** Always. This is the default architecture for Next.js App Router in 2026. The marketing site benefits enormously because most content is static.

**Trade-offs:** Requires thinking about the server/client boundary. 3D scenes, waitlist forms, and wallet connections are client components. Feature cards, hero text, comparison tables, and footers remain server components with zero client JS.

**Example:**
```typescript
// src/components/marketing/hero-section.tsx — Server component (default)
// No 'use client' directive. Zero JS shipped to browser for this component.
import dynamic from 'next/dynamic'

// 3D scene loaded client-side only, with loading fallback
const HeroScene = dynamic(
  () => import('@/components/three/hero-scene'),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-black" />
    ),
  }
)

export function HeroSection() {
  return (
    <section className="relative h-screen overflow-hidden">
      <HeroScene />
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 className="text-6xl font-bold text-white">ULTRASTREAM</h1>
        <p className="text-xl text-gray-300 mt-4">
          The decentralized streaming revolution
        </p>
      </div>
    </section>
  )
}
```

### Pattern 3: Progressive Enhancement for NEAR Integration

**What:** In Phase 1, the NEAR wallet connection is a preview/teaser (non-functional "Connect Wallet" button that shows the concept). In Phase 2, it becomes fully functional with NearProvider wrapping the portal route group.

**When to use:** When blockchain features need to be showcased before the backend is ready.

**Trade-offs:** Requires clear UI communication that wallet features are "coming soon" in Phase 1. The NearProvider context wrapper is already architected but only activated for the portal route group.

**Example:**
```typescript
// Phase 1: Teaser button in marketing section
// src/components/marketing/wallet-teaser.tsx
'use client'

export function WalletTeaser() {
  return (
    <button
      onClick={() => {/* open modal showing "Coming Soon" */}}
      className="px-6 py-3 bg-purple-600 text-white rounded-lg"
    >
      Connect NEAR Wallet
      <span className="ml-2 text-xs bg-purple-800 px-2 py-1 rounded">
        Coming Soon
      </span>
    </button>
  )
}

// Phase 2: Real integration in portal section
// src/lib/near/provider.tsx
'use client'
import { WalletSelectorContextProvider } from '@near-wallet-selector/react-hook'

export function NearProvider({ children }: { children: React.ReactNode }) {
  return (
    <WalletSelectorContextProvider
      config={{
        network: 'mainnet',
        modules: [
          /* MyNearWallet, MeteorWallet, EthereumWallets */
        ],
      }}
    >
      {children}
    </WalletSelectorContextProvider>
  )
}

// src/app/(portal)/layout.tsx — Only portal pages get NEAR functionality
import { NearProvider } from '@/lib/near/provider'

export default function PortalLayout({ children }) {
  return <NearProvider>{children}</NearProvider>
}
```

### Pattern 4: API Route for Waitlist with Rate Limiting

**What:** Use Next.js Route Handlers (not server actions) for the waitlist API, with Upstash Redis rate limiting and Resend for confirmation emails. This pattern keeps the endpoint accessible for future mobile/external integrations.

**When to use:** For any form submission that needs rate limiting, validation, and third-party service calls.

**Trade-offs:** Slightly more boilerplate than server actions, but provides a proper REST endpoint that external tools, mobile apps, and landing page variants can all hit.

**Example:**
```typescript
// src/app/api/waitlist/route.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const redis = Redis.fromEnv()
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 signups per hour per IP
})
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  // Rate limit check
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  const { email } = await request.json()

  // Validate email
  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'Invalid email' },
      { status: 400 }
    )
  }

  // Store in Redis list
  await redis.lpush('waitlist', JSON.stringify({ email, joinedAt: Date.now() }))

  // Send confirmation email
  await resend.emails.send({
    from: 'ULTRASTREAM <noreply@ultrastream.gg>',
    to: email,
    subject: 'Welcome to the ULTRASTREAM waitlist',
    html: '<p>You are in. We will notify you when early access opens.</p>',
  })

  return NextResponse.json({ success: true })
}
```

## Data Flow

### Request Flow (Marketing Site)

```
User visits ultrastream.gg
    |
    v
Vercel CDN (serves cached static HTML from SSG build)
    |
    v
Next.js Root Layout (loads fonts, injects metadata, wraps providers)
    |
    v
(marketing) Layout (renders Header, Footer, CTA Bar)
    |
    v
Page Component (server-rendered static content)
    |
    +-- Server Components: hero text, feature cards, comparison table (zero JS)
    |
    +-- Client Islands (dynamically imported):
        +-- 3D Hero Scene (React Three Fiber, ssr: false)
        +-- Waitlist Form (useState, fetch to /api/waitlist)
        +-- Scroll Animations (Motion/GSAP, useRef)
        +-- Analytics Script (Plausible lightweight embed)
```

### Waitlist Submission Flow

```
User types email + clicks "Join Waitlist"
    |
    v
WaitlistForm component (client)
    | POST /api/waitlist { email }
    v
API Route Handler (serverless function)
    |
    +-- 1. Rate limit check (Upstash Redis)
    |       |-- FAIL: return 429
    |       |-- PASS: continue
    |
    +-- 2. Validate email format
    |       |-- FAIL: return 400
    |       |-- PASS: continue
    |
    +-- 3. Store in Redis (LPUSH "waitlist")
    |
    +-- 4. Send confirmation (Resend API)
    |
    +-- 5. Track event (analytics)
    |
    v
Return { success: true }
    |
    v
WaitlistForm shows success state + confetti animation
```

### Analytics Flow

```
Page Load / User Action
    |
    v
Plausible script (lightweight, ~1KB)
    |
    +-- Pageview events (automatic)
    +-- Custom goals (waitlist signup, CTA click, scroll depth)
    |
    v
Plausible dashboard (privacy-respecting, no cookies, GDPR-compliant)

--- Phase 2+ addition ---

PostHog SDK (opt-in for deeper product analytics)
    |
    +-- Session replay
    +-- Feature flags
    +-- Funnel analysis (waitlist -> portal -> wallet connect)
    |
    v
PostHog dashboard (cookie-free mode, EU cloud)
```

### Evolution: Portal Authentication Flow (Phase 2+)

```
User clicks "Launch Portal" or "Connect Wallet"
    |
    v
(portal) Layout loads NearProvider context
    |
    v
Wallet Selector Modal opens
    | User selects wallet (MyNearWallet, Meteor, MetaMask via EVM bridge)
    v
NEAR RPC: authenticate + create session
    |
    v
useWalletSelector hook provides:
    +-- signedAccountId (e.g., "creator.ultrastream")
    +-- signIn / signOut functions
    +-- viewFunction / callFunction for contract calls
    |
    v
Portal pages render authenticated UI
    +-- Dashboard: stream stats, KZR balance
    +-- Wallet: transaction history, token management
    +-- Streams: manage content (connects to platform backend)
```

### Key Data Flows

1. **Static content delivery:** Build-time SSG generates HTML -> Vercel CDN caches globally -> users get sub-100ms TTFB worldwide. No server computation per request for marketing pages.

2. **Waitlist capture:** Client form -> API route (serverless) -> Redis (storage) + Resend (email). Serverless scales to zero when idle, scales up automatically during traffic spikes.

3. **3D asset loading:** Dynamic import with `ssr: false` -> browser loads R3F bundle on demand -> 3D models (.glb) loaded from `/public/models/` or CDN -> GPU renders scene. Does not block initial page paint.

4. **Analytics collection:** Plausible script fires on page load (no cookies, no consent banner needed) -> events sent to Plausible cloud or self-hosted instance -> dashboard shows traffic, sources, conversions.

5. **NEAR wallet connection (Phase 2+):** NearProvider initializes wallet selector -> user authenticates via chosen wallet -> session stored client-side -> contract calls proxied through NEAR RPC nodes.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10k visitors/month | SSG on Vercel free tier handles this effortlessly. Redis free tier for waitlist (10k commands/day). Plausible cloud at $9/month. No infrastructure concerns. |
| 10k-100k visitors/month | Vercel Pro ($20/month) for analytics and more bandwidth. Move waitlist data from Redis to a proper database (Supabase/PlanetScale) if list exceeds Redis memory. Consider PostHog free tier for deeper funnel analysis. |
| 100k+ visitors/month | ISR for any dynamic marketing content. Edge middleware for geo-routing. CDN-hosted 3D assets (separate from Vercel). PostHog for product analytics. Portal section may need dedicated NEAR RPC endpoint rather than public nodes. |

### Scaling Priorities

1. **First bottleneck: 3D asset loading.** Heavy .glb models and textures will be the first performance issue on mobile. Mitigation: aggressive compression (Draco for meshes, KTX2 for textures), loading skeletons, progressive enhancement (fallback to CSS gradients on low-end devices).

2. **Second bottleneck: Waitlist API under viral load.** If a tweet goes viral, the waitlist endpoint could see thousands of submissions per minute. Mitigation: Upstash Redis handles this natively (serverless, auto-scales), rate limiting prevents abuse, and the serverless function scales automatically on Vercel.

3. **Third bottleneck (Phase 2): NEAR RPC rate limits.** Public NEAR RPC nodes have rate limits. When the portal goes live, use a dedicated RPC provider (Pagoda, Infura for NEAR) or run your own node.

## Anti-Patterns

### Anti-Pattern 1: Monolithic Client Bundle

**What people do:** Import NEAR wallet selector, Three.js, GSAP, and analytics SDK in the root layout, shipping everything to every page visitor.

**Why it is wrong:** A visitor reading the features page does not need 500KB of Three.js or 200KB of NEAR SDK. This destroys Core Web Vitals (LCP, INP) and wastes bandwidth, especially on mobile.

**Do this instead:** Dynamic imports with `ssr: false` for Three.js scenes. Lazy-load NEAR wallet selector only when user interacts with wallet features. Code-split analytics to load after initial paint. Only the `(portal)` route group should include NEAR provider.

### Anti-Pattern 2: Premature Portal Architecture

**What people do:** Build the full portal authentication, dashboard, and wallet integration in Phase 1 alongside the marketing site because "we will need it eventually."

**Why it is wrong:** Delays the marketing site launch by weeks. The portal depends on platform APIs that do not exist yet. NEAR contract interfaces will change. You build against assumptions instead of reality.

**Do this instead:** Ship the `(portal)` route group as an empty placeholder with a "Coming Soon" page. Build the marketing site to completion in Phase 1. Add portal features incrementally as platform APIs become available. The route group architecture makes this addition seamless.

### Anti-Pattern 3: CSS-Only Animations Where JS Is Needed (and Vice Versa)

**What people do:** Use GSAP/Motion for simple hover states and fade-ins that CSS `transition` handles perfectly. Or use CSS for complex scroll-driven sequences that need precise timeline control.

**Why it is wrong:** JS animation libraries add bundle size and complexity. CSS animations run on the compositor thread (smoother). But CSS cannot do scroll-linked parallax, staggered reveals, or timeline sequences.

**Do this instead:** CSS transitions/animations for hover states, simple fades, and micro-interactions. Motion (Framer Motion) for React-integrated layout animations, gesture-based interactions, and AnimatePresence (exit animations). GSAP ScrollTrigger only if complex scroll-driven timelines are needed (e.g., pinned sections, scrub-linked progress).

### Anti-Pattern 4: Storing Waitlist in a JSON File or In-Memory

**What people do:** Use a local JSON file or in-memory array to store waitlist signups during development and never migrate to a proper store.

**Why it is wrong:** Serverless functions are stateless. Each invocation is isolated. In-memory data disappears between requests. JSON files do not persist on Vercel.

**Do this instead:** Use Upstash Redis from day one. It is serverless, has a generous free tier (10k commands/day), and the integration is three lines of code. When the waitlist outgrows Redis, migrate to Supabase or PlanetScale.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Resend** | SDK in API route (`new Resend(apiKey)`) | Server-side only. Never expose API key to client. Use React Email templates for branded confirmation emails. Free tier: 3,000 emails/month. |
| **Upstash Redis** | SDK in API route (`Redis.fromEnv()`) | Serverless Redis. No connection management needed. Use for rate limiting + waitlist storage. Free tier: 10k commands/day. |
| **Plausible Analytics** | Script tag in root layout | `<script data-domain="ultrastream.gg" src="https://plausible.io/js/script.js" />`. No cookies, no consent banner. Custom events via `window.plausible()`. |
| **PostHog** (Phase 2) | SDK provider wrapping portal | `posthog-js` client SDK + `posthog-node` for server events. Cookie-free mode available. Free tier: 1M events/month. |
| **NEAR RPC** (Phase 2) | Wallet Selector SDK | `@near-wallet-selector/core` + wallet modules. Client-side only. Connects to NEAR mainnet/testnet RPC. Consider dedicated RPC provider for production. |
| **Vercel** | Git-push deployment | Automatic preview deployments on PR. Environment variables separated by scope (production, preview, development). Edge functions for middleware. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **(marketing) <-> (portal)** | Shared root layout, separate sub-layouts | Link between them with standard `<Link>`. No API boundary. Shared components from `components/ui/`. Different providers (portal has NearProvider, marketing does not). |
| **Server Components <-> Client Components** | Props passed at boundary | Server components fetch data and pass to client components as props. Client components handle interactivity. Keep the boundary as high up as possible (fewer client components = less JS). |
| **Page Components <-> API Routes** | HTTP fetch from client components | Waitlist form calls `/api/waitlist` via fetch. No direct imports between page and API route code. This keeps the API usable by external tools. |
| **Components <-> Content Data** | Import from `content/` directory | Feature lists, competitor data, FAQ items are typed TypeScript objects. Components import and render them. Future CMS migration only changes the data source, not the components. |
| **3D Scene <-> Page Layout** | Dynamic import + CSS layering | 3D canvas is absolutely positioned behind content. Z-index layering keeps text readable. Suspense boundary shows gradient fallback while 3D loads. |

## Evolution Path: Landing Page to Portal

### Phase 1: Marketing Site (Weeks 1-3)

**Build:** `(marketing)` route group with all landing page sections, waitlist API, analytics, 3D hero.

**Architecture decisions that enable Phase 2:**
- Route groups already in place
- `lib/near/` directory exists with config stubs
- Component library (`components/ui/`) built for reuse
- API route patterns established
- Environment variable structure supports multiple environments

### Phase 2: Portal Foundation (When Platform APIs Ready)

**Add:** `(portal)` route group with layout, NearProvider, basic dashboard page, wallet connection.

**What changes:**
- New `(portal)/layout.tsx` with sidebar navigation
- `lib/near/provider.tsx` activated with real wallet selector
- New API routes for NEAR proxy calls
- PostHog added for product analytics

**What does NOT change:**
- Marketing pages continue serving unchanged
- Waitlist API keeps running
- Component library reused in portal
- Deployment pipeline unchanged

### Phase 3: Full Portal (Platform Maturity)

**Add:** Stream management, KZR token dashboard, community features, real-time data.

**What changes:**
- Database added (Supabase/PlanetScale) for user data
- WebSocket connections for real-time stream data
- More complex NEAR contract interactions
- Authentication middleware on portal routes

**What does NOT change:**
- Marketing site remains the public face
- Route group boundary keeps concerns separated
- Shared component library grows but does not break

### Build Order (Dependency Chain)

```
1. Project scaffolding (Next.js, TypeScript, Tailwind, ESLint)
   |
2. Root layout + fonts + metadata + global styles
   |
   +-- 3. Component library (ui/ primitives: Button, Card, Input, Badge)
   |
   +-- 4. (marketing) layout (Header, Footer, CTA Bar, mobile nav)
       |
       +-- 5a. Hero section (static content first, 3D added after)
       |   |
       |   +-- 6a. 3D scene (React Three Fiber, dynamic import)
       |
       +-- 5b. Feature showcase sections (server components, content data)
       |
       +-- 5c. Waitlist form + API route + Redis + Resend
       |
       +-- 5d. Competitor comparison, tokenomics preview, ecosystem map
       |
       +-- 7. Scroll animations (Motion/GSAP, added last to working pages)
       |
       +-- 8. Analytics integration (Plausible, custom events)
       |
       +-- 9. SEO: metadata, OG images, sitemap, robots.txt
       |
       +-- 10. Performance audit + mobile optimization
       |
       === PHASE 1 COMPLETE: Marketing site live ===
       |
       +-- 11. (portal) route group + layout stub
       |
       +-- 12. NEAR wallet selector integration
       |
       +-- 13. Dashboard page + contract reads
       |
       === PHASE 2: Portal foundation ===
```

## Sources

- [Next.js Official Docs: Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) -- verified 2026-02-27, v16.1.6 (HIGH confidence)
- [Next.js Architecture: Server-First, App Router Patterns](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router) (MEDIUM confidence)
- [Next.js 16 App Router Project Structure: The Definitive Guide](https://makerkit.dev/blog/tutorials/nextjs-app-router-project-structure) (MEDIUM confidence)
- [NEAR Docs: Your First Web3 App](https://docs.near.org/web3-apps/quickstart) -- official NEAR documentation (HIGH confidence)
- [NEAR Docs: Wallet Selector](https://docs.near.org/web3-apps/tutorials/web-login/wallet-selector) -- official NEAR documentation (HIGH confidence)
- [NEAR Wallet Selector GitHub](https://github.com/near/wallet-selector) -- official repository (HIGH confidence)
- [Building a Frontend Application with NEAR Protocol Integration](https://medium.com/@UrsolAlex/building-a-frontend-application-with-near-protocol-integration-25474f7156c5) (MEDIUM confidence)
- [Vercel: Deployment Environments](https://vercel.com/docs/deployments/environments) -- official Vercel docs (HIGH confidence)
- [Complete Guide to Deploying Next.js Apps in 2026](https://dev.to/zahg_81752b307f5df5d56035/the-complete-guide-to-deploying-nextjs-apps-in-2026-vercel-self-hosted-and-everything-in-between-48ia) (MEDIUM confidence)
- [Vercel Waitlist Template (Waitly)](https://vercel.com/templates/next.js/waitly) -- official Vercel template (HIGH confidence)
- [Resend: Send with Next.js](https://resend.com/docs/send-with-nextjs) -- official Resend docs (HIGH confidence)
- [PostHog: Next.js Integration](https://posthog.com/docs/libraries/next-js) -- official PostHog docs (HIGH confidence)
- [Privacy-First Analytics Alternatives 2026: Plausible, Fathom, PostHog](https://www.legal-forge.com/en/blog/privacy-first-analytics-alternatives-2026/) (MEDIUM confidence)
- [React Three Fiber vs Three.js in 2026](https://graffersid.com/react-three-fiber-vs-three-js/) (MEDIUM confidence)
- [The Future is 3D: Integrating Three.js in Next.js](https://www.artekia.com/en/blog/future-is-3d) (MEDIUM confidence)
- [GSAP vs Framer Motion: Deep Dive](https://www.artekia.com/en/blog/gsap-vs-framer-motion) (MEDIUM confidence)
- [Comparing Best React Animation Libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) (MEDIUM confidence)
- [Next.js as a Full-Stack Platform: Architecture, Patterns, and Trade-offs](https://medium.com/@johnidouglasmarangon/next-js-as-a-full-stack-platform-architecture-patterns-and-trade-offs-c327dc394b7c) (MEDIUM confidence)
- [Modern Full Stack Application Architecture Using Next.js 15+](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/) (MEDIUM confidence)
- [Next.js SEO Optimization Guide 2026](https://www.djamware.com/post/nextjs-seo-optimization-guide-2026-edition) (MEDIUM confidence)

---
*Architecture research for: ULTRASTREAM Web3 Gaming Streaming Platform Marketing Website*
*Researched: 2026-02-28*
