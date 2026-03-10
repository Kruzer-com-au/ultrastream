'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { generateNickname } from '@/lib/nickname-generator';
import { useIsMobile } from '@/lib/hooks/use-media-query';
import { Leaderboard } from './Leaderboard';

// ---------------------------------------------------------------------------
// Kill message pool
// ---------------------------------------------------------------------------

const KILL_MESSAGES = [
  'TAKE THAT, CORPORATE!',
  'FREEDOM!',
  'FOR THE CREATORS!',
  'DOWN WITH GREED!',
  'POWER TO THE PEOPLE!',
  'REVOLUTION!',
  'NO MORE CUTS!',
  'CREATORS UNITE!',
  'FAIR PAY!',
  'SMASHED!',
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GameHUDProps {
  score: number;
  wave: number;
  rebelsHealth: number;
  gameOver: boolean;
  gameStarted: boolean;
  playerNickname: string | null;
  playerEmail: string | null;
  victory: boolean;
  onStartGame: () => void;
  onJoinRevolution: () => void;
  onSetPlayer: (email: string | null, nickname: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GameHUD({
  score,
  wave,
  rebelsHealth,
  gameOver,
  gameStarted,
  playerNickname,
  playerEmail,
  victory,
  onStartGame,
  onJoinRevolution,
  onSetPlayer,
}: GameHUDProps) {
  const isMobile = useIsMobile();
  const [registrationPhase, setRegistrationPhase] = useState<'form' | 'ready'>('form');
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [isHighScore, setIsHighScore] = useState(false);
  const [totalAccumulatedScore, setTotalAccumulatedScore] = useState<number | null>(null);
  const [showReLogin, setShowReLogin] = useState(false);
  const [reLoginEmail, setReLoginEmail] = useState('');
  const [reLoginMessage, setReLoginMessage] = useState<string | null>(null);
  const [reLoginError, setReLoginError] = useState<string | null>(null);
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [submittedLeaderboard, setSubmittedLeaderboard] = useState<Array<{ nickname: string; score: number; wave: number; rank: number }> | null>(null);

  const handleRegister = useCallback(() => {
    const trimmed = emailInput.trim();
    if (!trimmed) {
      setEmailError('Enter your email to join the battle');
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError('');
    const nickname = generateNickname(trimmed);
    onSetPlayer(trimmed, nickname);
    setRegistrationPhase('ready');
  }, [emailInput, onSetPlayer]);

  const handleSkipRegistration = useCallback(() => {
    const randomNick = `Rebel_${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
    onSetPlayer(null, randomNick);
    setRegistrationPhase('ready');
  }, [onSetPlayer]);

  // Handle account recovery / re-login
  const handleReLogin = useCallback(() => {
    const trimmed = reLoginEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setReLoginError('Enter a valid email address');
      return;
    }
    setReLoginError(null);
    fetch(`/api/leaderboard?email=${encodeURIComponent(trimmed)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.found) {
          onSetPlayer(trimmed, data.nickname);
          setTotalAccumulatedScore(data.totalScore);
          setReLoginMessage(`Welcome back, ${data.nickname}!`);
          setShowReLogin(false);
        } else {
          setReLoginError('No account found with that email.');
        }
      })
      .catch(() => {
        setReLoginError('Could not look up account. Try again.');
      });
  }, [reLoginEmail, onSetPlayer]);

  const [displayScore, setDisplayScore] = useState(0);
  const [killMessage, setKillMessage] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [wavePulse, setWavePulse] = useState(false);
  const killTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevScore = useRef(0);
  const prevWave = useRef(0);
  const prevHealth = useRef(100);

  // Animate score counting up
  useEffect(() => {
    if (score === displayScore) return;
    const step = () => {
      setDisplayScore((prev) => {
        if (prev < score) return prev + 1;
        return score;
      });
    };
    const interval = setInterval(step, 40);
    return () => clearInterval(interval);
  }, [score, displayScore]);

  // Show kill message when score increases
  useEffect(() => {
    if (score > prevScore.current) {
      const msg = KILL_MESSAGES[Math.floor(Math.random() * KILL_MESSAGES.length)];
      setKillMessage(msg);
      if (killTimeout.current) clearTimeout(killTimeout.current);
      killTimeout.current = setTimeout(() => setKillMessage(null), 800);
    }
    prevScore.current = score;
  }, [score]);

  // Shake on damage
  useEffect(() => {
    if (rebelsHealth < prevHealth.current) {
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
    }
    prevHealth.current = rebelsHealth;
  }, [rebelsHealth]);

  // Wave pulse
  useEffect(() => {
    if (wave > prevWave.current && wave > 0) {
      setWavePulse(true);
      setTimeout(() => setWavePulse(false), 600);
    }
    prevWave.current = wave;
  }, [wave]);

  // Submit score when game ends
  useEffect(() => {
    if (gameOver && !scoreSubmitted && playerNickname && score > 0) {
      setScoreSubmitted(true);
      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: playerEmail || undefined,
          nickname: playerNickname,
          score,
          wave,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.isHighScore) {
            setIsHighScore(true);
          }
          if (data.totalScore) {
            setTotalAccumulatedScore(data.totalScore);
          }
          // Capture the leaderboard from POST response for immediate display
          if (data.leaderboard && data.leaderboard.length > 0) {
            setSubmittedLeaderboard(data.leaderboard);
          }
          // Force leaderboard to refetch after score is submitted
          setLeaderboardKey((k) => k + 1);
        })
        .catch(() => {/* silent fail */});
    }
  }, [gameOver, scoreSubmitted, playerNickname, playerEmail, score, wave]);

  // Reset submission state when game restarts
  useEffect(() => {
    if (!gameOver) {
      setScoreSubmitted(false);
      setIsHighScore(false);
      setTotalAccumulatedScore(null);
      setShowReLogin(false);
      setReLoginEmail('');
      setReLoginMessage(null);
      setReLoginError(null);
      setSubmittedLeaderboard(null);
    }
  }, [gameOver]);

  // Health bar colour
  const healthColour =
    rebelsHealth > 60 ? '#22c55e' : rebelsHealth > 30 ? '#eab308' : '#ef4444';

  const healthGlow =
    rebelsHealth > 60
      ? '0 0 10px rgba(34,197,94,0.4)'
      : rebelsHealth > 30
        ? '0 0 10px rgba(234,179,8,0.4)'
        : '0 0 10px rgba(239,68,68,0.5)';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        zIndex: 10,
        ...(shaking
          ? { animation: 'hud-shake 0.3s ease-in-out' }
          : {}),
      }}
    >
      {/* Inline keyframes */}
      <style>{`
        @keyframes hud-shake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-3px, 2px); }
          40% { transform: translate(3px, -2px); }
          60% { transform: translate(-2px, 3px); }
          80% { transform: translate(2px, -1px); }
        }
        @keyframes hud-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes hud-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hud-click-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes hud-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1); }
          50% { box-shadow: 0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2); }
        }
        @keyframes kill-pop {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          30% { opacity: 1; transform: translateY(-8px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-30px) scale(0.8); }
        }
        @keyframes game-over-flash {
          0%, 100% { opacity: 1; text-shadow: 0 0 30px rgba(255,0,64,0.5), 0 0 60px rgba(255,0,64,0.3); }
          50% { opacity: 0.8; text-shadow: 0 0 60px rgba(255,0,64,0.8), 0 0 120px rgba(255,0,64,0.4); }
        }
        @keyframes victory-glow {
          0%, 100% { text-shadow: 0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,215,0,0.3); }
          50% { text-shadow: 0 0 80px rgba(255,215,0,0.9), 0 0 150px rgba(255,215,0,0.5); }
        }
        @keyframes score-count-up {
          from { transform: scale(1); }
          50% { transform: scale(1.1); }
          to { transform: scale(1); }
        }
      `}</style>

      {/* ---- Game started: show HUD ---- */}
      {gameStarted && !gameOver && (
        <>
          {/* Wave indicator - top left */}
          <div
            style={{
              position: 'absolute',
              top: isMobile ? 12 : 20,
              left: isMobile ? 12 : 24,
              color: '#00d4ff',
              fontSize: isMobile ? 16 : 22,
              fontWeight: 900,
              letterSpacing: isMobile ? 2 : 3,
              textTransform: 'uppercase',
              textShadow: '0 0 15px rgba(0,212,255,0.6), 0 0 30px rgba(0,212,255,0.2)',
              ...(wavePulse ? { animation: 'hud-pulse 0.6s ease-in-out' } : {}),
            }}
          >
            WAVE {wave}
          </div>

          {/* Score - top right */}
          <div
            style={{
              position: 'absolute',
              top: isMobile ? 12 : 20,
              right: isMobile ? 12 : 24,
              color: '#ffd700',
              fontSize: isMobile ? 13 : 20,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: 'uppercase',
              textShadow: '0 0 15px rgba(255,215,0,0.5), 0 0 30px rgba(255,215,0,0.2)',
            }}
          >
            {isMobile ? (
              <>
                <span style={{ fontSize: 10, letterSpacing: 1, display: 'block', color: '#a0a0b0' }}>SCORE</span>
                {displayScore}
              </>
            ) : (
              `ENEMIES DEFEATED: ${displayScore}`
            )}
          </div>

          {/* Kill message - center */}
          {killMessage && (
            <div
              style={{
                position: 'absolute',
                top: '35%',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#ffd700',
                fontSize: isMobile ? 14 : 18,
                fontWeight: 900,
                letterSpacing: 2,
                textTransform: 'uppercase',
                textShadow: '0 0 12px rgba(255,215,0,0.7)',
                animation: 'kill-pop 0.8s ease-out forwards',
                pointerEvents: 'none',
              }}
            >
              {killMessage}
            </div>
          )}

          {/* Rebels health bar - bottom center */}
          <div
            style={{
              position: 'absolute',
              bottom: isMobile ? 16 : 30,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                color: '#a0a0b0',
                fontSize: isMobile ? 10 : 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              REBEL STRENGTH
            </div>
            <div
              style={{
                width: isMobile ? 180 : 280,
                height: 10,
                background: 'rgba(0,0,0,0.7)',
                borderRadius: 5,
                overflow: 'hidden',
                border: '1px solid rgba(255,215,0,0.2)',
                boxShadow: healthGlow,
              }}
            >
              <div
                style={{
                  width: `${rebelsHealth}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${healthColour}, ${healthColour}dd)`,
                  transition: 'width 0.3s ease',
                  borderRadius: 5,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2)`,
                }}
              />
            </div>
            <div
              style={{
                color: healthColour,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {rebelsHealth}%
            </div>
          </div>
        </>
      )}

      {/* ---- Pre-game overlay ---- */}
      {!gameStarted && !gameOver && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5,5,5,0.7)',
            pointerEvents: 'auto',
          }}
        >
          {/* If player already has a nickname (returning player), skip to ready */}
          {playerNickname && registrationPhase === 'form' ? (
            <>
              {/* Returning player — go straight to fight */}
              <div
                style={{
                  color: '#ffd700',
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                WELCOME BACK
              </div>
              <div
                style={{
                  color: '#00d4ff',
                  fontSize: isMobile ? 24 : 32,
                  fontWeight: 900,
                  letterSpacing: 4,
                  textShadow: '0 0 30px rgba(0,212,255,0.6)',
                  marginBottom: 24,
                }}
              >
                {playerNickname}
              </div>
              <div
                style={{
                  cursor: 'pointer',
                }}
                onClick={onStartGame}
              >
                <div
                  style={{
                    color: '#00d4ff',
                    fontSize: isMobile ? 26 : 36,
                    fontWeight: 900,
                    letterSpacing: isMobile ? 3 : 6,
                    textTransform: 'uppercase',
                    textShadow: '0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2)',
                    animation: 'hud-click-pulse 2s ease-in-out infinite',
                    marginBottom: 16,
                  }}
                >
                  CLICK TO FIGHT
                </div>
                <div
                  style={{
                    color: '#a0a0b0',
                    fontSize: isMobile ? 12 : 14,
                    fontWeight: 500,
                    letterSpacing: 1,
                    textAlign: 'center',
                  }}
                >
                  Click on corporate enemies to defeat them
                </div>
              </div>
            </>
          ) : registrationPhase === 'form' ? (
            <>
              {/* Registration form */}
              <div
                style={{
                  color: '#00d4ff',
                  fontSize: isMobile ? 22 : 28,
                  fontWeight: 900,
                  letterSpacing: 5,
                  textTransform: 'uppercase',
                  textShadow: '0 0 30px rgba(0,212,255,0.5)',
                  marginBottom: 8,
                }}
              >
                ENTER THE ARENA
              </div>
              <div
                style={{
                  color: '#a0a0b0',
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 500,
                  letterSpacing: 1,
                  marginBottom: 24,
                  textAlign: 'center',
                  maxWidth: isMobile ? 300 : 360,
                }}
              >
                Enter your email to join the leaderboard and compete for a special offer
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%', maxWidth: isMobile ? '85vw' : 340 }}>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setEmailError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRegister(); }}
                  placeholder="warrior@revolution.gg"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: 16,
                    fontWeight: 500,
                    color: '#f0f0f0',
                    background: 'rgba(0,0,0,0.6)',
                    border: emailError ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(0,212,255,0.3)',
                    borderRadius: 6,
                    outline: 'none',
                    letterSpacing: 0.5,
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => { if (!emailError) (e.target as HTMLInputElement).style.borderColor = 'rgba(0,212,255,0.6)'; }}
                  onBlur={(e) => { if (!emailError) (e.target as HTMLInputElement).style.borderColor = 'rgba(0,212,255,0.3)'; }}
                />
                {emailError && (
                  <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 500 }}>
                    {emailError}
                  </div>
                )}

                <button
                  onClick={handleRegister}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    fontSize: 15,
                    fontWeight: 900,
                    letterSpacing: 3,
                    textTransform: 'uppercase',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: '0 0 20px rgba(0,212,255,0.3)',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1.03)'; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1)'; }}
                >
                  REGISTER &amp; FIGHT
                </button>

                <button
                  onClick={handleSkipRegistration}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: 1,
                    cursor: 'pointer',
                    padding: isMobile ? '10px 16px' : '4px 8px',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  Skip — play as guest
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Ready to fight — show nickname */}
              <div
                style={{
                  color: '#ffd700',
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                YOUR CALLSIGN
              </div>
              <div
                style={{
                  color: '#00d4ff',
                  fontSize: isMobile ? 24 : 32,
                  fontWeight: 900,
                  letterSpacing: 4,
                  textShadow: '0 0 30px rgba(0,212,255,0.6)',
                  marginBottom: 24,
                }}
              >
                {playerNickname}
              </div>
              <div
                style={{
                  cursor: 'pointer',
                }}
                onClick={onStartGame}
              >
                <div
                  style={{
                    color: '#00d4ff',
                    fontSize: isMobile ? 26 : 36,
                    fontWeight: 900,
                    letterSpacing: isMobile ? 3 : 6,
                    textTransform: 'uppercase',
                    textShadow: '0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2)',
                    animation: 'hud-click-pulse 2s ease-in-out infinite',
                    marginBottom: 16,
                  }}
                >
                  CLICK TO FIGHT
                </div>
                <div
                  style={{
                    color: '#a0a0b0',
                    fontSize: isMobile ? 12 : 14,
                    fontWeight: 500,
                    letterSpacing: 1,
                    textAlign: 'center',
                  }}
                >
                  Click on corporate enemies to defeat them
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---- Game over overlay ---- */}
      {gameOver && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(5,5,5,0.92)',
            pointerEvents: 'auto',
            animation: 'hud-fade-in 0.6s ease-out',
            overflowY: 'auto',
            paddingTop: isMobile ? 16 : 24,
            paddingBottom: isMobile ? 16 : 24,
          }}
        >
          {/* Big GAME OVER / VICTORY banner */}
          {victory ? (
            <>
              <div
                style={{
                  color: '#ffd700',
                  fontSize: 'clamp(28px, 5vw, 48px)',
                  fontWeight: 900,
                  letterSpacing: 6,
                  textTransform: 'uppercase',
                  animation: 'victory-glow 2s ease-in-out infinite',
                  marginBottom: 4,
                  textAlign: 'center',
                }}
              >
                VICTORY
              </div>
              <div
                style={{
                  color: '#ffd700',
                  fontSize: 'clamp(12px, 2vw, 16px)',
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  opacity: 0.8,
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                ALL 100 WAVES CONQUERED!
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  color: '#ff0040',
                  fontSize: 'clamp(32px, 6vw, 56px)',
                  fontWeight: 900,
                  letterSpacing: 8,
                  textTransform: 'uppercase',
                  animation: 'game-over-flash 2s ease-in-out infinite',
                  marginBottom: 4,
                  textAlign: 'center',
                }}
              >
                GAME OVER
              </div>
              <div
                style={{
                  color: '#a0a0b0',
                  fontSize: 'clamp(12px, 2vw, 15px)',
                  fontWeight: 600,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                THE REBELLION NEEDS YOU
              </div>
            </>
          )}

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: isMobile ? 16 : 24,
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#ffd700', fontSize: isMobile ? 18 : 22, fontWeight: 900, letterSpacing: 1, animation: 'score-count-up 0.5s ease-out' }}>
                {score}
              </div>
              <div style={{ color: '#a0a0b0', fontSize: isMobile ? 9 : 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
                ENEMIES DEFEATED
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00d4ff', fontSize: isMobile ? 18 : 22, fontWeight: 900, letterSpacing: 1 }}>
                {wave}
              </div>
              <div style={{ color: '#a0a0b0', fontSize: isMobile ? 9 : 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
                WAVES SURVIVED
              </div>
            </div>
            {(totalAccumulatedScore !== null && totalAccumulatedScore > score) && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#7b2ff7', fontSize: isMobile ? 18 : 22, fontWeight: 900, letterSpacing: 1 }}>
                  {totalAccumulatedScore}
                </div>
                <div style={{ color: '#a0a0b0', fontSize: isMobile ? 9 : 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
                  TOTAL SCORE
                </div>
              </div>
            )}
          </div>

          {/* Welcome back message (from re-login) */}
          {reLoginMessage && (
            <div style={{ color: '#22c55e', fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              {reLoginMessage}
            </div>
          )}

          {/* High Score Special Offer */}
          {isHighScore && (
            <div
              style={{
                padding: isMobile ? '10px 14px' : '12px 20px',
                background: 'rgba(255, 215, 0, 0.08)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: 8,
                textAlign: 'center',
                maxWidth: isMobile ? '90vw' : 380,
                marginBottom: 12,
                animation: 'hud-glow 2s ease-in-out infinite',
              }}
            >
              <div style={{ color: '#ffd700', fontSize: 16, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', textShadow: '0 0 20px rgba(255,215,0,0.5)', marginBottom: 6 }}>
                CONGRATULATIONS, CHAMPION!
              </div>
              <div style={{ color: '#d0d0d0', fontSize: 12, fontWeight: 500, lineHeight: 1.6 }}>
                The ULTRASTREAM team has a special offer for you.
                <br />
                <span style={{ color: '#ffd700', fontWeight: 700 }}>Check your inbox soon.</span>
              </div>
            </div>
          )}

          {/* Leaderboard - shown immediately */}
          <div style={{ width: '100%', maxWidth: isMobile ? '95vw' : 400, marginBottom: 16 }}>
            <Leaderboard
              key={leaderboardKey}
              playerNickname={playerNickname}
              playerScore={score}
              playerWave={wave}
              initialData={submittedLeaderboard}
            />
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: isMobile ? 'stretch' : 'center',
            width: isMobile ? '90vw' : 'auto',
            maxWidth: isMobile ? 340 : 'none',
            marginBottom: 8,
          }}>
            <button
              onClick={onStartGame}
              style={{
                pointerEvents: 'auto',
                background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 900,
                letterSpacing: 3,
                textTransform: 'uppercase',
                padding: isMobile ? '14px 32px' : '12px 32px',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                animation: 'hud-glow 2s ease-in-out infinite',
                transition: 'transform 0.15s ease',
                width: isMobile ? '100%' : 'auto',
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              PLAY AGAIN
            </button>

            <button
              onClick={onJoinRevolution}
              style={{
                pointerEvents: 'auto',
                background: 'transparent',
                color: '#a0a0b0',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: 'uppercase',
                padding: isMobile ? '12px 24px' : '10px 24px',
                border: '1px solid rgba(160,160,176,0.3)',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'color 0.15s ease, border-color 0.15s ease',
                width: isMobile ? '100%' : 'auto',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = '#f0f0f0';
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(240,240,240,0.4)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = '#a0a0b0';
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(160,160,176,0.3)';
              }}
            >
              JOIN THE REVOLUTION
            </button>
          </div>

          {/* "Not you?" re-login link */}
          {!showReLogin ? (
            <button
              onClick={() => setShowReLogin(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: 1,
                cursor: 'pointer',
                padding: isMobile ? '10px 16px' : '4px 8px',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
                marginTop: 4,
              }}
            >
              Not you? Change account
            </button>
          ) : (
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                maxWidth: isMobile ? '85vw' : 320,
              }}
            >
              <div style={{ color: '#a0a0b0', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                RECOVER YOUR ACCOUNT
              </div>
              <input
                type="email"
                value={reLoginEmail}
                onChange={(e) => { setReLoginEmail(e.target.value); setReLoginError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleReLogin(); }}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 16,
                  fontWeight: 500,
                  color: '#f0f0f0',
                  background: 'rgba(0,0,0,0.6)',
                  border: reLoginError ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(0,212,255,0.3)',
                  borderRadius: 4,
                  outline: 'none',
                  letterSpacing: 0.5,
                }}
              />
              {reLoginError && (
                <div style={{ color: '#ef4444', fontSize: 11, fontWeight: 500 }}>
                  {reLoginError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleReLogin}
                  style={{
                    padding: isMobile ? '10px 20px' : '6px 16px',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  RECOVER
                </button>
                <button
                  onClick={() => { setShowReLogin(false); setReLoginError(null); }}
                  style={{
                    padding: isMobile ? '10px 20px' : '6px 16px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6b7280',
                    background: 'none',
                    border: '1px solid rgba(107,114,128,0.3)',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
