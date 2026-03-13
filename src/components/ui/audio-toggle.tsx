'use client';

import { useAudio } from '@/hooks/useAudio';

/**
 * Floating audio mute/unmute toggle button.
 * Fixed position bottom-right corner, visible across all sections.
 * Uses a speaker icon that toggles between muted/unmuted states.
 */
export function AudioToggle() {
  const { isMuted, toggleMute } = useAudio();

  return (
    <button
      onClick={toggleMute}
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      className="fixed bottom-20 right-6 z-[55] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer select-none"
      style={{
        background: 'rgba(5, 5, 5, 0.7)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        backdropFilter: 'blur(8px)',
        boxShadow: isMuted
          ? 'none'
          : '0 0 10px rgba(0, 212, 255, 0.15)',
      }}
    >
      {isMuted ? (
        /* Muted icon - speaker with X */
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(160, 160, 176, 0.6)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        /* Unmuted icon - speaker with waves */
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" opacity="0.3" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}
