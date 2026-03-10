'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import CorporateEnemy from './CorporateEnemy';
import type { Enemy } from '@/hooks/useGameState';
import { generateWaveEnemies, getWaveEnemyCount, getWaveDamage } from '@/hooks/useGameState';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EnemyManagerProps {
  enemies: Enemy[];
  wave: number;
  gameStarted: boolean;
  gameOver: boolean;
  rebelsHealth: number;
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
  betweenWaves: boolean;
  waveDefeatedCount: number;
  waveTotalCount: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EnemyManager({
  enemies,
  wave,
  gameStarted,
  gameOver,
  rebelsHealth,
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
  betweenWaves,
  waveDefeatedCount,
  waveTotalCount,
}: EnemyManagerProps) {
  const waveSpawned = useRef(false);
  const currentWaveRef = useRef(0);
  const betweenWaveStart = useRef(0);
  const damageThrottle = useRef<Record<string, number>>({});
  const initialSpawnDone = useRef(false);

  // Track which enemies have reached center (to prevent multi-damage)
  const reachedCenterSet = useRef<Set<string>>(new Set());

  // Reset refs when a new game starts
  useEffect(() => {
    if (gameStarted && !gameOver) {
      waveSpawned.current = false;
      currentWaveRef.current = 0;
      betweenWaveStart.current = 0;
      damageThrottle.current = {};
      initialSpawnDone.current = false;
      reachedCenterSet.current.clear();
    }
  }, [gameStarted, gameOver]);

  // --- Handle enemy reaching center ---
  const handleReachCenter = useCallback(
    (id: string) => {
      if (gameOver) return;
      if (reachedCenterSet.current.has(id)) return;
      reachedCenterSet.current.add(id);

      // Damage rebels - scales with wave
      onDamageRebels(getWaveDamage(wave));

      // Mark enemy as dead (counts toward wave progress, no score)
      onNeutralizeEnemy(id);

      // Remove enemy after brief delay (it "attacks" then vanishes)
      setTimeout(() => {
        onRemoveEnemy(id);
      }, 600);
    },
    [gameOver, onDamageRebels, onNeutralizeEnemy, onRemoveEnemy, wave]
  );

  // --- Handle enemy defeat ---
  const handleDefeat = useCallback(
    (id: string) => {
      if (gameOver) return;
      onDefeatEnemy(id);
      // Check if this hit will kill the enemy (health will reach 0)
      // The reducer handles health decrement; we schedule removal only if enemy will die
      const enemy = enemies.find((e) => e.id === id);
      if (enemy && enemy.health <= 1) {
        // Enemy will die from this hit - remove after death animation
        setTimeout(() => {
          onRemoveEnemy(id);
        }, 1200);
      }
    },
    [gameOver, onDefeatEnemy, onRemoveEnemy, enemies]
  );

  // --- Handle position update (from child) ---
  const handlePositionUpdate = useCallback(
    (id: string, pos: [number, number, number]) => {
      // We don't call the parent on every frame to avoid re-renders.
      // Position is tracked locally in the CorporateEnemy component.
      // Only used if we need external tracking.
    },
    []
  );

  // --- Game tick ---
  useFrame(() => {
    if (!gameStarted || gameOver) return;

    // Initial wave spawn
    if (!initialSpawnDone.current) {
      initialSpawnDone.current = true;
      currentWaveRef.current = wave;
      onSpawnWave(wave);
      waveSpawned.current = true;
      return;
    }

    // Check if current wave is cleared
    // Use waveDefeatedCount vs waveTotalCount — this correctly tracks enemies
    // that were clicked AND enemies that reached center (neutralized)
    const waveCleared = waveTotalCount > 0 && waveDefeatedCount >= waveTotalCount;

    if (waveCleared && !betweenWaves && waveSpawned.current) {
      // Victory condition - survived all 100 waves
      if (currentWaveRef.current >= 100) {
        onVictory();
        return;
      }

      // All enemies defeated - start between-wave pause
      waveSpawned.current = false;
      betweenWaveStart.current = Date.now();
      onSetBetweenWaves(Date.now() + 3000);
    }

    // Between-waves countdown

    if (betweenWaves) {
      const elapsed = Date.now() - betweenWaveStart.current;
      if (elapsed >= 3000) {
        // Spawn next wave
        const nextWave = currentWaveRef.current + 1;
        currentWaveRef.current = nextWave;
        onNextWave();
        onSpawnWave(nextWave);
        waveSpawned.current = true;
        reachedCenterSet.current.clear();
      }
    }

    // Check game over from health
    if (rebelsHealth <= 0 && !gameOver) {
      onGameOver();
    }
  });

  return (
    <group>
      {enemies.map((enemy) => (
        <CorporateEnemy
          key={enemy.id}
          id={enemy.id}
          position={enemy.position}
          targetPosition={[0, 0, 0]}
          speed={enemy.speed}
          phrase={enemy.phrase}
          isAlive={enemy.isAlive}
          health={enemy.health}
          maxHealth={enemy.maxHealth}
          isBoss={enemy.isBoss}
          bossColor={enemy.bossColor}
          onDefeat={handleDefeat}
          onReachCenter={handleReachCenter}
          onPositionUpdate={handlePositionUpdate}
        />
      ))}
    </group>
  );
}
