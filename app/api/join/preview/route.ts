import { NextResponse } from "next/server";

import { isAccessCodeValid, normalizeAccessCode } from "@/lib/access-code";
import type { PlanId } from "@/lib/plan-limits";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

function isPlanId(value: string): value is PlanId {
  return (
    value === "free" ||
    value === "standard" ||
    value === "plus" ||
    value === "premium" ||
    value === "max"
  );
}

function notFound(): NextResponse {
  return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const raw = url.searchParams.get("code") ?? "";
  const code = normalizeAccessCode(raw);

  if (!isAccessCodeValid(code)) {
    return notFound();
  }

  const supabase = await createSupabaseAuthServerClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("title, event_date, plan")
    .eq("access_code", code)
    .maybeSingle();

  if (error || !event) {
    return notFound();
  }

  if (typeof event.event_date !== "string" || !event.event_date || typeof event.plan !== "string" || !isPlanId(event.plan)) {
    return notFound();
  }

  const title = typeof event.title === "string" ? event.title : (event.title == null ? "Event" : String(event.title));

  return NextResponse.json({
    title,
    eventDate: event.event_date,
    planId: event.plan,
  });
}
