"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EventHorizonProps {
  activation: number; // 0-1
  zoomIntensity?: number; // 0-1 scroll-driven zoom, intensifies portal effects
}

/**
 * The event horizon -- a stunning liquid portal surface inside the Stargate ring.
 *
 * Shader features:
 *   - Voronoi noise (Worley F2-F1 ridges) for organic cellular veins
 *   - 5-octave domain-warped FBM (Inigo Quilez technique) for fluid folding
 *   - Chromatic aberration based on distance from center
 *   - Proper Fresnel rim glow from gradient-derived normals
 *   - HSV color cycling in blue-purple range
 *   - Random pulse ripples triggered every 2-5 seconds
 *   - Gold vein highlights at voronoi edge intersections
 *   - Pulsing bright center glow
 *   - Multi-layer vertex displacement with edge shimmer
 *   - 128-segment circle geometry for smooth edges
 *
 * Only renders when activation > 0.3. Alpha driven by uActivation.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uActivation;
  uniform float uPulse;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  // Hash for pseudo-random
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // Simple 2D noise for vertex displacement
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vUv = uv;
    vNormal = normal;

    vec3 pos = position;
    float dist = length(pos.xy);
    float angle = atan(pos.y, pos.x);

    // Layer 1: Primary concentric wave
    float wave1 = sin(dist * 8.0 - uTime * 2.5) * 0.05;

    // Layer 2: Slower outward ripple
    float wave2 = cos(dist * 5.0 + uTime * 1.8) * 0.035;

    // Layer 3: Directional wave for asymmetry
    float wave3 = sin(pos.x * 3.0 + pos.y * 2.0 + uTime * 1.2) * 0.025;

    // Layer 4: Noise-based organic displacement
    float noiseDisp = vnoise(pos.xy * 3.0 + uTime * 0.4) * 0.04;

    // Layer 5: Edge shimmer -- higher frequency near the rim
    float edgeFactor = smoothstep(0.3, 0.5, dist);
    float edgeShimmer = sin(angle * 12.0 + uTime * 4.0) * 0.015 * edgeFactor;
    edgeShimmer += sin(angle * 7.0 - uTime * 3.0) * 0.01 * edgeFactor;

    // Pulse ripple -- expanding ring from center
    float pulseRing = sin((dist - uPulse * 1.2) * 25.0) * exp(-abs(dist - uPulse * 1.2) * 8.0);
    float pulseDisp = pulseRing * 0.06 * smoothstep(0.0, 0.3, uPulse) * (1.0 - smoothstep(0.7, 1.0, uPulse));

    float totalDisp = (wave1 + wave2 + wave3 + noiseDisp + edgeShimmer + pulseDisp) * uActivation;
    pos.z += totalDisp;

    vPosition = pos;
    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uActivation;
  uniform float uPulse;
  uniform vec3 uColor1;   // neon-blue
  uniform vec3 uColor2;   // electric-violet
  uniform vec3 uColorGold; // gold highlights

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  // ============================================================
  // HASH & NOISE UTILITIES
  // ============================================================

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  float hash1(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // ============================================================
  // VORONOI NOISE (Worley) -- F1, F2 distances and cell ID
  // Returns vec3(F1, F2, cellID)
  // ============================================================
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
        // Animate cell seed points for drifting cells
        o = 0.5 + 0.5 * sin(time * 0.6 + 6.2831 * o);
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

  // ============================================================
  // VALUE NOISE for FBM base
  // ============================================================
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // smoothstep

    float a = hash1(i);
    float b = hash1(i + vec2(1.0, 0.0));
    float c = hash1(i + vec2(0.0, 1.0));
    float d = hash1(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // ============================================================
  // DOMAIN-WARPED FBM (5 octaves, Inigo Quilez technique)
  // Creates "fluid folding into itself" effect
  // ============================================================
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    // Rotation matrix to break axis alignment between octaves
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);

    for (int i = 0; i < 5; i++) {
      value += amplitude * vnoise(p * frequency);
      p = rot * p;
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  float domainWarpedFBM(vec2 p, float time) {
    // First warp
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + time * 0.15),
      fbm(p + vec2(5.2, 1.3) - time * 0.12)
    );
    // Second warp (warp the warp)
    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(1.7, 9.2) + time * 0.09),
      fbm(p + 4.0 * q + vec2(8.3, 2.8) - time * 0.07)
    );
    return fbm(p + 4.0 * r);
  }

  // ============================================================
  // HSV <-> RGB conversion for color cycling
  // ============================================================
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  // ============================================================
  // MAIN FRAGMENT
  // ============================================================
  void main() {
    vec2 uv = vUv - 0.5;
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);

    // === DOMAIN-WARPED FBM === fluid folding
    float warpedNoise = domainWarpedFBM(uv * 3.0, uTime);

    // === VORONOI === cellular liquid pattern
    vec3 vor = voronoi(uv * 6.0 + warpedNoise * 0.5, uTime);
    float F1 = vor.x;
    float F2 = vor.y;
    // F2-F1 ridge pattern -- bright at cell boundaries
    float ridge = F2 - F1;
    ridge = smoothstep(0.0, 0.15, ridge);
    float veinEdge = 1.0 - ridge; // Bright veins between cells

    // === CONCENTRIC RIPPLES (with warping) ===
    float warpedDist = dist + warpedNoise * 0.1;
    float ripple1 = sin(warpedDist * 18.0 - uTime * 3.0) * 0.5 + 0.5;
    float ripple2 = sin(warpedDist * 12.0 - uTime * 2.2 + 1.5) * 0.5 + 0.5;
    float ripples = ripple1 * ripple2;

    // === SPIRAL FLOW ===
    float spiral = sin(angle * 3.0 + dist * 10.0 - uTime * 1.5 + warpedNoise * 3.0) * 0.5 + 0.5;

    // === PULSE RIPPLE (triggered randomly) ===
    float pulseRingDist = abs(dist - uPulse * 0.6);
    float pulseRing = exp(-pulseRingDist * 30.0) * smoothstep(0.0, 0.1, uPulse) * (1.0 - smoothstep(0.8, 1.0, uPulse));

    // === COMBINE PATTERNS ===
    float pattern = 0.0;
    pattern += warpedNoise * 0.35;
    pattern += ripples * 0.2;
    pattern += spiral * 0.15;
    pattern += veinEdge * 0.3;

    // === HSV COLOR CYCLING ===
    // Slowly shift hue over time in the blue-purple range (0.55-0.8)
    float hueBase = 0.58 + sin(uTime * 0.2) * 0.1;
    float hueShift = pattern * 0.12;
    float hue = hueBase + hueShift;
    float sat = 0.7 + pattern * 0.2;
    float val = 0.5 + pattern * 0.4;
    vec3 hsvColor = hsv2rgb(vec3(hue, sat, val));

    // Mix with explicit colors for punch
    vec3 color = mix(hsvColor, uColor1, ripples * 0.3);
    color = mix(color, uColor2, spiral * 0.2);

    // === GOLD VEIN HIGHLIGHTS ===
    // Where voronoi edges are sharp, add gold accent
    float goldMask = veinEdge * smoothstep(0.5, 0.9, warpedNoise);
    color = mix(color, uColorGold, goldMask * 0.4);

    // Subtle gold shimmer on ridges
    float goldShimmer = veinEdge * sin(uTime * 5.0 + vor.z * 10.0) * 0.5 + 0.5;
    color += uColorGold * goldShimmer * veinEdge * 0.15;

    // === CHROMATIC ABERRATION ===
    // Offset R/G/B by slightly different UV amounts based on distance
    float chromaStrength = dist * 0.03;
    vec2 uvR = uv * (1.0 + chromaStrength * 1.0);
    vec2 uvB = uv * (1.0 - chromaStrength * 1.0);

    // Recalculate a simplified pattern for offset channels
    float distR = length(uvR);
    float distB = length(uvB);
    float noiseR = domainWarpedFBM(uvR * 3.0, uTime);
    float noiseB = domainWarpedFBM(uvB * 3.0, uTime);

    // Apply subtle chromatic shift
    color.r = mix(color.r, color.r * (0.8 + noiseR * 0.4), chromaStrength * 8.0);
    color.b = mix(color.b, color.b * (0.8 + noiseB * 0.4), chromaStrength * 8.0);

    // === FRESNEL RIM EFFECT ===
    // Derive fake surface normal from displacement gradient
    float eps = 0.01;
    float hL = domainWarpedFBM((uv + vec2(-eps, 0.0)) * 3.0, uTime);
    float hR = domainWarpedFBM((uv + vec2(eps, 0.0)) * 3.0, uTime);
    float hD = domainWarpedFBM((uv + vec2(0.0, -eps)) * 3.0, uTime);
    float hU = domainWarpedFBM((uv + vec2(0.0, eps)) * 3.0, uTime);

    vec3 surfNormal = normalize(vec3(
      (hL - hR) / (2.0 * eps),
      (hD - hU) / (2.0 * eps),
      1.0
    ));
    // View direction approximation (looking down Z)
    vec3 viewDir = normalize(vec3(uv * 0.5, 1.0));
    float fresnel = 1.0 - max(dot(surfNormal, viewDir), 0.0);
    fresnel = pow(fresnel, 2.5);

    // Edge distance Fresnel boost
    float edgeFresnel = smoothstep(0.25, 0.48, dist);
    float combinedFresnel = max(fresnel * 0.6, edgeFresnel);

    // Apply Fresnel as bright rim
    vec3 fresnelColor = mix(uColor1 * 1.5, vec3(1.0), 0.3);
    color += fresnelColor * combinedFresnel * 0.7;

    // === CENTER GLOW ===
    float centerGlow = 1.0 - smoothstep(0.0, 0.25, dist);
    float centerPulse = 0.8 + sin(uTime * 2.5) * 0.2;
    vec3 centerColor = mix(uColor1 * 2.0, vec3(1.0, 1.0, 1.0), 0.4);
    color += centerColor * centerGlow * centerPulse * 0.5;

    // === PULSE RIPPLE EFFECT ===
    vec3 pulseColor = mix(uColor1 * 2.0, vec3(1.0), 0.5);
    color += pulseColor * pulseRing * 1.5;

    // === OVERALL BRIGHTNESS & TONE ===
    color *= 1.3;
    // Subtle bloom approximation
    color += color * color * 0.15;

    // === ALPHA ===
    float circleMask = 1.0 - smoothstep(0.42, 0.5, dist);
    float alpha = circleMask * uActivation * (0.75 + warpedNoise * 0.25);

    gl_FragColor = vec4(color, alpha);
  }
`;

export function EventHorizon({ activation, zoomIntensity = 0 }: EventHorizonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseTimerRef = useRef<number>(0);
  const nextPulseRef = useRef<number>(2.0 + Math.random() * 3.0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uActivation: { value: 0 },
      uPulse: { value: 0 },
      uColor1: { value: new THREE.Color(0x00d4ff) },
      uColor2: { value: new THREE.Color(0x8b5cf6) },
      uColorGold: { value: new THREE.Color(0xffd700) },
    }),
    []
  );

  // Higher resolution geometry -- 128 segments for smooth edges
  const geometry = useMemo(
    () => new THREE.CircleGeometry(2.7, 128),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const delta = state.clock.getDelta();

    // Speed up time factor as camera zooms in -- portal surface animates faster
    const timeMultiplier = 1 + zoomIntensity * 0.8;
    uniforms.uTime.value = time * timeMultiplier;
    uniforms.uActivation.value = THREE.MathUtils.lerp(
      uniforms.uActivation.value,
      activation,
      0.05
    );

    // Brighten portal colors as zoom increases
    const zoomBrightness = 1 + zoomIntensity * 0.6;
    uniforms.uColor1.value.setRGB(
      0 * zoomBrightness,
      0.83 * zoomBrightness,
      1.0 * zoomBrightness
    );

    // Random pulse ripple system: trigger more frequently as camera approaches
    const pulseInterval = Math.max(0.5, (2.0 + Math.random() * 3.0) * (1 - zoomIntensity * 0.7));
    if (activation > 0.5) {
      pulseTimerRef.current += delta;

      if (pulseTimerRef.current >= (nextPulseRef.current * (1 - zoomIntensity * 0.6))) {
        // Reset pulse
        uniforms.uPulse.value = 0.001; // Start a new pulse
        pulseTimerRef.current = 0;
        nextPulseRef.current = pulseInterval;
      }

      // Advance pulse animation (0 -> 1 over ~1.5 seconds)
      // Pulses are faster when zoomed in
      const pulseSpeed = 0.7 + zoomIntensity * 0.8;
      if (uniforms.uPulse.value > 0 && uniforms.uPulse.value < 1.0) {
        uniforms.uPulse.value += delta * pulseSpeed;
        if (uniforms.uPulse.value >= 1.0) {
          uniforms.uPulse.value = 0;
        }
      }
    }

    // Scale event horizon slightly larger as camera approaches for immersion
    if (meshRef.current) {
      const portalScale = 1 + zoomIntensity * 0.15;
      meshRef.current.scale.set(portalScale, portalScale, 1);
    }
  });

  // Only render when there is enough activation to see
  if (activation < 0.3) return null;

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0.05]}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
