'use client';

import { useEffect, useState } from 'react';
import { useIsMobile } from '@/lib/hooks/use-media-query';

interface LeaderboardEntry {
  nickname: string;
  score: number;
  wave: number;
  rank: number;
}

interface LeaderboardProps {
  playerNickname: string | null;
  playerScore: number;
  playerWave?: number;
  /** Pre-fetched leaderboard data from score submission POST response */
  initialData?: LeaderboardEntry[] | null;
}

export function Leaderboard({ playerNickname, playerScore, playerWave, initialData }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData || initialData.length === 0);
  const isMobile = useIsMobile();

  // If initialData arrives later (after POST completes), use it immediately
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setEntries(initialData);
      setLoading(false);
    }
  }, [initialData]);

  // Fetch from API as fallback / primary data source
  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        const apiEntries = data.leaderboard || [];
        if (apiEntries.length > 0) {
          setEntries(apiEntries);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Build display entries — if API returned nothing and we have player data, create a local entry
  let displayEntries = entries;
  if (displayEntries.length === 0 && playerNickname && playerScore > 0) {
    displayEntries = [
      {
        nickname: playerNickname,
        score: playerScore,
        wave: playerWave || 1,
        rank: 1,
      },
    ];
  }

  // Ensure current player is in the list (in case POST hasn't resolved yet)
  if (displayEntries.length > 0 && playerNickname && playerScore > 0) {
    const playerInList = displayEntries.some((e) => e.nickname === playerNickname);
    if (!playerInList) {
      // Insert player at correct rank position
      const playerEntry: LeaderboardEntry = {
        nickname: playerNickname,
        score: playerScore,
        wave: playerWave || 1,
        rank: 0,
      };
      const merged = [...displayEntries, playerEntry].sort((a, b) => b.score - a.score);
      displayEntries = merged.map((e, i) => ({ ...e, rank: i + 1 }));
    }
  }

  if (loading && displayEntries.length === 0) {
    return (
      <div
        style={{
          padding: '16px 20px',
          background: 'rgba(255, 215, 0, 0.04)',
          border: '1px solid rgba(255, 215, 0, 0.15)',
          borderRadius: 8,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: '#ffd700',
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 8,
            textShadow: '0 0 10px rgba(255,215,0,0.3)',
          }}
        >
          LEADERBOARD
        </div>
        <div style={{ color: '#6b7280', fontSize: 12 }}>Loading leaderboard...</div>
      </div>
    );
  }

  const gridCols = isMobile ? '30px 1fr 52px 38px' : '40px 1fr 70px 50px';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : 400,
        margin: '0 auto',
        padding: isMobile ? '12px 0' : '16px 0',
        background: 'rgba(255, 215, 0, 0.03)',
        border: '1px solid rgba(255, 215, 0, 0.15)',
        borderRadius: 8,
      }}
    >
      <div
        style={{
          color: '#ffd700',
          fontSize: isMobile ? 13 : 16,
          fontWeight: 900,
          letterSpacing: isMobile ? 2 : 4,
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: isMobile ? 10 : 14,
          textShadow: '0 0 15px rgba(255,215,0,0.4)',
        }}
      >
        ⚔ LEADERBOARD ⚔
      </div>

      {/* Header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridCols,
          padding: isMobile ? '4px 10px' : '6px 16px',
          fontSize: isMobile ? 9 : 10,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: '#6b7280',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span>#</span>
        <span>PILOT</span>
        <span style={{ textAlign: 'right' }}>SCORE</span>
        <span style={{ textAlign: 'right' }}>WAVE</span>
      </div>

      {/* Entries */}
      <div style={{ maxHeight: isMobile ? 220 : 280, overflowY: 'auto' }}>
        {displayEntries.slice(0, 20).map((entry) => {
          const isCurrentPlayer = playerNickname && entry.nickname === playerNickname;
          const isTop3 = entry.rank <= 3;

          return (
            <div
              key={`${entry.nickname}-${entry.rank}`}
              style={{
                display: 'grid',
                gridTemplateColumns: gridCols,
                padding: isMobile ? '6px 10px' : '8px 16px',
                fontSize: isMobile ? 12 : 13,
                fontWeight: isCurrentPlayer ? 800 : 500,
                color: isCurrentPlayer
                  ? '#00d4ff'
                  : isTop3
                    ? '#ffd700'
                    : '#d0d0d0',
                background: isCurrentPlayer
                  ? 'rgba(0, 212, 255, 0.1)'
                  : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                borderLeft: isCurrentPlayer ? '3px solid #00d4ff' : '3px solid transparent',
                transition: 'background 0.2s ease',
                ...(isCurrentPlayer
                  ? { boxShadow: 'inset 0 0 20px rgba(0, 212, 255, 0.05)' }
                  : {}),
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  color:
                    entry.rank === 1
                      ? '#ffd700'
                      : entry.rank === 2
                        ? '#c0c0c0'
                        : entry.rank === 3
                          ? '#cd7f32'
                          : '#6b7280',
                  fontSize: entry.rank <= 3 ? 15 : 13,
                }}
              >
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
              </span>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {entry.nickname}
                {isCurrentPlayer && (
                  <span
                    style={{
                      fontSize: 10,
                      marginLeft: 6,
                      color: '#00d4ff',
                      fontWeight: 900,
                      letterSpacing: 1,
                    }}
                  >
                    ◀ YOU
                  </span>
                )}
              </span>
              <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {entry.score}
              </span>
              <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#6b7280' }}>
                {entry.wave}
              </span>
            </div>
          );
        })}
      </div>

      {/* Player position callout if they're beyond top 20 */}
      {playerNickname && displayEntries.length > 20 && (() => {
        const playerEntry = displayEntries.find((e) => e.nickname === playerNickname);
        if (playerEntry && playerEntry.rank > 20) {
          return (
            <div
              style={{
                marginTop: 4,
                padding: '6px 16px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'grid',
                gridTemplateColumns: gridCols,
                fontSize: isMobile ? 12 : 13,
                fontWeight: 800,
                color: '#00d4ff',
                background: 'rgba(0, 212, 255, 0.08)',
              }}
            >
              <span style={{ color: '#6b7280' }}>{playerEntry.rank}</span>
              <span>
                {playerEntry.nickname}
                <span style={{ fontSize: 10, marginLeft: 6, fontWeight: 900, letterSpacing: 1 }}>
                  ◀ YOU
                </span>
              </span>
              <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {playerEntry.score}
              </span>
              <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#6b7280' }}>
                {playerEntry.wave}
              </span>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}
