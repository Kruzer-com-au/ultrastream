'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import dynamic from 'next/dynamic';
import { useAudio } from '@/hooks/useAudio';
import { PortalMessages } from './PortalMessages';
import { BLOOM_MESSAGES } from '@/data/portal-messages';
import { useIsMobile } from '@/lib/hooks/use-media-query';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Dynamic imports for heavy 3D components (no SSR -- they use R3F / browser APIs)
const DynamicStargateHero = dynamic(
  () =>
    import('./StargateHero').then((mod) => ({
      default: mod.StargateHero,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
        <div
          className="text-sm font-bold tracking-[0.3em] uppercase opacity-40 animate-pulse"
          style={{ color: '#00d4ff' }}
        >
          INITIALIZING PORTAL...
        </div>
      </div>
    ),
  }
);

const DynamicWarpTunnel = dynamic(
  () => import('./WarpTunnel').then((mod) => ({ default: mod.WarpTunnel })),
  { ssr: false }
);

// ============================================================
// PORTAL JOURNEY -- Master Scroll Orchestrator
// ============================================================
//
// Architecture: ONE ScrollTrigger drives ALL phases.
//
// Desktop: 450vh tall section, Mobile: 300vh (less finger travel).
// The pinned viewport contains two stacked layers:
//   Layer 1: StargateHero (3D portal + text)
//   Layer 2: WarpTunnel (hyperspace transit)
//
// On MOBILE, canvas lifecycle is staggered to prevent two
// simultaneous WebGL contexts from running (GPU killer).
// Hero unmounts when warp takes over, behind the bloom mask.
//
// A white bloom overlay (fixed-position) masks transitions
// between layers. The bloom lifecycle is COMPLETE within
// the master ScrollTrigger -- it fades in AND out before
// the pin releases, ensuring no stale overlays persist.
//
// Scroll phases (progress 0-1):
//   0.00 - 0.45: Hero phase (camera zooms into portal, text fades)
//   0.40 - 0.55: Transition bloom (hero -> warp)
//   0.48 - 0.88: Warp phase (hyperspace tunnel transit)
//   0.85 - 0.98: Exit bloom (warp -> end, fully fades before unpin)
//   1.00:         Unpin -- battle section flows naturally
//
// All opacity values are managed through React state to avoid
// conflicts between direct DOM manipulation and React re-renders.
// ============================================================

interface PortalJourneyProps {
  children: React.ReactNode; // BattleGameWrapper goes here
}

export function PortalJourney({ children }: PortalJourneyProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const battleRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  const isMobileRef = useRef(false);

  // Keep ref in sync for ScrollTrigger callback (avoids stale closure)
  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  // --- Refs for high-frequency ScrollTrigger updates (no re-renders) ---
  const heroProgressRef = useRef(0);
  const warpProgressRef = useRef(0);
  const heroLayerOpRef = useRef(1);
  const warpLayerOpRef = useRef(0);
  const bloomOpRef = useRef(0);
  const warpMountedRef = useRef(false);
  const heroMountedRef = useRef(true);

  // --- React state for rendering (synced from refs every ~3 frames) ---
  const [heroProgress, setHeroProgress] = useState(0);
  const [warpProgress, setWarpProgress] = useState(0);
  const [heroLayerOp, setHeroLayerOp] = useState(1);
  const [warpLayerOp, setWarpLayerOp] = useState(0);
  const [bloomOp, setBloomOp] = useState(0);
  const [warpVisible, setWarpVisible] = useState(false);
  const [heroMounted, setHeroMounted] = useState(true);

  // --- Audio integration ---
  const { playPortalAmbience, playWarpAmbience, stopAllAmbience, playSFX } = useAudio();
  const audioPhaseRef = useRef<'none' | 'portal' | 'warp'>('none');

  // --- Visibility-gated state sync ---
  // Only syncs refs → state when section is in/near viewport.
  // Stops rAF work when user scrolls past the portal section.
  useEffect(() => {
    let frameCount = 0;
    let rafId: number | null = null;
    let isVisible = true;

    function sync() {
      frameCount++;
      if (frameCount % 3 === 0 && isVisible) {
        setHeroProgress(heroProgressRef.current);
        setWarpProgress(warpProgressRef.current);
        setHeroLayerOp(heroLayerOpRef.current);
        setWarpLayerOp(warpLayerOpRef.current);
        setBloomOp(bloomOpRef.current);
      }
      rafId = requestAnimationFrame(sync);
    }

    // IntersectionObserver: pause sync when section is off-screen
    let observer: IntersectionObserver | null = null;
    if (sectionRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        { rootMargin: '200px' }
      );
      observer.observe(sectionRef.current);
    }

    rafId = requestAnimationFrame(sync);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, []);

  // === MASTER SCROLL ORCHESTRATION ===
  useGSAP(
    () => {
      if (!sectionRef.current || !pinRef.current || !battleRef.current) return;

      // --------------------------------------------------------
      // MASTER ScrollTrigger: pin the viewport, drive all phases
      // --------------------------------------------------------
      const masterST = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinRef.current,
        pinSpacing: false,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const mobile = isMobileRef.current;

          // --- Compute phase progress ---
          // Hero: 0->1 over progress 0->0.45
          heroProgressRef.current = Math.min(1, p / 0.45);

          // Warp: 0->1 over progress 0.48->0.88
          warpProgressRef.current = Math.max(
            0,
            Math.min(1, (p - 0.48) / 0.40)
          );

          // --- Mount/unmount canvas lifecycle ---
          if (mobile) {
            // MOBILE: Stagger canvases to avoid 2 simultaneous WebGL contexts
            // Mount warp at 0.42 (later than desktop, just before bloom covers hero)
            if (p > 0.42 && !warpMountedRef.current) {
              warpMountedRef.current = true;
              setWarpVisible(true);
            }
            // Unmount hero canvas once bloom fully covers it (0.48)
            if (p > 0.48 && heroMountedRef.current) {
              heroMountedRef.current = false;
              setHeroMounted(false);
            }
            // Re-mount hero if scrolling back up
            if (p < 0.40 && !heroMountedRef.current) {
              heroMountedRef.current = true;
              setHeroMounted(true);
            }
          } else {
            // DESKTOP: Mount warp early for GPU warm-up (both canvases can coexist)
            if (p > 0.35 && !warpMountedRef.current) {
              warpMountedRef.current = true;
              setWarpVisible(true);
            }
          }

          // --- Unmount warp canvas after exit bloom completes ---
          // Frees WebGL context before battle section takes over
          if (p > 0.96 && warpMountedRef.current) {
            warpMountedRef.current = false;
            setWarpVisible(false);
          }
          // Re-mount warp if scrolling back into warp phase
          if (p < 0.90 && p > 0.35 && !warpMountedRef.current) {
            warpMountedRef.current = true;
            setWarpVisible(true);
          }

          // --- Layer opacities ---
          // Hero: visible until bloom covers, then fades out
          heroLayerOpRef.current =
            p < 0.46 ? 1 : Math.max(0, 1 - (p - 0.46) / 0.04);

          // Warp: fades in behind bloom
          warpLayerOpRef.current =
            p < 0.44 ? 0 : Math.min(1, (p - 0.44) / 0.06);

          // --- Bloom transitions (complete lifecycle within ST) ---
          let bloom = 0;

          // Hero -> Warp bloom: in at 0.40-0.47, out at 0.47-0.55
          if (p >= 0.40 && p < 0.55) {
            if (p < 0.47) {
              bloom = (p - 0.40) / 0.07;
            } else {
              bloom = 1 - (p - 0.47) / 0.08;
            }
          }

          // Warp -> End bloom: in at 0.85-0.92, out at 0.92-0.98
          if (p >= 0.85 && p < 0.98) {
            const exitBloom =
              p < 0.92
                ? (p - 0.85) / 0.07
                : 1 - (p - 0.92) / 0.06;
            bloom = Math.max(bloom, exitBloom);
          }

          bloomOpRef.current = Math.max(0, Math.min(1, bloom));

          // --- Audio phase triggers ---
          if (p > 0.02 && audioPhaseRef.current === 'none') {
            audioPhaseRef.current = 'portal';
            playPortalAmbience();
          }
          if (p > 0.42 && audioPhaseRef.current === 'portal') {
            audioPhaseRef.current = 'warp';
            playWarpAmbience();
          }
          // Bloom whoosh SFX at transition peaks
          if (p >= 0.46 && p < 0.48 && bloomOpRef.current > 0.9) {
            playSFX('bloom-whoosh');
          }
          if (p >= 0.91 && p < 0.93 && bloomOpRef.current > 0.9) {
            playSFX('bloom-whoosh');
          }
        },
      });

      // --------------------------------------------------------
      // BATTLE ENTRANCE: slide up + fade in after section ends
      // --------------------------------------------------------
      gsap.fromTo(
        battleRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: battleRef.current,
            start: 'top 95%',
            end: 'top 50%',
            scrub: true,
          },
        }
      );

      return () => {
        masterST.kill();
        stopAllAmbience(500);
      };
    },
    { scope: sectionRef }
  );

  return (
    <>
      {/* ============================================================
          PORTAL JOURNEY SECTION -- scroll container
          Desktop: 450vh, Mobile: 300vh (CSS media query avoids flash)
          Contains the pinned viewport with hero + warp layers.
          ============================================================ */}
      <section
        ref={sectionRef}
        className="relative w-full portal-section-height"
        id="portal-journey"
      >
        {/* Pinned viewport: sticks to screen while section scrolls */}
        <div
          ref={pinRef}
          className="relative w-full overflow-hidden"
          style={{ height: '100vh', background: '#050505', willChange: 'transform' }}
        >
          {/* Layer 1: Stargate Hero (3D portal + text overlay) */}
          {/* On mobile, unmounted once warp takes over to free GPU */}
          <div
            className="absolute inset-0"
            style={{ zIndex: 1, opacity: heroLayerOp }}
          >
            {heroMounted && (
              <DynamicStargateHero scrollProgress={heroProgress} />
            )}
          </div>

          {/* Layer 2: Warp Tunnel (hyperspace transit) */}
          <div
            className="absolute inset-0"
            style={{ zIndex: 2, opacity: warpLayerOp }}
          >
            {warpVisible && (
              <>
                <DynamicWarpTunnel progress={warpProgress} visible={true} isMobile={isMobile} />

                {/* Portal messages -- scroll-driven text during warp phase */}
                <PortalMessages warpProgress={warpProgress} />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHITE BLOOM OVERLAY -- Transition mask
          Fixed for full-screen coverage. Uses visibility:hidden when
          opacity is 0 to prevent rendering overhead and avoid
          interfering with sections below the portal journey.
          ============================================================ */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 9999,
          opacity: bloomOp,
          visibility: bloomOp > 0.001 ? 'visible' : 'hidden',
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,1) 0%, rgba(200,230,255,0.95) 40%, rgba(100,180,255,0.6) 70%, rgba(5,5,5,0) 100%)',
        }}
      >
        {/* Bloom transition text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p
            className="font-display font-black tracking-[0.25em] uppercase text-center px-4"
            style={{
              fontSize: 'clamp(28px, 6vw, 64px)',
              color: '#050505',
              opacity: bloomOp > 0.6 ? 1 : 0,
              transition: 'opacity 0.2s ease',
              textShadow: '0 0 30px rgba(255,255,255,0.5)',
              maxWidth: '80vw',
            }}
          >
            {heroProgress < 0.95 ? BLOOM_MESSAGES.heroToWarp : BLOOM_MESSAGES.warpToBattle}
          </p>
        </div>
      </div>

      {/* ============================================================
          BATTLE REVEAL -- Emerges after warp transit.
          Children = BattleGameWrapper.
          ============================================================ */}
      <div
        ref={battleRef}
        className="relative w-full"
        style={{ zIndex: 5 }}
      >
        {children}
      </div>

      {/* ============================================================
          NOSCRIPT FALLBACK -- If JS fails, content flows normally
          ============================================================ */}
      <noscript>
        <style>{`
          .fixed { position: static !important; }
        `}</style>
      </noscript>
    </>
  );
}
