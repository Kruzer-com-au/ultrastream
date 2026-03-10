'use client';

import { useEffect, useCallback, useState } from 'react';
import { audioEngine } from '@/lib/audio-engine';
import type { SFXName } from '@/lib/audio-engine';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * React hook wrapping the procedural audio engine.
 *
 * Provides memoised callbacks for playing ambience tracks and SFX,
 * plus a mute toggle that persists to localStorage.
 *
 * Automatically stops all ambience on unmount with a 500ms fade.
 */
export function useAudio() {
  const [isMuted, setIsMuted] = useState(false);

  // Sync mute state from engine on mount.
  useEffect(() => {
    if (audioEngine) {
      setIsMuted(audioEngine.getMuted());
    }
  }, []);

  // Cleanup on unmount — fade out any running ambience.
  useEffect(() => {
    return () => {
      if (audioEngine) {
        audioEngine.stopAllAmbience(500);
      }
    };
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioEngine) return;
    const newMuted = !audioEngine.getMuted();
    audioEngine.setMuted(newMuted);
    setIsMuted(newMuted);
  }, []);

  const playPortalAmbience = useCallback(() => {
    if (!audioEngine) return;
    audioEngine.playAmbience('portal-hum');
  }, []);

  const playWarpAmbience = useCallback(() => {
    if (!audioEngine) return;
    audioEngine.stopAmbience('portal-hum', 1000);
    audioEngine.playAmbience('warp-whoosh');
  }, []);

  const playBattleAmbience = useCallback(() => {
    if (!audioEngine) return;
    audioEngine.stopAllAmbience(1000);
    audioEngine.playAmbience('battle-ambient');
  }, []);

  const stopAllAmbience = useCallback((fadeMs = 500) => {
    if (!audioEngine) return;
    audioEngine.stopAllAmbience(fadeMs);
  }, []);

  const playSFX = useCallback((name: SFXName) => {
    if (!audioEngine) return;
    audioEngine.playSFX(name);
  }, []);

  const playMusic = useCallback(() => {
    if (!audioEngine) return;
    audioEngine.playMusic();
  }, []);

  const stopMusic = useCallback((fadeMs?: number) => {
    if (!audioEngine) return;
    audioEngine.stopMusic(fadeMs);
  }, []);

  return {
    isMuted,
    toggleMute,
    playPortalAmbience,
    playWarpAmbience,
    playBattleAmbience,
    stopAllAmbience,
    playSFX,
    playMusic,
    stopMusic,
  };
}
