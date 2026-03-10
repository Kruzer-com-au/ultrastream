"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useState, useCallback } from "react";
import { HeroParticles, HeroParticlesDeep } from "./HeroParticles";
import { HeroGeometry } from "./HeroGeometry";
import { useMouseParallax } from "@/hooks/useMouseParallax";

/**
 * Main R3F 3D hero scene -- dark atmospheric void with floating metallic
 * geometry, particle fields, and dramatic lighting. The visual centerpiece
 * of the ULTRASTREAM rebellion.
 *
 * Camera is fixed. Elements react to mouse parallax.
 * No OrbitControls. No post-processing. Raw power through lighting and motion.
 */
export function HeroScene() {
  const mousePosition = useMouseParallax(0.05);
  const [dpr, setDpr] = useState<[number, number]>([1, 2]);

  const handleIncline = useCallback(() => {
    setDpr([1, 2]);
  }, []);

  const handleDecline = useCallback(() => {
    setDpr([1, 1.5]);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      dpr={dpr}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
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

        {/* Lighting -- dark atmosphere with dramatic accents */}
        <ambientLight intensity={0.08} />

        {/* Electric blue rim light -- top right */}
        <pointLight
          position={[5, 5, 5]}
          intensity={0.8}
          color="#00d4ff"
          distance={20}
          decay={2}
        />

        {/* Deep purple fill -- bottom left */}
        <pointLight
          position={[-3, -2, 4]}
          intensity={0.4}
          color="#8b5cf6"
          distance={15}
          decay={2}
        />

        {/* Gold accent -- from behind camera */}
        <pointLight
          position={[0, 3, 8]}
          intensity={0.3}
          color="#d4a843"
          distance={20}
          decay={2}
        />

        {/* Dramatic top-down spot for center emphasis */}
        <spotLight
          position={[0, 8, 2]}
          intensity={0.5}
          color="#ffffff"
          angle={0.4}
          penumbra={0.8}
          distance={20}
          decay={2}
          castShadow={false}
        />

        {/* Depth fog -- objects fade into the void */}
        <fog attach="fog" args={["#000000", 5, 15]} />

        {/* Particle systems */}
        <HeroParticles mouseX={mousePosition} count={1800} />
        <HeroParticlesDeep mouseX={mousePosition} count={800} />

        {/* Floating metallic geometry */}
        <HeroGeometry mouseX={mousePosition} />
      </Suspense>
    </Canvas>
  );
}
