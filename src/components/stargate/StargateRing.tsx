"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StargateRingProps {
  activated: boolean;
  activationProgress: number;
}

/**
 * The Stargate ring structure -- a large metallic torus with:
 *   - Angular velocity with inertia (smooth acceleration/deceleration)
 *   - Shake on chevron lock (vibration impulse that decays)
 *   - Energy veins pulsing around the ring (TubeGeometry with custom shader)
 *   - Chevron spark particles (gold burst on lock)
 *   - Inner counter-rotating ring
 *   - 9 chevron indicators with enhanced lock animation
 */

// ============================================================
// ENERGY VEIN SHADER -- light pulse traveling around the ring
// ============================================================
const veinVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    vUv = uv;
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const veinFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uActivation;
  uniform vec3 uColor;

  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    // Traveling pulse along the ring (using UV.x as position along tube)
    float pulse1 = sin(vUv.x * 6.2831 * 2.0 - uTime * 3.0) * 0.5 + 0.5;
    float pulse2 = sin(vUv.x * 6.2831 * 3.0 + uTime * 2.0) * 0.5 + 0.5;
    float pulse3 = sin(vUv.x * 6.2831 * 5.0 - uTime * 5.0) * 0.5 + 0.5;

    // Combine pulses for complex traveling light pattern
    float intensity = pulse1 * 0.5 + pulse2 * 0.3 + pulse3 * 0.2;
    intensity = pow(intensity, 2.0); // Sharpen

    // Fade at tube edges (radial falloff around tube cross-section)
    float tubeFade = 1.0 - abs(vUv.y - 0.5) * 2.0;
    tubeFade = pow(tubeFade, 1.5);

    vec3 color = uColor * intensity * 2.0;
    float alpha = intensity * tubeFade * uActivation * 0.8;

    gl_FragColor = vec4(color, alpha);
  }
`;

// ============================================================
// CHEVRON SPARK SHADER -- soft glow sprites
// ============================================================
const sparkVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aLife;

  varying float vLife;

  void main() {
    vLife = aLife;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const sparkFragmentShader = /* glsl */ `
  varying float vLife;

  void main() {
    // Soft circular glow
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float glow = 1.0 - smoothstep(0.0, 1.0, d);
    glow = pow(glow, 2.0);

    // Gold -> white core
    vec3 color = mix(vec3(1.0, 0.84, 0.0), vec3(1.0, 1.0, 0.9), glow * 0.5);

    // Fade with life
    float alpha = glow * (1.0 - vLife) * 0.9;

    gl_FragColor = vec4(color, alpha);
  }
`;

// Max sparks per chevron burst
const SPARKS_PER_CHEVRON = 35;
const CHEVRON_COUNT = 9;
const MAX_TOTAL_SPARKS = SPARKS_PER_CHEVRON * CHEVRON_COUNT;

export function StargateRing({ activated, activationProgress }: StargateRingProps) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const chevronsRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const sparksRef = useRef<THREE.Points>(null);

  // Angular velocity system with inertia
  const outerVelocityRef = useRef<number>(0.002);
  const innerVelocityRef = useRef<number>(-0.003);
  const outerAngleRef = useRef<number>(0);
  const innerAngleRef = useRef<number>(0);

  // Shake system
  const shakeIntensityRef = useRef<number>(0);
  const shakeDecayRef = useRef<number>(0.92);

  // Chevron lock tracking
  const lockedChevronsRef = useRef<Set<number>>(new Set());
  const lastProgressRef = useRef<number>(0);

  // Spark particle data
  const sparkData = useMemo(() => {
    const positions = new Float32Array(MAX_TOTAL_SPARKS * 3);
    const sizes = new Float32Array(MAX_TOTAL_SPARKS);
    const lives = new Float32Array(MAX_TOTAL_SPARKS);
    const velocities = new Float32Array(MAX_TOTAL_SPARKS * 3);
    const active = new Uint8Array(MAX_TOTAL_SPARKS); // 0 = inactive

    for (let i = 0; i < MAX_TOTAL_SPARKS; i++) {
      sizes[i] = 0.03 + Math.random() * 0.08;
      lives[i] = 1.0; // Start dead
    }

    return { positions, sizes, lives, velocities, active };
  }, []);

  // Pre-compute chevron positions around the ring
  const chevronPositions = useMemo(() => {
    const positions: { x: number; y: number; angle: number }[] = [];
    const ringRadius = 3.0;
    for (let i = 0; i < CHEVRON_COUNT; i++) {
      const angle = (i / CHEVRON_COUNT) * Math.PI * 2 - Math.PI / 2;
      positions.push({
        x: Math.cos(angle) * ringRadius,
        y: Math.sin(angle) * ringRadius,
        angle,
      });
    }
    return positions;
  }, []);

  // Ring materials
  const outerMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x888899),
        metalness: 0.8,
        roughness: 0.3,
        envMapIntensity: 0.5,
      }),
    []
  );

  const innerMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x6a6a7a),
        metalness: 0.85,
        roughness: 0.25,
        envMapIntensity: 0.4,
      }),
    []
  );

  // Ring geometries
  const outerGeometry = useMemo(
    () => new THREE.TorusGeometry(3, 0.15, 24, 64),
    []
  );
  const innerGeometry = useMemo(
    () => new THREE.TorusGeometry(2.85, 0.08, 16, 64),
    []
  );

  // Energy vein tube geometry -- follows the ring path
  const veinGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 100;
    const radius = 3.0;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0.08));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    return new THREE.TubeGeometry(curve, 128, 0.025, 8, true);
  }, []);

  // Energy vein uniforms
  const veinUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uActivation: { value: 0 },
      uColor: { value: new THREE.Color(0x00d4ff) },
    }),
    []
  );

  // Chevron geometry
  const chevronGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.18);
    shape.lineTo(-0.1, -0.08);
    shape.lineTo(-0.06, -0.12);
    shape.lineTo(0, -0.02);
    shape.lineTo(0.06, -0.12);
    shape.lineTo(0.1, -0.08);
    shape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Spark material
  const sparkMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: sparkVertexShader,
        fragmentShader: sparkFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  // Spawn sparks at a chevron position
  const spawnSparks = (chevronIndex: number) => {
    const pos = chevronPositions[chevronIndex];
    const baseIdx = chevronIndex * SPARKS_PER_CHEVRON;

    for (let i = 0; i < SPARKS_PER_CHEVRON; i++) {
      const idx = baseIdx + i;
      const i3 = idx * 3;

      // Start at chevron position
      sparkData.positions[i3] = pos.x;
      sparkData.positions[i3 + 1] = pos.y;
      sparkData.positions[i3 + 2] = 0.1;

      // Spray outward from chevron
      const spreadAngle = pos.angle + (Math.random() - 0.5) * 1.2;
      const speed = 1.5 + Math.random() * 3.0;
      sparkData.velocities[i3] = Math.cos(spreadAngle) * speed;
      sparkData.velocities[i3 + 1] = Math.sin(spreadAngle) * speed;
      sparkData.velocities[i3 + 2] = (Math.random() - 0.5) * 2.0;

      sparkData.lives[idx] = 0;
      sparkData.active[idx] = 1;
      sparkData.sizes[idx] = 0.04 + Math.random() * 0.1;
    }
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const delta = Math.min(state.clock.getDelta(), 0.05); // Cap delta

    // === ANGULAR VELOCITY WITH INERTIA ===
    // Target velocity depends on activation state
    const targetOuterVel = activated
      ? 0.004 // Gentle idle after full activation
      : 0.002 + activationProgress * 0.025; // Accelerate during activation

    const targetInnerVel = activated
      ? -0.005
      : -0.003 - activationProgress * 0.018;

    // Smooth acceleration/deceleration with damping
    const accelRate = 0.02;
    outerVelocityRef.current += (targetOuterVel - outerVelocityRef.current) * accelRate;
    innerVelocityRef.current += (targetInnerVel - innerVelocityRef.current) * accelRate;

    outerAngleRef.current += outerVelocityRef.current;
    innerAngleRef.current += innerVelocityRef.current;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = outerAngleRef.current;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = innerAngleRef.current;
    }

    // === CHEVRON LOCK DETECTION & SHAKE ===
    for (let i = 0; i < CHEVRON_COUNT; i++) {
      const lockThreshold = (i + 1) / CHEVRON_COUNT;
      const isNowLocked = activationProgress >= lockThreshold;
      const wasLocked = lockedChevronsRef.current.has(i);

      if (isNowLocked && !wasLocked) {
        // Chevron just locked -- trigger shake
        lockedChevronsRef.current.add(i);
        shakeIntensityRef.current = 0.04; // Vibration impulse
        // Spawn spark particles
        spawnSparks(i);
      }
    }

    // Apply shake with decay
    if (shakeIntensityRef.current > 0.001 && groupRef.current) {
      const shakeX = (Math.random() - 0.5) * shakeIntensityRef.current;
      const shakeY = (Math.random() - 0.5) * shakeIntensityRef.current;
      groupRef.current.position.x = shakeX;
      groupRef.current.position.y = shakeY;
      shakeIntensityRef.current *= shakeDecayRef.current; // Exponential decay
    } else if (groupRef.current) {
      // Settle back to center
      groupRef.current.position.x *= 0.9;
      groupRef.current.position.y *= 0.9;
    }

    // === ENERGY VEIN UNIFORMS ===
    veinUniforms.uTime.value = time;
    veinUniforms.uActivation.value = THREE.MathUtils.lerp(
      veinUniforms.uActivation.value,
      activationProgress,
      0.05
    );

    // === CHEVRON COLOR ANIMATION ===
    if (chevronsRef.current) {
      chevronsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;

        const lockThreshold = (i + 1) / CHEVRON_COUNT;
        const isLocked = activationProgress >= lockThreshold;
        const isLocking =
          activationProgress >= lockThreshold - 0.05 &&
          activationProgress < lockThreshold;
        // Just-locked flash: brief bright white-blue flash
        const justLockedTime = activationProgress - lockThreshold;
        const isFlashing = justLockedTime >= 0 && justLockedTime < 0.08;

        if (isFlashing) {
          // Bright white-blue flash on lock
          material.color.lerp(new THREE.Color(0xffffff), 0.4);
          material.emissive.lerp(new THREE.Color(0x88ddff), 0.4);
          material.emissiveIntensity = THREE.MathUtils.lerp(
            material.emissiveIntensity,
            3.0,
            0.3
          );
        } else if (isLocked) {
          // Locked: neon-blue with pulsing emissive glow
          material.color.lerp(new THREE.Color(0x00d4ff), 0.1);
          material.emissive.lerp(new THREE.Color(0x00d4ff), 0.1);
          material.emissiveIntensity = THREE.MathUtils.lerp(
            material.emissiveIntensity,
            0.8 + Math.sin(time * 3 + i) * 0.2,
            0.1
          );
        } else if (isLocking) {
          // Locking transition: flash gold
          material.color.lerp(new THREE.Color(0xffd700), 0.2);
          material.emissive.lerp(new THREE.Color(0xffd700), 0.2);
          material.emissiveIntensity = THREE.MathUtils.lerp(
            material.emissiveIntensity,
            2.0,
            0.15
          );
        } else {
          // Idle: dark, no glow
          material.color.lerp(new THREE.Color(0x333333), 0.05);
          material.emissive.lerp(new THREE.Color(0x000000), 0.05);
          material.emissiveIntensity = THREE.MathUtils.lerp(
            material.emissiveIntensity,
            0.0,
            0.05
          );
        }
      });
    }

    // === SPARK PARTICLE UPDATE ===
    if (sparksRef.current) {
      const posAttr = sparksRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      const sizeAttr = sparksRef.current.geometry.getAttribute("aSize") as THREE.BufferAttribute;
      const lifeAttr = sparksRef.current.geometry.getAttribute("aLife") as THREE.BufferAttribute;

      for (let i = 0; i < MAX_TOTAL_SPARKS; i++) {
        if (!sparkData.active[i]) continue;

        const i3 = i * 3;

        // Advance life (0 -> 1 over ~0.5s)
        sparkData.lives[i] += delta * 2.0;

        if (sparkData.lives[i] >= 1.0) {
          // Kill particle
          sparkData.active[i] = 0;
          sparkData.positions[i3] = 0;
          sparkData.positions[i3 + 1] = 0;
          sparkData.positions[i3 + 2] = -100; // Move off screen
          continue;
        }

        // Apply velocity with deceleration
        const decel = 1.0 - sparkData.lives[i];
        sparkData.positions[i3] += sparkData.velocities[i3] * delta * decel;
        sparkData.positions[i3 + 1] += sparkData.velocities[i3 + 1] * delta * decel;
        sparkData.positions[i3 + 2] += sparkData.velocities[i3 + 2] * delta * decel;

        // Gravity-like pull toward center
        sparkData.velocities[i3] -= sparkData.positions[i3] * 0.5 * delta;
        sparkData.velocities[i3 + 1] -= sparkData.positions[i3 + 1] * 0.5 * delta;
      }

      posAttr.set(sparkData.positions);
      posAttr.needsUpdate = true;
      lifeAttr.set(sparkData.lives);
      lifeAttr.needsUpdate = true;
    }

    lastProgressRef.current = activationProgress;
  });

  return (
    <group ref={groupRef}>
      {/* Outer ring */}
      <mesh
        ref={outerRingRef}
        geometry={outerGeometry}
        material={outerMaterial}
      />

      {/* Inner counter-rotating ring */}
      <mesh
        ref={innerRingRef}
        geometry={innerGeometry}
        material={innerMaterial}
      />

      {/* Energy veins pulsing around the ring */}
      <mesh geometry={veinGeometry}>
        <shaderMaterial
          vertexShader={veinVertexShader}
          fragmentShader={veinFragmentShader}
          uniforms={veinUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Second energy vein (offset, different color) */}
      <mesh geometry={veinGeometry} rotation={[0, 0, Math.PI / 9]}>
        <shaderMaterial
          vertexShader={veinVertexShader}
          fragmentShader={veinFragmentShader}
          uniforms={{
            ...veinUniforms,
            uColor: { value: new THREE.Color(0x8b5cf6) },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Chevron indicators */}
      <group ref={chevronsRef}>
        {chevronPositions.map((pos, i) => (
          <mesh
            key={i}
            geometry={chevronGeometry}
            position={[pos.x, pos.y, 0.1]}
            rotation={[0, 0, pos.angle + Math.PI / 2]}
          >
            <meshStandardMaterial
              color={new THREE.Color(0x333333)}
              metalness={0.7}
              roughness={0.4}
              emissive={new THREE.Color(0x000000)}
              emissiveIntensity={0}
            />
          </mesh>
        ))}
      </group>

      {/* Chevron spark particles */}
      <points ref={sparksRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[sparkData.positions, 3]}
            count={MAX_TOTAL_SPARKS}
          />
          <bufferAttribute
            attach="attributes-aSize"
            args={[sparkData.sizes, 1]}
            count={MAX_TOTAL_SPARKS}
          />
          <bufferAttribute
            attach="attributes-aLife"
            args={[sparkData.lives, 1]}
            count={MAX_TOTAL_SPARKS}
          />
        </bufferGeometry>
        <primitive object={sparkMaterial} attach="material" />
      </points>
    </group>
  );
}
