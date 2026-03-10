"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils/cn";

interface HoverGlowProps {
  children: React.ReactNode;
  color?: "blue" | "purple" | "gold" | "red";
  intensity?: "subtle" | "medium" | "strong";
  scale?: boolean;
  className?: string;
}

const glowMap = {
  blue: {
    base: "rgba(0, 212, 255, 0)",
    hover: "rgba(0, 212, 255, 0.08)",
  },
  purple: {
    base: "rgba(123, 47, 247, 0)",
    hover: "rgba(123, 47, 247, 0.08)",
  },
  gold: {
    base: "rgba(255, 215, 0, 0)",
    hover: "rgba(255, 215, 0, 0.06)",
  },
  red: {
    base: "rgba(255, 0, 64, 0)",
    hover: "rgba(255, 0, 64, 0.08)",
  },
};

const intensityScale = {
  subtle: 1.005,
  medium: 1.02,
  strong: 1.04,
};

export function HoverGlow({
  children,
  color = "purple",
  intensity = "medium",
  scale = true,
  className,
}: HoverGlowProps) {
  return (
    <motion.div
      className={cn("relative rounded-xl", className)}
      data-interactive
      whileHover={{
        scale: scale ? intensityScale[intensity] : 1,
        backgroundColor: glowMap[color].hover,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      {children}
    </motion.div>
  );
}
