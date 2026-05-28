import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase/server";

const scoreSubmissionSchema = z.object({
  email: z.string().email().optional().nullable(),
  nickname: z.string().min(2).max(30),
  score: z.number().int().min(0),
  wave: z.number().int().min(1),
});

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

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

async function getTopEntries(limit = 20) {
  const { data } = await supabase
    .from("leaderboard")
    .select("nickname, score, wave")
    .order("score", { ascending: false })
    .limit(limit);

  return (data ?? []).map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Slow down, warrior. Too many submissions. Try again in a bit." },
        {
          status: 429,
          headers: {
            "Retry-After": "3600",
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          },
        }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const result = scoreSubmissionSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid submission data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email: rawEmail, nickname, score, wave } = result.data;
    const email = rawEmail ? rawEmail.toLowerCase().trim() : null;

    // If email provided, try to find existing entry and accumulate score
    if (email) {
      const { data: existing } = await supabase
        .from("leaderboard")
        .select("id, score, wave")
        .eq("email", email)
        .single();

      if (existing) {
        const newScore = existing.score + score;
        const newWave = Math.max(existing.wave, wave);

        await supabase
          .from("leaderboard")
          .update({ score: newScore, wave: newWave, nickname, updated_at: new Date().toISOString() })
          .eq("id", existing.id);

        const leaderboard = await getTopEntries(20);
        const rank = leaderboard.findIndex((e) => e.nickname === nickname) + 1;

        recordRequest(ip);

        return NextResponse.json(
          { success: true, rank, isHighScore: rank === 1, totalScore: newScore, leaderboard },
          { status: 201 }
        );
      }
    }

    // New entry
    await supabase.from("leaderboard").insert({ nickname, email, score, wave });

    const leaderboard = await getTopEntries(20);
    const rank = leaderboard.findIndex((e) => e.nickname === nickname) + 1;

    recordRequest(ip);

    return NextResponse.json(
      { success: true, rank, isHighScore: rank === 1, leaderboard },
      { status: 201 }
    );
  } catch (err) {
    console.error("[LEADERBOARD ERROR]", err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (email) {
    const { data: entry } = await supabase
      .from("leaderboard")
      .select("nickname, score, wave")
      .eq("email", email.toLowerCase().trim())
      .single();

    const leaderboard = await getTopEntries(20);
    const { count } = await supabase
      .from("leaderboard")
      .select("*", { count: "exact", head: true });

    if (entry) {
      return NextResponse.json({
        found: true,
        nickname: entry.nickname,
        totalScore: entry.score,
        bestWave: entry.wave,
        leaderboard,
        total: count ?? 0,
      });
    }

    return NextResponse.json({ found: false, leaderboard, total: count ?? 0 });
  }

  const leaderboard = await getTopEntries(20);
  const { count } = await supabase
    .from("leaderboard")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({ leaderboard, total: count ?? 0 });
}
