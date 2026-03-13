"use client";

import { useState, useEffect, useRef } from "react";
import { WaitlistForm } from "./waitlist-form";
import { useWaitlist } from "./waitlist-provider";
import { cn } from "@/lib/utils/cn";
import { trackEvent } from "@/lib/analytics";

export function StickyCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const { handleSuccess } = useWaitlist();

  useEffect(() => {
    const hero = document.getElementById("portal-journey");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when hero is NOT visible
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const show = visible && !dismissed;

  return (
    <div
      ref={barRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        show ? "translate-y-0" : "translate-y-full"
      )}
    >
      {/* Gradient top edge */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="bg-void/95 backdrop-blur-md border-t border-white/5 py-3 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          {/* CTA text - hidden on small mobile */}
          <p className="hidden sm:block text-sm text-text-secondary font-medium whitespace-nowrap">
            <span className="text-gold font-bold">Claim your spot.</span> Join
            the revolution.
          </p>

          {/* Form */}
          <div className="flex-1">
            <WaitlistForm variant="compact" onSuccess={handleSuccess} />
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => {
              trackEvent("CTA Click", { label: "Dismiss Sticky CTA", location: "sticky-bar" });
              setDismissed(true);
            }}
            className="text-text-muted hover:text-text-secondary transition-colors p-2 min-w-[44px] min-h-[44px] flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:rounded-sm flex items-center justify-center"
            aria-label="Dismiss sticky signup bar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
