"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface GeometryShapeProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color: string;
  emissiveColor: string;
  emissiveIntensity?: number;
  rotationSpeed?: [number, number, number];
  mouseX: React.RefObject<{ x: number; y: number }>;
  parallaxDepth?: number; // Higher = more parallax (closer objects)
  floatSpeed?: number;
  floatIntensity?: number;
}

function GeometryShape({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color,
  emissiveColor,
  emissiveIntensity = 0.4,
  rotationSpeed = [0.003, 0.005, 0.002],
  mouseX,
  parallaxDepth = 1,
  floatSpeed = 1.5,
  floatIntensity = 0.4,
  children,
}: GeometryShapeProps & { children: React.ReactNode }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    // Individual rotation -- each axis at different speed for organic feel
    meshRef.current.rotation.x += rotationSpeed[0];
    meshRef.current.rotation.y += rotationSpeed[1];
    meshRef.current.rotation.z += rotationSpeed[2];

    // Mouse parallax -- depth-weighted
    const mouse = mouseX.current;
    if (mouse) {
      const baseX = position[0];
      const baseY = position[1];
      meshRef.current.position.x +=
        (baseX + mouse.x * 0.4 * parallaxDepth - meshRef.current.position.x) *
        0.03;
      meshRef.current.position.y +=
        (baseY +
          mouse.y * -0.3 * parallaxDepth -
          meshRef.current.position.y) *
        0.03;
    }
  });

  return (
    <Float speed={floatSpeed} floatIntensity={floatIntensity} rotationIntensity={0.2}>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
      >
        {children}
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

interface HeroGeometryProps {
  mouseX: React.RefObject<{ x: number; y: number }>;
}

/**
 * Floating metallic geometric shapes -- crystalline polyhedra, angular shards,
 * and rings of power. Like the remnants of a shattered dark crystal fortress.
 */
export function HeroGeometry({ mouseX }: HeroGeometryProps) {
  // Custom angular shard geometry -- like a broken blade
  const shardGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Front face -- angular blade
      0, 1.2, 0,
      -0.3, -0.5, 0.15,
      0.3, -0.5, 0.15,
      // Back face
      0, 1.2, 0,
      0.3, -0.5, -0.15,
      -0.3, -0.5, -0.15,
      // Left face
      0, 1.2, 0,
      -0.3, -0.5, -0.15,
      -0.3, -0.5, 0.15,
      // Right face
      0, 1.2, 0,
      0.3, -0.5, 0.15,
      0.3, -0.5, -0.15,
      // Bottom face 1
      -0.3, -0.5, 0.15,
      0.3, -0.5, -0.15,
      0.3, -0.5, 0.15,
      // Bottom face 2
      -0.3, -0.5, 0.15,
      -0.3, -0.5, -0.15,
      0.3, -0.5, -0.15,
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      {/* Large Icosahedron -- main crystalline form, upper right */}
      <GeometryShape
        position={[2.5, 1.2, -3]}
        scale={1.2}
        color="#0a0a1a"
        emissiveColor="#00d4ff"
        emissiveIntensity={0.5}
        rotationSpeed={[0.002, 0.004, 0.001]}
        mouseX={mouseX}
        parallaxDepth={1.2}
        floatSpeed={1.2}
        floatIntensity={0.5}
      >
        <icosahedronGeometry args={[1, 0]} />
      </GeometryShape>

      {/* Smaller Icosahedron -- lower left, purple glow */}
      <GeometryShape
        position={[-2.8, -0.8, -4]}
        scale={0.8}
        color="#0a0a1a"
        emissiveColor="#8b5cf6"
        emissiveIntensity={0.6}
        rotationSpeed={[0.005, 0.003, 0.004]}
        mouseX={mouseX}
        parallaxDepth={0.8}
        floatSpeed={1.8}
        floatIntensity={0.3}
      >
        <icosahedronGeometry args={[1, 0]} />
      </GeometryShape>

      {/* Octahedron -- diamond shard, front-center-left */}
      <GeometryShape
        position={[-1.5, 1.8, -2]}
        scale={0.6}
        color="#0a0a1a"
        emissiveColor="#ff3366"
        emissiveIntensity={0.4}
        rotationSpeed={[0.006, 0.002, 0.005]}
        mouseX={mouseX}
        parallaxDepth={1.5}
        floatSpeed={2}
        floatIntensity={0.4}
      >
        <octahedronGeometry args={[1, 0]} />
      </GeometryShape>

      {/* Torus -- ring of power, mid-right */}
      <GeometryShape
        position={[3.2, -1.5, -5]}
        rotation={[Math.PI / 4, 0, Math.PI / 6]}
        scale={1.5}
        color="#0a0a1a"
        emissiveColor="#d4a843"
        emissiveIntensity={0.35}
        rotationSpeed={[0.001, 0.003, 0.002]}
        mouseX={mouseX}
        parallaxDepth={0.6}
        floatSpeed={1}
        floatIntensity={0.3}
      >
        <torusGeometry args={[1, 0.02, 16, 64]} />
      </GeometryShape>

      {/* Custom Shard -- angular blade, far left */}
      <GeometryShape
        position={[-3.5, 0.5, -3.5]}
        rotation={[0, 0, Math.PI / 5]}
        scale={0.7}
        color="#0a0a1a"
        emissiveColor="#00d4ff"
        emissiveIntensity={0.5}
        rotationSpeed={[0.004, 0.006, 0.003]}
        mouseX={mouseX}
        parallaxDepth={1.0}
        floatSpeed={1.6}
        floatIntensity={0.35}
      >
        <primitive object={shardGeometry} attach="geometry" />
      </GeometryShape>

      {/* Small Octahedron -- accent piece, upper far */}
      <GeometryShape
        position={[1.0, 2.5, -6]}
        scale={0.4}
        color="#0a0a1a"
        emissiveColor="#8b5cf6"
        emissiveIntensity={0.3}
        rotationSpeed={[0.007, 0.004, 0.006]}
        mouseX={mouseX}
        parallaxDepth={0.4}
        floatSpeed={2.2}
        floatIntensity={0.5}
      >
        <octahedronGeometry args={[1, 0]} />
      </GeometryShape>
    </group>
  );
}
