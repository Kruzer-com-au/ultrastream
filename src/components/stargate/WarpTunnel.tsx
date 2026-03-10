"use client";

import { useRef, useMemo, useCallback, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

// ============================================================
// TYPES
// ============================================================

interface WarpTunnelProps {
  progress: number; // 0-1 scroll progress through the tunnel
  visible: boolean; // whether to render
}

// ============================================================
// CONSTANTS
// ============================================================

// Adaptive particle count based on device capability
function getAdaptiveParticleCount(): number {
  if (typeof window === 'undefined') return 1500;

  const cores = navigator.hardwareConcurrency || 4;
  const dpr = window.devicePixelRatio || 1;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Tier system: High / Medium / Low
  if (isMobile || cores <= 2 || dpr < 1.5) {
    return 800; // Low tier
  } else if (cores <= 4 || dpr <= 2) {
    return 1500; // Medium tier
  }
  return 2500; // High tier
}

const PARTICLE_COUNT = getAdaptiveParticleCount();
const TUNNEL_RADIUS = 4.0;
const TUNNEL_LENGTH = 60.0;

// ============================================================
// TUNNEL WALL SHADERS
// ============================================================

/**
 * Tunnel vertex shader:
 * - Renders the inside of a CylinderGeometry (BackSide)
 * - Applies sinusoidal displacement for tunnel curvature/twist
 * - Breathing/pulsing of walls based on speed
 */
const tunnelVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSpeed;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPos;
  varying float vAngle;

  void main() {
    vUv = uv;
    vPosition = position;

    vec3 pos = position;

    // Angle around the cylinder for later use in fragment
    vAngle = atan(pos.x, pos.z);

    // Normalize position along the tunnel length (y-axis for cylinder)
    float normalizedY = (pos.y + 30.0) / 60.0;

    // S-curve: shift cylinder center at each y-slice for tunnel curvature
    float curveX = sin(normalizedY * 6.28318 + uTime * 0.15) * 1.2;
    float curveZ = cos(normalizedY * 4.71239 + uTime * 0.1) * 0.8;
    pos.x += curveX * smoothstep(0.0, 0.5, normalizedY);
    pos.z += curveZ * smoothstep(0.0, 0.5, normalizedY);

    // Breathing / pulsing of tunnel walls
    float pulse = sin(normalizedY * 12.0 - uTime * 3.0 * uSpeed) * 0.15 * uSpeed;
    float breathe = sin(uTime * 0.5 + normalizedY * 6.28318) * 0.1;
    float radialDir = length(pos.xz);
    if (radialDir > 0.001) {
      vec2 radialNorm = pos.xz / radialDir;
      pos.xz += radialNorm * (pulse + breathe);
    }

    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

/**
 * Tunnel fragment shader:
 * - FBM noise with domain warping for organic plasma
 * - Voronoi ridges for energy veins
 * - Streaking energy lines moving along the tunnel axis
 * - Spiral patterns
 * - Chromatic distortion increasing with speed
 * - Progress-driven color phases: void -> blue -> purple -> gold -> white bloom
 */
const tunnelFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSpeed;
  uniform vec3 uColorBlue;
  uniform vec3 uColorPurple;
  uniform vec3 uColorGold;
  uniform vec3 uColorViolet;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPos;
  varying float vAngle;

  // --- Noise Utilities ---

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  float hash1(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash1(i);
    float b = hash1(i + vec2(1.0, 0.0));
    float c = hash1(i + vec2(0.0, 1.0));
    float d = hash1(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      value += amplitude * vnoise(p * frequency);
      p = rot * p;
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  float domainWarpedFBM(vec2 p, float time) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + time * 0.2),
      fbm(p + vec2(5.2, 1.3) - time * 0.15)
    );
    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(1.7, 9.2) + time * 0.12),
      fbm(p + 4.0 * q + vec2(8.3, 2.8) - time * 0.09)
    );
    return fbm(p + 4.0 * r);
  }

  vec3 voronoi(vec2 x, float time) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float F1 = 8.0;
    float F2 = 8.0;
    float cellId = 0.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash2(n + g);
        o = 0.5 + 0.5 * sin(time * 0.8 + 6.2831 * o);
        vec2 diff = g + o - f;
        float d = dot(diff, diff);
        if (d < F1) {
          F2 = F1;
          F1 = d;
          cellId = dot(n + g, vec2(7.0, 113.0));
        } else if (d < F2) {
          F2 = d;
        }
      }
    }
    F1 = sqrt(F1);
    F2 = sqrt(F2);
    return vec3(F1, F2, cellId);
  }

  void main() {
    // UV.x = around the cylinder (0-1), UV.y = along the length (0-1)
    float angle = vUv.x * 6.28318;
    float tunnelPos = vUv.y;

    // Scrolling UV: tunnel walls rush past
    float scrollSpeed = uSpeed * 8.0;
    float scrolledY = tunnelPos + uTime * scrollSpeed * 0.05;

    // Spiraling UV coordinates
    vec2 spiralUV = vec2(
      angle / 6.28318 + scrolledY * 0.3 + sin(scrolledY * 2.0) * 0.1,
      scrolledY * 3.0
    );

    // Plasma base (domain-warped FBM)
    float plasma = domainWarpedFBM(spiralUV * 2.0, uTime * 0.8);

    // Energy veins (voronoi ridges)
    vec3 vor = voronoi(spiralUV * 4.0 + plasma * 0.3, uTime * 1.2);
    float ridge = vor.y - vor.x;
    float veins = 1.0 - smoothstep(0.0, 0.12, ridge);

    // Streaking energy lines moving along the tunnel axis
    float streaks = sin(angle * 20.0 + scrolledY * 40.0) * 0.5 + 0.5;
    streaks = pow(streaks, 8.0);
    streaks *= smoothstep(0.0, 0.3, uSpeed);

    // Secondary streak layer
    float streaks2 = sin(angle * 13.0 - scrolledY * 60.0 + 1.5) * 0.5 + 0.5;
    streaks2 = pow(streaks2, 10.0);
    streaks2 *= smoothstep(0.1, 0.5, uSpeed);

    // Spiral pattern
    float spiral = sin(angle * 3.0 + tunnelPos * 30.0 - uTime * 2.0) * 0.5 + 0.5;
    spiral *= sin(angle * 5.0 - tunnelPos * 20.0 + uTime * 1.5) * 0.5 + 0.5;

    // === COLOR MAPPING ===
    // Progress-driven phases:
    //   0.0-0.3: Dark blue / deep space entry
    //   0.3-0.7: Vivid blue + purple plasma peak
    //   0.7-0.9: Gold/warm tones bleed in
    //   0.9-1.0: White bloom emergence

    vec3 voidColor = vec3(0.01, 0.02, 0.06);
    vec3 blueGlow = uColorBlue * (plasma * 0.6 + 0.2);
    vec3 purpleEnergy = mix(uColorPurple, uColorViolet, spiral) * (veins * 0.8 + plasma * 0.3);
    vec3 goldVeins = uColorGold * veins * 1.5;

    // Phase factors
    float entryPhase = smoothstep(0.0, 0.3, uProgress);
    float peakPhase = smoothstep(0.2, 0.5, uProgress) * (1.0 - smoothstep(0.7, 0.9, uProgress));
    float exitPhase = smoothstep(0.65, 0.9, uProgress);
    float bloomPhase = smoothstep(0.85, 1.0, uProgress);

    // Compose color
    vec3 color = voidColor;
    color += blueGlow * 0.3 * entryPhase;
    color += blueGlow * 0.8 * peakPhase;
    color += purpleEnergy * peakPhase;
    color += vec3(streaks) * uColorBlue * 0.6 * peakPhase;
    color += vec3(streaks2) * uColorViolet * 0.4 * peakPhase;
    color += goldVeins * 0.3 * peakPhase;
    color += spiral * uColorPurple * 0.15 * peakPhase;
    color += goldVeins * 0.8 * exitPhase;
    color += uColorGold * plasma * 0.4 * exitPhase;
    color = mix(color, uColorGold * 0.6 + vec3(0.2), exitPhase * 0.3);
    color = mix(color, vec3(1.0, 0.98, 0.95), bloomPhase);

    // Chromatic distortion based on speed
    float chromaOffset = uSpeed * 0.04;
    float noiseR = domainWarpedFBM(spiralUV * 2.0 + vec2(chromaOffset, 0.0), uTime * 0.8);
    float noiseB = domainWarpedFBM(spiralUV * 2.0 - vec2(chromaOffset, 0.0), uTime * 0.8);
    color.r += (noiseR - plasma) * chromaOffset * 3.0 * peakPhase;
    color.b += (noiseB - plasma) * chromaOffset * 3.0 * peakPhase;

    // Emission boost during peak and bloom
    float emission = 1.0 + peakPhase * 0.5 + bloomPhase * 2.0;
    color *= emission;
    color += color * color * 0.1;

    // Alpha
    float alpha = smoothstep(0.0, 0.05, uProgress) * (1.0 - smoothstep(0.98, 1.0, uProgress));
    alpha = max(alpha, bloomPhase * 0.5);

    gl_FragColor = vec4(color, alpha);
  }
`;

// ============================================================
// SPEED STREAK PARTICLE SHADERS
// ============================================================

/**
 * Vertex shader for speed streak particles:
 * - Custom attributes: aSize, aSpeed, aColor, aOffset
 * - gl_PointSize varies with speed for motion blur effect
 * - Color and alpha driven by speed/progress
 */
const streakVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aSpeed;
  attribute vec3 aColor;
  attribute float aOffset;

  uniform float uTime;
  uniform float uProgress;
  uniform float uGlobalSpeed;
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vStretch;

  void main() {
    vColor = aColor;

    // Stretch factor for fragment shader motion blur
    vStretch = uGlobalSpeed * aSpeed;

    // Alpha: brighter at higher speed, fade at entry/exit
    float progressAlpha = smoothstep(0.0, 0.1, uProgress) * (1.0 - smoothstep(0.9, 1.0, uProgress));
    vAlpha = (0.3 + uGlobalSpeed * 0.7) * progressAlpha * (0.5 + aSpeed * 0.5);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Size: larger when closer, elongated at speed
    float sizeMult = 1.0 + uGlobalSpeed * 2.0;
    gl_PointSize = aSize * sizeMult * uPixelRatio * (200.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 1.0, 64.0);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * Fragment shader for speed streak particles:
 * - Elongated ellipse shape for motion blur
 * - Hot white core with colored outer glow
 */
const streakFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vStretch;

  void main() {
    vec2 center = gl_PointCoord - 0.5;

    // Elongate along y-axis for motion blur
    float stretchFactor = max(1.0, vStretch * 3.0);
    center.y /= stretchFactor;

    float dist = length(center);

    // Soft glowing point
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = pow(alpha, 1.5);

    // Hot white core, colored outer glow
    vec3 color = mix(vColor, vec3(1.0), smoothstep(0.15, 0.0, dist));
    color *= 1.5;

    gl_FragColor = vec4(color, alpha * vAlpha);
  }
`;

// ============================================================
// EXIT LIGHT SHADERS
// ============================================================

const exitLightVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Exit light fragment shader:
 * - Warm gold glow at tunnel end
 * - God-ray spoke pattern
 * - Grows and blooms as progress approaches 1.0
 */
const exitLightFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uColorGold;

  varying vec2 vUv;

  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    float angle = atan(center.y, center.x);

    // Exit light grows as progress approaches 1.0
    float lightSize = smoothstep(0.3, 1.0, uProgress);
    float lightRadius = 0.05 + lightSize * 0.45;

    // Core glow
    float glow = 1.0 - smoothstep(0.0, lightRadius, dist);
    glow = pow(glow, 2.0);

    // Outer halo
    float halo = 1.0 - smoothstep(lightRadius * 0.5, lightRadius * 2.5, dist);
    halo = pow(halo, 3.0);

    // God ray spokes
    float rays = sin(angle * 8.0 + uTime * 0.5) * 0.5 + 0.5;
    rays = pow(rays, 4.0);
    float rayMask = halo * rays * 0.5;

    // Secondary finer rays
    float fineRays = sin(angle * 16.0 - uTime * 0.3) * 0.5 + 0.5;
    fineRays = pow(fineRays, 6.0);
    float fineRayMask = halo * fineRays * 0.25;

    // Color: warm gold center, white-hot core
    vec3 coreColor = vec3(1.0, 0.98, 0.92);
    vec3 warmColor = uColorGold * 1.5;
    vec3 color = mix(warmColor, coreColor, glow);
    color += warmColor * rayMask;
    color += coreColor * fineRayMask * 0.5;

    // Intensity driven by progress
    float intensity = smoothstep(0.2, 0.6, uProgress) * 2.0;
    intensity += smoothstep(0.8, 1.0, uProgress) * 3.0;

    float alpha = (glow + halo * 0.3 + rayMask + fineRayMask) * intensity;
    alpha = clamp(alpha, 0.0, 1.0);

    // Full bloom at the very end
    float bloomPhase = smoothstep(0.9, 1.0, uProgress);
    color = mix(color, vec3(1.0), bloomPhase * 0.7);
    alpha = mix(alpha, 1.0, bloomPhase * (1.0 - smoothstep(0.0, 0.6, dist)));

    gl_FragColor = vec4(color, alpha);
  }
`;

// ============================================================
// HELPER: Compute speed from progress (ramp-up, sustain, ramp-down)
// ============================================================

function getSpeed(progress: number): number {
  if (progress < 0.3) {
    // Acceleration: 0 -> 1 over progress 0-0.3
    const t = progress / 0.3;
    return t * t; // Ease-in quadratic
  } else if (progress < 0.7) {
    return 1.0; // Full hyperspace
  } else {
    // Deceleration: 1 -> 0 over progress 0.7-1.0
    const t = (progress - 0.7) / 0.3;
    return 1.0 - t * t; // Ease-out quadratic
  }
}

// ============================================================
// TUNNEL WALLS COMPONENT
// ============================================================

function TunnelWalls({
  progress,
  speed,
}: {
  progress: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Cylinder: radius 4, height 60, 64 radial segments, 128 height segments, open-ended
  const geometry = useMemo(
    () =>
      new THREE.CylinderGeometry(
        TUNNEL_RADIUS,
        TUNNEL_RADIUS,
        TUNNEL_LENGTH,
        64,
        128,
        true
      ),
    []
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uSpeed: { value: 0 },
      uColorBlue: { value: new THREE.Color(0x00d4ff) },
      uColorPurple: { value: new THREE.Color(0x7b2ff7) },
      uColorGold: { value: new THREE.Color(0xffd700) },
      uColorViolet: { value: new THREE.Color(0x8b5cf6) },
    }),
    []
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
    uniforms.uProgress.value = THREE.MathUtils.lerp(
      uniforms.uProgress.value,
      progress,
      0.1
    );
    uniforms.uSpeed.value = THREE.MathUtils.lerp(
      uniforms.uSpeed.value,
      speed,
      0.1
    );
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <shaderMaterial
        vertexShader={tunnelVertexShader}
        fragmentShader={tunnelFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ============================================================
// SPEED STREAK PARTICLES COMPONENT
// ============================================================

function SpeedStreaks({
  progress,
  speed,
}: {
  progress: number;
  speed: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, sizes, speeds, colors, offsets, velocities } =
    useMemo(() => {
      const pos = new Float32Array(PARTICLE_COUNT * 3);
      const sz = new Float32Array(PARTICLE_COUNT);
      const spd = new Float32Array(PARTICLE_COUNT);
      const col = new Float32Array(PARTICLE_COUNT * 3);
      const off = new Float32Array(PARTICLE_COUNT);
      const vel = new Float32Array(PARTICLE_COUNT);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Distribute inside the cylinder along its length
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.5 + Math.random() * (TUNNEL_RADIUS - 0.8);
        const y = (Math.random() - 0.5) * TUNNEL_LENGTH;

        pos[i3] = Math.cos(angle) * radius;
        pos[i3 + 1] = y;
        pos[i3 + 2] = Math.sin(angle) * radius;

        sz[i] = 0.5 + Math.random() * 2.0;
        spd[i] = 0.3 + Math.random() * 0.7;
        vel[i] = 0.5 + Math.random() * 1.5;
        off[i] = Math.random() * TUNNEL_LENGTH;

        // Color distribution: white-hot, neon blue, purple, gold
        const colorChoice = Math.random();
        if (colorChoice < 0.4) {
          // White-hot
          col[i3] = 0.9 + Math.random() * 0.1;
          col[i3 + 1] = 0.9 + Math.random() * 0.1;
          col[i3 + 2] = 1.0;
        } else if (colorChoice < 0.65) {
          // Neon blue (#00d4ff)
          col[i3] = 0.0;
          col[i3 + 1] = 0.83;
          col[i3 + 2] = 1.0;
        } else if (colorChoice < 0.85) {
          // Purple (#8b5cf6)
          col[i3] = 0.545;
          col[i3 + 1] = 0.361;
          col[i3 + 2] = 0.965;
        } else {
          // Gold (#ffd700)
          col[i3] = 1.0;
          col[i3 + 1] = 0.843;
          col[i3 + 2] = 0.0;
        }
      }

      return {
        positions: pos,
        sizes: sz,
        speeds: spd,
        colors: col,
        offsets: off,
        velocities: vel,
      };
    }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uGlobalSpeed: { value: 0 },
      uPixelRatio: { value: 1 },
    }),
    []
  );

  useFrame((state) => {
    if (!pointsRef.current) return;

    uniforms.uTime.value = state.clock.getElapsedTime();
    uniforms.uProgress.value = progress;
    uniforms.uGlobalSpeed.value = THREE.MathUtils.lerp(
      uniforms.uGlobalSpeed.value,
      speed,
      0.08
    );
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();

    // Move particles along the tunnel axis, recycle when past the camera
    const posAttr = pointsRef.current.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    const halfLength = TUNNEL_LENGTH / 2;
    const moveSpeed = speed * 0.8;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Advance along tunnel axis (y in cylinder-local space)
      posArray[i3 + 1] += velocities[i] * moveSpeed * 0.5;

      // Recycle particles that pass the end
      if (posArray[i3 + 1] > halfLength) {
        posArray[i3 + 1] = -halfLength + Math.random() * 5;
        // Re-randomize radial position
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.5 + Math.random() * (TUNNEL_RADIUS - 0.8);
        posArray[i3] = Math.cos(angle) * radius;
        posArray[i3 + 2] = Math.sin(angle) * radius;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points
      ref={pointsRef}
      frustumCulled={false}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[sizes, 1]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          args={[speeds, 1]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-aColor"
          args={[colors, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-aOffset"
          args={[offsets, 1]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={streakVertexShader}
        fragmentShader={streakFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ============================================================
// EXIT LIGHT COMPONENT
// ============================================================

function ExitLight({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => new THREE.PlaneGeometry(12, 12), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uColorGold: { value: new THREE.Color(0xffd700) },
    }),
    []
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
    uniforms.uProgress.value = THREE.MathUtils.lerp(
      uniforms.uProgress.value,
      progress,
      0.08
    );

    // Face the exit light toward the camera
    if (meshRef.current) {
      meshRef.current.lookAt(state.camera.position);
    }
  });

  // Only render once progress is meaningful
  if (progress < 0.15) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, 0, -TUNNEL_LENGTH * 0.48]}
    >
      <shaderMaterial
        vertexShader={exitLightVertexShader}
        fragmentShader={exitLightFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ============================================================
// CAMERA CONTROLLER
// ============================================================

/**
 * Controls camera position, rotation, and FOV based on scroll progress.
 * - Moves forward through the tunnel (z: 25 -> -25)
 * - Subtle banking/oscillation for cinematic feel
 * - FOV widens at peak speed, narrows on deceleration
 */
function CameraController({ progress }: { progress: number }) {
  const { camera } = useThree();
  const targetFovRef = useRef(50);

  useFrame(() => {
    const speed = getSpeed(progress);

    // Camera position: travel forward through the tunnel
    const targetZ = 25 - progress * 50;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.06);

    // Gentle banking for cinematic feel
    const bankAmount = Math.sin(progress * Math.PI * 3) * 0.08 * speed;
    camera.rotation.z = THREE.MathUtils.lerp(
      camera.rotation.z,
      bankAmount,
      0.04
    );

    // Subtle vertical oscillation
    const yOscillation = Math.sin(progress * Math.PI * 5) * 0.3 * speed;
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      yOscillation,
      0.04
    );

    // FOV: 50 at entry -> 75 at peak speed -> 50 at exit
    const baseFov = 50;
    const speedFov = baseFov + speed * 25;
    const exitNarrow =
      progress > 0.85 ? ((progress - 0.85) / 0.15) * 10 : 0;
    targetFovRef.current = speedFov - exitNarrow;

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(
        camera.fov,
        targetFovRef.current,
        0.06
      );
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

// ============================================================
// TUNNEL LIGHTING
// ============================================================

/**
 * Dynamic point lights that follow the camera and shift color/intensity
 * based on tunnel progress phase.
 */
function TunnelLighting({ progress }: { progress: number }) {
  const blueRef = useRef<THREE.PointLight>(null);
  const purpleRef = useRef<THREE.PointLight>(null);
  const goldRef = useRef<THREE.PointLight>(null);
  const exitRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speed = getSpeed(progress);

    // Blue light: strong during early/peak phases
    if (blueRef.current) {
      const blueTarget =
        (0.5 + speed * 1.5) *
        (1.0 - Math.max(0, Math.min(1, (progress - 0.8) / 0.2)));
      blueRef.current.intensity = THREE.MathUtils.lerp(
        blueRef.current.intensity,
        blueTarget,
        0.05
      );
      blueRef.current.position.z = state.camera.position.z + 5;
    }

    // Purple light: peaks mid-journey
    if (purpleRef.current) {
      const purpleTarget =
        Math.max(0, Math.min(1, (progress - 0.1) / 0.2)) *
        (1.0 - Math.max(0, Math.min(1, (progress - 0.7) / 0.2))) *
        1.5;
      purpleRef.current.intensity = THREE.MathUtils.lerp(
        purpleRef.current.intensity,
        purpleTarget,
        0.05
      );
      purpleRef.current.position.z = state.camera.position.z;
      purpleRef.current.position.x = Math.sin(time * 0.5) * 2;
    }

    // Gold light: appears in exit phase
    if (goldRef.current) {
      const goldTarget =
        Math.max(0, Math.min(1, (progress - 0.6) / 0.3)) * 2.0;
      goldRef.current.intensity = THREE.MathUtils.lerp(
        goldRef.current.intensity,
        goldTarget,
        0.05
      );
      goldRef.current.position.z = state.camera.position.z - 10;
    }

    // Exit light: bright beacon at the tunnel end
    if (exitRef.current) {
      const exitTarget =
        Math.max(0, Math.min(1, (progress - 0.5) / 0.5)) * 4.0;
      exitRef.current.intensity = THREE.MathUtils.lerp(
        exitRef.current.intensity,
        exitTarget,
        0.05
      );
      exitRef.current.position.z = -TUNNEL_LENGTH * 0.48;
    }
  });

  return (
    <>
      <pointLight
        ref={blueRef}
        color="#00d4ff"
        intensity={0.5}
        distance={30}
        decay={2}
      />
      <pointLight
        ref={purpleRef}
        color="#7b2ff7"
        intensity={0}
        distance={20}
        decay={2}
      />
      <pointLight
        ref={goldRef}
        color="#ffd700"
        intensity={0}
        distance={25}
        decay={2}
      />
      <pointLight
        ref={exitRef}
        color="#fff5c2"
        intensity={0}
        distance={40}
        decay={2}
      />
    </>
  );
}

// ============================================================
// SCENE CONTENTS (rendered inside Canvas)
// ============================================================

function WarpTunnelScene({ progress }: { progress: number }) {
  const speed = getSpeed(progress);

  return (
    <>
      <CameraController progress={progress} />
      <TunnelLighting progress={progress} />

      {/* Dim ambient for base visibility */}
      <ambientLight intensity={0.03} />

      {/* Depth fog for atmospheric depth */}
      <fog attach="fog" args={["#020208", 5, 50]} />

      {/* Tunnel walls: BackSide-rendered cylinder with plasma shader */}
      <TunnelWalls progress={progress} speed={speed} />

      {/* 2500 speed streak particles */}
      <SpeedStreaks progress={progress} speed={speed} />

      {/* Exit light with god rays at tunnel end */}
      <ExitLight progress={progress} />
    </>
  );
}

// ============================================================
// MAIN EXPORTED COMPONENT
// ============================================================

/**
 * WarpTunnel -- Full-screen R3F Canvas rendering a GLSL wormhole/hyperspace
 * tunnel effect. The user experiences this as "traveling through the Stargate"
 * between the hero and battle sections.
 *
 * Features:
 * - Procedural GLSL tunnel with FBM noise, domain warping, voronoi veins
 * - 2500 speed streak particles with motion blur
 * - Scroll-driven animation via progress prop (0-1)
 * - Dynamic camera progression with FOV and banking
 * - Exit light with god-ray effects
 * - PerformanceMonitor for auto DPR adjustment
 */
export function WarpTunnel({ progress, visible }: WarpTunnelProps) {
  const [dpr, setDpr] = useState<[number, number]>([1, 2]);

  const handleIncline = useCallback(() => {
    setDpr([1, 2]);
  }, []);

  const handleDecline = useCallback(() => {
    setDpr([1, 1.5]);
  }, []);

  // Don't render when not visible -- save GPU resources
  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{ background: "#050505" }}
    >
      <Canvas
        camera={{ position: [0, 0, 25], fov: 50, near: 0.1, far: 100 }}
        dpr={dpr}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        style={{ background: "#050505" }}
      >
        <Suspense fallback={null}>
          <PerformanceMonitor
            onIncline={handleIncline}
            onDecline={handleDecline}
            flipflops={3}
            bounds={(refreshrate) => [refreshrate * 0.5, refreshrate * 0.8]}
          />
          <WarpTunnelScene progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
