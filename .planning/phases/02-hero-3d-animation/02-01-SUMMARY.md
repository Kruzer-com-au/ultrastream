---
phase: 02-hero-3d-animation
plan: 01
subsystem: hero-3d-scene
tags: [r3f, three.js, 3d, hero, particles, gpu-detection, gsap, animation]
dependency_graph:
  requires: [01-01, 01-02]
  provides: [hero-section, gpu-detection, mouse-parallax, 3d-scene]
  affects: [landing-page, scroll-engine]
tech_stack:
  added: [three, "@react-three/fiber", "@react-three/drei", "@pmndrs/detect-gpu"]
  patterns: [dynamic-import-ssr-false, ref-based-mouse-tracking, gpu-tier-routing, code-splitting]
key_files:
  created:
    - src/components/hero/HeroScene.tsx
    - src/components/hero/HeroParticles.tsx
    - src/components/hero/HeroGeometry.tsx
    - src/components/hero/LogoReveal.tsx
    - src/components/hero/Manifesto.tsx
    - src/components/hero/HeroFallback.tsx
    - src/components/hero/HeroSection.tsx
    - src/hooks/useMouseParallax.ts
    - src/hooks/useGPUDetect.ts
  modified:
    - src/app/(marketing)/page.tsx
    - package.json
decisions:
  - "Used HTML overlay for logo/manifesto instead of 3D text meshes for crisp rendering and accessibility"
  - "Manual character splitting for manifesto instead of GSAP SplitText to avoid plugin dependency"
  - "Two-layer particle system (blue foreground + purple deep) for depth separation"
  - "Custom BufferGeometry angular shard alongside standard Three.js primitives"
  - "Module-level cache for GPU detection to prevent re-detection across re-renders"
  - "CSS-only fallback with animated SVG wireframes and scan line effect for low-GPU devices"
metrics:
  duration: "~4 minutes"
  completed: "2026-02-28"
  tasks_completed: 2
  tasks_total: 2
  files_created: 9
  files_modified: 2
---

# Phase 2 Plan 1: 3D Hero Scene, Logo Reveal, and Manifesto Summary

Immersive R3F 3D hero with 2600+ particles across two depth layers, 6 metallic geometric shapes, dramatic 4-light setup, animated logo reveal with metallic shimmer, and aggressive character-by-character manifesto reveal with screen-shake impact.

## What Was Built

### 3D Scene (HeroScene.tsx)
R3F Canvas with fixed camera (FOV 60), transparent alpha background, clamped DPR [1,2], and PerformanceMonitor that auto-adjusts DPR on FPS drops. Scene contains fog for depth fade (5-15 units), ambient light at 0.08, and four accent lights: electric blue rim (top-right), deep purple fill (bottom-left), gold accent (behind camera), and white top-down spot.

### Particle Systems (HeroParticles.tsx)
Two particle layers using `@react-three/drei` Points + PointMaterial with additive blending:
- **Foreground**: 1800 particles in sphere distribution (radius 8), electric blue (#00d4ff), slow rotation + breathing scale animation + mouse parallax
- **Deep layer**: 800 particles (radius 12), purple (#8b5cf6), pushed back on z-axis, counter-rotating, subtler parallax

### Floating Geometry (HeroGeometry.tsx)
6 metallic shapes (metalness 0.9, roughness 0.1) with emissive glow in brand accent colors:
- 2x Icosahedron (crystalline polyhedra) -- blue and purple emissive
- 2x Octahedron (diamond shards) -- red and purple emissive
- 1x Torus (ring of power) -- gold emissive
- 1x Custom BufferGeometry angular blade/shard -- blue emissive

Each shape wrapped in `Float` component for gentle bobbing, individual rotation on all axes at different speeds, and depth-weighted mouse parallax.

### Mouse Parallax (useMouseParallax.ts)
Ref-based tracking (no state re-renders) with lerp smoothing (factor 0.05) via requestAnimationFrame loop. Normalized -1 to 1 viewport-relative coordinates. Falls back to DeviceOrientationEvent on mobile.

### Logo Reveal (LogoReveal.tsx)
GSAP timeline animation sequence:
1. Emerge from void: opacity 0 + blur 10px + scale 1.1 --> clear at scale 1.0 (0.8s)
2. Metallic shimmer: gradient overlay sweeps left-to-right (0.6s)
3. Glow pulse: text-shadow expands then settles with brand accent colors

Styled with metallic gradient (white-gold-white) via background-clip: text, font-display at 6xl/8xl/9xl responsive.

### Manifesto (Manifesto.tsx)
Manual character splitting into individual spans, animated with GSAP stagger:
- Line 1: "FOR THE PEOPLE. BY THE REBELS." -- white, bold, wide tracking
- Line 2: "AGAINST CORPORATE STREAMING." -- neon-red (#ff3366) with glow
- 0.02s stagger per character, power4.out easing for aggressive snap
- Screen-shake impact (2px random offset, 4 repeats) on final reveal

### GPU Detection (useGPUDetect.ts)
Async GPU tier detection via `@pmndrs/detect-gpu` with module-level cache. Combines GPU tier with hardware concurrency check and mobile detection. Returns tier 0-3 for conditional rendering decisions.

### CSS Fallback (HeroFallback.tsx)
Multi-layer radial gradient background (deep blue center, purple bottom-left, red right), SVG noise texture overlay at 3% opacity, 4 floating animated SVG wireframe shapes (icosahedron, octahedron, diamond, triangle) with CSS keyframe rotation, and subtle scan line effect.

### Hero Assembly (HeroSection.tsx)
Orchestrator that uses useGPUDetect to route: tier >= 2 gets full R3F (dynamically imported with ssr:false), tier < 2 gets CSS fallback. Both share identical logo + manifesto overlays. Loading state shows dark gradient matching fallback to avoid flash. Scroll indicator at bottom with animated dot.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Added second particle layer for depth**
- **Found during:** Task 1
- **Issue:** Single particle layer lacked depth perception
- **Fix:** Added HeroParticlesDeep with 800 purple particles at larger radius, counter-rotating, with subtler parallax
- **Files modified:** src/components/hero/HeroParticles.tsx

**2. [Rule 1 - Bug] Used manual char splitting instead of GSAP SplitText**
- **Found during:** Task 2
- **Issue:** SplitText plugin may not be available/registered in the bundle
- **Fix:** Manual splitting into spans with inline-block display, preserving whitespace
- **Files modified:** src/components/hero/Manifesto.tsx

**3. [Rule 2 - Missing critical functionality] Added gradient overlay for text readability**
- **Found during:** Task 2
- **Issue:** Text over 3D scene could be hard to read without contrast
- **Fix:** Added bottom-gradient overlay (transparent to rgba(5,5,5,0.8)) between 3D and content
- **Files modified:** src/components/hero/HeroSection.tsx
