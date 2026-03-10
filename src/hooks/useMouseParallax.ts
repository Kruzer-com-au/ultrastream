"use client";

import { useEffect, useRef, useCallback } from "react";

interface MousePosition {
  x: number;
  y: number;
}

/**
 * Tracks normalized mouse position (-1 to 1) relative to viewport center.
 * Uses refs instead of state to avoid re-renders on every mouse move.
 * Applies lerp smoothing via requestAnimationFrame for fluid motion.
 */
export function useMouseParallax(lerpFactor = 0.05) {
  const position = useRef<MousePosition>({ x: 0, y: 0 });
  const target = useRef<MousePosition>({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Normalize to -1...1 range centered on viewport
    target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, []);

  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.gamma !== null && e.beta !== null) {
      // gamma: -90 to 90 (left-right tilt), beta: -180 to 180 (front-back tilt)
      target.current.x = Math.max(-1, Math.min(1, (e.gamma / 45)));
      target.current.y = Math.max(-1, Math.min(1, ((e.beta - 45) / 45)));
    }
  }, []);

  useEffect(() => {
    // Check if we have mouse (desktop) or touch (mobile)
    const hasPointer = window.matchMedia("(pointer: fine)").matches;

    if (hasPointer) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    } else if (typeof DeviceOrientationEvent !== "undefined") {
      window.addEventListener("deviceorientation", handleDeviceOrientation, {
        passive: true,
      });
    }

    // Lerp animation loop
    function animate() {
      position.current.x +=
        (target.current.x - position.current.x) * lerpFactor;
      position.current.y +=
        (target.current.y - position.current.y) * lerpFactor;
      rafId.current = requestAnimationFrame(animate);
    }
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
      cancelAnimationFrame(rafId.current);
    };
  }, [handleMouseMove, handleDeviceOrientation, lerpFactor]);

  return position;
}
