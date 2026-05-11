import { NextResponse } from "next/server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const STORAGE_CHUNK = 400;

function normalizeTitleConfirm(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function pathsFromRpcPayload(data: unknown): string[] {
  if (!Array.isArray(data)) return [];
  return data.filter((p): p is string => typeof p === "string" && p.length > 0);
}

async function removeStoragePaths(db: SupabaseClient, paths: string[]) {
  for (let i = 0; i < paths.length; i += STORAGE_CHUNK) {
    const slice = paths.slice(i, i + STORAGE_CHUNK);
    const { error } = await db.storage.from("event-media").remove(slice);
    if (error) return error;
  }
  return null;
}

type DeleteBody = Readonly<{
  eventTitleConfirm?: unknown;
  /** Typing `DELETE` (any case) also confirms, for power users. */
  deleteWordConfirm?: unknown;
}>;

export const __test = {
  getSupabaseServerClient: getSupabaseServerClient,
};

/**
 * Permanent event teardown: primary organizer only. Confirms by exact stored title trim
 * or literal `DELETE`.
 */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await ctx.params;
  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: DeleteBody;
  try {
    body = (await request.json()) as DeleteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const titleConfirm = normalizeTitleConfirm(body.eventTitleConfirm);
  const deleteWord =
    typeof body.deleteWordConfirm === "string" ? body.deleteWordConfirm.trim().toUpperCase() : "";

  const db = __test.getSupabaseServerClient();

  const { data: eventRow, error: evErr } = await db
    .from("events")
    .select("id, title, organizer_id")
    .eq("id", eventId)
    .maybeSingle();

  if (evErr || !eventRow) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const organizerId = typeof (eventRow as { organizer_id?: unknown }).organizer_id === "string"
    ? (eventRow as { organizer_id: string }).organizer_id
    : "";

  if (!organizerId || organizerId !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const storedTitle = String((eventRow as { title?: unknown }).title ?? "").trim();
  const confirmOk = deleteWord === "DELETE" || titleConfirm === storedTitle;
  if (!confirmOk) {
    return NextResponse.json({ error: "CONFIRM_MISMATCH" }, { status: 400 });
  }

  const { data: pathsPayload, error: rpcErr } = await authClient.rpc("delete_event_as_primary_return_paths", {
    p_event_id: eventId,
  });

  if (rpcErr) {
    const raw = rpcErr.message ?? "";
    if (raw.includes("NOT_ORGANIZER")) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (raw.includes("NOT_AUTHENTICATED")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }

  const paths = pathsFromRpcPayload(pathsPayload as unknown);
  const storageError = paths.length > 0 ? await removeStoragePaths(db, paths) : null;
  if (storageError) {
    console.error("[delete-event] storage remove incomplete", storageError.message);
    return NextResponse.json({ error: "EVENT_DELETED_STORAGE_INCOMPLETE" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
