import { cn } from "@/lib/utils/cn";
import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered";
  glow?: "blue" | "purple" | "gold" | "none";
  hover?: boolean;
}

const variantStyles = {
  default: "bg-obsidian/60 border border-white/5 backdrop-blur-sm",
  elevated: "bg-obsidian/80 border border-white/8 shadow-[0_4px_24px_rgba(0,0,0,0.5)]",
  bordered: "bg-transparent border-2",
};

const glowBorderMap = {
  blue: "border-neon-blue/30",
  purple: "border-neon-purple/30",
  gold: "border-gold/30",
  none: "",
};

const glowShadowMap = {
  blue: "0 0 20px rgba(0, 212, 255, 0.15), 0 0 60px rgba(0, 212, 255, 0.05)",
  purple: "0 0 20px rgba(123, 47, 247, 0.15), 0 0 60px rgba(123, 47, 247, 0.05)",
  gold: "0 0 20px rgba(255, 215, 0, 0.12), 0 0 60px rgba(255, 215, 0, 0.04)",
  none: "none",
};

const glowHoverShadowMap = {
  blue: "0 0 30px rgba(0, 212, 255, 0.3), 0 0 80px rgba(0, 212, 255, 0.1)",
  purple: "0 0 30px rgba(123, 47, 247, 0.3), 0 0 80px rgba(123, 47, 247, 0.1)",
  gold: "0 0 30px rgba(255, 215, 0, 0.25), 0 0 80px rgba(255, 215, 0, 0.08)",
  none: "none",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      glow = "none",
      hover = false,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl p-6 transition-all duration-300",
          variantStyles[variant],
          glow !== "none" && glowBorderMap[glow],
          hover && "hover:-translate-y-1 hover:border-white/15",
          className
        )}
        style={{
          boxShadow: glowShadowMap[glow],
          ...style,
        }}
        onMouseEnter={
          hover
            ? (e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  glowHoverShadowMap[glow];
              }
            : undefined
        }
        onMouseLeave={
          hover
            ? (e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  glowShadowMap[glow];
              }
            : undefined
        }
        data-interactive={hover ? "" : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
