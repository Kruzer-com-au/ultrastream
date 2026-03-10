# Stack Research

**Domain:** Web3 Gaming Streaming Platform -- Marketing/Landing Website
**Project:** ULTRASTREAM (by ULTRAVERSE.games)
**Researched:** 2026-02-28
**Confidence:** HIGH

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1.6 | Full-stack React framework | The standard for production React sites in 2026. Turbopack is now the default bundler (5-10x faster dev, 2-5x faster builds). App Router with React Server Components gives excellent SEO for a marketing site. Cache Components are opt-in only now, which is saner. View Transitions support via React 19.2 enables cinematic page transitions out of the box. Critically, this site will evolve into a web portal -- Next.js API routes and middleware (now called "proxy") provide the backend foundation without rewriting later. |
| React | 19.2.4 | UI library | Shipped with Next.js 16. React Compiler is now stable -- automatic memoization means fewer performance footguns. View Transitions and `<Activity />` component enable premium UX. `useEffectEvent` simplifies animation cleanup. |
| TypeScript | 5.8+ | Type safety | TypeScript 5.8 is the sweet spot -- stable, well-supported, and the `--erasableSyntaxOnly` flag aligns with Node.js native TypeScript support. Do not jump to 5.9/6.0 beta yet; let Next.js 16 dictate the version. |
| Tailwind CSS | 4.x | Utility-first CSS | Ground-up rewrite with 5x faster full builds, 100x faster incremental builds. CSS-first configuration via `@theme` means design tokens live in CSS, not JS config files. OKLCH colors by default produce more vibrant, gaming-appropriate palettes. Single `@import "tailwindcss"` entry point. Zero reason to use v3 on a new project. |

### Animation & Visual Libraries

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| GSAP | 3.14+ | Scroll animations, timeline sequences, text effects | The professional animation standard. Now 100% free (all plugins) after Webflow acquisition. ScrollTrigger for scroll-driven reveals, SplitText for cinematic text animations, Flip for layout transitions. 12M+ sites use it. For a premium Web3 gaming site, GSAP delivers the "wow factor" that Framer Motion cannot match for complex choreographed sequences. The `@gsap/react` package with `useGSAP()` hook handles React cleanup automatically. |
| Motion (Framer Motion) | 12.34+ | Micro-interactions, component animations, gestures | Use Motion for component-level animations: hover states, modal entrances, button presses, toast notifications. Its declarative `<motion.div>` API is faster to write than GSAP for simple transitions. Hardware-accelerated via Web Animations API at 120fps. Use GSAP for page-level choreography, Motion for component-level interaction. |
| Lenis | 1.3.17 | Smooth scrolling | Ultra-lightweight (3KB). The industry standard for butter-smooth scroll on premium marketing sites. Compatible with CSS `position: sticky`. Works seamlessly with GSAP ScrollTrigger. Configurable lerp intensity. |
| React Three Fiber | 9.5.0 | 3D scenes/hero visuals | Optional but high-impact. React renderer for Three.js. Use for hero section 3D elements (floating logos, particle fields, abstract gaming environments). On-demand rendering means zero performance cost when 3D scene is at rest. WebGPU support with automatic WebGL 2 fallback. |
| @react-three/drei | 10.7.7 | R3F helper components | Scroll controls, prebuilt geometries, camera helpers, GPU detection. The `useDetectGPU` hook is critical: serve 3D to capable devices, fall back to 2D/video on low-end mobile. |

### Styling & UI Components

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| shadcn/ui | latest (CLI-based) | UI component foundation | Not a dependency -- CLI copies component source into your project. Full control, zero bundle bloat from unused components. 65K+ GitHub stars. Tailwind v4 support since Feb 2025. February 2026 update unified Radix UI into single package. Use the "Vega" (New York) style as base, then heavily customize for gaming aesthetic. Critical for "evolve into portal later" -- these same components become your app UI. |
| next-themes | latest | Dark/light mode | ULTRASTREAM should be dark-mode-first (gaming aesthetic), but next-themes handles system preference detection and prevents flash of wrong theme. For Tailwind v4, add `@custom-variant dark (&:where(.dark, .dark *));` to globals.css. Force dark theme on marketing pages, allow toggle in portal later. |
| @tailwindcss/typography | 4.x | Prose content styling | For blog posts, documentation, terms of service. The `prose` classes handle long-form content without custom CSS. |

### Email Capture & Waitlist

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| Resend | latest | Email sending API | Built by the React Email team. Modern API, 3,000 free emails/month. Native waitlist email template. Next.js API route integration is 10 lines of code. Developer experience is leagues ahead of SendGrid/Mailgun for a small team shipping fast. |
| React Email | latest | Email templates | Build email templates as React components. Co-designed with Resend. Type-safe, component-based emails that render correctly across Gmail, Outlook, Apple Mail. Waitlist confirmation, launch announcements all stay in your React codebase. |
| react-hook-form | latest | Form handling | Performant (uncontrolled components, minimal re-renders). Combined with Zod for type-safe validation. The industry standard for React forms in 2026. |
| Zod | 3.x / 4.x | Schema validation | TypeScript-first validation. Define once, infer types automatically. Validates waitlist form data on both client and server (same schema). `@hookform/resolvers` bridges to react-hook-form. |

### Web3 Integration (Preview/Teaser)

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| @near-wallet-selector/core | 10.1.4 | NEAR wallet connection | The official NEAR Foundation wallet selector. Supports all major NEAR wallets (MyNearWallet, HERE Wallet, Nightly, Narwallets, Ledger, WalletConnect, Ethereum wallets via chain abstraction). For the landing page, use this as a "Connect Wallet" preview/teaser -- not full dApp functionality yet. Shows technical credibility to crypto-native visitors. |
| @near-wallet-selector/modal-ui | 8.10.2 | Wallet selection modal | Pre-built modal UI for wallet selection. Saves building a custom wallet picker. Updated 6 days ago -- actively maintained. |

### Analytics & Monitoring

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| Plausible Analytics | Cloud or self-hosted | Privacy-first web analytics | GDPR-compliant out of the box. No cookie banners needed. Sub-1KB script. Perfect for a landing page where you need traffic sources, page views, and conversion tracking without enterprise complexity. $9/month cloud. For a Web3 audience, privacy-first analytics signals respect for user data -- which matters to the crypto community. |
| Vercel Analytics | built-in | Core Web Vitals, performance | Free on Vercel. Measures real user performance metrics. Ensures the site actually feels fast, not just loads fast. Zero config with Next.js 16. |

### Database (Waitlist Storage)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase | latest | Waitlist database + auth foundation | PostgreSQL under the hood. Free tier: 500MB storage, 2GB transfer. Real-time subscriptions (useful later for live viewer counts). Row-level security. Built-in auth (useful when evolving to portal). REST API works in serverless/edge. The "evolve into portal" constraint makes Supabase the right choice over Upstash -- you need relational data (user profiles, referral tracking, permissions) not just a key-value store. Start with waitlist table, grow into full user management. |

### Deployment & Infrastructure

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vercel | Pro ($20/mo) | Hosting & deployment | Native Next.js 16 support (Vercel builds Next.js). Git-push deploys, preview URLs for every PR, automatic HTTPS, global CDN. The DX savings justify $20/month when shipping on a weeks timeline. Edge Functions for wallet-gated previews later. Image Optimization API for hero graphics. |
| Cloudflare (DNS) | Free tier | DNS + DDoS protection | Point ultrastream.gg (or whatever domain) through Cloudflare for free DNS, DDoS mitigation, and CDN caching of static assets in front of Vercel. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pnpm | Package manager | Faster installs, strict dependency resolution, disk-space efficient. The standard for modern Next.js projects. |
| ESLint 9 | Linting | Next.js 16 ships with ESLint 9 support. Flat config format. |
| Prettier | Code formatting | Consistent code style across team. Use `prettier-plugin-tailwindcss` for automatic class sorting. |
| Turbopack | Bundler | Default in Next.js 16 for both dev and production. No configuration needed. |
| Husky + lint-staged | Git hooks | Pre-commit linting and formatting. Prevents broken code from reaching the repo. |

---

## Installation

```bash
# Initialize Next.js 16 project with TypeScript and Tailwind v4
npx create-next-app@latest ultrastream-web --typescript --tailwind --app --turbopack

# Core dependencies
pnpm add gsap @gsap/react motion lenis

# UI foundation
pnpm add next-themes
npx shadcn@latest init

# Forms & validation
pnpm add react-hook-form zod @hookform/resolvers

# Email
pnpm add resend @react-email/components

# Database
pnpm add @supabase/supabase-js

# NEAR wallet (add when building wallet preview)
pnpm add @near-wallet-selector/core @near-wallet-selector/modal-ui @near-wallet-selector/my-near-wallet @near-wallet-selector/here-wallet @near-wallet-selector/wallet-connect

# 3D (add only if building 3D hero)
pnpm add three @react-three/fiber @react-three/drei

# Analytics
pnpm add @vercel/analytics

# Dev dependencies
pnpm add -D @types/three prettier prettier-plugin-tailwindcss husky lint-staged
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 | Astro 5 | If the site were ONLY static content with zero interactivity and no plan to evolve into a portal. Astro ships zero JS by default but cannot grow into a web app. ULTRASTREAM needs to evolve, so Next.js wins. |
| Next.js 16 | Vite + React | If you explicitly do not want SSR/SSG and are fine with client-only rendering. Loses SEO benefits and requires separate deployment infrastructure. |
| Tailwind CSS v4 | vanilla CSS / CSS Modules | If the team has strong CSS skills and prefers writing custom CSS. Tailwind's utility approach is faster for rapid prototyping, which matters on a weeks timeline. |
| GSAP | Motion (Framer Motion) alone | If the site only needs simple component transitions. But for scroll-driven choreography, timeline sequences, and text effects (which a premium gaming site demands), GSAP is irreplaceable. Use both. |
| Supabase | Upstash Redis | If you only need a simple email list with no relational data. But the portal evolution path needs relational data (users, roles, subscriptions), making PostgreSQL/Supabase the better foundation. |
| Supabase | PlanetScale / Neon | If you need more advanced database features like branching (PlanetScale) or auto-scaling (Neon). For a waitlist that evolves into user management, Supabase's built-in auth and real-time features provide more value with less glue code. |
| Resend | SendGrid | If you need enterprise marketing automation, A/B testing on emails, or sending 100K+ emails/month. For a waitlist with <10K signups, Resend's DX and free tier are superior. |
| Vercel | Cloudflare Pages | If you want zero hosting cost and can work around SSR limitations. Cloudflare Pages has unlimited free bandwidth but Next.js 16 SSR support may lag behind Vercel's native support. For a weeks timeline, Vercel's zero-config Next.js deploy is worth $20/month. |
| Vercel | Self-hosted (Coolify + VPS) | If budget is the primary constraint and you have DevOps experience. A Hetzner VPS at ~$9/month gives full control. But setup time eats into the weeks timeline. |
| Plausible | PostHog | If you need product analytics (funnels, session replay, feature flags) in addition to web analytics. PostHog's free tier is generous (1M events/month). Consider switching to PostHog when the portal launches and you need product analytics. For a landing page, Plausible's simplicity wins. |
| Plausible | Google Analytics 4 | Never for a Web3 project. GA4 requires cookie consent banners, has GDPR complexity, and signals to crypto-native users that you do not respect privacy. Plausible is the correct choice for this audience. |
| shadcn/ui | Chakra UI / Mantine | If you want a fully managed component library with built-in dark mode, responsive styles, etc. But shadcn/ui gives full source control -- critical for the heavy visual customization a gaming site needs. You cannot make Chakra "look like a gaming platform" without fighting it. shadcn/ui components are yours to reshape. |
| React Three Fiber | Raw Three.js | If the 3D developer is more comfortable with imperative Three.js. But in a React/Next.js codebase, R3F's declarative approach is cleaner and integrates with React's lifecycle. |
| Motion (Framer Motion) | CSS animations | For very simple animations (fade in, slide up). But CSS animations cannot handle spring physics, gesture tracking, or layout animations. Motion's API is worth the 30KB bundle. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Next.js 15 or earlier | 15.x has a critical CVSS 10.0 RCE vulnerability in the React Server Components protocol. All 13.x-16.x users must upgrade, but starting fresh means starting on 16. Also, Turbopack was not yet stable for production in 15. | Next.js 16.1.6 |
| Tailwind CSS v3 | Legacy JavaScript config system. Slower builds. No OKLCH colors. No cascade layers. Tailwind v4 is the default for new projects since January 2025. | Tailwind CSS v4 |
| `framer-motion` package name | The library rebranded to "Motion". The old `framer-motion` npm package still works but is the legacy name. New projects should use `motion`. | `motion` (npm package) |
| Create React App (CRA) | Deprecated. No SSR, no SSG, no file-based routing, no API routes. Cannot evolve into a portal. | Next.js 16 |
| Google Analytics | Requires cookie consent banners. GDPR compliance overhead. Signals disrespect for privacy to crypto-native users. GA4's implementation complexity is disproportionate for a landing page. | Plausible Analytics |
| Material UI (MUI) | Opinionated design language (Google's Material Design) that is extremely difficult to customize into a gaming/Web3 aesthetic. Heavy bundle size. Fighting MUI's design system wastes the timeline. | shadcn/ui + custom Tailwind theme |
| Webpack | Turbopack is the default bundler in Next.js 16. Webpack is legacy. No configuration needed to switch. | Turbopack (built into Next.js 16) |
| npm / yarn classic | npm's flat node_modules causes phantom dependencies. Yarn classic is legacy. pnpm's strict resolution prevents "works on my machine" bugs. | pnpm |
| Firebase | Google ecosystem lock-in. Proprietary database (Firestore) is difficult to migrate from. Supabase provides equivalent features (auth, realtime, storage) on open-source PostgreSQL. | Supabase |
| Mailchimp / ConvertKit | Marketing email platforms with bloated embed scripts, branded forms, and limited API control. A developer-first stack (Resend + React Email) gives full control over the waitlist experience. | Resend + React Email |
| near-wallet-selector (unscoped) | The old `near-wallet-selector` package (v2.1.0) is 4 years old and unsupported. | `@near-wallet-selector/core` v10.1.4 |
| jQuery / jQuery animations | Legacy library. Zero reason to use in a React project. GSAP and Motion handle everything jQuery did, better. | GSAP + Motion |
| Styled Components / Emotion | CSS-in-JS runtime libraries add bundle size and runtime cost. Tailwind v4's utility-first approach with CSS variables is faster at build time and runtime. | Tailwind CSS v4 |

---

## Stack Patterns by Variant

**If the 3D hero section proves too heavy for mobile:**
- Use `@react-three/drei`'s `useDetectGPU` hook to check device capability
- Serve a video loop or Lottie animation to low-tier GPUs
- Keep the R3F scene for desktop/high-end mobile only
- This is the recommended progressive enhancement pattern

**If the timeline is under 2 weeks:**
- Skip React Three Fiber entirely
- Use GSAP + Motion for all visual impact
- A well-executed 2D site with premium scroll animations beats a half-baked 3D site
- Add 3D in a later iteration when the portal is being built

**If you want zero backend (simplest possible waitlist):**
- Replace Supabase with a Google Form or Typeform embed
- Use Resend for confirmation emails only (triggered by form webhook)
- Trade flexibility for speed; migrate to Supabase when building the portal
- NOT recommended because it limits the "evolve into portal" path

**If wallet connect is just a teaser (not functional):**
- Install `@near-wallet-selector/core` and `@near-wallet-selector/modal-ui`
- Show the wallet connection modal on button click
- Display "Coming soon" after wallet selection
- This signals Web3 readiness without needing backend contract integration

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.1.6 | React 19.2.4 | Next.js 16 requires React 19.2+. Do not pin React to 19.0 or 19.1. |
| Next.js 16.1.6 | TypeScript 5.8+ | Stable Turbopack requires TS 5.7+. Use 5.8 for `--erasableSyntaxOnly` support. |
| Tailwind CSS v4 | Next.js 16 | Use `@tailwindcss/postcss` (not the old `tailwindcss` PostCSS plugin). `create-next-app` handles this automatically. |
| GSAP 3.14 | React 19 | Use `@gsap/react` for the `useGSAP()` hook. Works with React 19's concurrent features. |
| Motion 12.34+ | React 19 | Fully compatible. Uses Web Animations API with JavaScript fallback. |
| @near-wallet-selector/core 10.1.4 | React 19 | Verify compatibility -- NEAR packages sometimes lag on React major versions. Test early. |
| shadcn/ui | Tailwind v4 + Next.js 16 | Supported since Feb 2025. Use unified `radix-ui` package (Feb 2026 update). Run `npx shadcn@latest init` which auto-detects your framework. |
| Supabase JS | Next.js 16 | Use `@supabase/ssr` for server-side auth in App Router. Standard `@supabase/supabase-js` for client. |
| React Three Fiber 9.5.0 | React 19 | R3F v9 supports React 19. Requires Three.js r160+. |
| Lenis 1.3.17 | GSAP 3.14 | Lenis integrates with GSAP ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`. |
| next-themes | Tailwind v4 | Requires `@custom-variant dark (&:where(.dark, .dark *));` in globals.css for `dark:` classes to work with theme toggle. |

---

## Critical Security Note

All Next.js 13.x, 14.x, 15.x, and 16.x versions prior to their latest patches have a **CVSS 10.0 vulnerability** in the React Server Components protocol allowing remote code execution. Always use the latest patch version (16.1.6 as of this writing). Pin to `next@latest` and monitor Vercel security advisories.

---

## Sources

- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) -- Next.js 16 features, Turbopack stable, React 19.2 (HIGH confidence)
- [Next.js 16.1 Blog Post](https://nextjs.org/blog/next-16-1) -- Turbopack file system caching, bundle analyzer (HIGH confidence)
- [Next.js Version 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- Migration details, breaking changes (HIGH confidence)
- [Tailwind CSS v4.0 Blog](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, performance, OKLCH colors (HIGH confidence)
- [GSAP Homepage](https://gsap.com/) -- Free licensing, plugin availability, version 3.14 (HIGH confidence)
- [Motion Changelog](https://motion.dev/changelog) -- Version 12.34+, AnimateView, hardware acceleration (HIGH confidence)
- [Motion Upgrade Guide](https://motion.dev/docs/react-upgrade-guide) -- Framer Motion to Motion migration (HIGH confidence)
- [Lenis GitHub](https://github.com/darkroomengineering/lenis) -- v1.3.17, features, integration (HIGH confidence)
- [React Three Fiber GitHub](https://github.com/pmndrs/react-three-fiber) -- v9.5.0, React 19 support (HIGH confidence)
- [NEAR Wallet Selector Docs](https://docs.near.org/tools/wallet-selector) -- Official NEAR documentation (HIGH confidence)
- [@near-wallet-selector/core npm](https://www.npmjs.com/package/@near-wallet-selector/core) -- v10.1.4, publish date (HIGH confidence)
- [Resend](https://resend.com) -- Email API, pricing, React Email integration (HIGH confidence)
- [React Email + Resend Docs](https://react.email/docs/integrations/resend) -- Integration guide (HIGH confidence)
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog) -- Feb 2026 unified Radix, Jan 2026 RTL (HIGH confidence)
- [Plausible Analytics](https://plausible.io) -- Privacy-first analytics, GDPR compliance (MEDIUM confidence, pricing from WebSearch)
- [Vercel Pricing](https://vercel.com/pricing) -- Hobby/Pro plans, usage limits (HIGH confidence)
- [Supabase](https://supabase.com) -- PostgreSQL, free tier, auth (MEDIUM confidence, comparative data from WebSearch)
- [TypeScript 5.8 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html) -- erasableSyntaxOnly flag (HIGH confidence)
- [React 19.2 Blog](https://react.dev/blog/2025/10/01/react-19-2) -- Activity component, View Transitions (HIGH confidence)
- [DigitalOcean - Vercel Alternatives](https://www.digitalocean.com/resources/articles/vercel-alternatives) -- Hosting comparison (MEDIUM confidence)
- [LegalForge - Privacy Analytics 2026](https://www.legal-forge.com/en/blog/privacy-first-analytics-alternatives-2026/) -- Plausible vs PostHog vs Mixpanel comparison (MEDIUM confidence)
- [Three.js in 2026 - Utsubo](https://www.utsubo.com/blog/threejs-2026-what-changed) -- WebGPU support, ecosystem trends (MEDIUM confidence)

---
*Stack research for: ULTRASTREAM Web3 Gaming Streaming Platform -- Marketing/Landing Website*
*Researched: 2026-02-28*
