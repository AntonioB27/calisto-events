import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";
import { normalizeRsvpCode } from "@/lib/rsvp-code";
import { normalizePlanId, planRank } from "@/lib/plan-limits";
import { findPossibleDuplicate, type RsvpAttendee } from "@/lib/rsvp-duplicate";
import { sendRsvpNotificationEmail } from "@/lib/rsvp-email";

type SubmitBody = {
  clientToken: string;
  status: "confirmed" | "declined";
  submitterName: string;
  contact?: string;
  attendees?: RsvpAttendee[];
};

const MAX_NAME_LENGTH = 120;
const MAX_ATTENDEES = 30;

function sanitizeName(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_NAME_LENGTH) : "";
}

function parseBody(raw: unknown): SubmitBody | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  const clientToken = typeof body.clientToken === "string" ? body.clientToken.trim() : "";
  const status = body.status === "confirmed" || body.status === "declined" ? body.status : null;
  const submitterName = sanitizeName(body.submitterName);
  if (!clientToken || !status || !submitterName) return null;

  const contact = typeof body.contact === "string" && body.contact.trim() ? body.contact.trim().slice(0, 200) : undefined;

  let attendees: RsvpAttendee[] = [];
  if (status === "confirmed") {
    const rawAttendees = Array.isArray(body.attendees) ? body.attendees : [];
    attendees = rawAttendees
      .slice(0, MAX_ATTENDEES)
      .map((a) => {
        const entry = a as Record<string, unknown>;
        const name = sanitizeName(entry?.name);
        const type = entry?.type === "child" ? "child" : "adult";
        return name ? { name, type } : null;
      })
      .filter((a): a is RsvpAttendee => a !== null);
    if (attendees.length === 0) return null;
  }

  return { clientToken, status, submitterName, contact, attendees };
}

export async function POST(request: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const body = parseBody(raw);
  if (!body) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const db = getSupabaseServerClient();
  const { data: event } = await db
    .from("events")
    .select("id, title, plan, rsvp_open, organizer_id")
    .eq("rsvp_code", normalizeRsvpCode(code))
    .maybeSingle();

  if (!event) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const eventRow = event as {
    id: string;
    title: string;
    plan: string;
    rsvp_open: boolean;
    organizer_id: string;
  };

  const planEligible = planRank(normalizePlanId(eventRow.plan)) >= planRank("standard");
  if (!planEligible || !eventRow.rsvp_open) {
    return NextResponse.json({ error: "RSVP_CLOSED" }, { status: 403 });
  }

  const { data: existingMine } = await db
    .from("rsvps")
    .select("id")
    .eq("event_id", eventRow.id)
    .eq("client_token", body.clientToken)
    .maybeSingle();

  const isNewSubmission = !existingMine;

  const record = {
    event_id: eventRow.id,
    status: body.status,
    submitter_name: body.submitterName,
    contact: body.contact ?? null,
    attendees: body.attendees ?? [],
    client_token: body.clientToken,
    updated_at: new Date().toISOString(),
  };

  let rsvpId: string;
  if (existingMine) {
    const { data, error } = await db
      .from("rsvps")
      .update(record)
      .eq("id", (existingMine as { id: string }).id)
      .select("id")
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "SUBMIT_FAILED" }, { status: 500 });
    }
    rsvpId = (data as { id: string }).id;
  } else {
    const { data, error } = await db.from("rsvps").insert(record).select("id").single();
    if (error || !data) {
      return NextResponse.json({ error: "SUBMIT_FAILED" }, { status: 500 });
    }
    rsvpId = (data as { id: string }).id;
  }

  // Duplicate detection only makes sense for brand-new submissions — an edit to
  // your own existing RSVP is not a duplicate of itself.
  if (isNewSubmission) {
    const { data: others } = await db
      .from("rsvps")
      .select("id, submitter_name, contact, attendees")
      .eq("event_id", eventRow.id)
      .neq("id", rsvpId);

    const existingRows = (others ?? []) as Array<{
      id: string;
      submitter_name: string;
      contact: string | null;
      attendees: RsvpAttendee[];
    }>;

    const duplicate = findPossibleDuplicate(
      { submitterName: body.submitterName, contact: body.contact, attendees: body.attendees },
      existingRows.map((r) => ({ id: r.id, submitterName: r.submitter_name, contact: r.contact, attendees: r.attendees })),
    );

    if (duplicate) {
      await db.from("rsvps").update({ possible_duplicate_of: duplicate.id, duplicate_status: "flagged" }).eq("id", rsvpId);
    }

    // Fire-and-forget: a failed notification email should never block the guest's submission.
    void sendRsvpNotificationEmail({
      organizerId: eventRow.organizer_id,
      eventId: eventRow.id,
      eventTitle: eventRow.title,
      locale: "en",
      status: body.status,
      submitterName: body.submitterName,
      attendees: body.attendees ?? [],
    }).catch(() => undefined);
  }

  return NextResponse.json({ ok: true, id: rsvpId });
}
