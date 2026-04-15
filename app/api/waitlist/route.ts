import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 320;

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value) && value.length <= MAX_EMAIL_LENGTH;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || !("email" in payload) || typeof payload.email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const email = normalizeEmail(payload.email);
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("waitlist").insert({ email });

    if (error) {
      // Duplicate entry should still be treated as success for idempotent UX.
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
      }
      console.error("[waitlist] insert failed", error);
      return NextResponse.json({ error: "Failed to join waitlist." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[waitlist] server error", error);
    return NextResponse.json({ error: "Failed to join waitlist." }, { status: 500 });
  }
}
