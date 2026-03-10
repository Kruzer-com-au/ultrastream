"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

interface HeroParticlesProps {
  mouseX: React.RefObject<{ x: number; y: number }>;
  count?: number;
}

/**
 * Floating particle field -- thousands of tiny glowing particles drifting
 * through a dark void. Like embers from a barbarian's forge.
 */
export function HeroParticles({ mouseX, count = 1800 }: HeroParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particle positions in a sphere distribution
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const radius = 8;

    for (let i = 0; i < count; i++) {
      // Spherical distribution with slight vertical bias
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random()); // cbrt for uniform volume distribution

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7; // Slightly flattened vertically
      pos[i * 3 + 2] = r * Math.cos(phi);
    }

    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();

    // Slow rotation -- like the cosmos turning
    pointsRef.current.rotation.y += 0.0003;
    pointsRef.current.rotation.x += 0.0001;

    // Breathing scale -- subtle pulsation
    const breathe = 1 + Math.sin(time * 0.8) * 0.05;
    pointsRef.current.scale.setScalar(breathe);

    // Mouse parallax -- subtle shift following the cursor
    const mouse = mouseX.current;
    if (mouse) {
      pointsRef.current.position.x +=
        (mouse.x * 0.3 - pointsRef.current.position.x) * 0.02;
      pointsRef.current.position.y +=
        (mouse.y * -0.2 - pointsRef.current.position.y) * 0.02;
    }
  });

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color="#00d4ff"
        size={0.02}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.6}
      />
    </Points>
  );
}

/**
 * Secondary particle layer -- deeper, purple-tinted, slower.
 * Creates depth separation.
 */
export function HeroParticlesDeep({
  mouseX,
  count = 800,
}: HeroParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const radius = 12;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random());

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi) - 3; // Push back
    }

    return pos;
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.y -= 0.0002;
    pointsRef.current.rotation.z += 0.00015;

    const mouse = mouseX.current;
    if (mouse) {
      pointsRef.current.position.x +=
        (mouse.x * 0.15 - pointsRef.current.position.x) * 0.01;
      pointsRef.current.position.y +=
        (mouse.y * -0.1 - pointsRef.current.position.y) * 0.01;
    }
  });

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.4}
      />
    </Points>
  );
}
