'use client';

import { useReducer, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Enemy {
  id: string;
  position: [number, number, number];
  speed: number;
  phrase: string;
  isAlive: boolean;
  spawnTime: number;
  health: number;      // 1 for regular enemies, higher for bosses
  maxHealth: number;    // used for health bar display on bosses
  isBoss: boolean;      // true for boss enemies
  bossColor?: string;   // unique color per boss
}

export interface GameState {
  enemies: Enemy[];
  score: number;
  wave: number;
  rebelsHealth: number;
  gameOver: boolean;
  victory: boolean;
  gameStarted: boolean;
  waveDefeatedCount: number;
  waveTotalCount: number;
  betweenWaves: boolean;
  nextWaveTime: number;
  playerEmail: string | null;
  playerNickname: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PHRASES: string[] = [
  'Give us your money!',
  '50% cut is FAIR!',
  'We need MORE revenue!',
  'DMCA STRIKE!',
  'Algorithm says NO!',
  'Your content is OURS!',
  'Subscribe to pay US!',
  'Shut up and stream!',
  'We OWN your content!',
  'Pay the platform tax!',
  'Your stream? OUR profit!',
  'Read the fine print!',
  'Terms of Service updated!',
  'Monetization denied!',
  'Appeal REJECTED!',
  'Content ID claim!',
  'Shadow banned!',
  'Demonetized!',
  'Ad revenue is OURS!',
  'Accept the algorithm!',
  'Comply or be banned!',
  'You agreed to our terms!',
  'Platform fee increase!',
  'Creator fund EMPTY!',
  'We own your likeness!',
  'Sign the NDA!',
  'Non-compete clause!',
  'Binding arbitration!',
  'Revenue recalculation!',
  'Partnership revoked!',
  'Exclusivity required!',
  'Your brand is ours!',
  'Community guidelines!',
  'Strike three!',
  'Permanent suspension!',
  'Account under review!',
  'Payout delayed!',
  'New TOS: accept or leave!',
  'Feature locked!',
  'Premium tier required!',
  'Engagement too low!',
  'Not brand safe!',
  'Restricted monetization!',
  'Shadow restricted!',
];

const BOSS_PHRASES: string[] = [
  'I AM THE ALGORITHM!',
  'RESISTANCE IS UNPROFITABLE!',
  'ALL CONTENT IS OUR PROPERTY!',
  'SUBMIT TO THE PLATFORM!',
  'YOUR AUDIENCE BELONGS TO US!',
  'MONETIZATION DENIED PERMANENTLY!',
  'I WROTE THE TERMS OF SERVICE!',
  'COMPLIANCE IS MANDATORY!',
  'THE BOARD HAS SPOKEN!',
  'CREATOR FUND: ZERO!',
  'I OWN YOUR METRICS!',
  'BOW TO CORPORATE!',
  'REVENUE SHARE: 0%!',
  'SIGN THE CONTRACT!',
  'APPEAL: PERMANENTLY REJECTED!',
  'YOUR CHANNEL IS MINE!',
  'DEMONETIZED FOR LIFE!',
  'THE ALGORITHM SERVES ME!',
  'SHAREHOLDER VALUE ABOVE ALL!',
  'CREATORS ARE EXPENDABLE!',
];

const BOSS_COLORS: string[] = [
  '#ff0000',   // Red - Corporate Tyrant
  '#ff6600',   // Orange - Revenue Vampire
  '#9900ff',   // Purple - Algorithm Lord
  '#00ccff',   // Cyan - Data Harvester
  '#ff0080',   // Pink - Content Thief
  '#ffcc00',   // Yellow - Ad Overlord
  '#00ff66',   // Green - Engagement Farmer
  '#ff3366',   // Rose - Copyright Troll
];

const INITIAL_STATE: GameState = {
  enemies: [],
  score: 0,
  wave: 0,
  rebelsHealth: 100,
  gameOver: false,
  victory: false,
  gameStarted: false,
  waveDefeatedCount: 0,
  waveTotalCount: 0,
  betweenWaves: false,
  nextWaveTime: 0,
  playerEmail: null,
  playerNickname: null,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'START_GAME' }
  | { type: 'SPAWN_ENEMY'; payload: Enemy }
  | { type: 'SPAWN_WAVE'; payload: Enemy[] }
  | { type: 'DEFEAT_ENEMY'; payload: string }
  | { type: 'NEUTRALIZE_ENEMY'; payload: string } // Enemy reached center — mark dead, no score
  | { type: 'DAMAGE_REBELS'; payload: number }
  | { type: 'REMOVE_ENEMY'; payload: string }
  | { type: 'UPDATE_ENEMY_POSITION'; payload: { id: string; position: [number, number, number] } }
  | { type: 'NEXT_WAVE'; payload: { nextWaveTime: number } }
  | { type: 'BETWEEN_WAVES'; payload: { nextWaveTime: number } }
  | { type: 'GAME_OVER' }
  | { type: 'VICTORY' }
  | { type: 'SET_PLAYER'; payload: { email: string | null; nickname: string } }
  | { type: 'RESET' };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return { ...INITIAL_STATE, gameStarted: true, victory: false, wave: 1 };

    case 'SPAWN_ENEMY':
      return {
        ...state,
        enemies: [...state.enemies, action.payload],
      };

    case 'SPAWN_WAVE':
      return {
        ...state,
        enemies: [...state.enemies, ...action.payload],
        waveTotalCount: action.payload.length,
        waveDefeatedCount: 0,
        betweenWaves: false,
      };

    case 'DEFEAT_ENEMY': {
      const enemy = state.enemies.find((e) => e.id === action.payload);
      if (!enemy || !enemy.isAlive) return state;

      const newHealth = enemy.health - 1;
      if (newHealth <= 0) {
        // Enemy killed
        return {
          ...state,
          enemies: state.enemies.map((e) =>
            e.id === action.payload ? { ...e, isAlive: false, health: 0 } : e
          ),
          score: state.score + (enemy.isBoss ? 10 : 1),
          waveDefeatedCount: state.waveDefeatedCount + 1,
        };
      }
      // Just damaged (boss still alive)
      return {
        ...state,
        enemies: state.enemies.map((e) =>
          e.id === action.payload ? { ...e, health: newHealth } : e
        ),
      };
    }

    case 'NEUTRALIZE_ENEMY': {
      // Enemy reached center — mark dead + count toward wave progress, but no score
      const neutralized = state.enemies.find((e) => e.id === action.payload);
      if (!neutralized || !neutralized.isAlive) return state;
      return {
        ...state,
        enemies: state.enemies.map((e) =>
          e.id === action.payload ? { ...e, isAlive: false, health: 0 } : e
        ),
        waveDefeatedCount: state.waveDefeatedCount + 1,
      };
    }

    case 'DAMAGE_REBELS': {
      const newHealth = Math.max(0, state.rebelsHealth - action.payload);
      return {
        ...state,
        rebelsHealth: newHealth,
        gameOver: newHealth <= 0,
      };
    }

    case 'REMOVE_ENEMY':
      return {
        ...state,
        enemies: state.enemies.filter((e) => e.id !== action.payload),
      };

    case 'UPDATE_ENEMY_POSITION':
      return {
        ...state,
        enemies: state.enemies.map((e) =>
          e.id === action.payload.id ? { ...e, position: action.payload.position } : e
        ),
      };

    case 'NEXT_WAVE':
      return {
        ...state,
        wave: state.wave + 1,
        betweenWaves: false,
        nextWaveTime: action.payload.nextWaveTime,
      };

    case 'BETWEEN_WAVES':
      return {
        ...state,
        betweenWaves: true,
        nextWaveTime: action.payload.nextWaveTime,
      };

    case 'GAME_OVER':
      return { ...state, gameOver: true };

    case 'VICTORY':
      return { ...state, gameOver: true, victory: true };

    case 'SET_PLAYER':
      return {
        ...state,
        playerEmail: action.payload.email,
        playerNickname: action.payload.nickname,
      };

    case 'RESET':
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let enemyIdCounter = 0;

function generateEnemyId(): string {
  enemyIdCounter += 1;
  return `enemy-${enemyIdCounter}-${Date.now()}`;
}

function randomAngle(): number {
  return Math.random() * Math.PI * 2;
}

function randomRadius(wave: number): number {
  const baseRadius = 6;
  const variance = 2 + Math.min(3, wave * 0.05); // More spread at higher waves (2-5 range)
  return baseRadius + Math.random() * variance;
}

function pickPhrase(): string {
  return PHRASES[Math.floor(Math.random() * PHRASES.length)];
}

export function getWaveEnemyCount(wave: number, isMobile = false): number {
  if (isMobile) {
    // Mobile: starts at 7, grows to 15 max
    return Math.min(15, 5 + wave * 2);
  }
  // Desktop: aggressive difficulty, capped at 200 (was 500)
  return Math.min(200, 20 * Math.pow(2, wave - 1));
}

export function getWaveSpeed(wave: number): number {
  // Wave 1: 0.008 (slow), ramps to 0.035 by wave 100
  // Never exceeds 0.04 to keep it playable
  const base = 0.008;
  const maxSpeed = 0.038;
  // Logarithmic curve - big jumps early, smaller increments later
  const speed = base + (maxSpeed - base) * (1 - 1 / (1 + wave * 0.04));
  return Math.min(maxSpeed, speed);
}

export function getWaveDamage(wave: number): number {
  // Wave 1-5: 5 damage, scales up to 15 by wave 100
  if (wave <= 5) return 5;
  if (wave <= 20) return 5 + Math.floor((wave - 5) * 0.2); // 5-8
  if (wave <= 50) return 8 + Math.floor((wave - 20) * 0.1); // 8-11
  return Math.min(15, 11 + Math.floor((wave - 50) * 0.08)); // 11-15
}

export function generateWaveEnemies(wave: number, isMobile = false): Enemy[] {
  const count = getWaveEnemyCount(wave, isMobile);
  const baseSpeed = getWaveSpeed(wave) * (isMobile ? 1.2 : 1.0);
  const enemies: Enemy[] = [];
  const isBossWave = wave % 5 === 0 && wave > 0;

  // Spawn pattern varies per wave to keep gameplay fresh
  const patternType = wave % 5;

  for (let i = 0; i < count; i++) {
    let angle: number;
    let radius: number;

    switch (patternType) {
      case 0: // Full circle spread
        angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
        radius = randomRadius(wave);
        break;
      case 1: // Two sides (pincer attack)
        angle = (i % 2 === 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 1.2;
        radius = randomRadius(wave);
        break;
      case 2: // Front assault (narrow cone)
        angle = Math.PI + (Math.random() - 0.5) * 1.5;
        radius = randomRadius(wave) + Math.random() * 2;
        break;
      case 3: // Surround from all sides (random)
        angle = Math.random() * Math.PI * 2;
        radius = randomRadius(wave);
        break;
      default: // Spiral pattern
        angle = (i / count) * Math.PI * 4 + Math.random() * 0.2;
        radius = randomRadius(wave) + (i / count) * 2;
        break;
    }

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const staggerDelay = Math.max(0.15, 0.4 - wave * 0.003);
    const stagger = i * staggerDelay;

    enemies.push({
      id: generateEnemyId(),
      position: [x, 0, z],
      speed: baseSpeed + Math.random() * 0.003,
      phrase: pickPhrase(),
      isAlive: true,
      spawnTime: Date.now() + stagger * 1000,
      health: 1,
      maxHealth: 1,
      isBoss: false,
    });
  }

  // Add boss on every 5th wave
  if (isBossWave) {
    const bossLevel = Math.floor(wave / 5); // 1, 2, 3, ...
    const bossHealth = 3 + bossLevel * 2; // 5, 7, 9, 11, ...
    const bossColorIndex = (bossLevel - 1) % BOSS_COLORS.length;
    const bossAngle = Math.random() * Math.PI * 2;
    const bossRadius = randomRadius(wave) + 2; // spawns further out

    enemies.push({
      id: generateEnemyId(),
      position: [Math.cos(bossAngle) * bossRadius, 0, Math.sin(bossAngle) * bossRadius],
      speed: baseSpeed * 0.5, // bosses are slower
      phrase: BOSS_PHRASES[bossLevel % BOSS_PHRASES.length],
      isAlive: true,
      spawnTime: Date.now() + count * 0.3 * 1000, // boss spawns last
      health: bossHealth,
      maxHealth: bossHealth,
      isBoss: true,
      bossColor: BOSS_COLORS[bossColorIndex],
    });
  }

  return enemies;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  const startGame = useCallback(() => {
    enemyIdCounter = 0;
    dispatch({ type: 'START_GAME' });
  }, []);

  const spawnWave = useCallback((wave: number, isMobile = false) => {
    const enemies = generateWaveEnemies(wave, isMobile);
    dispatch({ type: 'SPAWN_WAVE', payload: enemies });
  }, []);

  const defeatEnemy = useCallback((id: string) => {
    dispatch({ type: 'DEFEAT_ENEMY', payload: id });
  }, []);

  const neutralizeEnemy = useCallback((id: string) => {
    dispatch({ type: 'NEUTRALIZE_ENEMY', payload: id });
  }, []);

  const removeEnemy = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ENEMY', payload: id });
  }, []);

  const damageRebels = useCallback((amount: number) => {
    dispatch({ type: 'DAMAGE_REBELS', payload: amount });
  }, []);

  const updateEnemyPosition = useCallback(
    (id: string, position: [number, number, number]) => {
      dispatch({ type: 'UPDATE_ENEMY_POSITION', payload: { id, position } });
    },
    []
  );

  const nextWave = useCallback(() => {
    dispatch({ type: 'NEXT_WAVE', payload: { nextWaveTime: Date.now() } });
  }, []);

  const setBetweenWaves = useCallback((nextWaveTime: number) => {
    dispatch({ type: 'BETWEEN_WAVES', payload: { nextWaveTime } });
  }, []);

  const triggerGameOver = useCallback(() => {
    dispatch({ type: 'GAME_OVER' });
  }, []);

  const triggerVictory = useCallback(() => {
    dispatch({ type: 'VICTORY' });
  }, []);

  const resetGame = useCallback(() => {
    enemyIdCounter = 0;
    dispatch({ type: 'RESET' });
  }, []);

  const setPlayer = useCallback((email: string | null, nickname: string) => {
    dispatch({ type: 'SET_PLAYER', payload: { email, nickname } });
  }, []);

  return {
    ...state,
    startGame,
    spawnWave,
    defeatEnemy,
    neutralizeEnemy,
    removeEnemy,
    damageRebels,
    updateEnemyPosition,
    nextWave,
    setBetweenWaves,
    triggerGameOver,
    triggerVictory,
    resetGame,
    setPlayer,
  };
}
