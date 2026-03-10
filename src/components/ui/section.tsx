import { cn } from "@/lib/utils/cn";
import { type HTMLAttributes, forwardRef } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  background?: "default" | "gradient" | "darker" | "accent";
  spacing?: "sm" | "md" | "lg";
  divider?: boolean;
}

const bgStyles = {
  default: "bg-abyss",
  gradient:
    "bg-abyss bg-[radial-gradient(ellipse_at_center,rgba(123,47,247,0.08)_0%,transparent_70%)]",
  darker: "bg-void",
  accent:
    "bg-abyss bg-[radial-gradient(ellipse_at_top,rgba(123,47,247,0.05)_0%,transparent_50%)]",
};

const spacingStyles = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-24 md:py-36",
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      background = "default",
      spacing = "md",
      divider = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative w-full",
          bgStyles[background],
          spacingStyles[spacing],
          className
        )}
        {...props}
      >
        {children}
        {divider && (
          <div className="section-divider absolute bottom-0 left-0 right-0" />
        )}
      </section>
    );
  }
);
Section.displayName = "Section";
