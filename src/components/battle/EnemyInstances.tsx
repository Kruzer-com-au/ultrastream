'use client';

import { useRef, useMemo, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Enemy } from '@/hooks/useGameState';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EnemyInstancesProps {
  enemies: Enemy[];
  isMobile: boolean;
  onDefeat: (id: string) => void;
  onReachCenter: (id: string) => void;
}

// Per-enemy runtime state (NOT React state -- plain mutable objects)
interface EnemyRuntime {
  id: string;
  pos: THREE.Vector3;
  targetPos: THREE.Vector3;
  speed: number;
  animOffset: number;
  walkSpeedVariation: number;
  deathVariation: number;
  isAlive: boolean;
  dying: boolean;
  dead: boolean;
  dyingTimer: number;
  hasReachedCenter: boolean;
  hitFlashTimer: number;
  isBoss: boolean;
  bossScale: number;
  bossColor: string | undefined;
  health: number;
  maxHealth: number;
  phrase: string;
}

// ---------------------------------------------------------------------------
// Shared materials (created ONCE at module scope)
// ---------------------------------------------------------------------------

const SHARED_MATS = {
  suit: new THREE.MeshStandardMaterial({
    color: '#4a4a4a', roughness: 0.55, metalness: 0.28,
  }),
  suitDark: new THREE.MeshStandardMaterial({
    color: '#2d2d2d', roughness: 0.65, metalness: 0.2,
  }),
  skin: new THREE.MeshStandardMaterial({
    color: '#e0c8a8', roughness: 0.75, metalness: 0.05,
  }),
  tie: new THREE.MeshStandardMaterial({
    color: '#ff0040',
    emissive: new THREE.Color('#ff0040'),
    emissiveIntensity: 0.35,
    roughness: 0.3, metalness: 0.4,
  }),
  briefcase: new THREE.MeshStandardMaterial({
    color: '#2a1a0a', roughness: 0.45, metalness: 0.4,
    emissive: new THREE.Color('#ff0040'),
    emissiveIntensity: 0.05,
  }),
  eyes: new THREE.MeshStandardMaterial({
    color: '#ff0000',
    emissive: new THREE.Color('#ff0000'),
    emissiveIntensity: 0.8,
  }),
  hair: new THREE.MeshStandardMaterial({
    color: '#1a1a1a', roughness: 0.9, metalness: 0.0,
  }),
  shoes: new THREE.MeshStandardMaterial({
    color: '#1a1a1a', roughness: 0.4, metalness: 0.3,
  }),
};

// ---------------------------------------------------------------------------
// Shared geometries (created ONCE at module scope)
// ---------------------------------------------------------------------------

const SHARED_GEOS = {
  // Torso
  torso: new THREE.BoxGeometry(0.32, 0.52, 0.2),
  // Head
  head: new THREE.SphereGeometry(0.17, 10, 10),
  // Eyes
  eye: new THREE.SphereGeometry(0.028, 6, 6),
  // Tie body
  tieBody: new THREE.BoxGeometry(0.04, 0.26, 0.015),
  // Briefcase
  briefcase: new THREE.BoxGeometry(0.18, 0.12, 0.04),
  // Legs (upper+lower combined for mobile simplicity)
  leg: new THREE.BoxGeometry(0.09, 0.36, 0.09),
  // Arms (upper+lower combined)
  arm: new THREE.BoxGeometry(0.07, 0.38, 0.07),
  // Hitbox (invisible, oversized for tap targets)
  hitbox: new THREE.BoxGeometry(1.0, 1.6, 0.8),
  hitboxMobile: new THREE.BoxGeometry(1.5, 2.0, 1.2),
  // Shoe
  shoe: new THREE.BoxGeometry(0.08, 0.04, 0.12),
};

// Dummy for matrix calculations
const _dummy = new THREE.Object3D();
const _tempVec = new THREE.Vector3();
const _tempDir = new THREE.Vector3();
const _tempColor = new THREE.Color();

// Large bounding sphere so InstancedMesh raycasting always passes the
// coarse bounding-sphere check.  Without this, THREE.js computes the sphere
// once from stale/uninitialized matrices and caches it forever, silently
// causing every ray-mesh intersection to early-return false.
const ARENA_BOUNDING_SPHERE = new THREE.Sphere(
  new THREE.Vector3(0, 0, 0),
  50 // well beyond the 8-12 unit arena radius
);

// Max instances supported
const MAX_INSTANCES = 210; // 200 desktop max + 10 bosses buffer

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EnemyInstances({
  enemies,
  isMobile,
  onDefeat,
  onReachCenter,
}: EnemyInstancesProps) {
  // InstancedMesh refs -- one per body part type
  const torsoRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const eyeLeftRef = useRef<THREE.InstancedMesh>(null);
  const eyeRightRef = useRef<THREE.InstancedMesh>(null);
  const tieRef = useRef<THREE.InstancedMesh>(null);
  const briefcaseRef = useRef<THREE.InstancedMesh>(null);
  const leftLegRef = useRef<THREE.InstancedMesh>(null);
  const rightLegRef = useRef<THREE.InstancedMesh>(null);
  const leftArmRef = useRef<THREE.InstancedMesh>(null);
  const rightArmRef = useRef<THREE.InstancedMesh>(null);
  const hitboxRef = useRef<THREE.InstancedMesh>(null);

  // Runtime state map (mutable, NOT React state)
  const runtimeMap = useRef<Map<string, EnemyRuntime>>(new Map());
  // Ordered list of active enemy IDs for index mapping
  const activeIds = useRef<string[]>([]);
  // Track which enemies have been reported as reached center
  const reachedCenterSet = useRef<Set<string>>(new Set());

  // -- Sync runtime state from React enemy data --
  useEffect(() => {
    const map = runtimeMap.current;
    const currentIds = new Set<string>();

    for (const enemy of enemies) {
      currentIds.add(enemy.id);
      let rt = map.get(enemy.id);
      if (!rt) {
        // New enemy -- create runtime
        rt = {
          id: enemy.id,
          pos: new THREE.Vector3(enemy.position[0], 0, enemy.position[2]),
          targetPos: new THREE.Vector3(0, 0, 0),
          speed: enemy.speed,
          animOffset: Math.random() * Math.PI * 2,
          walkSpeedVariation: 0.88 + Math.random() * 0.24,
          deathVariation: Math.floor(Math.random() * 3),
          isAlive: enemy.isAlive,
          dying: false,
          dead: false,
          dyingTimer: 0,
          hasReachedCenter: false,
          hitFlashTimer: 0,
          isBoss: enemy.isBoss,
          bossScale: enemy.isBoss ? 1.0 + enemy.maxHealth * 0.06 : 1.0,
          bossColor: enemy.bossColor,
          health: enemy.health,
          maxHealth: enemy.maxHealth,
          phrase: enemy.phrase,
        };
        map.set(enemy.id, rt);
      } else {
        // Update from React state
        if (!enemy.isAlive && rt.isAlive && !rt.dying && !rt.dead) {
          rt.dying = true;
          rt.dyingTimer = 0;
          rt.hitFlashTimer = 0.08;
        }
        rt.isAlive = enemy.isAlive;
        rt.health = enemy.health;
      }
    }

    // Remove enemies no longer in the list
    for (const [id] of map) {
      if (!currentIds.has(id)) {
        map.delete(id);
        reachedCenterSet.current.delete(id);
      }
    }

    // Rebuild active IDs list (for index mapping)
    activeIds.current = enemies
      .filter((e) => {
        const rt = map.get(e.id);
        return rt && !rt.dead;
      })
      .map((e) => e.id);
  }, [enemies]);

  // -- Native DOM pointer handler with manual raycasting --
  // R3F v9.5 + Three.js 0.183 built-in event system doesn't fire on
  // InstancedMesh, so we bypass it entirely with native DOM events.
  const { camera, gl } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleNativePointer = (e: PointerEvent) => {
      // Convert screen coords to NDC (-1..1)
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      // Test against all clickable InstancedMeshes
      const targets = [hitboxRef, torsoRef, headRef, leftLegRef, rightLegRef]
        .map((r) => r.current)
        .filter(Boolean) as THREE.InstancedMesh[];

      const intersects = raycaster.intersectObjects(targets, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const instanceId = hit.instanceId;
        if (instanceId === undefined) return;

        const id = activeIds.current[instanceId];
        if (!id) return;

        const rt = runtimeMap.current.get(id);
        if (!rt || !rt.isAlive || rt.dying || rt.dead) return;

        rt.hitFlashTimer = 0.08;

        // Haptic feedback on mobile
        if (isMobile && navigator.vibrate) {
          navigator.vibrate(30);
        }

        onDefeat(id);
      }
    };

    canvas.addEventListener('pointerdown', handleNativePointer);
    return () => canvas.removeEventListener('pointerdown', handleNativePointer);
  }, [camera, gl, raycaster, pointer, isMobile, onDefeat]);

  // -- Single useFrame for ALL enemies --
  useFrame((_, delta) => {
    const map = runtimeMap.current;
    const ids = activeIds.current;
    const dt = Math.min(delta, 0.05);
    const t = performance.now() / 1000;
    let visibleCount = 0;

    // Re-build activeIds from map (filter dead)
    const newIds: string[] = [];
    for (const [id, rt] of map) {
      if (!rt.dead) {
        newIds.push(id);
      }
    }
    activeIds.current = newIds;
    const count = newIds.length;

    for (let i = 0; i < count; i++) {
      const id = newIds[i];
      const rt = map.get(id);
      if (!rt) continue;

      const phi = rt.animOffset;
      const bossScale = rt.bossScale;

      // === DYING ANIMATION ===
      if (rt.dying) {
        rt.dyingTimer += dt;
        const elapsed = rt.dyingTimer;

        let scale = 1.0;
        let extraY = 0;
        let extraRotY = 0;

        switch (rt.deathVariation) {
          case 0: {
            // "Boardroom Bust"
            if (elapsed < 0.1) {
              scale = 1.0 + 0.1 * (elapsed / 0.1);
            } else if (elapsed < 0.4) {
              const p = (elapsed - 0.1) / 0.3;
              extraRotY = p * 15 * dt * 60;
              extraY = elapsed * 1.5;
              scale = Math.max(0, 1.1 - p * 0.8);
            } else {
              rt.dead = true;
              scale = 0;
            }
            break;
          }
          case 1: {
            // "Comedy Deflation"
            if (elapsed < 0.1) {
              scale = 1.0;
            } else if (elapsed < 0.4) {
              const p = (elapsed - 0.1) / 0.3;
              scale = Math.max(0.05, 1.0 - p * 0.85);
            } else if (elapsed < 0.6) {
              const p = (elapsed - 0.4) / 0.2;
              scale = Math.max(0, 0.15 * (1 - p));
            } else {
              rt.dead = true;
              scale = 0;
            }
            break;
          }
          default: {
            // "Dissolve Spin"
            if (elapsed < 0.65) {
              const p = elapsed / 0.65;
              extraRotY = p * 14 * dt * 60;
              extraY = elapsed * 1.2;
              scale = Math.max(0, 1.0 - p);
            } else {
              rt.dead = true;
              scale = 0;
            }
            break;
          }
        }

        if (rt.dead) {
          // Hide all instances for this enemy by setting scale to 0
          setInstanceTransform(i, rt.pos.x, -100, rt.pos.z, 0, 0, 0.001);
          visibleCount++;
          continue;
        }

        // During dying, update position for animation
        setInstanceTransform(
          i,
          rt.pos.x,
          extraY,
          rt.pos.z,
          extraRotY,
          0,
          scale * bossScale
        );
        visibleCount++;
        continue;
      }

      // === MOVEMENT TOWARD TARGET ===
      _tempDir.copy(rt.targetPos).sub(rt.pos);
      const dist = _tempDir.length();

      if (dist > 0.8) {
        _tempDir.normalize().multiplyScalar(rt.speed);
        rt.pos.add(_tempDir);
      } else if (!rt.hasReachedCenter) {
        rt.hasReachedCenter = true;
        if (!reachedCenterSet.current.has(rt.id)) {
          reachedCenterSet.current.add(rt.id);
          onReachCenter(rt.id);
        }
      }

      // === WALK CYCLE ===
      const walkPhase = t * 7 * rt.walkSpeedVariation + phi;
      const bounceY = Math.abs(Math.sin(walkPhase)) * 0.06;
      const facingAngle = dist > 0.8
        ? Math.atan2(rt.targetPos.x - rt.pos.x, rt.targetPos.z - rt.pos.z)
        : 0;

      // Leg swing angles
      const leftLegSwing = Math.sin(walkPhase) * 0.35;
      const rightLegSwing = Math.sin(walkPhase + Math.PI) * 0.35;
      // Arm swing angles
      const leftArmSwing = Math.sin(walkPhase + Math.PI) * 0.25;
      const rightArmSwing = Math.sin(walkPhase) * 0.12;

      // Eye glow based on distance
      const distNorm = Math.min(1, Math.max(0, 1 - dist / 8));

      // --- Update all body part instances ---

      // TORSO
      if (torsoRef.current) {
        _dummy.position.set(rt.pos.x, 0.5 + bounceY, rt.pos.z);
        _dummy.rotation.set(-0.06, facingAngle, Math.sin(walkPhase * 0.5) * 0.05);
        _dummy.scale.setScalar(bossScale);
        _dummy.updateMatrix();
        torsoRef.current.setMatrixAt(i, _dummy.matrix);
      }

      // HEAD
      if (headRef.current) {
        _dummy.position.set(rt.pos.x, 0.92 + bounceY * 0.5, rt.pos.z);
        _dummy.rotation.set(-0.08, facingAngle + Math.sin(t * 0.3 + phi) * 0.03, 0);
        _dummy.scale.setScalar(bossScale);
        _dummy.updateMatrix();
        headRef.current.setMatrixAt(i, _dummy.matrix);
      }

      // EYES
      if (eyeLeftRef.current) {
        // Position eyes relative to head in world space
        const headY = 0.92 + bounceY * 0.5;
        const eyeOffsetX = 0.055 * bossScale;
        const eyeOffsetZ = 0.14 * bossScale;
        const cosA = Math.cos(facingAngle);
        const sinA = Math.sin(facingAngle);
        // Left eye
        _dummy.position.set(
          rt.pos.x + sinA * eyeOffsetZ - cosA * eyeOffsetX,
          headY + 0.01 * bossScale,
          rt.pos.z + cosA * eyeOffsetZ + sinA * eyeOffsetX
        );
        _dummy.rotation.set(0, facingAngle, 0);
        _dummy.scale.setScalar(bossScale);
        _dummy.updateMatrix();
        eyeLeftRef.current.setMatrixAt(i, _dummy.matrix);
      }

      if (eyeRightRef.current) {
        const headY = 0.92 + bounceY * 0.5;
        const eyeOffsetX = 0.055 * bossScale;
        const eyeOffsetZ = 0.14 * bossScale;
        const cosA = Math.cos(facingAngle);
        const sinA = Math.sin(facingAngle);
        // Right eye
        _dummy.position.set(
          rt.pos.x + sinA * eyeOffsetZ + cosA * eyeOffsetX,
          headY + 0.01 * bossScale,
          rt.pos.z + cosA * eyeOffsetZ - sinA * eyeOffsetX
        );
        _dummy.rotation.set(0, facingAngle, 0);
        _dummy.scale.setScalar(bossScale);
        _dummy.updateMatrix();
        eyeRightRef.current.setMatrixAt(i, _dummy.matrix);
      }

      // TIE (skip on mobile)
      if (!isMobile && tieRef.current) {
        const tieSwing = Math.sin(walkPhase * 2) * 0.12;
        _dummy.position.set(rt.pos.x, 0.57 + bounceY, rt.pos.z);
        _dummy.rotation.set(
          Math.sin(walkPhase) * 0.05,
          facingAngle,
          tieSwing
        );
        _dummy.scale.setScalar(bossScale);
        _dummy.updateMatrix();
        tieRef.current.setMatrixAt(i, _dummy.matrix);
      }

      // BRIEFCASE (skip on mobile)
      if (!isMobile && briefcaseRef.current) {
        const bcOffsetX = -0.22 * bossScale;
        const cosA = Math.cos(facingAngle);
        const sinA = Math.sin(facingAngle);
        _dummy.position.set(
          rt.pos.x - cosA * bcOffsetX,
          0.27 + bounceY + Math.sin(walkPhase) * 0.03,
          rt.pos.z + sinA * bcOffsetX
        );
        _dummy.rotation.set(rightArmSwing * 0.3, facingAngle, 0);
        _dummy.scale.setScalar(bossScale);
        _dummy.updateMatrix();
        briefcaseRef.current.setMatrixAt(i, _dummy.matrix);
      }

      // LEFT LEG
      if (leftLegRef.current) {
        const legOffsetX = 0.07 * bossScale;
        const cosA = Math.cos(facingAngle);
        const sinA = Math.sin(facingAngle);
        _dummy.position.set(
          rt.pos.x - cosA * legOffsetX,
          0.04 + bounceY * 0.3,
          rt.pos.z + sinA * legOffsetX
        );
        _dummy.rotation.set(leftLegSwing, facingAngle, 0);
        _dummy.scale.setScalar(bossScale);
        _dummy.updateMatrix();
        leftLegRef.current.setMatrixAt(i, _dummy.matrix);
      }

      // RIGHT LEG
      if (rightLegRef.current) {
        const legOffsetX = -0.07 * bossScale;
        const cosA = Math.cos(facingAngle);
        const sinA = Math.sin(facingAngle);
        _dummy.position.set(
          rt.pos.x - cosA * legOffsetX,
          0.04 + bounceY * 0.3,
          rt.pos.z + sinA * legOffsetX
        );
        _dummy.rotation.set(rightLegSwing, facingAngle, 0);
        _dummy.scale.setScalar(bossScale);
        _dummy.updateMatrix();
        rightLegRef.current.setMatrixAt(i, _dummy.matrix);
      }

      // LEFT ARM (skip on mobile)
      if (!isMobile && leftArmRef.current) {
        const armOffsetX = 0.22 * bossScale;
        const cosA = Math.cos(facingAngle);
        const sinA = Math.sin(facingAngle);
        _dummy.position.set(
          rt.pos.x - cosA * armOffsetX,
          0.46 + bounceY,
          rt.pos.z + sinA * armOffsetX
        );
        _dummy.rotation.set(leftArmSwing, facingAngle, 0);
        _dummy.scale.setScalar(bossScale);
        _dummy.updateMatrix();
        leftArmRef.current.setMatrixAt(i, _dummy.matrix);
      }

      // RIGHT ARM (skip on mobile)
      if (!isMobile && rightArmRef.current) {
        const armOffsetX = -0.22 * bossScale;
        const cosA = Math.cos(facingAngle);
        const sinA = Math.sin(facingAngle);
        _dummy.position.set(
          rt.pos.x - cosA * armOffsetX,
          0.46 + bounceY,
          rt.pos.z + sinA * armOffsetX
        );
        _dummy.rotation.set(rightArmSwing, facingAngle, 0);
        _dummy.scale.setScalar(bossScale);
        _dummy.updateMatrix();
        rightArmRef.current.setMatrixAt(i, _dummy.matrix);
      }

      // HITBOX (invisible, for tap detection)
      if (hitboxRef.current) {
        _dummy.position.set(rt.pos.x, 0.5 + bounceY, rt.pos.z);
        _dummy.rotation.set(0, facingAngle, 0);
        _dummy.scale.setScalar(bossScale);
        _dummy.updateMatrix();
        hitboxRef.current.setMatrixAt(i, _dummy.matrix);
      }

      visibleCount++;
    }

    // Hide remaining instances (set them far off-screen)
    for (let i = count; i < MAX_INSTANCES; i++) {
      setInstanceTransform(i, 0, -100, 0, 0, 0, 0.001);
    }

    // Mark all instancedMeshes as needing matrix update
    const meshes = [
      torsoRef, headRef, eyeLeftRef, eyeRightRef,
      tieRef, briefcaseRef, leftLegRef, rightLegRef,
      leftArmRef, rightArmRef, hitboxRef,
    ];
    for (const ref of meshes) {
      if (ref.current) {
        ref.current.instanceMatrix.needsUpdate = true;
        ref.current.count = count;
      }
    }

    // Force a large bounding sphere on clickable meshes so manual
    // raycaster.intersectObjects() doesn't early-reject them.
    const clickableMeshes = [torsoRef, headRef, leftLegRef, rightLegRef, hitboxRef];
    for (const ref of clickableMeshes) {
      if (ref.current) {
        ref.current.boundingSphere = ARENA_BOUNDING_SPHERE;
      }
    }
  });

  // Helper: set a transform on all body part instancedMeshes at index i
  function setInstanceTransform(
    i: number,
    x: number,
    y: number,
    z: number,
    rotY: number,
    rotX: number,
    scale: number
  ) {
    _dummy.position.set(x, y, z);
    _dummy.rotation.set(rotX, rotY, 0);
    _dummy.scale.setScalar(scale);
    _dummy.updateMatrix();

    const meshes = [
      torsoRef, headRef, eyeLeftRef, eyeRightRef,
      tieRef, briefcaseRef, leftLegRef, rightLegRef,
      leftArmRef, rightArmRef, hitboxRef,
    ];
    for (const ref of meshes) {
      if (ref.current) {
        ref.current.setMatrixAt(i, _dummy.matrix);
      }
    }
  }

  // Hitbox material (invisible)
  const hitboxMat = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    []
  );

  const hitboxGeo = isMobile ? SHARED_GEOS.hitboxMobile : SHARED_GEOS.hitbox;

  return (
    <group>
      {/* TORSO */}
      <instancedMesh
        ref={torsoRef}
        args={[SHARED_GEOS.torso, SHARED_MATS.suit, MAX_INSTANCES]}
        frustumCulled={false}
        castShadow={!isMobile}
      />

      {/* HEAD */}
      <instancedMesh
        ref={headRef}
        args={[SHARED_GEOS.head, SHARED_MATS.skin, MAX_INSTANCES]}
        frustumCulled={false}
        castShadow={!isMobile}
      />

      {/* LEFT EYE */}
      <instancedMesh
        ref={eyeLeftRef}
        args={[SHARED_GEOS.eye, SHARED_MATS.eyes, MAX_INSTANCES]}
        frustumCulled={false}
      />

      {/* RIGHT EYE */}
      <instancedMesh
        ref={eyeRightRef}
        args={[SHARED_GEOS.eye, SHARED_MATS.eyes, MAX_INSTANCES]}
        frustumCulled={false}
      />

      {/* TIE (skip on mobile) */}
      {!isMobile && (
        <instancedMesh
          ref={tieRef}
          args={[SHARED_GEOS.tieBody, SHARED_MATS.tie, MAX_INSTANCES]}
          frustumCulled={false}
        />
      )}

      {/* BRIEFCASE (skip on mobile) */}
      {!isMobile && (
        <instancedMesh
          ref={briefcaseRef}
          args={[SHARED_GEOS.briefcase, SHARED_MATS.briefcase, MAX_INSTANCES]}
          frustumCulled={false}
          castShadow
        />
      )}

      {/* LEFT LEG */}
      <instancedMesh
        ref={leftLegRef}
        args={[SHARED_GEOS.leg, SHARED_MATS.suitDark, MAX_INSTANCES]}
        frustumCulled={false}
        castShadow={!isMobile}
      />

      {/* RIGHT LEG */}
      <instancedMesh
        ref={rightLegRef}
        args={[SHARED_GEOS.leg, SHARED_MATS.suitDark, MAX_INSTANCES]}
        frustumCulled={false}
        castShadow={!isMobile}
      />

      {/* LEFT ARM (skip on mobile) */}
      {!isMobile && (
        <instancedMesh
          ref={leftArmRef}
          args={[SHARED_GEOS.arm, SHARED_MATS.suit, MAX_INSTANCES]}
          frustumCulled={false}
        />
      )}

      {/* RIGHT ARM (skip on mobile) */}
      {!isMobile && (
        <instancedMesh
          ref={rightArmRef}
          args={[SHARED_GEOS.arm, SHARED_MATS.suit, MAX_INSTANCES]}
          frustumCulled={false}
        />
      )}

      {/* HITBOX (invisible, for tap/click detection) */}
      <instancedMesh
        ref={hitboxRef}
        args={[hitboxGeo, hitboxMat, MAX_INSTANCES]}
        frustumCulled={false}
      />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Helper: get the boss info from enemies list (for HUD display)
// ---------------------------------------------------------------------------

export function getActiveBoss(enemies: Enemy[]): Enemy | null {
  return enemies.find((e) => e.isBoss && e.isAlive && e.health > 0) || null;
}

export function getRandomPhrase(enemies: Enemy[]): string | null {
  const alive = enemies.filter((e) => e.isAlive);
  if (alive.length === 0) return null;
  return alive[Math.floor(Math.random() * alive.length)].phrase;
}
