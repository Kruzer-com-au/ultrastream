/**
 * Portal Messages — scroll-driven text overlays for the warp tunnel phase.
 *
 * Each message has a visibility window defined by startProgress / endProgress
 * (normalised 0-1 within the warp scroll progress). The style determines
 * visual treatment: feature (informational), rebel (anti-corporate), or
 * epic (climactic).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PortalMessage {
  text: string;
  /** Start of visibility window (0-1 within warp progress). */
  startProgress: number;
  /** End of visibility window. */
  endProgress: number;
  /** Visual style. */
  style: 'feature' | 'rebel' | 'epic';
}

// ---------------------------------------------------------------------------
// Message data
// ---------------------------------------------------------------------------

export const PORTAL_MESSAGES: PortalMessage[] = [
  // Feature messages — wider windows so users can't scroll past them
  {
    text: 'CREATORS KEEP 97% OF REVENUE',
    startProgress: 0.02,
    endProgress: 0.20,
    style: 'feature',
  },
  {
    text: 'ZERO ALGORITHM MANIPULATION',
    startProgress: 0.16,
    endProgress: 0.36,
    style: 'feature',
  },
  {
    text: 'COMMUNITY-OWNED PLATFORM',
    startProgress: 0.32,
    endProgress: 0.52,
    style: 'feature',
  },
  {
    text: 'YOUR CONTENT. YOUR RULES.',
    startProgress: 0.48,
    endProgress: 0.68,
    style: 'rebel',
  },

  // Anti-corporate / rebel messages
  {
    text: 'NO MORE 50% PLATFORM CUTS',
    startProgress: 0.62,
    endProgress: 0.80,
    style: 'rebel',
  },
  {
    text: 'FIGHTING CORPORATE GREED',
    startProgress: 0.75,
    endProgress: 0.92,
    style: 'epic',
  },
  {
    text: 'THE REVOLUTION IS HERE',
    startProgress: 0.88,
    endProgress: 1.0,
    style: 'epic',
  },
];

// ---------------------------------------------------------------------------
// Bloom transition messages
// ---------------------------------------------------------------------------

/** Messages shown during bloom (white flash) transitions between phases. */
export const BLOOM_MESSAGES = {
  heroToWarp: 'WELCOME TO THE REVOLUTION',
  warpToBattle: 'TIME TO FIGHT',
} as const;
