import { NextRequest, NextResponse } from "next/server";
import { waitlistSchema } from "@/lib/validations/waitlist";
import { sendConfirmationEmail } from "@/lib/email/confirmation";

/**
 * In-memory waitlist store.
 * In production, replace with Supabase:
 *   1. pnpm add @supabase/supabase-js
 *   2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   3. Run supabase/migrations/001_waitlist.sql
 *   4. Swap in-memory operations for Supabase client calls
 */
const waitlistStore: { email: string; createdAt: string }[] = [];

/**
 * Basic in-memory rate limiter.
 * Maps IP -> array of timestamps.
 * TODO: Replace with Upstash Redis for production.
 */
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // 5 signups per IP per hour

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
 * POST /api/waitlist
 * Accepts { email } and stores to waitlist.
 * Returns { success, message, count } on success.
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
            "Slow down, warrior. Too many attempts. Try again in a bit.",
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
    const result = waitlistSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check for duplicate
    const exists = waitlistStore.find((w) => w.email === normalizedEmail);
    if (exists) {
      return NextResponse.json(
        {
          error:
            "You're already on the list, revolutionary! We'll be in touch.",
        },
        { status: 409 }
      );
    }

    // Store signup
    waitlistStore.push({
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
    });

    // Send confirmation email (fire and forget -- don't block signup on email)
    sendConfirmationEmail(normalizedEmail).catch((err) =>
      console.error("[EMAIL ERROR]", err)
    );

    recordRequest(ip);

    return NextResponse.json(
      {
        success: true,
        message: "Welcome to the revolution!",
        count: waitlistStore.length,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[WAITLIST ERROR]", err);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/waitlist
 * Returns the current waitlist count for social proof.
 */
export async function GET() {
  return NextResponse.json({ count: waitlistStore.length });
}
