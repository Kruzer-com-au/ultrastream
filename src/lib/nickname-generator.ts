/**
 * Deterministic nickname generator.
 *
 * Generates a fun, deterministic nickname from an email address.
 * Same email always produces the same nickname.
 *
 * Algorithm:
 *   1. Normalize the email (lowercase, trim)
 *   2. Hash the full email to get a numeric seed
 *   3. Use seed to pick adjective + noun from curated lists
 *   4. Append 2-digit number derived from hash
 *
 * Examples:
 *   "john@gmail.com"              -> "CosmicRebel_42"  (illustrative)
 *   "sarah.streams@outlook.com"   -> "NeonWarrior_87"  (illustrative)
 */

const ADJECTIVES = [
  "Cosmic",
  "Neon",
  "Stellar",
  "Quantum",
  "Blazing",
  "Shadow",
  "Crimson",
  "Electric",
  "Hyper",
  "Phantom",
  "Ultra",
  "Cyber",
  "Radiant",
  "Savage",
  "Mythic",
  "Galactic",
  "Thunder",
  "Turbo",
  "Fierce",
  "Astral",
  "Omega",
  "Nova",
  "Primal",
  "Rogue",
  "Apex",
  "Storm",
  "Void",
  "Blaze",
  "Iron",
  "Sonic",
] as const;

const NOUNS = [
  "Rebel",
  "Warrior",
  "Phoenix",
  "Vortex",
  "Hunter",
  "Striker",
  "Guardian",
  "Titan",
  "Falcon",
  "Blade",
  "Ranger",
  "Specter",
  "Sentinel",
  "Crusader",
  "Legend",
  "Champion",
  "Commander",
  "Maverick",
  "Pioneer",
  "Voyager",
  "Raider",
  "Seeker",
  "Fury",
  "Dragon",
  "Wolf",
  "Eagle",
  "Hammer",
  "Shield",
  "Knight",
  "Pilot",
] as const;

/**
 * Simple deterministic hash function (djb2 variant).
 * Converts a string into a non-negative 32-bit integer.
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates a deterministic nickname from an email address.
 *
 * @param email - The email address to derive a nickname from.
 * @returns A nickname in the format "AdjectiveNoun_NN" (e.g. "CosmicRebel_42").
 */
export function generateNickname(email: string): string {
  const normalized = email.toLowerCase().trim();
  const hash = simpleHash(normalized);

  const adjIndex = hash % ADJECTIVES.length;
  const nounIndex = Math.floor(hash / ADJECTIVES.length) % NOUNS.length;
  const number = hash % 100;

  return `${ADJECTIVES[adjIndex]}${NOUNS[nounIndex]}_${String(number).padStart(2, "0")}`;
}

/**
 * Validates a custom nickname (if user provides one instead of using email generation).
 *
 * Rules:
 *   - Between 2 and 30 characters
 *   - Only alphanumeric characters, underscores, and hyphens
 *
 * @param nickname - The nickname to validate.
 * @returns True if the nickname is valid.
 */
export function isValidNickname(nickname: string): boolean {
  return (
    nickname.length >= 2 &&
    nickname.length <= 30 &&
    /^[a-zA-Z0-9_-]+$/.test(nickname)
  );
}
