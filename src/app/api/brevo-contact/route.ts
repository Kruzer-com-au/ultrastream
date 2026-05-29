import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addBrevoContact } from "@/lib/brevo";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    await addBrevoContact(result.data.email);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[BREVO CONTACT ERROR]", err);
    // Non-fatal — don't surface Brevo errors to the client
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
