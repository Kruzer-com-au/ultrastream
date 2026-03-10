"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PortalKawooshProps {
  triggered: boolean;
}

/**
 * The "kawoosh" -- the iconic energy blast that erupts from the Stargate
 * when the event horizon forms.
 *
 * Enhancements over original:
 *   - Custom ShaderMaterial for soft glow sprites instead of flat PointsMaterial
 *   - Per-particle size attribute (0.03-0.15) with variation
 *   - White-hot core -> neon blue -> electric purple -> fade color transitions
 *   - Higher particle density in the initial burst (first 0.3s)
 *   - 3000 particles total (up from 2000)
 *   - Dynamic PointLight that illuminates the ring during kawoosh
 *
 * Lifecycle:
 *   1. triggered=false: particles invisible
 *   2. triggered=true: explosive outward burst (~1.5s)
 *   3. After burst: particles settle into gentle ambient drift
 */

// ============================================================
// KAWOOSH PARTICLE SHADER -- soft glow sprites with color
// ============================================================
const kawooshVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aLife;
  attribute float aRandom;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vLife;
  varying float vRandom;

  void main() {
    vColor = aColor;
    vLife = aLife;
    vRandom = aRandom;

    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);

    // Size varies with life -- blooms at birth, shrinks at death
    float lifeFactor = 1.0 - abs(aLife * 2.0 - 1.0); // Peak at life=0.5
    lifeFactor = 0.3 + lifeFactor * 0.7;

    // Flicker effect
    float flicker = 1.0 + sin(aLife * 30.0 + aRandom * 100.0) * 0.15;

    gl_PointSize = aSize * lifeFactor * flicker * (350.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const kawooshFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vLife;
  varying float vRandom;

  void main() {
    // Soft circular glow with hot core
    float d = length(gl_PointCoord - 0.5) * 2.0;

    // Multi-layer glow: bright core + soft outer
    float core = 1.0 - smoothstep(0.0, 0.3, d);
    float mid = 1.0 - smoothstep(0.0, 0.6, d);
    float outer = 1.0 - smoothstep(0.0, 1.0, d);

    float glow = core * 0.5 + mid * 0.3 + outer * 0.2;
    glow = pow(glow, 1.5);

    // White-hot core blend
    vec3 color = mix(vColor, vec3(1.0, 1.0, 1.0), core * 0.6);

    // Fade with life -- particles die out
    float fadeIn = smoothstep(0.0, 0.05, vLife);
    float fadeOut = 1.0 - smoothstep(0.7, 1.0, vLife);
    float alpha = glow * fadeIn * fadeOut;

    // Extra brightness at very early life (initial flash)
    float birthFlash = (1.0 - smoothstep(0.0, 0.1, vLife)) * 0.5;
    alpha += birthFlash;

    gl_FragColor = vec4(color, alpha);
  }
`;

const PARTICLE_COUNT = 3000;
// Extra particles in the initial dense burst
const BURST_DENSE_COUNT = 800; // First 800 particles launch in the first 0.3s

export function PortalKawoosh({ triggered }: PortalKawooshProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [phase, setPhase] = useState<"idle" | "burst" | "settle">("idle");
  const burstStartTime = useRef<number>(0);

  // Per-particle attributes
  const particleData = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const lives = new Float32Array(PARTICLE_COUNT);
    const maxLives = new Float32Array(PARTICLE_COUNT);
    const randoms = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const staggerTimes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Start at center
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      // Cone-shaped velocity toward camera (+z) with spread
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * 0.9;
      const speed = 2.5 + Math.random() * 4.5;
      velocities[i3] = Math.cos(angle) * spread * speed * 0.35;
      velocities[i3 + 1] = Math.sin(angle) * spread * speed * 0.35;
      velocities[i3 + 2] = speed; // Forward toward camera

      lives[i] = 0;
      maxLives[i] = 0.8 + Math.random() * 0.8;
      randoms[i] = Math.random();

      // Start white-hot
      colors[i3] = 1.0;
      colors[i3 + 1] = 1.0;
      colors[i3 + 2] = 1.0;

      // Per-particle size variation (0.03 to 0.15)
      sizes[i] = 0.03 + Math.random() * 0.12;

      // Stagger times: first BURST_DENSE_COUNT particles launch in 0.3s
      if (i < BURST_DENSE_COUNT) {
        staggerTimes[i] = Math.random() * 0.3; // Dense burst
        sizes[i] = 0.05 + Math.random() * 0.1; // Slightly larger in burst
      } else {
        staggerTimes[i] = 0.2 + Math.random() * 0.6; // Trailing particles
      }
    }

    return {
      positions,
      velocities,
      lives,
      maxLives,
      randoms,
      colors,
      sizes,
      staggerTimes,
    };
  }, []);

  // Custom shader material
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: kawooshVertexShader,
        fragmentShader: kawooshFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  // Trigger burst when prop changes
  useEffect(() => {
    if (triggered && phase === "idle") {
      setPhase("burst");
    }
  }, [triggered, phase]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const colorAttr = geometry.getAttribute("aColor") as THREE.BufferAttribute;
    const lifeAttr = geometry.getAttribute("aLife") as THREE.BufferAttribute;
    const sizeAttr = geometry.getAttribute("aSize") as THREE.BufferAttribute;

    const time = state.clock.getElapsedTime();

    if (phase === "burst") {
      if (burstStartTime.current === 0) {
        burstStartTime.current = time;
        // Reset all particles to center
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const i3 = i * 3;
          particleData.positions[i3] = 0;
          particleData.positions[i3 + 1] = 0;
          particleData.positions[i3 + 2] = 0;
          particleData.lives[i] = 0;
        }
      }

      const elapsed = time - burstStartTime.current;
      const burstDuration = 1.5;

      // Dynamic light emission during burst
      if (lightRef.current) {
        if (elapsed < 0.2) {
          // Bright white flash
          lightRef.current.intensity = THREE.MathUtils.lerp(0, 6.0, elapsed / 0.2);
          lightRef.current.color.setHex(0xffffff);
        } else if (elapsed < 0.8) {
          // Decay to blue
          const t = (elapsed - 0.2) / 0.6;
          lightRef.current.intensity = THREE.MathUtils.lerp(6.0, 2.0, t);
          lightRef.current.color.lerpColors(
            new THREE.Color(0xffffff),
            new THREE.Color(0x00aaff),
            t
          );
        } else if (elapsed < burstDuration) {
          // Fade to purple
          const t = (elapsed - 0.8) / (burstDuration - 0.8);
          lightRef.current.intensity = THREE.MathUtils.lerp(2.0, 0.5, t);
          lightRef.current.color.lerpColors(
            new THREE.Color(0x00aaff),
            new THREE.Color(0x8855ff),
            t
          );
        }
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const stagger = particleData.staggerTimes[i];

        if (elapsed > stagger) {
          const particleTime = elapsed - stagger;
          particleData.lives[i] = Math.min(particleTime / particleData.maxLives[i], 1.0);
          const t = particleData.lives[i]; // Normalized life 0-1

          if (t < 1.0) {
            // Active: move along velocity with deceleration
            const decel = 1.0 - t * t; // Quadratic deceleration

            particleData.positions[i3] = particleData.velocities[i3] * particleTime * decel;
            particleData.positions[i3 + 1] = particleData.velocities[i3 + 1] * particleTime * decel;

            // Extend forward then retract (kawoosh pulls back)
            const zExtend = particleData.velocities[i3 + 2] * particleTime * decel;
            const retract = t > 0.4 ? (t - 0.4) * 1.67 : 0;
            particleData.positions[i3 + 2] = zExtend * (1.0 - retract * 0.8);

            // Add slight turbulence
            const turbX = Math.sin(particleTime * 8.0 + particleData.randoms[i] * 20.0) * 0.05 * t;
            const turbY = Math.cos(particleTime * 6.0 + particleData.randoms[i] * 15.0) * 0.05 * t;
            particleData.positions[i3] += turbX;
            particleData.positions[i3 + 1] += turbY;

            // === ENHANCED COLOR TRANSITIONS ===
            // White-hot core -> neon blue -> electric purple -> fade
            if (t < 0.15) {
              // Phase 1: White-hot (birth)
              const ct = t / 0.15;
              particleData.colors[i3] = 1.0;
              particleData.colors[i3 + 1] = THREE.MathUtils.lerp(1.0, 0.95, ct);
              particleData.colors[i3 + 2] = 1.0;
            } else if (t < 0.35) {
              // Phase 2: White -> Neon blue
              const ct = (t - 0.15) / 0.2;
              particleData.colors[i3] = THREE.MathUtils.lerp(1.0, 0.0, ct);
              particleData.colors[i3 + 1] = THREE.MathUtils.lerp(0.95, 0.83, ct);
              particleData.colors[i3 + 2] = 1.0;
            } else if (t < 0.65) {
              // Phase 3: Neon blue -> Electric purple
              const ct = (t - 0.35) / 0.3;
              particleData.colors[i3] = THREE.MathUtils.lerp(0.0, 0.55, ct);
              particleData.colors[i3 + 1] = THREE.MathUtils.lerp(0.83, 0.2, ct);
              particleData.colors[i3 + 2] = THREE.MathUtils.lerp(1.0, 0.96, ct);
            } else {
              // Phase 4: Fade to dim purple
              const ct = (t - 0.65) / 0.35;
              particleData.colors[i3] = THREE.MathUtils.lerp(0.55, 0.3, ct);
              particleData.colors[i3 + 1] = THREE.MathUtils.lerp(0.2, 0.1, ct);
              particleData.colors[i3 + 2] = THREE.MathUtils.lerp(0.96, 0.5, ct);
            }
          } else {
            // Dead: rapid fade
            particleData.colors[i3] *= 0.92;
            particleData.colors[i3 + 1] *= 0.92;
            particleData.colors[i3 + 2] *= 0.92;
          }
        }
      }

      // Transition to settle phase after burst completes
      if (elapsed > burstDuration + 0.5) {
        setPhase("settle");
      }
    } else if (phase === "settle") {
      // Gentle ambient drift around the portal
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Slowly drift particles into a ring formation
        const targetAngle = particleData.randoms[i] * Math.PI * 2 + time * 0.1;
        const targetRadius = 2.0 + particleData.randoms[i] * 1.5;
        const targetX = Math.cos(targetAngle) * targetRadius;
        const targetY = Math.sin(targetAngle) * targetRadius;
        const targetZ = Math.sin(time * 0.5 + particleData.randoms[i] * 6.28) * 0.3;

        particleData.positions[i3] += (targetX - particleData.positions[i3]) * 0.01;
        particleData.positions[i3 + 1] += (targetY - particleData.positions[i3 + 1]) * 0.01;
        particleData.positions[i3 + 2] += (targetZ - particleData.positions[i3 + 2]) * 0.01;

        // Ambient blue/purple color with gentle pulsing
        const colorMix = Math.sin(time + particleData.randoms[i] * 6.28) * 0.5 + 0.5;
        particleData.colors[i3] = THREE.MathUtils.lerp(0.0, 0.35, colorMix) * 0.4;
        particleData.colors[i3 + 1] = THREE.MathUtils.lerp(0.6, 0.2, colorMix) * 0.4;
        particleData.colors[i3 + 2] = THREE.MathUtils.lerp(1.0, 0.8, colorMix) * 0.4;

        // All particles are in settled state
        particleData.lives[i] = 0.5; // Mid-life for stable rendering
      }

      // Settle light to ambient glow
      if (lightRef.current) {
        lightRef.current.intensity = THREE.MathUtils.lerp(
          lightRef.current.intensity,
          0.3 + Math.sin(time * 1.5) * 0.1,
          0.05
        );
        lightRef.current.color.setHex(0x4488ff);
      }
    }

    // Update buffer attributes
    posAttr.set(particleData.positions);
    posAttr.needsUpdate = true;
    colorAttr.set(particleData.colors);
    colorAttr.needsUpdate = true;
    lifeAttr.set(particleData.lives);
    lifeAttr.needsUpdate = true;
  });

  // Don't render anything until triggered
  if (phase === "idle") return null;

  return (
    <group>
      {/* Particle system */}
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions, 3]}
            count={PARTICLE_COUNT}
          />
          <bufferAttribute
            attach="attributes-aColor"
            args={[particleData.colors, 3]}
            count={PARTICLE_COUNT}
          />
          <bufferAttribute
            attach="attributes-aSize"
            args={[particleData.sizes, 1]}
            count={PARTICLE_COUNT}
          />
          <bufferAttribute
            attach="attributes-aLife"
            args={[particleData.lives, 1]}
            count={PARTICLE_COUNT}
          />
          <bufferAttribute
            attach="attributes-aRandom"
            args={[particleData.randoms, 1]}
            count={PARTICLE_COUNT}
          />
        </bufferGeometry>
        <primitive object={material} attach="material" />
      </points>

      {/* Dynamic kawoosh light -- illuminates ring and surroundings */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 1.5]}
        intensity={0}
        distance={12}
        decay={2}
        color="#ffffff"
      />
    </group>
  );
}
