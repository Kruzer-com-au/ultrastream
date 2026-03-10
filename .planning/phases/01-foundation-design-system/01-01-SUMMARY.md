---
phase: 01-foundation-design-system
plan: 01
subsystem: scaffold
tags: [nextjs, tailwind, darktheme, grid, preloader, routing]
dependency-graph:
  requires: []
  provides: [nextjs-scaffold, dark-theme, grid-system, preloader, route-groups]
  affects: [01-02, 02-01, 02-02]
tech-stack:
  added: [next@16.1.6, react@19.2.3, tailwindcss@4.2.1, typescript@5.9.3, gsap@3.14.2, motion@12.34.3, lenis@1.3.17, next-themes@0.4.6, clsx@2.1.1, tailwind-merge@3.5.0]
  patterns: [app-router, route-groups, css-first-tailwind, perspective-grid]
key-files:
  created:
    - package.json
    - src/styles/globals.css
    - src/styles/fonts.ts
    - src/lib/utils/cn.ts
    - src/app/layout.tsx
    - src/app/(marketing)/layout.tsx
    - src/app/(marketing)/page.tsx
    - src/app/(portal)/layout.tsx
    - src/app/(portal)/portal/page.tsx
    - src/app/not-found.tsx
    - src/app/loading.tsx
    - src/components/layout/grid-system.tsx
    - src/components/layout/preloader.tsx
    - vercel.json
    - .env.example
  modified: []
decisions:
  - "Used Oswald + Inter font pairing for display/body hierarchy"
  - "Portal route group at /portal path to avoid root route conflict with marketing"
  - "Static col-span map in grid-system.tsx instead of dynamic Tailwind classes"
  - "CSS keyframe animations for preloader instead of GSAP (lightweight initial load)"
metrics:
  duration: ~10min
  completed: 2026-02-28
---

# Phase 1 Plan 01: Project Scaffold, Dark Theme, 3D Grid Summary

Next.js 16.1.6 project scaffolded with App Router, TypeScript 5.9, Tailwind v4 CSS-first config, dark ULTRASTREAM theme, 3D perspective grid, epic preloader, and (marketing)/(portal) route groups.

## What Was Built

### Project Foundation
- Next.js 16.1.6 with React 19.2.3, TypeScript 5.9.3, Tailwind v4.2.1
- pnpm package manager with all animation deps pre-installed
- App Router with `src/` directory structure
- Root layout with dark theme forced via next-themes, Oswald + Inter fonts

### Dark Theme System (globals.css @theme)
- ULTRASTREAM color palette: void (#050505), abyss (#0a0a0a), obsidian (#111111), gunmetal (#1a1a2e)
- Neon accents: blue (#00d4ff), purple (#7b2ff7), red (#ff0040), pink (#ff00ff)
- Metallic golds: dark (#b8860b), standard (#ffd700), light (#ffe55c)
- Text hierarchy: primary (#f0f0f0), secondary (#a0a0b0), muted (#6b7280)
- Glow shadows using OKLCH for blue, purple, and gold neon effects
- Custom scrollbar, selection colors, z-index scale

### 3D Grid Layout System
- `GridSystem`: 12-column grid with CSS `perspective: 1200px`
- `GridCell`: Static col-span maps (1-12) for Tailwind compatibility, depth presets (near/mid/far) with translateZ transforms, glow border colors
- Responsive: 1 col mobile, 6 col tablet, 12 col desktop; 3D transforms only on lg+
- Hover: cells lift with translateZ(30px) and scale 1.03

### Epic Preloader
- Full-screen void overlay at z-9999
- ULTRASTREAM logo with gold gradient, fadeInScale animation
- Neon blue/purple loading bar, 0-100% over 1.5s
- Exit: slide up + fade out, adds `preloader-done` class to body
- Pure CSS animations (no GSAP dependency at load time)

### Route Groups
- `(marketing)`: Header with gold logo + nav, main content, footer with copyright
- `(portal)`: Stub at `/portal` with "Coming Soon" page and purple accent banner
- Custom 404 page with neon glow "404" text

### Deployment Config
- vercel.json with security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy)
- .env.example with placeholder vars for future analytics, email, database

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] pnpm not installed globally**
- **Found during:** Task 1, Step 1
- **Issue:** `create-next-app --use-pnpm` failed with ENOENT because pnpm was not globally installed
- **Fix:** Ran `npm install -g pnpm` before retrying
- **Commit:** 53072b0

**2. [Rule 3 - Blocking] Directory name with spaces**
- **Found during:** Task 1, Step 1
- **Issue:** `create-next-app .` failed because "ULTASTREAM WEBSITE" contains spaces and capitals
- **Fix:** Created in temp subdirectory, moved files to root, reinstalled with pnpm install

**3. [Rule 1 - Bug] Route group conflict at `/`**
- **Found during:** Task 1, build verification
- **Issue:** Both `(marketing)/page.tsx` and `(portal)/page.tsx` resolved to `/`, causing build failure
- **Fix:** Moved portal page to `(portal)/portal/page.tsx` so it resolves to `/portal`

**4. [Rule 1 - Bug] React 19 useRef requires initial value**
- **Found during:** Build verification
- **Issue:** `useRef<ReturnType<typeof setTimeout>>()` without argument fails in React 19 strict types
- **Fix:** Added `undefined` as initial value

## Commits

| Commit | Description |
|--------|-------------|
| 53072b0 | feat(01-01): scaffold ULTRASTREAM Next.js 16 project with dark theme and 3D grid |

## Verification

- [x] `pnpm build` succeeds with zero errors
- [x] `pnpm dev` starts in ~600ms
- [x] Route `/` serves the marketing page
- [x] Route `/portal` serves the portal coming soon page
- [x] Dark theme applied globally (bg-abyss, text-text-primary)
- [x] Oswald and Inter fonts configured via CSS variables
- [x] Preloader, GridSystem, GridCell components export correctly
- [x] TypeScript strict mode passes
