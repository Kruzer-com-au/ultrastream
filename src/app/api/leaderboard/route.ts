import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Zod schema for score submission.
 * Email is optional — stored on backend but NEVER returned to clients.
 */
const scoreSubmissionSchema = z.object({
  email: z.string().email().optional().nullable(),
  nickname: z.string().min(2).max(30),
  score: z.number().int().min(0),
  wave: z.number().int().min(1),
});

/**
 * In-memory leaderboard store.
 * In production, replace with Supabase:
 *   1. pnpm add @supabase/supabase-js
 *   2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   3. Create a leaderboard table migration
 *   4. Swap in-memory operations for Supabase client calls
 */
interface LeaderboardEntry {
  nickname: string;
  email?: string; // stored but NEVER returned to client
  score: number;
  wave: number;
  createdAt: string;
}

const leaderboardStore: LeaderboardEntry[] = [];

/**
 * Basic in-memory rate limiter.
 * Maps IP -> array of timestamps.
 * TODO: Replace with Upstash Redis for production.
 */
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10; // 10 submissions per IP per hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  rateLimitMap.set(ip, recent);
  return recent.length < RATE_LIMIT_MAX;
}

function recordRequest(ip: string): void {
  const timestamps = rateLimitMap.get(ip) || [];
  timestamps.push(Date.now());
  rateLimitMap.set(ip, timestamps);
}

/**
 * Strips email from an entry and adds a rank, producing a safe public record.
 */
function toPublicEntry(
  entry: LeaderboardEntry,
  rank: number
): { nickname: string; score: number; wave: number; rank: number } {
  return {
    nickname: entry.nickname,
    score: entry.score,
    wave: entry.wave,
    rank,
  };
}

/**
 * Returns the top N entries sorted by score descending, with rank numbers.
 * Emails are stripped — only public fields are returned.
 */
function getTopEntries(limit: number = 20) {
  const sorted = [...leaderboardStore].sort((a, b) => b.score - a.score);
  return sorted.slice(0, limit).map((entry, index) => toPublicEntry(entry, index + 1));
}

/**
 * POST /api/leaderboard
 * Submit a score. Returns { success, rank, isHighScore, leaderboard }.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error:
            "Slow down, warrior. Too many submissions. Try again in a bit.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "3600",
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          },
        }
      );
    }

    // Parse body
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate with Zod
    const result = scoreSubmissionSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid submission data";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { email: rawEmail, nickname, score, wave } = result.data;
    const email = rawEmail || undefined; // Normalize null to undefined

    // Check if player already exists (by email) — accumulate score
    if (email) {
      const existingIndex = leaderboardStore.findIndex(
        (e) => e.email === email.toLowerCase().trim()
      );
      if (existingIndex !== -1) {
        // Accumulate score, take max wave
        leaderboardStore[existingIndex].score += score;
        leaderboardStore[existingIndex].wave = Math.max(leaderboardStore[existingIndex].wave, wave);
        leaderboardStore[existingIndex].nickname = nickname; // update nickname if changed

        // Re-sort
        leaderboardStore.sort((a, b) => b.score - a.score);

        const rank = leaderboardStore.findIndex(e => e.email === email.toLowerCase().trim()) + 1;
        const isHighScore = rank === 1;

        recordRequest(ip);

        return NextResponse.json(
          {
            success: true,
            rank,
            isHighScore,
            totalScore: leaderboardStore[existingIndex].score,
            leaderboard: getTopEntries(20),
          },
          { status: 201 }
        );
      }
    }

    // Store the entry (email is kept server-side only)
    const entry: LeaderboardEntry = {
      nickname,
      email: email?.toLowerCase().trim(),
      score,
      wave,
      createdAt: new Date().toISOString(),
    };

    leaderboardStore.push(entry);

    // Sort store by score descending
    leaderboardStore.sort((a, b) => b.score - a.score);

    // Keep only top 100 entries to prevent unbounded growth
    if (leaderboardStore.length > 100) {
      leaderboardStore.splice(100);
    }

    // Calculate the rank of the just-submitted entry
    const rank = leaderboardStore.findIndex(
      (e) => e === entry
    ) + 1;

    const isHighScore = rank === 1;

    recordRequest(ip);

    return NextResponse.json(
      {
        success: true,
        rank,
        isHighScore,
        leaderboard: getTopEntries(20),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[LEADERBOARD ERROR]", err);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leaderboard
 * Returns top 20 leaderboard entries (no emails).
 * Fields: nickname, score, wave, rank.
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (email) {
    const entry = leaderboardStore.find(
      (e) => e.email === email.toLowerCase().trim()
    );
    if (entry) {
      return NextResponse.json({
        found: true,
        nickname: entry.nickname,
        totalScore: entry.score,
        bestWave: entry.wave,
        leaderboard: getTopEntries(20),
        total: leaderboardStore.length,
      });
    }
    return NextResponse.json({
      found: false,
      leaderboard: getTopEntries(20),
      total: leaderboardStore.length,
    });
  }

  return NextResponse.json({
    leaderboard: getTopEntries(20),
    total: leaderboardStore.length,
  });
}
