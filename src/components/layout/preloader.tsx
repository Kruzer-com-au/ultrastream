"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

export function Preloader() {
  const [phase, setPhase] = useState<"loading" | "exiting" | "done">("loading");

  useEffect(() => {
    const exitTimer = setTimeout(() => setPhase("exiting"), 1800);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      document.body.classList.add("preloader-done");
    }, 2300);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center",
        "bg-void transition-all duration-500",
        phase === "exiting" && "opacity-0 -translate-y-8"
      )}
    >
      {/* Logo */}
      <h1
        className={cn(
          "text-5xl md:text-7xl font-display font-bold tracking-wider",
          "text-gradient-gold",
          "animate-[fadeInScale_0.6s_ease-out_forwards]"
        )}
      >
        ULTRASTREAM
      </h1>

      {/* Loading bar */}
      <div className="mt-8 w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue rounded-full animate-[loadBar_1.5s_0.3s_ease-in-out_forwards]"
          style={{ width: "0%" }}
        />
      </div>

      {/* Tagline */}
      <p className="mt-4 text-text-muted text-sm tracking-[0.3em] uppercase animate-[fadeIn_0.5s_0.8s_ease-out_forwards] opacity-0">
        The Revolution Loads
      </p>
    </div>
  );
}
