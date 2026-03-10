"use client";

import { forwardRef, type ButtonHTMLAttributes, useRef, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "gold" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
}

const variants = {
  primary: [
    "bg-gradient-to-r from-neon-blue to-neon-purple text-white",
    "hover:shadow-[0_0_20px_rgba(0,212,255,0.4),0_0_60px_rgba(0,212,255,0.15)] hover:scale-[1.02]",
    "active:scale-[0.97]",
    "focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2 focus-visible:ring-offset-abyss",
  ].join(" "),
  secondary: [
    "bg-transparent border border-neon-purple/50 text-neon-purple",
    "hover:border-neon-purple hover:bg-neon-purple/10 hover:shadow-[0_0_20px_rgba(123,47,247,0.3)]",
    "active:scale-[0.97]",
    "focus-visible:ring-2 focus-visible:ring-neon-purple focus-visible:ring-offset-2 focus-visible:ring-offset-abyss",
  ].join(" "),
  ghost: [
    "bg-transparent text-text-secondary",
    "hover:text-text-primary hover:bg-white/5",
    "active:scale-[0.97]",
    "focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-abyss",
  ].join(" "),
  gold: [
    "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-void font-semibold",
    "hover:shadow-[0_0_20px_rgba(255,215,0,0.4),0_0_60px_rgba(255,215,0,0.15)] hover:scale-[1.02]",
    "active:scale-[0.97]",
    "focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-abyss",
  ].join(" "),
  danger: [
    "bg-neon-red text-white",
    "hover:shadow-[0_0_20px_rgba(255,0,64,0.4)] hover:scale-[1.02]",
    "active:scale-[0.97]",
    "focus-visible:ring-2 focus-visible:ring-neon-red focus-visible:ring-offset-2 focus-visible:ring-offset-abyss",
  ].join(" "),
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-7 py-3 text-base rounded-lg",
  xl: "px-10 py-4 text-lg rounded-xl font-display tracking-wide uppercase",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      disabled,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Create ripple effect
        const button = buttonRef.current;
        if (button) {
          const rect = button.getBoundingClientRect();
          const ripple = document.createElement("span");
          const size = Math.max(rect.width, rect.height);
          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
          ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
          ripple.className = "ripple";
          button.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        }
        onClick?.(e);
      },
      [onClick]
    );

    return (
      <button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "ripple-container",
          "inline-flex items-center justify-center gap-2 font-medium",
          "transition-all duration-300",
          "[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          "cursor-pointer select-none",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
