"use client";

import { Suspense, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { useIsMobile } from "@/lib/hooks/use-media-query";
import { StargateRing } from "./StargateRing";
import { EventHorizon } from "./EventHorizon";
import { PortalKawoosh } from "./PortalKawoosh";
import { PortalParticles } from "./PortalParticles";

/**
 * The complete Stargate 3D scene -- orchestrates the activation sequence
 * and contains all portal sub-components.
 *
 * Enhanced activation sequence (~5 seconds after mount):
 *   0.0s - Silence, brief anticipation
 *   0.3s - Ring begins spinning up, first chevrons start locking
 *   1.0s - Chevrons locking with dramatic pauses between each lock
 *   2.2s - All chevrons locked, brief dramatic pause
 *   2.5s - Event horizon begins forming (unstable shimmer)
 *   3.2s - Kawoosh fires -- energy blast toward camera
 *   3.2s - Dynamic point light spikes white, transitions to blue
 *   5.0s - Scene settles into ambient shimmer
 *
 * Scene enhancements:
 *   - Dynamic PointLight that spikes on kawoosh
 *   - God rays: ConeGeometry with rotating light beams from portal
 *   - Better activation timing with dramatic pauses at lock moments
 *
 * Scroll-driven camera animation:
 *   - scrollProgress 0-1 drives camera from [0,0,8] into the portal [0,0,0.5]
 *   - FOV widens 50->90 for "sucking in" effect
 *   - Subtle camera shake as camera approaches (>0.7)
 *   - Mouse parallax diminishes as scroll increases
 *   - Portal effects intensify (god rays, event horizon, particles)
 */

// ============================================================
// GOD RAY SHADER -- rotating light beams from the portal
// ============================================================
const godRayVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    vUv = uv;
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const godRayFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uActivation;
  uniform float uZoomIntensity;

  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    // Angle around the cone axis
    float angle = atan(vPos.x, vPos.y);

    // Create rotating beam pattern
    float beamCount = 6.0;
    float beams = sin(angle * beamCount + uTime * 0.8) * 0.5 + 0.5;
    beams = pow(beams, 4.0); // Sharpen beams

    // Second layer of beams, rotating opposite direction
    float beams2 = sin(angle * 4.0 - uTime * 0.5) * 0.5 + 0.5;
    beams2 = pow(beams2, 3.0);

    float combined = beams * 0.6 + beams2 * 0.4;

    // Fade along the cone length (brighter at base near portal)
    float lengthFade = 1.0 - vUv.y;
    lengthFade = pow(lengthFade, 2.0);

    // Radial fade (softer at cone edges)
    float radialDist = length(vPos.xy);
    float radialFade = 1.0 - smoothstep(0.0, 3.0, radialDist);

    // Color: blue-white, intensifying toward white as zoom increases
    vec3 baseColor = mix(
      vec3(0.0, 0.5, 1.0),
      vec3(0.3, 0.6, 1.0),
      beams
    );
    vec3 zoomColor = mix(baseColor, vec3(0.6, 0.8, 1.0), uZoomIntensity * 0.5);

    // Base alpha increases with zoom intensity
    float baseAlpha = 0.12 + uZoomIntensity * 0.18;
    float alpha = combined * lengthFade * radialFade * uActivation * baseAlpha;

    gl_FragColor = vec4(zoomColor, alpha);
  }
`;

// ============================================================
// CAMERA CONTROLLER -- scroll-driven camera zoom into portal
// ============================================================

interface CameraControllerProps {
  scrollProgress: number;
}

/**
 * Animates camera position and FOV based on scroll progress.
 * Position: [0, 0, 8] -> [0, 0, 0.5]
 * FOV: 50 -> 90 (creates "sucking in" wide-angle distortion)
 * Adds subtle camera shake when very close to portal (scrollProgress > 0.7)
 */
function CameraController({ scrollProgress }: CameraControllerProps) {
  const { camera } = useThree();
  const shakeOffsetRef = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    const perspCam = camera as THREE.PerspectiveCamera;
    const t = scrollProgress;

    // Smooth easing curve -- slow start, accelerate in middle, ease into portal
    // Using a custom cubic bezier-like curve
    const eased = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Camera Z position: 8 -> 0.5
    const targetZ = THREE.MathUtils.lerp(8, 0.5, eased);

    // FOV: 50 -> 90 (widening for "sucking in" feel)
    const targetFOV = THREE.MathUtils.lerp(50, 90, eased);

    // Camera shake when close to portal (scrollProgress > 0.7)
    let shakeX = 0;
    let shakeY = 0;
    if (t > 0.7) {
      const shakeIntensity = (t - 0.7) / 0.3; // 0-1 over the last 30%
      const shakeMag = shakeIntensity * 0.06; // Max shake magnitude
      const time = state.clock.getElapsedTime();
      // Multi-frequency shake for organic feel
      shakeX = (
        Math.sin(time * 23.7) * 0.4 +
        Math.sin(time * 41.3) * 0.3 +
        Math.sin(time * 67.1) * 0.3
      ) * shakeMag;
      shakeY = (
        Math.cos(time * 19.3) * 0.4 +
        Math.cos(time * 37.7) * 0.3 +
        Math.cos(time * 53.9) * 0.3
      ) * shakeMag;
    }

    // Smooth interpolation toward target (prevents jarring jumps)
    shakeOffsetRef.current.x += (shakeX - shakeOffsetRef.current.x) * 0.3;
    shakeOffsetRef.current.y += (shakeY - shakeOffsetRef.current.y) * 0.3;

    // Apply camera position with smooth lerp
    perspCam.position.x += (shakeOffsetRef.current.x - perspCam.position.x) * 0.15;
    perspCam.position.y += (shakeOffsetRef.current.y - perspCam.position.y) * 0.15;
    perspCam.position.z += (targetZ - perspCam.position.z) * 0.12;

    // Apply FOV with smooth lerp
    perspCam.fov += (targetFOV - perspCam.fov) * 0.12;
    perspCam.updateProjectionMatrix();
  });

  return null;
}

// ============================================================
// SCENE PROPS INTERFACE
// ============================================================

interface StargateSceneProps {
  scrollProgress?: number; // 0-1, default 0
}

export function StargateScene({ scrollProgress = 0 }: StargateSceneProps) {
  const mousePosition = useMouseParallax(0.05);
  const isMobile = useIsMobile();
  const [dpr, setDpr] = useState<[number, number]>([1, 2]);
  const [activationProgress, setActivationProgress] = useState(0);
  const [kawooshTriggered, setKawooshTriggered] = useState(false);
  const [activated, setActivated] = useState(false);
  const animationRef = useRef<number>(0);

  // Cap DPR for mobile on mount/change
  useEffect(() => {
    if (isMobile) {
      setDpr([1, 1.5]);
    }
  }, [isMobile]);

  const handleIncline = useCallback(() => {
    setDpr(isMobile ? [1, 1.5] : [1, 2]);
  }, [isMobile]);

  const handleDecline = useCallback(() => {
    setDpr(isMobile ? [1, 1] : [1, 1.5]);
  }, [isMobile]);

  // Enhanced activation sequence with dramatic pauses at chevron locks
  useEffect(() => {
    const startTime = performance.now();
    const totalDuration = 5000; // 5 seconds total (longer for drama)
    const kawooshTime = 3200; // Kawoosh at 3.2s (after a pause post-lock)
    let kawooshFired = false;

    // Chevron lock times -- unevenly spaced for drama
    // Each lock gets a brief "hold" moment
    const chevronLockTimes = [
      0.3, // Chevron 1: quick
      0.6, // Chevron 2: quick
      0.9, // Chevron 3: brief pause before
      1.15, // Chevron 4
      1.4, // Chevron 5
      1.65, // Chevron 6
      1.85, // Chevron 7: speeding up tension
      2.0, // Chevron 8: rapid
      2.2, // Chevron 9: LOCKED -- dramatic final
    ];

    function animate(now: number) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / totalDuration, 1);

      // Custom easing: slow buildup, accelerate through chevron sequence,
      // pause at full lock, then smooth to end
      let easedProgress: number;

      if (rawProgress < 0.06) {
        // 0-0.3s: anticipation (nearly zero progress)
        easedProgress = rawProgress * 0.5;
      } else if (rawProgress < 0.44) {
        // 0.3s-2.2s: chevron locking phase -- map to 0.03 - 1.0 of activation
        const lockPhase = (rawProgress - 0.06) / 0.38;
        // Step-wise progression -- acceleration with micro-pauses
        easedProgress = 0.03 + lockPhase * 0.97;
        // Add micro-hesitations at each chevron lock
        const chevronIndex = Math.floor(lockPhase * 9);
        const withinChevron = (lockPhase * 9) - chevronIndex;
        if (withinChevron > 0.7 && withinChevron < 0.9) {
          // Brief "hold" effect at each lock
          easedProgress -= 0.01;
        }
      } else if (rawProgress < 0.5) {
        // 2.2s-2.5s: dramatic pause before event horizon
        easedProgress = 1.0;
      } else {
        // 2.5s+: fully activated
        easedProgress = 1.0;
      }

      easedProgress = Math.max(0, Math.min(1, easedProgress));
      setActivationProgress(easedProgress);

      // Fire kawoosh at the right moment
      if (!kawooshFired && elapsed >= kawooshTime) {
        kawooshFired = true;
        setKawooshTriggered(true);
      }

      // Mark fully activated
      if (rawProgress >= 1) {
        setActivated(true);
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    // Start the sequence after a short delay for canvas to initialize
    const timeout = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 500);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={dpr}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        {/* Performance auto-adjustment */}
        <PerformanceMonitor
          onIncline={handleIncline}
          onDecline={handleDecline}
          flipflops={3}
          bounds={(refreshrate) => [refreshrate * 0.5, refreshrate * 0.8]}
        />

        {/* Scroll-driven camera animation */}
        <CameraController scrollProgress={scrollProgress} />

        {/* Depth fog -- objects dissolve into the void */}
        <fog attach="fog" args={["#050505", 6, 18]} />

        {/* === LIGHTING === */}

        {/* Dim ambient fill */}
        <ambientLight intensity={0.06} />

        {/* Blue rim light -- top right, main accent */}
        <pointLight
          position={[5, 4, 6]}
          intensity={1.0}
          color="#00d4ff"
          distance={25}
          decay={2}
        />

        {/* Purple fill -- bottom left */}
        <pointLight
          position={[-4, -3, 4]}
          intensity={0.5}
          color="#7b2ff7"
          distance={18}
          decay={2}
        />

        {/* Gold accent -- behind and above */}
        <pointLight
          position={[0, 5, -3]}
          intensity={0.4}
          color="#ffd700"
          distance={20}
          decay={2}
        />

        {/* White spot -- dramatic center emphasis from camera direction */}
        <spotLight
          position={[0, 0, 10]}
          intensity={0.6}
          color="#ffffff"
          angle={0.5}
          penumbra={0.9}
          distance={20}
          decay={2}
          castShadow={false}
        />

        {/* === SCENE ELEMENTS === */}

        {/* Mouse-reactive wrapper -- subtle parallax rotation of all children */}
        {/* Parallax diminishes as scrollProgress increases */}
        <SceneMouseReactor mousePosition={mousePosition} scrollProgress={scrollProgress}>
          {/* Stargate ring with chevrons */}
          <StargateRing
            activated={activated}
            activationProgress={activationProgress}
          />

          {/* Event horizon portal surface -- intensifies with zoom */}
          <EventHorizon activation={activationProgress} zoomIntensity={scrollProgress} mobile={isMobile} />

          {/* Kawoosh particle explosion */}
          <PortalKawoosh triggered={kawooshTriggered} />

          {/* Dynamic kawoosh light -- spikes white, transitions to blue */}
          <KawooshLight triggered={kawooshTriggered} />

          {/* God rays emanating from the portal -- intensify with scroll */}
          <GodRays activation={activationProgress} zoomIntensity={scrollProgress} />
        </SceneMouseReactor>

        {/* Ambient orbiting particles -- independent mouse reaction */}
        {/* Particles accelerate/scatter as camera pushes through them */}
        <PortalParticles mousePosition={mousePosition} scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
}

/**
 * Dynamic point light that spikes to high intensity when kawoosh fires,
 * then decays. Color transitions from white to blue.
 */
function KawooshLight({ triggered }: { triggered: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const intensityRef = useRef<number>(0);
  const phaseRef = useRef<"idle" | "spike" | "decay">("idle");
  const spikeTimeRef = useRef<number>(0);

  useEffect(() => {
    if (triggered && phaseRef.current === "idle") {
      phaseRef.current = "spike";
    }
  }, [triggered]);

  useFrame((state) => {
    if (!lightRef.current) return;
    const time = state.clock.getElapsedTime();

    if (phaseRef.current === "spike") {
      spikeTimeRef.current = time;
      intensityRef.current = 8.0; // Bright flash
      lightRef.current.color.setHex(0xffffff); // Start white
      phaseRef.current = "decay";
    } else if (phaseRef.current === "decay") {
      const elapsed = time - spikeTimeRef.current;

      // Rapid initial decay, then slow settling
      if (elapsed < 0.3) {
        // White -> light blue
        intensityRef.current = THREE.MathUtils.lerp(8.0, 3.0, elapsed / 0.3);
        lightRef.current.color.lerpColors(
          new THREE.Color(0xffffff),
          new THREE.Color(0x88ccff),
          elapsed / 0.3
        );
      } else if (elapsed < 1.5) {
        // Light blue -> deep blue, intensity fading
        const t = (elapsed - 0.3) / 1.2;
        intensityRef.current = THREE.MathUtils.lerp(3.0, 0.8, t);
        lightRef.current.color.lerpColors(
          new THREE.Color(0x88ccff),
          new THREE.Color(0x00d4ff),
          t
        );
      } else {
        // Ambient blue pulsing
        intensityRef.current = 0.6 + Math.sin(time * 2.0) * 0.2;
        lightRef.current.color.setHex(0x00d4ff);
      }
    }

    lightRef.current.intensity = intensityRef.current;
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0, 0.5]}
      intensity={0}
      distance={15}
      decay={2}
    />
  );
}

/**
 * God rays -- ConeGeometry with BackSide rendering and a custom shader
 * creating rotating light beams emanating from the portal.
 * Subtle, additive blended. Intensifies with scroll zoom.
 */
function GodRays({ activation, zoomIntensity = 0 }: { activation: number; zoomIntensity?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(
    () => new THREE.ConeGeometry(4, 8, 32, 1, true),
    []
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uActivation: { value: 0 },
      uZoomIntensity: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
    uniforms.uActivation.value = THREE.MathUtils.lerp(
      uniforms.uActivation.value,
      activation > 0.5 ? activation : 0,
      0.03
    );
    // Smooth zoom intensity
    uniforms.uZoomIntensity.value = THREE.MathUtils.lerp(
      uniforms.uZoomIntensity.value,
      zoomIntensity,
      0.05
    );

    // Slowly rotate the god ray cone
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
      // Scale up god rays as camera approaches -- they grow to envelop the view
      const scale = 1 + zoomIntensity * 0.8;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  if (activation < 0.3) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, 0, 4]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <shaderMaterial
        vertexShader={godRayVertexShader}
        fragmentShader={godRayFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

/**
 * Wrapper group that applies subtle rotation to its children
 * based on mouse position, creating depth through parallax.
 * Parallax effect diminishes as scrollProgress increases --
 * when deep in the portal, the world should feel locked/immersive.
 * Must be a child of Canvas to use useFrame.
 */
function SceneMouseReactor({
  mousePosition,
  scrollProgress = 0,
  children,
}: {
  mousePosition: React.RefObject<{ x: number; y: number }>;
  scrollProgress?: number;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const mouse = mousePosition.current;
    if (!mouse) return;

    // Parallax strength diminishes as scroll increases
    // At scrollProgress=0: full parallax; at scrollProgress=1: nearly zero
    const parallaxStrength = 1 - scrollProgress * 0.9;

    // Subtle scene-level rotation responding to mouse
    groupRef.current.rotation.y +=
      (mouse.x * 0.08 * parallaxStrength - groupRef.current.rotation.y) * 0.03;
    groupRef.current.rotation.x +=
      (mouse.y * -0.05 * parallaxStrength - groupRef.current.rotation.x) * 0.03;
  });

  return <group ref={groupRef}>{children}</group>;
}
