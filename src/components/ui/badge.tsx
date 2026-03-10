import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  variant?: "default" | "neon" | "gold" | "live";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: "bg-white/5 text-text-secondary border border-white/10",
  neon: "bg-neon-purple/10 text-neon-purple border border-neon-purple/30",
  gold: "bg-gold/10 text-gold border border-gold/30",
  live: "bg-neon-red text-white border-transparent",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full",
        variantStyles[variant],
        className
      )}
    >
      {variant === "live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-[pulse-dot_1.5s_ease-in-out_infinite]" />
      )}
      {children}
    </span>
  );
}
