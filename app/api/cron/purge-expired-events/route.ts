import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { purgeEventsDueAsOf } from "@/lib/purge-expired-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron (see `vercel.json`). Requires `CRON_SECRET`; Vercel injects
 * `Authorization: Bearer <CRON_SECRET>` when the env var is set on the project.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  const expected = `Bearer ${secret}`;
  const provided = request.headers.get("authorization") ?? "";
  const match =
    provided.length === expected.length &&
    timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  if (!match) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const nowIso = new Date().toISOString();
  const result = await purgeEventsDueAsOf(nowIso, { limit: 40 });

  return NextResponse.json(
    {
      ok: true,
      now: nowIso,
      purgedCount: result.purgedIds.length,
      purgedIds: result.purgedIds,
      storageIncompleteIds: result.storageIncompleteIds,
      errors: result.errors,
    },
    { status: 200 },
  );
}
