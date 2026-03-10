"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils/cn";

/* PressEffect - wraps an element to add press/tap animation */
export function PressEffect({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

/* FloatEffect - gentle floating bobbing animation */
export function FloatEffect({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/* PulseGlow - pulsing glow outline effect */
export function PulseGlow({
  children,
  color = "purple",
  className,
}: {
  children: React.ReactNode;
  color?: "purple" | "blue" | "gold";
  className?: string;
}) {
  const colorMap = {
    purple: [
      "0 0 0px rgba(123, 47, 247, 0)",
      "0 0 25px rgba(123, 47, 247, 0.3)",
      "0 0 0px rgba(123, 47, 247, 0)",
    ],
    blue: [
      "0 0 0px rgba(0, 212, 255, 0)",
      "0 0 25px rgba(0, 212, 255, 0.3)",
      "0 0 0px rgba(0, 212, 255, 0)",
    ],
    gold: [
      "0 0 0px rgba(255, 215, 0, 0)",
      "0 0 25px rgba(255, 215, 0, 0.25)",
      "0 0 0px rgba(255, 215, 0, 0)",
    ],
  };

  return (
    <motion.div
      className={cn("relative", className)}
      animate={{
        boxShadow: colorMap[color],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
