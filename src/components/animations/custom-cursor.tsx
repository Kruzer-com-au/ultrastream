"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

export function CustomCursor() {
  const isDesktop = useMediaQuery("(pointer: fine)");
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const mouse = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const isHoveringRef = useRef(false);

  const updateHovering = useCallback((value: boolean) => {
    isHoveringRef.current = value;
    setIsHovering(value);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest(
        'a, button, [role="button"], input, textarea, select, [data-interactive]'
      );
      updateHovering(!!isInteractive);
    };

    // Smooth ring follow with lerp
    let animFrame: number;
    const animate = () => {
      ringPos.current.x +=
        (mouse.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y +=
        (mouse.current.y - ringPos.current.y) * 0.15;
      if (ringRef.current) {
        const size = isHoveringRef.current ? 60 : 40;
        ringRef.current.style.transform = `translate(${ringPos.current.x - size / 2}px, ${ringPos.current.y - size / 2}px)`;
      }
      animFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    animFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(animFrame);
    };
  }, [isDesktop, updateHovering]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Dot - instant follow */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[300] pointer-events-none w-2 h-2 rounded-full bg-neon-blue"
        style={{ willChange: "transform" }}
      />
      {/* Ring - delayed follow */}
      <div
        ref={ringRef}
        className={cn(
          "fixed top-0 left-0 z-[300] pointer-events-none rounded-full",
          "border transition-[width,height,border-color,opacity] duration-300",
          isHovering
            ? "w-[60px] h-[60px] border-gold/60 opacity-80"
            : "w-[40px] h-[40px] border-neon-purple/30 opacity-50"
        )}
        style={{
          willChange: "transform",
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}
