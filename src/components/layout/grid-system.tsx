"use client";

import { cn } from "@/lib/utils/cn";

interface GridSystemProps {
  children: React.ReactNode;
  className?: string;
}

export function GridSystem({ children, className }: GridSystemProps) {
  return (
    <div
      className={cn(
        "grid gap-4 md:gap-6 lg:gap-8",
        "[perspective:1200px]",
        "grid-cols-1 md:grid-cols-6 lg:grid-cols-12",
        "px-4 md:px-8 lg:px-12 xl:px-16",
        "max-w-[1440px] mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

interface GridCellProps {
  children: React.ReactNode;
  colSpan?: { sm?: number; md?: number; lg?: number };
  depth?: "near" | "mid" | "far";
  glow?: "blue" | "purple" | "gold" | "none";
  className?: string;
}

const depthStyles = {
  near: "lg:[transform:translateZ(20px)] lg:scale-[1.02]",
  mid: "lg:[transform:translateZ(0px)]",
  far: "lg:[transform:translateZ(-20px)] lg:scale-[0.98] lg:opacity-90",
};

const glowMap = {
  blue: "0 0 20px rgba(0, 212, 255, 0.25), 0 0 60px rgba(0, 212, 255, 0.08)",
  purple:
    "0 0 20px rgba(123, 47, 247, 0.25), 0 0 60px rgba(123, 47, 247, 0.08)",
  gold: "0 0 20px rgba(255, 215, 0, 0.2), 0 0 60px rgba(255, 215, 0, 0.06)",
  none: "none",
};

// Pre-defined column span classes (Tailwind needs to see these statically)
const smSpanMap: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

const mdSpanMap: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};

const lgSpanMap: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
};

export function GridCell({
  children,
  colSpan = { sm: 1, md: 6, lg: 6 },
  depth = "mid",
  glow = "none",
  className,
}: GridCellProps) {
  const smClass = smSpanMap[colSpan.sm || 1] || "col-span-1";
  const mdClass = mdSpanMap[colSpan.md || 6] || "md:col-span-6";
  const lgClass = lgSpanMap[colSpan.lg || 6] || "lg:col-span-6";

  return (
    <div
      className={cn(
        "rounded-lg border border-white/5 bg-obsidian/50 backdrop-blur-sm",
        "p-6 transition-all duration-500",
        "[transform-style:preserve-3d]",
        depthStyles[depth],
        "hover:lg:[transform:translateZ(30px)] hover:lg:scale-[1.03]",
        "hover:border-white/10",
        smClass,
        mdClass,
        lgClass,
        className
      )}
      style={{
        boxShadow: glowMap[glow],
      }}
    >
      {children}
    </div>
  );
}
