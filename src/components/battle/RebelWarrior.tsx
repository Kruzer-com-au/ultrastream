'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RebelWarriorProps {
  position: [number, number, number];
  health: number;
  isFighting: boolean;
  mirrorSword?: boolean;
}

// ---------------------------------------------------------------------------
// Easing helpers
// ---------------------------------------------------------------------------

/** power2.in easing */
function easeIn(t: number): number {
  return t * t;
}

/** power2.out easing */
function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/** power4.out easing — very fast start, sharp deceleration */
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/** smoothstep for blending */
function smoothstep(a: number, b: number, t: number): number {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

// ---------------------------------------------------------------------------
// Sword blade shape (ExtrudeGeometry diamond cross-section)
// ---------------------------------------------------------------------------

function createSwordBladeGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  // Diamond/rhombus cross-section for proper blade look
  shape.moveTo(0, -0.04);
  shape.lineTo(0.015, 0);
  shape.lineTo(0, 0.04);
  shape.lineTo(-0.015, 0);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.85,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 1,
  });
}

// ---------------------------------------------------------------------------
// Pauldron shape (partial sphere for shoulder armor)
// ---------------------------------------------------------------------------

function createPauldronGeometry(): THREE.SphereGeometry {
  return new THREE.SphereGeometry(
    0.16, 12, 8,
    0, Math.PI * 2,
    0, Math.PI * 0.55
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RebelWarrior({
  position,
  health,
  isFighting,
  mirrorSword = false,
}: RebelWarriorProps) {
  // --- Refs for animation ---
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const swordArmRef = useRef<THREE.Group>(null);
  const shieldArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const swordGlowRef = useRef<THREE.Mesh>(null);

  // --- Sword swing state machine ---
  const swingPhase = useRef<'idle' | 'windup' | 'strike' | 'impact' | 'followthrough' | 'recovery'>('idle');
  const swingTimer = useRef(0);
  const swingCooldown = useRef(0);
  const lastFighting = useRef(false);

  // --- Hit flash state ---
  const hitFlashTimer = useRef(0);
  const lastHealth = useRef(health);

  // --- Materials – memoised ---
  const mats = useMemo(
    () => ({
      // Worn bronze armor (primary 60%)
      armor: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#b8860b'),
        roughness: 0.4,
        metalness: 0.75,
        emissive: new THREE.Color('#1a1200'),
        emissiveIntensity: 0.1,
      }),
      // Gold trim for accents
      gold: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ffd700'),
        roughness: 0.25,
        metalness: 0.85,
        emissive: new THREE.Color('#ffd700'),
        emissiveIntensity: 0.08,
      }),
      // Neon glow aura (BackSide)
      glow: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00d4ff'),
        emissive: new THREE.Color('#00d4ff'),
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
      }),
      // Skin
      skin: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d4a574'),
        roughness: 0.65,
        metalness: 0.08,
      }),
      // Sword blade — polished steel with cyan energy
      sword: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#c8c8d0'),
        roughness: 0.15,
        metalness: 0.92,
        emissive: new THREE.Color('#00d4ff'),
        emissiveIntensity: 0.2,
      }),
      // Sword glow (larger blade behind for magic effect)
      swordGlow: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00d4ff'),
        emissive: new THREE.Color('#00d4ff'),
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
      }),
      // Leather (handle, belt, straps)
      leather: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#5c3317'),
        roughness: 0.78,
        metalness: 0.08,
      }),
      // Shield face
      shield: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#b8860b'),
        roughness: 0.35,
        metalness: 0.72,
        emissive: new THREE.Color('#ffd700'),
        emissiveIntensity: 0.08,
      }),
      // Shield rim
      shieldRim: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ffd700'),
        roughness: 0.28,
        metalness: 0.82,
      }),
      // Dark iron for secondary armor plates
      darkIron: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#3a3a3a'),
        roughness: 0.55,
        metalness: 0.78,
      }),
      // Glowing eyes
      eyes: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00d4ff'),
        emissive: new THREE.Color('#00d4ff'),
        emissiveIntensity: 1.0,
      }),
      // Cape material
      cape: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#8b1a1a'),
        roughness: 0.92,
        metalness: 0.0,
        side: THREE.DoubleSide,
      }),
      // Hit flash material (white)
      flash: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ffffff'),
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 3.0,
        transparent: true,
        opacity: 0,
      }),
    }),
    []
  );

  // --- Geometries – memoised ---
  const geos = useMemo(
    () => ({
      swordBlade: createSwordBladeGeometry(),
      pauldronL: createPauldronGeometry(),
      pauldronR: createPauldronGeometry(),
    }),
    []
  );

  // Health bar colour
  const healthColour = useMemo(() => {
    if (health > 60) return '#22c55e';
    if (health > 30) return '#eab308';
    return '#ef4444';
  }, [health]);

  // --- Animation -----------------------------------------------------------
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = performance.now() / 1000; // Use performance.now for consistency
    const dt = Math.min(delta, 0.05); // Clamp delta to prevent jumps

    // --- Hit flash detection ---
    if (health < lastHealth.current) {
      hitFlashTimer.current = 0.08; // 80ms flash
    }
    lastHealth.current = health;

    // --- Hit flash update ---
    if (hitFlashTimer.current > 0) {
      hitFlashTimer.current -= dt;
      mats.flash.opacity = hitFlashTimer.current > 0 ? 0.7 : 0;
    }

    // === IDLE ANIMATION (multi-layer) ===
    // Layer 1: Breathing (chest rise/fall) — primary life signal
    const breathCycle = Math.sin(t * 1.8);
    const breathAmount = 0.025;

    // Layer 2: Fighter bounce (subtle boxer-like readiness)
    const bounceCycle = Math.sin(t * 2.5);
    const bounceAmount = 0.006;

    // Layer 3: Weight shift (very slow sway)
    const swayCycle = Math.sin(t * 0.4);
    const swayAmount = 0.012;

    // Layer 4: Noise (life-like irregularity)
    const noise = Math.sin(t * 3.7) * Math.cos(t * 5.3) * 0.003;

    // --- Full body position ---
    groupRef.current.position.y =
      position[1] +
      breathCycle * breathAmount +
      Math.abs(bounceCycle) * bounceAmount +
      noise;

    groupRef.current.position.x =
      position[0] + swayCycle * swayAmount * 0.8;

    // --- Body (torso group) ---
    if (bodyRef.current) {
      // Slight forward lean for badass stance
      bodyRef.current.rotation.x = -0.04;
      // Weight shift lean
      bodyRef.current.rotation.z = swayCycle * 0.01 + noise;
      // Breathing scale
      bodyRef.current.scale.y = 1.0 + breathCycle * 0.012;
      bodyRef.current.scale.x = 1.0 - breathCycle * 0.006;
      bodyRef.current.scale.z = 1.0 - breathCycle * 0.006;

      // Fighting body twist
      if (isFighting) {
        bodyRef.current.rotation.y = Math.sin(t * 5) * 0.06;
      } else {
        bodyRef.current.rotation.y = swayCycle * 0.008;
      }
    }

    // --- Head ---
    if (headRef.current) {
      // Scanning environment
      headRef.current.rotation.y = Math.sin(t * 0.3) * 0.04 + Math.sin(t * 1.1) * 0.015;
      // Slight chin-down for looking-up-through-brows badass look
      headRef.current.rotation.x = 0.06 + Math.sin(t * 0.7) * 0.012;
      headRef.current.rotation.z = noise * 0.5;
    }

    // --- Glow aura pulse ---
    if (glowRef.current) {
      const glowMat = glowRef.current.material as THREE.MeshStandardMaterial;
      glowMat.emissiveIntensity = 0.35 + Math.sin(t * 1.5) * 0.08;
      glowMat.opacity = 0.1 + Math.sin(t * 1.2) * 0.03;
    }

    // --- Sword glow pulse ---
    if (swordGlowRef.current) {
      const sgMat = swordGlowRef.current.material as THREE.MeshStandardMaterial;
      sgMat.emissiveIntensity = 0.5 + Math.sin(t * 2.0) * 0.15;
    }

    // === SWORD ARM ANIMATION ===
    const swordSide = mirrorSword ? -1 : 1;

    // Detect transition to fighting
    if (isFighting && !lastFighting.current) {
      swingPhase.current = 'windup';
      swingTimer.current = 0;
      swingCooldown.current = 0;
    }
    if (!isFighting && lastFighting.current) {
      swingPhase.current = 'idle';
      swingTimer.current = 0;
    }
    lastFighting.current = isFighting;

    if (swordArmRef.current) {
      if (isFighting) {
        // --- 4-Phase sword swing state machine ---
        swingTimer.current += dt;

        switch (swingPhase.current) {
          case 'windup': {
            // Phase 1: Anticipation — 150ms pull-back
            const dur = 0.15;
            const p = Math.min(swingTimer.current / dur, 1);
            const e = easeIn(p);
            swordArmRef.current.rotation.x = -0.3 + (-1.3 - (-0.3)) * e;
            swordArmRef.current.rotation.z = swordSide * (0.3 * e);
            if (bodyRef.current) {
              bodyRef.current.rotation.y = -0.15 * e * swordSide;
              bodyRef.current.scale.y = 1.0 - 0.04 * e; // coiling crouch
            }
            if (p >= 1) {
              swingPhase.current = 'strike';
              swingTimer.current = 0;
            }
            break;
          }
          case 'strike': {
            // Phase 2: Strike — 80ms explosive forward swing
            const dur = 0.08;
            const p = Math.min(swingTimer.current / dur, 1);
            const e = easeOutQuart(p);
            swordArmRef.current.rotation.x = -1.3 + (0.7 - (-1.3)) * e;
            swordArmRef.current.rotation.z = swordSide * (0.3 - 0.5 * e);
            if (bodyRef.current) {
              bodyRef.current.rotation.y = (-0.15 + 0.45 * e) * swordSide;
              bodyRef.current.scale.y = 0.96 + 0.09 * e; // explosive extension
              bodyRef.current.position.z = 0.03 * e;
            }
            if (p >= 1) {
              swingPhase.current = 'impact';
              swingTimer.current = 0;
            }
            break;
          }
          case 'impact': {
            // Phase 3: Impact hold — 60ms freeze with micro-vibration
            const dur = 0.06;
            const p = Math.min(swingTimer.current / dur, 1);
            // Vibration during impact freeze
            const vib = (Math.random() - 0.5) * 0.015;
            swordArmRef.current.rotation.x = 0.7 + vib;
            swordArmRef.current.rotation.z = swordSide * -0.2 + vib;
            if (bodyRef.current) {
              bodyRef.current.position.x = vib * 0.5;
            }
            if (p >= 1) {
              swingPhase.current = 'followthrough';
              swingTimer.current = 0;
            }
            break;
          }
          case 'followthrough': {
            // Phase 4: Follow-through — 200ms deceleration past impact
            const dur = 0.2;
            const p = Math.min(swingTimer.current / dur, 1);
            const e = easeOut(p);
            swordArmRef.current.rotation.x = 0.7 + 0.15 * (1 - e) + (-0.3 - 0.85) * e;
            swordArmRef.current.rotation.z = swordSide * (-0.2 + 0.2 * e);
            if (bodyRef.current) {
              bodyRef.current.rotation.y = (0.3 - 0.3 * e) * swordSide;
              bodyRef.current.scale.y = 1.05 - 0.05 * e;
              bodyRef.current.position.z = 0.03 * (1 - e);
              bodyRef.current.position.x = 0;
            }
            if (p >= 1) {
              swingPhase.current = 'recovery';
              swingTimer.current = 0;
            }
            break;
          }
          case 'recovery': {
            // Return to guard then start a new swing
            const dur = 0.12;
            const p = Math.min(swingTimer.current / dur, 1);
            const e = easeOut(p);
            swordArmRef.current.rotation.x = -0.3;
            swordArmRef.current.rotation.z = 0;
            if (bodyRef.current) {
              bodyRef.current.rotation.y = 0;
              bodyRef.current.scale.y = 1.0;
              bodyRef.current.position.z = 0;
            }
            if (p >= 1) {
              // Start next swing cycle
              swingPhase.current = 'windup';
              swingTimer.current = 0;
            }
            break;
          }
          default: {
            // idle fallback during fighting
            swingPhase.current = 'windup';
            swingTimer.current = 0;
          }
        }
      } else {
        // --- Idle sword arm: badass ready stance ---
        // Sword held at mid-guard with gentle pendulum sway
        swordArmRef.current.rotation.x =
          -0.3 + Math.sin(t * 1.2) * 0.06;
        swordArmRef.current.rotation.z =
          swordSide * (Math.sin(t * 2.1) * 0.02);

        // Reset body overrides
        if (bodyRef.current) {
          bodyRef.current.position.z = 0;
          bodyRef.current.position.x = 0;
        }
      }
    }

    // --- Shield arm ---
    if (shieldArmRef.current) {
      if (isFighting) {
        // Shield comes up defensively during attack
        shieldArmRef.current.rotation.x =
          -0.4 + Math.sin(t * 4 + 1) * 0.1;
        shieldArmRef.current.rotation.z = -swordSide * 0.15;
      } else {
        // Idle: relaxed counter-sway (offset from sword arm)
        shieldArmRef.current.rotation.x =
          -0.15 + Math.sin(t * 1.2 + Math.PI / 2) * 0.04;
        shieldArmRef.current.rotation.z = 0;
      }
    }

    // --- Legs micro-animation ---
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(t * 0.35) * 0.008;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = Math.sin(t * 0.35 + Math.PI) * 0.008;
    }
  });

  const swordSide = mirrorSword ? -1 : 1;

  return (
    <group ref={groupRef} position={position}>
      {/* ====== NEON GLOW AURA (BackSide technique) ====== */}
      <mesh ref={glowRef} position={[0, 0.75, 0]} material={mats.glow}>
        <capsuleGeometry args={[0.38, 1.35, 8, 12]} />
      </mesh>

      {/* ====== HIT FLASH OVERLAY ====== */}
      <mesh position={[0, 0.75, 0]} material={mats.flash}>
        <capsuleGeometry args={[0.36, 1.3, 8, 12]} />
      </mesh>

      {/* ====== BODY GROUP (torso, animated as unit) ====== */}
      <group ref={bodyRef}>
        {/* --- Upper Torso (broad, heroic V-taper) --- */}
        <mesh position={[0, 0.95, 0]} material={mats.armor} castShadow>
          <boxGeometry args={[0.55, 0.45, 0.28]} />
        </mesh>

        {/* --- Chest plate (layered armor detail) --- */}
        <mesh ref={chestRef} position={[0, 0.95, 0.14]} material={mats.gold}>
          <boxGeometry args={[0.35, 0.3, 0.03]} />
        </mesh>

        {/* --- Chest center gem/emblem --- */}
        <mesh position={[0, 0.98, 0.17]} material={mats.eyes}>
          <sphereGeometry args={[0.035, 8, 8]} />
        </mesh>

        {/* --- Lower Torso (narrower waist for V-taper) --- */}
        <mesh position={[0, 0.6, 0]} material={mats.darkIron} castShadow>
          <boxGeometry args={[0.38, 0.3, 0.22]} />
        </mesh>

        {/* --- Belt --- */}
        <mesh position={[0, 0.48, 0]} material={mats.leather}>
          <boxGeometry args={[0.42, 0.08, 0.25]} />
        </mesh>
        {/* Belt buckle */}
        <mesh position={[0, 0.48, 0.13]} material={mats.gold}>
          <boxGeometry args={[0.08, 0.06, 0.02]} />
        </mesh>

        {/* ====== PAULDRONS (shoulder armor plates) ====== */}
        {/* Right pauldron */}
        <group position={[0.32, 1.22, 0]} rotation={[0, 0, -0.3]}>
          <mesh material={mats.armor} castShadow>
            <sphereGeometry args={[0.14, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          </mesh>
          {/* Pauldron spike */}
          <mesh position={[0, 0.1, 0]} material={mats.gold}>
            <coneGeometry args={[0.035, 0.1, 6]} />
          </mesh>
          {/* Pauldron trim */}
          <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.gold}>
            <torusGeometry args={[0.13, 0.015, 4, 10, Math.PI]} />
          </mesh>
        </group>

        {/* Left pauldron */}
        <group position={[-0.32, 1.22, 0]} rotation={[0, 0, 0.3]}>
          <mesh material={mats.armor} castShadow>
            <sphereGeometry args={[0.14, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          </mesh>
          {/* Pauldron spike */}
          <mesh position={[0, 0.1, 0]} material={mats.gold}>
            <coneGeometry args={[0.035, 0.1, 6]} />
          </mesh>
          {/* Pauldron trim */}
          <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.gold}>
            <torusGeometry args={[0.13, 0.015, 4, 10, Math.PI]} />
          </mesh>
        </group>

        {/* ====== CAPE (multiple panels for slight movement) ====== */}
        <mesh position={[0, 0.8, -0.17]} rotation={[0.08, 0, 0]} material={mats.cape}>
          <planeGeometry args={[0.4, 0.65]} />
        </mesh>
        <mesh position={[0, 0.45, -0.19]} rotation={[0.12, 0, 0]} material={mats.cape}>
          <planeGeometry args={[0.35, 0.35]} />
        </mesh>
      </group>

      {/* ====== HEAD GROUP ====== */}
      <group ref={headRef} position={[0, 1.4, 0]}>
        {/* Head sphere */}
        <mesh position={[0, 0, 0]} material={mats.skin} castShadow>
          <sphereGeometry args={[0.18, 12, 12]} />
        </mesh>

        {/* Helmet dome (partial sphere) */}
        <mesh position={[0, 0.04, 0]} material={mats.armor}>
          <sphereGeometry args={[0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>

        {/* Helmet brow ridge */}
        <mesh position={[0, -0.02, 0.01]} rotation={[0.1, 0, 0]} material={mats.gold}>
          <torusGeometry args={[0.19, 0.018, 4, 12, Math.PI]} />
        </mesh>

        {/* Helmet nose guard */}
        <mesh position={[0, -0.04, 0.16]} material={mats.armor}>
          <boxGeometry args={[0.025, 0.1, 0.05]} />
        </mesh>

        {/* Helmet horns (stylized) */}
        <mesh position={[0.15, 0.06, 0]} rotation={[0, 0, -0.7]} material={mats.gold}>
          <coneGeometry args={[0.025, 0.14, 6]} />
        </mesh>
        <mesh position={[-0.15, 0.06, 0]} rotation={[0, 0, 0.7]} material={mats.gold}>
          <coneGeometry args={[0.025, 0.14, 6]} />
        </mesh>

        {/* Glowing eyes */}
        <mesh position={[0.055, -0.02, 0.14]} material={mats.eyes}>
          <sphereGeometry args={[0.022, 6, 6]} />
        </mesh>
        <mesh position={[-0.055, -0.02, 0.14]} material={mats.eyes}>
          <sphereGeometry args={[0.022, 6, 6]} />
        </mesh>

        {/* Jaw / chin (slight square jaw) */}
        <mesh position={[0, -0.12, 0.04]} material={mats.skin}>
          <boxGeometry args={[0.12, 0.06, 0.1]} />
        </mesh>
      </group>

      {/* ====== SWORD ARM ====== */}
      <group
        ref={swordArmRef}
        position={[swordSide * 0.38, 1.15, 0]}
      >
        {/* Upper arm (oversized forearm for heroic look) */}
        <mesh position={[0, -0.14, 0]} material={mats.skin}>
          <capsuleGeometry args={[0.055, 0.18, 4, 8]} />
        </mesh>

        {/* Gauntlet (forearm armor) */}
        <mesh position={[0, -0.28, 0]} material={mats.armor} castShadow>
          <boxGeometry args={[0.1, 0.16, 0.1]} />
        </mesh>
        {/* Gauntlet trim */}
        <mesh position={[0, -0.21, 0]} material={mats.gold}>
          <boxGeometry args={[0.11, 0.02, 0.11]} />
        </mesh>

        {/* Hand */}
        <mesh position={[0, -0.4, 0]} material={mats.skin}>
          <sphereGeometry args={[0.045, 8, 8]} />
        </mesh>

        {/* === SWORD === */}
        {/* Pommel (base sphere) */}
        <mesh position={[0, -0.46, 0]} material={mats.gold}>
          <sphereGeometry args={[0.03, 8, 8]} />
        </mesh>

        {/* Sword handle */}
        <mesh position={[0, -0.54, 0]} material={mats.leather}>
          <cylinderGeometry args={[0.025, 0.028, 0.2, 8]} />
        </mesh>

        {/* Crossguard */}
        <mesh position={[0, -0.45, 0]} material={mats.gold}>
          <boxGeometry args={[0.2, 0.035, 0.035]} />
        </mesh>
        {/* Crossguard end caps */}
        <mesh position={[0.1, -0.45, 0]} material={mats.gold}>
          <sphereGeometry args={[0.02, 6, 6]} />
        </mesh>
        <mesh position={[-0.1, -0.45, 0]} material={mats.gold}>
          <sphereGeometry args={[0.02, 6, 6]} />
        </mesh>

        {/* Blade (ExtrudeGeometry diamond cross-section, rotated to extend downward) */}
        <mesh
          position={[0, -0.46, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          geometry={geos.swordBlade}
          material={mats.sword}
          castShadow
        />

        {/* Blade glow (slightly larger, emissive, backside) */}
        <mesh
          ref={swordGlowRef}
          position={[0, -0.9, 0]}
          material={mats.swordGlow}
        >
          <boxGeometry args={[0.06, 0.82, 0.03]} />
        </mesh>

        {/* Blade tip */}
        <mesh position={[0, -1.33, 0]} material={mats.sword}>
          <coneGeometry args={[0.035, 0.1, 4]} />
        </mesh>
      </group>

      {/* ====== SHIELD ARM ====== */}
      <group
        ref={shieldArmRef}
        position={[-swordSide * 0.38, 1.15, 0]}
      >
        {/* Upper arm */}
        <mesh position={[0, -0.14, 0]} material={mats.skin}>
          <capsuleGeometry args={[0.055, 0.18, 4, 8]} />
        </mesh>

        {/* Gauntlet */}
        <mesh position={[0, -0.28, 0]} material={mats.armor} castShadow>
          <boxGeometry args={[0.1, 0.16, 0.1]} />
        </mesh>
        {/* Gauntlet trim */}
        <mesh position={[0, -0.21, 0]} material={mats.gold}>
          <boxGeometry args={[0.11, 0.02, 0.11]} />
        </mesh>

        {/* Shield group */}
        <group position={[0, -0.32, 0.12]} rotation={[0.25, 0, 0]}>
          {/* Shield face (domed partial sphere) */}
          <mesh material={mats.shield}>
            <sphereGeometry args={[0.22, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>
          {/* Shield flat back */}
          <mesh position={[0, 0, -0.01]} material={mats.darkIron}>
            <circleGeometry args={[0.21, 10]} />
          </mesh>
          {/* Shield rim (torus) */}
          <mesh material={mats.shieldRim}>
            <torusGeometry args={[0.22, 0.02, 6, 10]} />
          </mesh>
          {/* Shield boss (center bump) */}
          <mesh position={[0, 0, 0.06]} material={mats.gold}>
            <sphereGeometry args={[0.05, 8, 8]} />
          </mesh>
          {/* Shield cross decoration */}
          <mesh position={[0, 0, 0.02]} material={mats.gold}>
            <boxGeometry args={[0.04, 0.2, 0.01]} />
          </mesh>
          <mesh position={[0, 0, 0.02]} material={mats.gold}>
            <boxGeometry args={[0.2, 0.04, 0.01]} />
          </mesh>
        </group>
      </group>

      {/* ====== LEGS ====== */}
      {/* Left leg group */}
      <group ref={leftLegRef} position={[0.12, 0.3, 0]}>
        {/* Upper leg (armored) */}
        <mesh position={[0, -0.05, 0]} material={mats.darkIron} castShadow>
          <boxGeometry args={[0.13, 0.28, 0.13]} />
        </mesh>
        {/* Knee guard */}
        <mesh position={[0, -0.16, 0.06]} material={mats.armor}>
          <sphereGeometry args={[0.05, 6, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.3, 0]} material={mats.darkIron} castShadow>
          <boxGeometry args={[0.11, 0.22, 0.11]} />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.44, 0.02]} material={mats.leather}>
          <boxGeometry args={[0.12, 0.08, 0.16]} />
        </mesh>
      </group>

      {/* Right leg group */}
      <group ref={rightLegRef} position={[-0.12, 0.3, 0]}>
        {/* Upper leg */}
        <mesh position={[0, -0.05, 0]} material={mats.darkIron} castShadow>
          <boxGeometry args={[0.13, 0.28, 0.13]} />
        </mesh>
        {/* Knee guard */}
        <mesh position={[0, -0.16, 0.06]} material={mats.armor}>
          <sphereGeometry args={[0.05, 6, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.3, 0]} material={mats.darkIron} castShadow>
          <boxGeometry args={[0.11, 0.22, 0.11]} />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.44, 0.02]} material={mats.leather}>
          <boxGeometry args={[0.12, 0.08, 0.16]} />
        </mesh>
      </group>

      {/* ====== HEALTH BAR (HTML overlay) ====== */}
      <Html
        position={[0, 1.85, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            width: 60,
            height: 6,
            background: 'rgba(0,0,0,0.7)',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid rgba(255,215,0,0.3)',
          }}
        >
          <div
            style={{
              width: `${health}%`,
              height: '100%',
              background: healthColour,
              transition: 'width 0.3s ease, background 0.3s ease',
              borderRadius: 3,
            }}
          />
        </div>
      </Html>
    </group>
  );
}
