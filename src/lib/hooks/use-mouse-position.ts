"use client";

import { useState, useEffect, useRef } from "react";

interface MousePosition {
  x: number;
  y: number;
  isMoving: boolean;
}

export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    isMoving: false,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY, isMoving: true });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setPosition((prev) => ({ ...prev, isMoving: false }));
      }, 150);
    };

    window.addEventListener("mousemove", handler);
    return () => {
      window.removeEventListener("mousemove", handler);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return position;
}
