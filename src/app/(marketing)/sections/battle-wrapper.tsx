"use client";

import dynamic from "next/dynamic";

// Dynamic import with ssr disabled — BattleGame contains R3F (WebGL)
const BattleGame = dynamic(
  () => import("@/components/battle/BattleGame"),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-full flex items-center justify-center bg-void">
        <div className="text-center">
          <div className="text-neon-blue text-sm font-bold tracking-[0.3em] uppercase opacity-60 animate-pulse">
            LOADING ARENA...
          </div>
        </div>
      </div>
    ),
  }
);

/**
 * Client wrapper for the BattleGame section.
 * Handles the dynamic import boundary for the page (which is a server component).
 */
export function BattleGameWrapper() {
  return <BattleGame />;
}
