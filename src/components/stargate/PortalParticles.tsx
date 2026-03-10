"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PortalParticlesProps {
  mousePosition: React.RefObject<{ x: number; y: number }>;
  scrollProgress?: number; // 0-1: particles scatter/accelerate as camera pushes through
}

/**
 * Ambient atmospheric particles orbiting around the Stargate ring.
 * ~500 particles in a toroidal distribution, slowly orbiting with
 * gentle floating motion. Mix of neon-blue and purple with additive
 * blending. Reacts subtly to mouse position for interactivity.
 *
 * Always visible -- creates the mystical atmosphere around the gate.
 */

const PARTICLE_COUNT = 500;

export function PortalParticles({ mousePosition, scrollProgress = 0 }: PortalParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate toroidal distribution of particles around the ring
  const { positions, basePositions, speeds, colors, offsets } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const basePos = new Float32Array(PARTICLE_COUNT * 3);
    const spd = new Float32Array(PARTICLE_COUNT);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const off = new Float32Array(PARTICLE_COUNT * 3);

    const ringRadius = 3.2; // Slightly outside the stargate ring
    const tubeRadius = 0.8; // How thick the particle cloud is

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Toroidal distribution
      const theta = Math.random() * Math.PI * 2; // Angle around the ring
      const phi = Math.random() * Math.PI * 2; // Angle around the tube

      // Add variation to tube radius for organic feel
      const tubeR = tubeRadius * (0.3 + Math.random() * 0.7);

      const x = (ringRadius + tubeR * Math.cos(phi)) * Math.cos(theta);
      const y = (ringRadius + tubeR * Math.cos(phi)) * Math.sin(theta);
      const z = tubeR * Math.sin(phi) * 0.5; // Flatten z slightly

      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;

      // Store base positions for orbital calculations
      basePos[i3] = theta; // Store the initial angle
      basePos[i3 + 1] = phi;
      basePos[i3 + 2] = tubeR;

      // Individual orbital speed
      spd[i] = 0.05 + Math.random() * 0.15;

      // Color: mix of neon-blue (#00d4ff) and purple (#8b5cf6)
      const colorMix = Math.random();
      if (colorMix < 0.6) {
        // Neon blue
        col[i3] = 0.0;
        col[i3 + 1] = 0.83;
        col[i3 + 2] = 1.0;
      } else if (colorMix < 0.85) {
        // Purple
        col[i3] = 0.545;
        col[i3 + 1] = 0.184;
        col[i3 + 2] = 0.965;
      } else {
        // White-blue sparkle
        col[i3] = 0.7;
        col[i3 + 1] = 0.9;
        col[i3 + 2] = 1.0;
      }

      // Random offsets for floating variation
      off[i3] = Math.random() * Math.PI * 2;
      off[i3 + 1] = Math.random() * Math.PI * 2;
      off[i3 + 2] = Math.random() * Math.PI * 2;
    }

    return {
      positions: pos,
      basePositions: basePos,
      speeds: spd,
      colors: col,
      offsets: off,
    };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;

    const ringRadius = 3.2;

    // Scroll-driven effects: particles accelerate orbital speed and scatter outward
    // as the camera pushes through them
    const speedMultiplier = 1 + scrollProgress * 3.0; // Up to 4x orbital speed
    const scatterAmount = scrollProgress * scrollProgress * 2.5; // Quadratic scatter
    const zPush = scrollProgress * 4.0; // Particles rush past camera in z

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Orbital motion: advance theta over time (accelerated by scroll)
      const theta = basePositions[i3] + time * speeds[i] * speedMultiplier;
      const phi = basePositions[i3 + 1];
      const tubeR = basePositions[i3 + 2];

      // Floating undulation (amplified during scroll)
      const undulationScale = 1 + scrollProgress * 2.0;
      const floatX = Math.sin(time * 0.7 * speedMultiplier + offsets[i3]) * 0.1 * undulationScale;
      const floatY = Math.cos(time * 0.5 * speedMultiplier + offsets[i3 + 1]) * 0.1 * undulationScale;
      const floatZ = Math.sin(time * 0.3 * speedMultiplier + offsets[i3 + 2]) * 0.15 * undulationScale;

      // Base toroidal position
      const baseX = (ringRadius + tubeR * Math.cos(phi)) * Math.cos(theta);
      const baseY = (ringRadius + tubeR * Math.cos(phi)) * Math.sin(theta);
      const baseZ = tubeR * Math.sin(phi) * 0.5;

      // Scatter: particles expand outward from center as camera approaches
      const scatterDir = Math.atan2(baseY, baseX);
      const scatterX = Math.cos(scatterDir) * scatterAmount;
      const scatterY = Math.sin(scatterDir) * scatterAmount;

      // Z push: particles rush toward/past camera -- gives "flying through" feeling
      // Use per-particle offset for variation (some rush ahead, some lag behind)
      const particleZPush = zPush * (0.5 + offsets[i3] / (Math.PI * 2));

      positions[i3] = baseX + floatX + scatterX;
      positions[i3 + 1] = baseY + floatY + scatterY;
      positions[i3 + 2] = baseZ + floatZ + particleZPush;
    }

    posAttr.set(positions);
    posAttr.needsUpdate = true;

    // Mouse reactivity: diminishes with scroll progress
    const mouse = mousePosition.current;
    const mouseStrength = 1 - scrollProgress * 0.85;
    if (mouse && pointsRef.current) {
      pointsRef.current.rotation.y +=
        (mouse.x * 0.05 * mouseStrength - pointsRef.current.rotation.y) * 0.02;
      pointsRef.current.rotation.x +=
        (mouse.y * -0.03 * mouseStrength - pointsRef.current.rotation.x) * 0.02;
    }

    // Increase particle opacity/size as camera approaches
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    if (mat) {
      mat.size = 0.03 + scrollProgress * 0.04;
      mat.opacity = 0.6 + scrollProgress * 0.3;
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
