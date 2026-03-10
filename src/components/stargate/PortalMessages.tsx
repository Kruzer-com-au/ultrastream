'use client';

import { useMemo } from 'react';
import { PORTAL_MESSAGES, type PortalMessage } from '@/data/portal-messages';

interface PortalMessagesProps {
  /** 0-1 progress through the warp tunnel phase */
  warpProgress: number;
}

/**
 * Scroll-driven portal messages that appear during the warp tunnel transit.
 * Each message fades in, holds, then fades out based on warp progress.
 * Positioned as an overlay above the tunnel but below bloom.
 */
export function PortalMessages({ warpProgress }: PortalMessagesProps) {
  const activeMessages = useMemo(() => {
    return PORTAL_MESSAGES.map((msg) => {
      const { startProgress, endProgress } = msg;
      const duration = endProgress - startProgress;
      const fadeIn = duration * 0.25;
      const fadeOut = duration * 0.25;

      let opacity = 0;
      let yOffset = 20; // Start below, drift up

      if (warpProgress >= startProgress && warpProgress <= endProgress) {
        const localProgress = (warpProgress - startProgress) / duration;

        if (localProgress < 0.25) {
          // Fade in
          opacity = localProgress / 0.25;
          yOffset = 20 * (1 - localProgress / 0.25);
        } else if (localProgress < 0.75) {
          // Hold
          opacity = 1;
          yOffset = 0;
        } else {
          // Fade out
          opacity = (1 - localProgress) / 0.25;
          yOffset = -10 * ((localProgress - 0.75) / 0.25);
        }
      }

      return { ...msg, opacity, yOffset };
    }).filter((msg) => msg.opacity > 0.01);
  }, [warpProgress]);

  if (activeMessages.length === 0) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 4 }}
    >
      {activeMessages.map((msg, i) => (
        <div
          key={`${msg.text}-${i}`}
          className="absolute text-center px-8"
          style={{
            opacity: msg.opacity,
            transform: `translateY(${msg.yOffset}px)`,
            transition: 'none',
          }}
        >
          <p
            className="font-display font-black tracking-[0.2em] uppercase leading-tight"
            style={{
              fontSize: 'clamp(32px, 7vw, 72px)',
              color: msg.style === 'epic' ? '#ffd700' : msg.style === 'rebel' ? '#ffffff' : '#00d4ff',
              textShadow: msg.style === 'epic'
                ? '0 0 60px rgba(255, 215, 0, 0.9), 0 0 120px rgba(255, 215, 0, 0.5), 0 0 200px rgba(255, 215, 0, 0.3), 0 2px 8px rgba(0,0,0,0.9)'
                : msg.style === 'rebel'
                  ? '0 0 60px rgba(123, 47, 247, 0.9), 0 0 120px rgba(123, 47, 247, 0.5), 0 0 200px rgba(0, 212, 255, 0.3), 0 2px 8px rgba(0,0,0,0.9)'
                  : '0 0 60px rgba(0, 212, 255, 0.8), 0 0 120px rgba(0, 212, 255, 0.4), 0 0 200px rgba(0, 212, 255, 0.2), 0 2px 8px rgba(0,0,0,0.9)',
              maxWidth: '85vw',
              WebkitTextStroke: '1px rgba(255,255,255,0.1)',
            }}
          >
            {msg.text}
          </p>
        </div>
      ))}
    </div>
  );
}
