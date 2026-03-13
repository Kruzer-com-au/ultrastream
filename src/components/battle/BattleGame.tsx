'use client';

import { useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGameState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';
import { useIsMobile } from '@/lib/hooks/use-media-query';
import GameHUD from './GameHUD';

// Dynamic import of the R3F scene (no SSR – WebGL needs the browser)
const BattleScene = dynamic(() => import('./BattleScene'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050505',
      }}
    >
      <div
        style={{
          color: '#00d4ff',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: 'uppercase',
          opacity: 0.6,
        }}
      >
        LOADING BATTLEFIELD...
      </div>
    </div>
  ),
});

// ---------------------------------------------------------------------------
// BattleGame (section wrapper)
// ---------------------------------------------------------------------------

export default function BattleGame() {
  const {
    enemies,
    score,
    wave,
    rebelsHealth,
    gameOver,
    gameStarted,
    betweenWaves,
    waveDefeatedCount,
    waveTotalCount,
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
    playerNickname,
    playerEmail,
    victory,
  } = useGameState();

  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  const { playBattleAmbience, stopAllAmbience, playSFX, playMusic, stopMusic } = useAudio();

  // Wrap defeatEnemy to add sound
  const handleDefeatEnemy = useCallback((id: string) => {
    playSFX('enemy-destroy');
    defeatEnemy(id);
  }, [defeatEnemy, playSFX]);

  // Start music when game starts — also kill any lingering portal/warp ambiences
  useEffect(() => {
    if (gameStarted && !gameOver) {
      stopAllAmbience(1000); // Kill portal-hum / warp-whoosh from scroll journey
      playMusic();
    }
    if (gameOver) {
      stopAllAmbience(1000);
      stopMusic(2000);
      playSFX('game-over');
    }
  }, [gameStarted, gameOver, stopAllAmbience, playSFX, playMusic, stopMusic]);

  // Wave start SFX
  const prevWaveRef = useRef(0);
  useEffect(() => {
    if (wave > prevWaveRef.current && wave > 1) {
      playSFX('wave-start');
    }
    prevWaveRef.current = wave;
  }, [wave, playSFX]);

  // Damage SFX
  const prevHealthRef = useRef(100);
  useEffect(() => {
    if (rebelsHealth < prevHealthRef.current && gameStarted) {
      playSFX('damage-taken');
    }
    prevHealthRef.current = rebelsHealth;
  }, [rebelsHealth, gameStarted, playSFX]);

  // Start / restart game (preserves player info for returning players)
  const handleStartGame = useCallback(() => {
    // Explicit audio context unlock (required for mobile):
    // Playing an SFX on user tap triggers AudioContext.resume() internally
    playSFX('wave-start');
    const savedEmail = playerEmail;
    const savedNickname = playerNickname;
    resetGame();
    // Small timeout to let reset flush, then start
    setTimeout(() => {
      if (savedEmail && savedNickname) {
        setPlayer(savedEmail, savedNickname);
      }
      startGame();
    }, 50);
  }, [resetGame, startGame, playerEmail, playerNickname, setPlayer, playSFX]);

  // CTA handler - scroll to waitlist or navigate
  const handleJoinRevolution = useCallback(() => {
    // Try to scroll to an existing waitlist section
    const waitlistSection = document.getElementById('waitlist');
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // Fallback: scroll to CTA section
    const ctaSection = document.getElementById('cta');
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // If nothing found, open # (no-op)
    window.location.hash = 'waitlist';
  }, []);

  // Contextual bottom message
  const getContextMessage = (): string => {
    const tapOrClick = isMobile ? 'Tap' : 'Click';
    const tappingOrClicking = isMobile ? 'tapping' : 'clicking';
    if (!gameStarted) return 'Corporate giants are exploiting creators. Time to fight back.';
    if (gameOver) return 'The old platforms can\'t be beaten alone. Join ULTRASTREAM \u2014 where creators fight back.';
    if (wave === 1) return `${tapOrClick} on the corporate enemies to defeat them!`;
    if (wave === 2) return `More suits incoming \u2014 keep ${tappingOrClicking}!`;
    if (wave === 3) return 'They just keep coming... how long can you hold?';
    if (rebelsHealth < 30) return `The rebels are weakening! ${tapOrClick} faster!`;
    return `Wave ${wave} \u2014 the corporate machine never stops.`;
  };

  return (
    <section
      ref={sectionRef}
      id="battle"
      style={{
        position: 'relative',
        width: '100%',
        height: '100svh',
        minHeight: isMobile ? 500 : 600,
        background: '#050505',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
    >
      {/* ---- Section header ---- */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          textAlign: 'center',
          paddingTop: isMobile ? 16 : 32,
          paddingBottom: isMobile ? 4 : 8,
          pointerEvents: 'none',
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 900,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#ffd700',
            margin: 0,
            lineHeight: 1.1,
            textShadow:
              '0 0 30px rgba(255,215,0,0.4), 0 0 60px rgba(255,215,0,0.15)',
            fontFamily: 'var(--font-display, system-ui), system-ui, sans-serif',
          }}
        >
          FIGHT THE SYSTEM
        </h2>
        <p
          style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            fontWeight: 500,
            color: '#a0a0b0',
            margin: '8px 0 0',
            letterSpacing: 1,
            fontFamily: 'var(--font-body, system-ui), system-ui, sans-serif',
          }}
        >
          Creators are under attack. Will you help?
        </p>
      </div>

      {/* ---- 3D Canvas ---- */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
        }}
      >
        <BattleScene
          enemies={enemies}
          wave={wave}
          rebelsHealth={rebelsHealth}
          gameStarted={gameStarted}
          gameOver={gameOver}
          betweenWaves={betweenWaves}
          waveDefeatedCount={waveDefeatedCount}
          waveTotalCount={waveTotalCount}
          isMobile={isMobile}
          onDefeatEnemy={handleDefeatEnemy}
          onNeutralizeEnemy={neutralizeEnemy}
          onDamageRebels={damageRebels}
          onRemoveEnemy={removeEnemy}
          onSpawnWave={spawnWave}
          onNextWave={nextWave}
          onSetBetweenWaves={setBetweenWaves}
          onUpdateEnemyPosition={updateEnemyPosition}
          onGameOver={triggerGameOver}
          onVictory={triggerVictory}
        />

        {/* HUD Overlay */}
        <GameHUD
          score={score}
          wave={wave}
          rebelsHealth={rebelsHealth}
          gameOver={gameOver}
          gameStarted={gameStarted}
          playerNickname={playerNickname}
          playerEmail={playerEmail}
          victory={victory}
          enemies={enemies}
          onStartGame={handleStartGame}
          onJoinRevolution={handleJoinRevolution}
          onSetPlayer={setPlayer}
        />
      </div>

      {/* ---- Bottom context message ---- */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          textAlign: 'center',
          paddingTop: 8,
          paddingBottom: 24,
          pointerEvents: gameOver ? 'auto' : 'none',
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: 'clamp(12px, 1.5vw, 15px)',
            fontWeight: 500,
            color: gameOver ? '#f0f0f0' : '#6b7280',
            margin: 0,
            letterSpacing: 0.5,
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.5,
            transition: 'color 0.4s ease',
            fontFamily: 'var(--font-body, system-ui), system-ui, sans-serif',
          }}
        >
          {getContextMessage()}
        </p>

        {/* Post-game CTA button (duplicated from HUD for better visibility) */}
        {gameOver && (
          <button
            onClick={handleJoinRevolution}
            style={{
              marginTop: 16,
              background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: 'uppercase',
              padding: '10px 28px',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer',
              boxShadow:
                '0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              fontFamily: 'var(--font-display, system-ui), system-ui, sans-serif',
            }}
            onMouseEnter={(e) => {
              const btn = e.target as HTMLButtonElement;
              btn.style.transform = 'scale(1.05)';
              btn.style.boxShadow =
                '0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2)';
            }}
            onMouseLeave={(e) => {
              const btn = e.target as HTMLButtonElement;
              btn.style.transform = 'scale(1)';
              btn.style.boxShadow =
                '0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1)';
            }}
          >
            JOIN THE REVOLUTION
          </button>
        )}
      </div>

      {/* Vignette overlay for cinematic edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(5,5,5,0.6) 100%)',
          zIndex: 5,
        }}
      />
    </section>
  );
}
