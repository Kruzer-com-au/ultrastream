"use client";

import { WaitlistForm } from "./waitlist-form";
import { useWaitlist } from "./waitlist-provider";

/**
 * A hero-variant waitlist form positioned in the hero content area.
 * Rendered below the manifesto text in the hero section.
 * Uses WaitlistProvider context for shared celebration state.
 */
export function HeroWaitlist() {
  const { handleSuccess } = useWaitlist();

  return (
    <div className="mt-8 w-full max-w-lg mx-auto">
      <WaitlistForm variant="hero" onSuccess={handleSuccess} />
    </div>
  );
}
