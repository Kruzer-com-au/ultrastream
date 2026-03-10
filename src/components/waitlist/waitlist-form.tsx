"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  waitlistSchema,
  type WaitlistFormData,
} from "@/lib/validations/waitlist";
import { cn } from "@/lib/utils/cn";
import { trackEvent, useInViewTrack } from "@/lib/analytics";

type FormStatus = "idle" | "submitting" | "success" | "duplicate" | "error" | "rate-limited";

interface WaitlistFormProps {
  variant?: "hero" | "inline" | "compact" | "portal";
  onSuccess?: (count: number) => void;
  className?: string;
}

export function WaitlistForm({
  variant = "hero",
  onSuccess,
  className,
}: WaitlistFormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverMessage, setServerMessage] = useState("");

  // Track when this form instance scrolls into view
  const trackFormView = useCallback(
    () => trackEvent("Waitlist Form View", { location: variant }),
    [variant]
  );
  const formViewRef = useInViewTrack(trackFormView);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    setStatus("submitting");
    setServerMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const json = await res.json();

      if (res.status === 201) {
        setStatus("success");
        setServerMessage("You're in! Check your email, warrior.");
        reset();
        trackEvent("Waitlist Signup", { location: variant });
        onSuccess?.(json.count || 0);
      } else if (res.status === 409) {
        setStatus("duplicate");
        setServerMessage(
          json.error || "You're already enlisted! We'll be in touch soon."
        );
      } else if (res.status === 429) {
        setStatus("rate-limited");
        setServerMessage(
          json.error || "Too many attempts. Try again in a bit."
        );
      } else {
        setStatus("error");
        setServerMessage(json.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setServerMessage("Network error. Check your connection and try again.");
    }
  };

  const isCompleted = status === "success" || status === "duplicate";

  // Variant-specific styles
  const containerStyles = {
    hero: "max-w-lg mx-auto",
    inline: "max-w-md mx-auto",
    compact: "max-w-sm",
    portal: "max-w-md mx-auto",
  };

  const inputStyles = {
    hero: "px-5 py-4 text-base rounded-lg",
    inline: "px-4 py-3 text-sm rounded-lg",
    compact: "px-3 py-2.5 text-sm rounded-md",
    portal: "px-4 py-3 text-base rounded-lg bg-black/60 border-2 border-gold/50 focus:border-gold/80 focus:ring-gold/30 placeholder:text-white/50 text-white font-semibold",
  };

  const buttonStyles = {
    hero: "px-8 py-4 text-base rounded-lg font-display tracking-wide uppercase",
    inline: "px-6 py-3 text-sm rounded-lg font-medium uppercase tracking-wider",
    compact: "px-4 py-2.5 text-sm rounded-md font-medium uppercase tracking-wider",
    portal: "px-6 py-3 text-base rounded-lg font-display font-bold tracking-wider uppercase",
  };

  if (isCompleted) {
    return (
      <div className={cn(containerStyles[variant], className)}>
        <div
          className={cn(
            "text-center py-4 px-6 rounded-xl border",
            status === "success"
              ? "bg-gold/10 border-gold/30"
              : "bg-neon-purple/10 border-neon-purple/30"
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {status === "success" ? (
              <svg
                className="w-6 h-6 text-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-neon-purple"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <span
              className={cn(
                "font-bold text-lg",
                status === "success" ? "text-gold" : "text-neon-purple"
              )}
            >
              {status === "success" ? "YOU'RE IN" : "ALREADY ENLISTED"}
            </span>
          </div>
          <p className="text-text-secondary text-sm">{serverMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={formViewRef} className={cn(containerStyles[variant], className)}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          "flex gap-3",
          variant === "hero" || variant === "portal" ? "flex-col sm:flex-row" : "flex-row"
        )}
        noValidate
      >
        <div className="flex-1 relative">
          <label htmlFor={`waitlist-email-${variant}`} className="sr-only">
            Email address
          </label>
          <input
            {...register("email")}
            id={`waitlist-email-${variant}`}
            type="email"
            placeholder={
              variant === "compact"
                ? "your@email.com"
                : "warrior@revolution.gg"
            }
            disabled={status === "submitting"}
            className={cn(
              "w-full bg-obsidian/80 border text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30",
              "transition-all duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              inputStyles[variant],
              errors.email
                ? "border-neon-red/50 focus:border-neon-red/50 focus:ring-neon-red/30"
                : "border-white/10"
            )}
            aria-invalid={errors.email ? "true" : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p
              id="email-error"
              className="absolute -bottom-5 left-0 text-xs text-neon-red"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className={cn(
            "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-void font-semibold",
            "hover:shadow-[0_0_20px_rgba(255,215,0,0.4),0_0_60px_rgba(255,215,0,0.15)]",
            "hover:scale-[1.02] active:scale-[0.97]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2 focus-visible:ring-offset-abyss",
            "transition-all duration-300 cursor-pointer select-none",
            "disabled:opacity-60 disabled:pointer-events-none",
            "flex items-center justify-center gap-2 whitespace-nowrap",
            buttonStyles[variant]
          )}
        >
          {status === "submitting" ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              ENLISTING...
            </>
          ) : variant === "compact" ? (
            "JOIN"
          ) : (
            "JOIN THE REVOLUTION"
          )}
        </button>
      </form>

      {/* Error messages */}
      {(status === "error" || status === "rate-limited") && serverMessage && (
        <p
          className={cn(
            "mt-3 text-sm text-center",
            status === "rate-limited" ? "text-gold/80" : "text-neon-red"
          )}
        >
          {serverMessage}
        </p>
      )}

      {/* Fine print */}
      {(variant === "hero" || variant === "portal") && (
        <p className="mt-4 text-text-muted text-xs text-center">
          No spam. No corporate overlords. Just updates on when you can start
          earning what you deserve.
        </p>
      )}
    </div>
  );
}
