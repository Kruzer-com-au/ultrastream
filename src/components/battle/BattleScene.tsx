'use client';

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import RebelWarrior from './RebelWarrior';
import EnemyManager from './EnemyManager';
import type { Enemy } from '@/hooks/useGameState';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BattleSceneProps {
  enemies: Enemy[];
  wave: number;
  rebelsHealth: number;
  gameStarted: boolean;
  gameOver: boolean;
  betweenWaves: boolean;
  waveDefeatedCount: number;
  waveTotalCount: number;
  isMobile?: boolean;
  onDefeatEnemy: (id: string) => void;
  onNeutralizeEnemy: (id: string) => void;
  onDamageRebels: (amount: number) => void;
  onRemoveEnemy: (id: string) => void;
  onSpawnWave: (wave: number) => void;
  onNextWave: () => void;
  onSetBetweenWaves: (nextWaveTime: number) => void;
  onUpdateEnemyPosition: (id: string, pos: [number, number, number]) => void;
  onGameOver: () => void;
  onVictory: () => void;
}

// ---------------------------------------------------------------------------
// Ground plane sub-component (inside Canvas)
// ---------------------------------------------------------------------------

function BattleGround() {
  const gridTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Dark fill
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, size, size);

    // Grid lines
    const cellSize = size / 20;
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 20; i++) {
      const pos = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(size, pos);
      ctx.stroke();
    }

    // Center glow circle
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 3
    );
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.06)');
    gradient.addColorStop(0.5, 'rgba(123, 47, 247, 0.03)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.1, 0]}
      receiveShadow
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        map={gridTexture}
        color="#0a0a0a"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Arena ring decoration (subtle neon ring on ground)
// ---------------------------------------------------------------------------

function ArenaRing() {
  return (
    <group>
      {/* Outer ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <ringGeometry args={[7.8, 8.0, 48]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner ring (danger zone) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <ringGeometry args={[0.7, 0.9, 32]} />
        <meshStandardMaterial
          color="#ff0040"
          emissive="#ff0040"
          emissiveIntensity={0.3}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Lighting setup
// ---------------------------------------------------------------------------

function BattleLighting({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <>
      {/* Ambient – cold blue tone (slightly brighter on mobile to compensate for fewer lights) */}
      <ambientLight intensity={isMobile ? 0.4 : 0.25} color="#4488cc" />

      {/* Main warm light on rebels */}
      <pointLight
        position={[0, 6, 0]}
        intensity={isMobile ? 30 : 40}
        color="#ffd700"
        distance={12}
        decay={2}
        castShadow={!isMobile}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {/* Fill light from front */}
      <directionalLight
        position={[3, 5, 5]}
        intensity={0.6}
        color="#ffe0a0"
        castShadow={!isMobile}
        shadow-mapSize-width={isMobile ? 256 : 512}
        shadow-mapSize-height={isMobile ? 256 : 512}
      />

      {/* Rim lights – reduced on mobile for performance */}
      <pointLight
        position={[8, 2, 0]}
        intensity={isMobile ? 10 : 15}
        color="#ff0040"
        distance={12}
        decay={2}
      />
      {!isMobile && (
        <pointLight
          position={[-8, 2, 0]}
          intensity={15}
          color="#ff0040"
          distance={12}
          decay={2}
        />
      )}
      {!isMobile && (
        <pointLight
          position={[0, 2, 8]}
          intensity={10}
          color="#ff0040"
          distance={12}
          decay={2}
        />
      )}
      <pointLight
        position={[0, 2, -8]}
        intensity={isMobile ? 8 : 10}
        color="#7b2ff7"
        distance={12}
        decay={2}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main BattleScene component
// ---------------------------------------------------------------------------

export default function BattleScene({
  enemies,
  wave,
  rebelsHealth,
  gameStarted,
  gameOver,
  betweenWaves,
  waveDefeatedCount,
  waveTotalCount,
  isMobile = false,
  onDefeatEnemy,
  onNeutralizeEnemy,
  onDamageRebels,
  onRemoveEnemy,
  onSpawnWave,
  onNextWave,
  onSetBetweenWaves,
  onUpdateEnemyPosition,
  onGameOver,
  onVictory,
}: BattleSceneProps) {
  // Each rebel gets half the health display
  const rebelHealth = rebelsHealth;
  const isFighting = gameStarted && !gameOver && enemies.some((e) => e.isAlive);

  return (
    <Canvas
      camera={{
        position: [0, 8, 8],
        fov: 50,
        near: 0.1,
        far: 100,
      }}
      shadows={!isMobile}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      style={{
        width: '100%',
        height: '100%',
        cursor: gameStarted && !gameOver ? 'crosshair' : 'default',
      }}
      gl={{
        antialias: !isMobile,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0, 0);
      }}
    >
      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#050505', 8, 22]} />

      {/* Lighting */}
      <BattleLighting isMobile={isMobile} />

      {/* Ground */}
      <BattleGround />

      {/* Arena decorations */}
      <ArenaRing />

      {/* Rebel Warriors (two fighters back-to-back) */}
      <RebelWarrior
        position={[-0.5, 0, 0]}
        health={rebelHealth}
        isFighting={isFighting}
        mirrorSword={false}
      />
      <RebelWarrior
        position={[0.5, 0, 0]}
        health={rebelHealth}
        isFighting={isFighting}
        mirrorSword={true}
      />

      {/* Enemy Manager */}
      <EnemyManager
        enemies={enemies}
        wave={wave}
        gameStarted={gameStarted}
        gameOver={gameOver}
        rebelsHealth={rebelsHealth}
        onDefeatEnemy={onDefeatEnemy}
        onNeutralizeEnemy={onNeutralizeEnemy}
        onDamageRebels={onDamageRebels}
        onRemoveEnemy={onRemoveEnemy}
        onSpawnWave={onSpawnWave}
        onNextWave={onNextWave}
        onSetBetweenWaves={onSetBetweenWaves}
        onUpdateEnemyPosition={onUpdateEnemyPosition}
        onGameOver={onGameOver}
        onVictory={onVictory}
        betweenWaves={betweenWaves}
        waveDefeatedCount={waveDefeatedCount}
        waveTotalCount={waveTotalCount}
      />
    </Canvas>
  );
}
