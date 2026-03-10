import { cn } from "@/lib/utils/cn";
import { type HTMLAttributes } from "react";

interface GradientTextProps extends HTMLAttributes<HTMLElement> {
  variant?: "gold" | "neon" | "fire" | "custom";
  gradient?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

const gradientMap = {
  gold: "bg-gradient-to-r from-gold-dark via-gold to-gold-light",
  neon: "bg-gradient-to-r from-neon-blue to-neon-purple",
  fire: "bg-gradient-to-r from-neon-red via-gold to-neon-red",
  custom: "",
};

export function GradientText({
  variant = "gold",
  gradient,
  as: Component = "span",
  className,
  style,
  children,
  ...props
}: GradientTextProps) {
  return (
    <Component
      className={cn(
        "bg-clip-text text-transparent",
        variant !== "custom" && gradientMap[variant],
        className
      )}
      style={
        variant === "custom" && gradient
          ? { backgroundImage: gradient, ...style }
          : style
      }
      {...props}
    >
      {children}
    </Component>
  );
}
