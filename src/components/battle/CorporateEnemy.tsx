'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CorporateEnemyProps {
  id: string;
  position: [number, number, number];
  targetPosition: [number, number, number];
  speed: number;
  phrase: string;
  isAlive: boolean;
  health: number;
  maxHealth: number;
  isBoss: boolean;
  bossColor?: string;
  onDefeat: (id: string) => void;
  onReachCenter: (id: string) => void;
  onPositionUpdate: (id: string, pos: [number, number, number]) => void;
}

// ---------------------------------------------------------------------------
// Death particle data type
// ---------------------------------------------------------------------------

interface ParticleData {
  offset: [number, number, number];
  velocity: [number, number, number];
  size: number;
  rotSpeed: [number, number, number];
  colorIndex: number; // 0=red, 1=suit grey, 2=dark grey, 3=briefcase brown
}

// ---------------------------------------------------------------------------
// Dust impact sub-component (ground poof when enemy dies)
// ---------------------------------------------------------------------------

function DustImpact({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const [visible, setVisible] = useState(true);
  const startTime = useRef(performance.now());

  const dustData = useMemo(() => {
    const data: { angle: number; speed: number; size: number }[] = [];
    for (let i = 0; i < 8; i++) {
      data.push({
        angle: (i / 8) * Math.PI * 2 + Math.random() * 0.4,
        speed: 0.8 + Math.random() * 1.2,
        size: 0.03 + Math.random() * 0.04,
      });
    }
    return data;
  }, []);

  const dustMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#666655',
        emissive: '#332211',
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.6,
      }),
    []
  );

  useFrame(() => {
    if (!groupRef.current || !visible) return;
    const elapsed = (performance.now() - startTime.current) / 1000;
    if (elapsed > 0.6) {
      setVisible(false);
      return;
    }
    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as THREE.Mesh;
      const d = dustData[i];
      if (!d) continue;
      const t = elapsed;
      child.position.set(
        Math.cos(d.angle) * d.speed * t,
        0.02 + t * 0.3 - t * t * 2.0, // rise then fall
        Math.sin(d.angle) * d.speed * t
      );
      const fade = Math.max(0, 1 - elapsed / 0.6);
      child.scale.setScalar(1 + t * 2); // expand outward
      const mat = child.material as THREE.MeshStandardMaterial;
      mat.opacity = fade * 0.5;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {dustData.map((d, i) => (
        <mesh key={i} position={[0, 0.02, 0]} material={dustMat.clone()}>
          <sphereGeometry args={[d.size, 4, 4]} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Death particles sub-component (rendered inside Canvas)
// ---------------------------------------------------------------------------

function DeathParticles({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const [visible, setVisible] = useState(true);
  const startTime = useRef(performance.now());

  // Create particle data once on mount — 25 particles for a dramatic burst
  const particleData = useMemo(() => {
    const count = 25;
    const data: ParticleData[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.8;
      const upward = 0.04 + Math.random() * 0.06;
      const outward = 0.04 + Math.random() * 0.05;
      // Make one particle larger (the "briefcase" particle)
      const isBriefcase = i === 0;
      data.push({
        offset: [0, 0.3, 0],
        velocity: [
          Math.cos(angle) * outward * (isBriefcase ? 1.5 : 1),
          upward * (isBriefcase ? 1.8 : 1),
          Math.sin(angle) * outward * (isBriefcase ? 1.5 : 1),
        ],
        size: isBriefcase ? 0.1 : 0.03 + Math.random() * 0.05,
        rotSpeed: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
        ],
        colorIndex: isBriefcase ? 3 : Math.floor(Math.random() * 3),
      });
    }
    return data;
  }, []);

  // Pre-create materials
  const particleMats = useMemo(
    () => [
      // 0: red
      new THREE.MeshStandardMaterial({
        color: '#ff0040',
        emissive: '#ff0040',
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 1,
      }),
      // 1: suit grey
      new THREE.MeshStandardMaterial({
        color: '#555555',
        emissive: '#222222',
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 1,
      }),
      // 2: dark grey
      new THREE.MeshStandardMaterial({
        color: '#333333',
        emissive: '#111111',
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 1,
      }),
      // 3: briefcase brown
      new THREE.MeshStandardMaterial({
        color: '#3a2010',
        emissive: '#1a1005',
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 1,
      }),
    ],
    []
  );

  useFrame(() => {
    if (!groupRef.current || !visible) return;
    const elapsed = (performance.now() - startTime.current) / 1000;
    if (elapsed > 1.2) {
      setVisible(false);
      return;
    }

    const gravity = 12.0;
    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as THREE.Mesh;
      const d = particleData[i];
      if (!d) continue;
      const t = elapsed;

      // Physics: position = initial + velocity * t - 0.5 * gravity * t^2
      const px = d.offset[0] + d.velocity[0] * t * 25;
      let py = d.offset[1] + d.velocity[1] * t * 25 - 0.5 * gravity * t * t;
      const pz = d.offset[2] + d.velocity[2] * t * 25;

      // Bounce off ground with restitution
      if (py < 0 && t > 0.1) {
        py = Math.abs(py) * 0.3; // bounce with 0.3 coefficient
      }

      child.position.set(px, Math.max(0, py), pz);

      // Tumble rotation
      child.rotation.x += d.rotSpeed[0] * 0.016;
      child.rotation.y += d.rotSpeed[1] * 0.016;
      child.rotation.z += d.rotSpeed[2] * 0.016;

      // Fade and shrink
      const fadeStart = d.colorIndex === 3 ? 0.6 : 0.4; // briefcase lasts longer
      const fade = elapsed < fadeStart ? 1 : Math.max(0, 1 - (elapsed - fadeStart) / 0.8);
      child.scale.setScalar(fade);
      const mat = child.material as THREE.MeshStandardMaterial;
      mat.opacity = fade;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {particleData.map((d, i) => (
        <mesh
          key={i}
          position={d.offset}
          material={particleMats[d.colorIndex].clone()}
        >
          {d.colorIndex === 3 ? (
            // Briefcase particle is a flat box
            <boxGeometry args={[d.size * 1.5, d.size, d.size * 0.4]} />
          ) : (
            <boxGeometry args={[d.size, d.size, d.size]} />
          )}
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main enemy component
// ---------------------------------------------------------------------------

export default function CorporateEnemy({
  id,
  position: initialPosition,
  targetPosition,
  speed,
  phrase,
  isAlive,
  health,
  maxHealth,
  isBoss,
  bossColor,
  onDefeat,
  onReachCenter,
  onPositionUpdate,
}: CorporateEnemyProps) {
  // Boss visual scaling
  const bossScale = isBoss ? 1.0 + (maxHealth * 0.06) : 1.0;
  const groupRef = useRef<THREE.Group>(null);
  const bodyGroupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const tieRef = useRef<THREE.Mesh>(null);

  // Pre-allocated vectors to avoid GC pressure
  const currentPos = useRef(new THREE.Vector3(...initialPosition));
  const tempTarget = useRef(new THREE.Vector3());
  const tempDir = useRef(new THREE.Vector3());

  const [showSpeech, setShowSpeech] = useState(false);
  const [dying, setDying] = useState(false);
  const [dead, setDead] = useState(false);
  const [deathPos, setDeathPos] = useState<[number, number, number]>([0, 0, 0]);
  const dyingTimer = useRef(0);
  const hasReachedCenter = useRef(false);
  const speechTimer = useRef(Math.random() * 3);

  // Random animation phase offset (prevents chorus-line sync)
  const animOffset = useRef(Math.random() * Math.PI * 2);
  // Random walk speed variation (+-12%)
  const walkSpeedVariation = useRef(0.88 + Math.random() * 0.24);
  // Random death variation
  const deathVariation = useRef(Math.floor(Math.random() * 3)); // 0, 1, or 2

  // Hit flash timer
  const hitFlashTimer = useRef(0);

  // Materials — memoised
  const mats = useMemo(
    () => ({
      suit: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#4a4a4a'),
        roughness: 0.55,
        metalness: 0.28,
      }),
      suitDark: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2d2d2d'),
        roughness: 0.65,
        metalness: 0.2,
      }),
      shirt: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d8d8d8'),
        roughness: 0.8,
        metalness: 0.05,
      }),
      skin: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#e0c8a8'),
        roughness: 0.75,
        metalness: 0.05,
      }),
      tie: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ff0040'),
        emissive: new THREE.Color('#ff0040'),
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.4,
      }),
      briefcase: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2a1a0a'),
        roughness: 0.45,
        metalness: 0.4,
        emissive: new THREE.Color('#ff0040'),
        emissiveIntensity: 0.05,
      }),
      briefcaseHardware: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#c0a020'),
        roughness: 0.3,
        metalness: 0.8,
      }),
      eyes: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ff0000'),
        emissive: new THREE.Color('#ff0000'),
        emissiveIntensity: 0.8,
      }),
      hair: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1a1a1a'),
        roughness: 0.9,
        metalness: 0.0,
      }),
      shoes: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1a1a1a'),
        roughness: 0.4,
        metalness: 0.3,
      }),
      // Red aura
      aura: new THREE.MeshStandardMaterial({
        color: '#ff0040',
        emissive: '#ff0040',
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide,
      }),
      // Hit flash
      flash: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#ffffff',
        emissiveIntensity: 3.0,
        transparent: true,
        opacity: 0,
      }),
    }),
    []
  );

  // Override materials for boss enemies — suit color changes to match boss theme
  useEffect(() => {
    if (isBoss && bossColor) {
      const color = new THREE.Color(bossColor);
      mats.tie.color.copy(color);
      mats.tie.emissive.copy(color);
      mats.eyes.color.copy(color);
      mats.eyes.emissive.copy(color);
      mats.aura.color.copy(color);
      mats.aura.emissive.copy(color);
      // Tint the suit with the boss color (dark version)
      const suitColor = new THREE.Color(bossColor).multiplyScalar(0.25);
      const suitDarkColor = new THREE.Color(bossColor).multiplyScalar(0.12);
      mats.suit.color.copy(suitColor);
      mats.suit.emissive.copy(new THREE.Color(bossColor).multiplyScalar(0.05));
      mats.suit.emissiveIntensity = 0.3;
      mats.suitDark.color.copy(suitDarkColor);
      mats.suitDark.emissive.copy(new THREE.Color(bossColor).multiplyScalar(0.03));
      mats.suitDark.emissiveIntensity = 0.2;
    }
  }, [isBoss, bossColor, mats]);

  // Reset position when initialPosition changes (new spawn)
  useEffect(() => {
    currentPos.current.set(...initialPosition);
  }, [initialPosition]);

  // Handle defeat trigger
  useEffect(() => {
    if (!isAlive && !dying && !dead) {
      setDying(true);
      setDeathPos([currentPos.current.x, 0, currentPos.current.z]);
      dyingTimer.current = 0;
      hitFlashTimer.current = 0.06; // initial hit flash
    }
  }, [isAlive, dying, dead]);

  // --- Animation -----------------------------------------------------------
  useFrame((_, delta) => {
    if (dead) return;
    if (!groupRef.current) return;
    const t = performance.now() / 1000;
    const dt = Math.min(delta, 0.05);
    const phi = animOffset.current; // per-enemy phase offset

    // --- Hit flash update ---
    if (hitFlashTimer.current > 0) {
      hitFlashTimer.current -= dt;
      mats.flash.opacity = hitFlashTimer.current > 0 ? 0.8 : 0;
    }

    // === DYING ANIMATION ===
    if (dying) {
      dyingTimer.current += dt;
      const elapsed = dyingTimer.current;

      switch (deathVariation.current) {
        case 0: {
          // Variation A: "Boardroom Bust" — shock, spin up, burst
          if (elapsed < 0.1) {
            // Phase 1: Shock — lean back, arms fling up
            const p = elapsed / 0.1;
            groupRef.current.rotation.x = -0.3 * p;
            groupRef.current.scale.y = 1.0 + 0.1 * p;
            groupRef.current.scale.x = 1.0 - 0.05 * p;
            groupRef.current.scale.z = 1.0 - 0.05 * p;
            // Eyes flare
            mats.eyes.emissiveIntensity = 0.8 + 2.2 * p;
          } else if (elapsed < 0.4) {
            // Phase 2: Spin up and shrink
            const p = (elapsed - 0.1) / 0.3;
            groupRef.current.rotation.y += (8 + p * 15) * dt;
            groupRef.current.position.y += dt * 1.5;
            const shrink = 1.1 - p * 0.8;
            groupRef.current.scale.setScalar(Math.max(0, shrink));
            mats.aura.opacity = 0.06 + p * 0.3;
          } else {
            // Phase 3: Gone
            groupRef.current.scale.setScalar(0);
            setDead(true);
          }
          break;
        }
        case 1: {
          // Variation B: "Comedy Deflation" — squash flat
          if (elapsed < 0.1) {
            // Surprise freeze
            groupRef.current.rotation.x = -0.2;
            if (leftArmRef.current) leftArmRef.current.rotation.x = -0.8;
            if (rightArmRef.current) rightArmRef.current.rotation.x = -0.8;
          } else if (elapsed < 0.4) {
            // Squash vertically
            const p = (elapsed - 0.1) / 0.3;
            const squashY = 1.0 - p * 0.85;
            const expandXZ = 1.0 + p * 0.7;
            groupRef.current.scale.y = Math.max(0.05, squashY);
            groupRef.current.scale.x = expandXZ;
            groupRef.current.scale.z = expandXZ;
          } else if (elapsed < 0.6) {
            // Pop and vanish
            const p = (elapsed - 0.4) / 0.2;
            groupRef.current.scale.setScalar(Math.max(0, 0.15 * (1 - p)));
          } else {
            groupRef.current.scale.setScalar(0);
            setDead(true);
          }
          break;
        }
        case 2:
        default: {
          // Variation C: "Dissolve Spin" — spin, rise, shrink
          if (elapsed < 0.65) {
            const p = elapsed / 0.65;
            groupRef.current.rotation.y += (2 + p * 14) * dt; // accelerating spin
            groupRef.current.position.y += dt * 1.2;
            const shrink = 1.0 - p;
            groupRef.current.scale.setScalar(Math.max(0, shrink));
            mats.aura.opacity = 0.06 + p * 0.2;
          } else {
            groupRef.current.scale.setScalar(0);
            setDead(true);
          }
          break;
        }
      }
      return;
    }

    // === MOVEMENT TOWARD TARGET ===
    tempTarget.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
    tempDir.current.copy(tempTarget.current).sub(currentPos.current);
    const dist = tempDir.current.length();

    if (dist > 0.8) {
      tempDir.current.normalize().multiplyScalar(speed);
      currentPos.current.add(tempDir.current);
      const pos = currentPos.current;
      groupRef.current.position.set(pos.x, 0, pos.z);

      // Face toward target
      const angle = Math.atan2(tempDir.current.x, tempDir.current.z);
      groupRef.current.rotation.y = angle;

      onPositionUpdate(id, [pos.x, pos.y, pos.z]);
    } else if (!hasReachedCenter.current) {
      hasReachedCenter.current = true;
      onReachCenter(id);
    }

    // === WALK CYCLE ANIMATION (research-backed multi-component) ===
    const walkPhase = (t * 7 * walkSpeedVariation.current) + phi;

    // 1. Vertical bounce (stiff march bob)
    const bounceY = Math.abs(Math.sin(walkPhase)) * 0.06;
    groupRef.current.position.y = bounceY;

    // 2. Lateral body tilt (side-to-side sway)
    groupRef.current.rotation.z = Math.sin(walkPhase * 0.5) * 0.05;

    // 3. Hip twist (body rotation Y added on top of facing direction)
    if (bodyGroupRef.current) {
      bodyGroupRef.current.rotation.y = Math.sin(walkPhase) * 0.04;
      // Slight forward lean (marching menacingly)
      bodyGroupRef.current.rotation.x = -0.06;
    }

    // 4. Head — stays eerily stable relative to world while body bounces
    if (headRef.current) {
      // Counter the body bounce for stable head
      headRef.current.position.y = -bounceY * 0.5;
      // Slow suspicious look-around
      headRef.current.rotation.y = Math.sin((t * 0.3) + phi) * 0.03;
      // Chin down for menacing look
      headRef.current.rotation.x = -0.08;
    }

    // 5. Leg swing (opposite phases)
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(walkPhase) * 0.35;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = Math.sin(walkPhase + Math.PI) * 0.35;
    }

    // 6. Left arm counter-swing (opposite to left leg)
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(walkPhase + Math.PI) * 0.25;
    }

    // 7. Right arm (holding briefcase, reduced swing)
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = Math.sin(walkPhase) * 0.12;
    }

    // 8. Tie flap (bounces with walk, comically)
    if (tieRef.current) {
      tieRef.current.rotation.z = Math.sin(walkPhase * 2) * 0.12;
      tieRef.current.rotation.x = Math.sin(walkPhase) * 0.05;
    }

    // 9. Eye glow intensifies as enemy gets closer to center
    const distNorm = Math.min(1, Math.max(0, 1 - dist / 8));
    mats.eyes.emissiveIntensity = 0.5 + distNorm * 0.8;

    // 10. Aura intensifies when close
    mats.aura.opacity = 0.04 + distNorm * 0.06;
    mats.aura.emissiveIntensity = 0.15 + distNorm * 0.15;

    // --- Speech bubble timing (long visibility so players can read them) ---
    speechTimer.current -= dt;
    if (speechTimer.current <= 0) {
      if (!showSpeech) {
        setShowSpeech(true);
        speechTimer.current = isBoss ? 5.0 : 4.0;  // visible for 4-5 seconds
      } else {
        setShowSpeech(false);
        speechTimer.current = isBoss ? 0.5 + Math.random() * 0.5 : 0.8 + Math.random() * 1.0; // short gap
      }
    }
  });

  // After death animation completes, render only particles + dust
  if (dead) {
    return (
      <>
        <DeathParticles position={deathPos} />
        <DustImpact position={deathPos} />
      </>
    );
  }

  return (
    <>
      <group
        ref={groupRef}
        position={[initialPosition[0], 0, initialPosition[2]]}
        scale={[bossScale, bossScale, bossScale]}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isAlive && !dying) {
            hitFlashTimer.current = 0.08;
            onDefeat(id);
          }
        }}
      >
        {/* Hit-box: invisible larger mesh for easier clicking */}
        <mesh visible={false}>
          <boxGeometry args={[
            isBoss ? 1.2 : 0.9,
            isBoss ? 1.8 : 1.4,
            isBoss ? 0.9 : 0.7
          ]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Hit flash overlay */}
        <mesh position={[0, 0.5, 0]} material={mats.flash}>
          <boxGeometry args={[0.42, 0.72, 0.3]} />
        </mesh>

        {/* Red aura (BackSide glow) */}
        <mesh position={[0, 0.5, 0]} material={mats.aura}>
          <boxGeometry args={[0.45, 0.78, 0.32]} />
        </mesh>

        {/* ====== BODY GROUP (animated together for hip twist) ====== */}
        <group ref={bodyGroupRef}>
          {/* === TORSO (boxy corporate rectangle, 1:1 ratio) === */}
          <mesh position={[0, 0.5, 0]} material={mats.suit} castShadow>
            <boxGeometry args={[0.32, 0.52, 0.2]} />
          </mesh>

          {/* Shirt collar visible at top */}
          <mesh position={[0, 0.74, 0.08]} material={mats.shirt}>
            <boxGeometry args={[0.15, 0.06, 0.06]} />
          </mesh>

          {/* Suit lapels (thin darker strips on chest) */}
          <mesh position={[0.08, 0.6, 0.1]} rotation={[0, 0, 0.1]} material={mats.suitDark}>
            <boxGeometry args={[0.04, 0.28, 0.02]} />
          </mesh>
          <mesh position={[-0.08, 0.6, 0.1]} rotation={[0, 0, -0.1]} material={mats.suitDark}>
            <boxGeometry args={[0.04, 0.28, 0.02]} />
          </mesh>

          {/* Breast pocket */}
          <mesh position={[0.1, 0.64, 0.11]} material={mats.shirt}>
            <boxGeometry args={[0.05, 0.03, 0.01]} />
          </mesh>
          {/* Pocket square (red) */}
          <mesh position={[0.1, 0.66, 0.115]} material={mats.tie}>
            <boxGeometry args={[0.03, 0.02, 0.005]} />
          </mesh>

          {/* === TIE (long, flapping, evil red) === */}
          <group position={[0, 0.6, 0.105]}>
            {/* Tie knot */}
            <mesh position={[0, 0.12, 0]} material={mats.tie}>
              <boxGeometry args={[0.04, 0.04, 0.03]} />
            </mesh>
            {/* Tie body (long, visible) */}
            <mesh
              ref={tieRef}
              position={[0, -0.03, 0]}
              material={mats.tie}
            >
              <boxGeometry args={[0.04, 0.26, 0.015]} />
            </mesh>
            {/* Tie tip (triangle pointing down) */}
            <mesh
              position={[0, -0.18, 0]}
              rotation={[Math.PI, 0, 0]}
              material={mats.tie}
            >
              <coneGeometry args={[0.025, 0.06, 4]} />
            </mesh>
          </group>

          {/* Suit buttons */}
          <mesh position={[0, 0.52, 0.105]} material={mats.suitDark}>
            <sphereGeometry args={[0.012, 6, 6]} />
          </mesh>
          <mesh position={[0, 0.42, 0.105]} material={mats.suitDark}>
            <sphereGeometry args={[0.012, 6, 6]} />
          </mesh>

          {/* === HEAD (oversized for greedy/comedic look, ~1.3x normal) === */}
          <group ref={headRef} position={[0, 0.92, 0]}>
            {/* Head sphere */}
            <mesh material={mats.skin} castShadow>
              <sphereGeometry args={[0.17, 12, 12]} />
            </mesh>

            {/* Slicked-back hair */}
            <mesh position={[0, 0.06, -0.02]} material={mats.hair}>
              <sphereGeometry args={[0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            </mesh>

            {/* Evil RED eyes (strong glow) */}
            <mesh position={[0.055, 0.01, 0.14]} material={mats.eyes}>
              <sphereGeometry args={[0.028, 8, 8]} />
            </mesh>
            <mesh position={[-0.055, 0.01, 0.14]} material={mats.eyes}>
              <sphereGeometry args={[0.028, 8, 8]} />
            </mesh>

            {/* Eye pupils (dark centers for more expressive eyes) */}
            <mesh position={[0.055, 0.01, 0.165]} material={mats.hair}>
              <sphereGeometry args={[0.012, 6, 6]} />
            </mesh>
            <mesh position={[-0.055, 0.01, 0.165]} material={mats.hair}>
              <sphereGeometry args={[0.012, 6, 6]} />
            </mesh>

            {/* Eyebrows (angry, angled inward) */}
            <mesh position={[0.055, 0.06, 0.135]} rotation={[0, 0, 0.2]} material={mats.hair}>
              <boxGeometry args={[0.06, 0.015, 0.02]} />
            </mesh>
            <mesh position={[-0.055, 0.06, 0.135]} rotation={[0, 0, -0.2]} material={mats.hair}>
              <boxGeometry args={[0.06, 0.015, 0.02]} />
            </mesh>

            {/* Mouth (thin line, grim expression) */}
            <mesh position={[0, -0.06, 0.145]} material={mats.hair}>
              <boxGeometry args={[0.06, 0.012, 0.015]} />
            </mesh>

            {/* Ears */}
            <mesh position={[0.16, -0.01, 0]} material={mats.skin}>
              <sphereGeometry args={[0.03, 6, 6]} />
            </mesh>
            <mesh position={[-0.16, -0.01, 0]} material={mats.skin}>
              <sphereGeometry args={[0.03, 6, 6]} />
            </mesh>

            {/* Neck */}
            <mesh position={[0, -0.14, 0]} material={mats.skin}>
              <cylinderGeometry args={[0.05, 0.06, 0.08, 8]} />
            </mesh>
          </group>

          {/* === LEFT ARM (thin, noodly — no physical strength) === */}
          <group ref={leftArmRef} position={[0.22, 0.65, 0]}>
            {/* Suit jacket shoulder */}
            <mesh position={[0.02, 0.04, 0]} material={mats.suit}>
              <sphereGeometry args={[0.05, 6, 6]} />
            </mesh>
            {/* Upper arm */}
            <mesh position={[0, -0.08, 0]} material={mats.suit}>
              <boxGeometry args={[0.07, 0.22, 0.07]} />
            </mesh>
            {/* Lower arm (shirt sleeve cuff) */}
            <mesh position={[0, -0.26, 0]} material={mats.suitDark}>
              <boxGeometry args={[0.06, 0.16, 0.06]} />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -0.36, 0]} material={mats.skin}>
              <sphereGeometry args={[0.03, 6, 6]} />
            </mesh>
          </group>

          {/* === RIGHT ARM + BRIEFCASE (held forward menacingly) === */}
          <group ref={rightArmRef} position={[-0.22, 0.65, 0]}>
            {/* Suit jacket shoulder */}
            <mesh position={[-0.02, 0.04, 0]} material={mats.suit}>
              <sphereGeometry args={[0.05, 6, 6]} />
            </mesh>
            {/* Upper arm */}
            <mesh position={[0, -0.08, 0]} material={mats.suit}>
              <boxGeometry args={[0.07, 0.22, 0.07]} />
            </mesh>
            {/* Lower arm */}
            <mesh position={[0, -0.26, 0]} material={mats.suitDark}>
              <boxGeometry args={[0.06, 0.16, 0.06]} />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -0.36, 0]} material={mats.skin}>
              <sphereGeometry args={[0.03, 6, 6]} />
            </mesh>

            {/* === BRIEFCASE (oversized, menacing) === */}
            <group position={[0, -0.38, 0.06]}>
              {/* Briefcase body */}
              <mesh material={mats.briefcase} castShadow>
                <boxGeometry args={[0.18, 0.12, 0.04]} />
              </mesh>
              {/* Briefcase edge trim */}
              <mesh position={[0, 0, 0]} material={mats.briefcaseHardware}>
                <boxGeometry args={[0.19, 0.005, 0.045]} />
              </mesh>
              {/* Briefcase latches */}
              <mesh position={[0.04, 0.02, 0.022]} material={mats.briefcaseHardware}>
                <boxGeometry args={[0.02, 0.012, 0.005]} />
              </mesh>
              <mesh position={[-0.04, 0.02, 0.022]} material={mats.briefcaseHardware}>
                <boxGeometry args={[0.02, 0.012, 0.005]} />
              </mesh>
              {/* Briefcase handle */}
              <mesh position={[0, 0.07, 0.02]} material={mats.briefcaseHardware}>
                <torusGeometry args={[0.03, 0.006, 4, 8, Math.PI]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* === LEGS (short relative to body, scurrying) === */}
        {/* Left leg */}
        <group ref={leftLegRef} position={[0.07, 0.22, 0]}>
          {/* Upper leg */}
          <mesh position={[0, -0.04, 0]} material={mats.suitDark} castShadow>
            <boxGeometry args={[0.09, 0.2, 0.09]} />
          </mesh>
          {/* Lower leg */}
          <mesh position={[0, -0.18, 0]} material={mats.suitDark} castShadow>
            <boxGeometry args={[0.08, 0.16, 0.08]} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.28, 0.02]} material={mats.shoes}>
            <boxGeometry args={[0.08, 0.04, 0.12]} />
          </mesh>
        </group>

        {/* Right leg */}
        <group ref={rightLegRef} position={[-0.07, 0.22, 0]}>
          {/* Upper leg */}
          <mesh position={[0, -0.04, 0]} material={mats.suitDark} castShadow>
            <boxGeometry args={[0.09, 0.2, 0.09]} />
          </mesh>
          {/* Lower leg */}
          <mesh position={[0, -0.18, 0]} material={mats.suitDark} castShadow>
            <boxGeometry args={[0.08, 0.16, 0.08]} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.28, 0.02]} material={mats.shoes}>
            <boxGeometry args={[0.08, 0.04, 0.12]} />
          </mesh>
        </group>

        {/* === SPEECH BUBBLE (large, readable) === */}
        {showSpeech && isAlive && (
          <Html
            position={[0, (isBoss ? 2.2 * bossScale : 1.7), 0]}
            center
            distanceFactor={4}
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                background: isBoss ? 'rgba(60,0,0,0.97)' : 'rgba(30,0,0,0.95)',
                color: isBoss ? (bossColor || '#ff4444') : '#ff4444',
                padding: isBoss ? '12px 24px' : '10px 20px',
                borderRadius: 8,
                fontSize: isBoss ? 32 : 24,
                fontWeight: 900,
                fontFamily: 'system-ui, sans-serif',
                whiteSpace: 'nowrap',
                border: `2px solid ${isBoss ? (bossColor || '#ff0040') + '90' : 'rgba(255,0,64,0.6)'}`,
                textTransform: 'uppercase',
                letterSpacing: isBoss ? '2px' : '1.5px',
                textShadow: `0 0 ${isBoss ? '16' : '10'}px ${isBoss ? (bossColor || '#ff0040') : 'rgba(255,0,64,0.7)'}`,
                boxShadow: isBoss ? `0 0 30px ${bossColor || '#ff0040'}60` : '0 0 15px rgba(255,0,64,0.3)',
              }}
            >
              {phrase}
            </div>
          </Html>
        )}

        {/* Boss health bar + BOSS tag — directly over head */}
        {isBoss && isAlive && health > 0 && (
          <Html
            position={[0, 1.95 * bossScale, 0]}
            center
            distanceFactor={4}
            style={{ pointerEvents: 'none' }}
          >
            <div style={{
              width: 120,
              textAlign: 'center',
            }}>
              <div style={{
                color: bossColor || '#ff0040',
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: 4,
                textTransform: 'uppercase',
                textShadow: `0 0 12px ${bossColor || '#ff0040'}, 0 0 24px ${bossColor || '#ff0040'}80`,
                marginBottom: 6,
              }}>
                BOSS
              </div>
              <div style={{
                width: 120,
                height: 10,
                background: 'rgba(0,0,0,0.85)',
                borderRadius: 5,
                overflow: 'hidden',
                border: `2px solid ${bossColor || '#ff0040'}70`,
              }}>
                <div style={{
                  width: `${(health / maxHealth) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${bossColor || '#ff0040'}, ${bossColor || '#ff0040'}cc)`,
                  borderRadius: 5,
                  transition: 'width 0.15s ease',
                  boxShadow: `0 0 10px ${bossColor || '#ff0040'}90`,
                }} />
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* Death particles (rendered when dying starts) */}
      {dying && <DeathParticles position={deathPos} />}
      {dying && <DustImpact position={deathPos} />}
    </>
  );
}
