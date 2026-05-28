import { NextRequest, NextResponse } from "next/server";
import { waitlistSchema } from "@/lib/validations/waitlist";
import { sendConfirmationEmail } from "@/lib/email/confirmation";
import { supabase } from "@/lib/supabase/server";

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

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

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Slow down, warrior. Too many attempts. Try again in a bit." },
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

    const result = waitlistSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const normalizedEmail = result.data.email.toLowerCase().trim();

    // Capture referral source from body and country from Vercel/Cloudflare geo headers
    const referralSource = typeof body.referral_source === "string" ? body.referral_source.slice(0, 100) : null;
    const ipCountry =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      null;

    const { error: insertError } = await supabase
      .from("waitlist")
      .insert({ email: normalizedEmail, referral_source: referralSource, ip_country: ipCountry });

    if (insertError) {
      // Postgres unique violation code
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "You're already on the list, revolutionary! We'll be in touch." },
          { status: 409 }
        );
      }
      console.error("[WAITLIST DB ERROR]", insertError);
      return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
    }

    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    sendConfirmationEmail(normalizedEmail).catch((err) =>
      console.error("[EMAIL ERROR]", err)
    );

    recordRequest(ip);

    return NextResponse.json(
      { success: true, message: "Welcome to the revolution!", count: count ?? 0 },
      { status: 201 }
    );
  } catch (err) {
    console.error("[WAITLIST ERROR]", err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

export async function GET() {
  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({ count: count ?? 0 });
}
