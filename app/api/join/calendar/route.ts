import { NextResponse } from "next/server";

import { isAccessCodeValid, normalizeAccessCode } from "@/lib/access-code";
import { eventIcs } from "@/lib/event-ics";
import { splitEventTitleStored } from "@/lib/event-title";
import { getPublicOrigin } from "@/lib/public-origin";
import { clientIpFromRequest, consumeRateLimitToken } from "@/lib/simple-ip-rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const JOIN_CALENDAR_RATE_LIMIT = { max: 60, windowMs: 60_000 } as const;

/** The guest's "Add to calendar": an all-day .ics for the event day. Shows no more than /api/join/preview. */
export async function GET(request: Request): Promise<Response> {
  const rl = consumeRateLimitToken(`join-calendar:${clientIpFromRequest(request)}`, JOIN_CALENDAR_RATE_LIMIT);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
  }

  const code = normalizeAccessCode(new URL(request.url).searchParams.get("code") ?? "");
  if (!isAccessCodeValid(code)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const { data: event, error } = await getSupabaseServerClient()
    .from("events")
    .select("title, event_date")
    .eq("access_code", code)
    .maybeSingle();

  const ics =
    !error && event && typeof event.event_date === "string"
      ? eventIcs({
          uid: `${code}@calisto`,
          title: splitEventTitleStored(String(event.title ?? "")).name,
          eventDate: event.event_date,
          url: `${await getPublicOrigin()}/join/${encodeURIComponent(code)}`,
        })
      : null;
  if (!ics) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // inline, not attachment: iOS Safari then offers "Add to Calendar" instead of saving a file.
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="calisto-event.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
