"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface CelebrationOverlayProps {
  active: boolean;
  onComplete?: () => void;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
}

const BRAND_COLORS = [
  "#FFD700", // gold
  "#FFE55C", // gold-light
  "#B8860B", // gold-dark
  "#00D4FF", // neon-blue
  "#7B2FF7", // neon-purple
  "#FF0040", // neon-red
  "#FFFFFF", // white
];

export function CelebrationOverlay({
  active,
  onComplete,
  className,
}: CelebrationOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const createParticles = useCallback((canvas: HTMLCanvasElement) => {
    const particles: Particle[] = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40 + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 6;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 3 + Math.random() * 5,
        color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
        alpha: 1,
        decay: 0.008 + Math.random() * 0.012,
        gravity: 0.06 + Math.random() * 0.04,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size canvas to container
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    particlesRef.current = createParticles(canvas);

    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particlesRef.current) {
        if (p.alpha <= 0) continue;

        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;
        p.vx *= 0.99;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        // Draw as small rectangles (confetti-like)
        ctx.translate(p.x, p.y);
        ctx.rotate(p.vx * 0.3);
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (alive) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    }

    animRef.current = requestAnimationFrame(animate);

    // Auto-complete after 3 seconds regardless
    const timeout = setTimeout(() => {
      cancelAnimationFrame(animRef.current);
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      onComplete?.();
    }, 3000);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(timeout);
    };
  }, [active, createParticles, onComplete]);

  if (!active) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none z-10 overflow-hidden",
        className
      )}
    >
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Text flash */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-gold font-display text-2xl md:text-3xl font-bold tracking-wider uppercase animate-[fadeInScale_0.5s_ease-out]"
          style={{
            textShadow: "0 0 30px rgba(255,215,0,0.5), 0 0 60px rgba(255,215,0,0.2)",
          }}
        >
          WELCOME TO THE REVOLUTION
        </div>
      </div>
    </div>
  );
}
