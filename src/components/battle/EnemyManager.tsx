'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import EnemyInstances from './EnemyInstances';
import type { Enemy } from '@/hooks/useGameState';
import { getWaveDamage } from '@/hooks/useGameState';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EnemyManagerProps {
  enemies: Enemy[];
  wave: number;
  gameStarted: boolean;
  gameOver: boolean;
  rebelsHealth: number;
  isMobile: boolean;
  onDefeatEnemy: (id: string) => void;
  onNeutralizeEnemy: (id: string) => void;
  onDamageRebels: (amount: number) => void;
  onRemoveEnemy: (id: string) => void;
  onSpawnWave: (wave: number, isMobile?: boolean) => void;
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
  isMobile,
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
  const initialSpawnDone = useRef(false);

  // Track which enemies have reached center (to prevent multi-damage)
  const reachedCenterSet = useRef<Set<string>>(new Set());

  // Reset refs when a new game starts
  useEffect(() => {
    if (gameStarted && !gameOver) {
      waveSpawned.current = false;
      currentWaveRef.current = 0;
      betweenWaveStart.current = 0;
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

  // --- Game tick ---
  useFrame(() => {
    if (!gameStarted || gameOver) return;

    // Initial wave spawn
    if (!initialSpawnDone.current) {
      initialSpawnDone.current = true;
      currentWaveRef.current = wave;
      onSpawnWave(wave, isMobile);
      waveSpawned.current = true;
      return;
    }

    // Check if current wave is cleared
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
        onSpawnWave(nextWave, isMobile);
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
      <EnemyInstances
        enemies={enemies}
        isMobile={isMobile}
        onDefeat={handleDefeat}
        onReachCenter={handleReachCenter}
      />
    </group>
  );
}
