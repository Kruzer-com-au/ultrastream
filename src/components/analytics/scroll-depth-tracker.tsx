"use client";

import { useScrollDepth } from "@/lib/analytics";

/**
 * Client component that activates scroll depth tracking.
 * Renders nothing -- purely for side effects.
 * Include in any page that needs scroll milestone tracking.
 */
export function ScrollDepthTracker() {
  useScrollDepth();
  return null;
}
