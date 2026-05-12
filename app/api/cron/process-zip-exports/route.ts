import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { ZIP_EXPORT_BATCH_LIMIT } from "@/lib/zip-export-constants";
import { processNextZipExportJob } from "@/lib/process-zip-export-job";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const db = getSupabaseServerClient();
  const processedIds: string[] = [];

  for (let i = 0; i < ZIP_EXPORT_BATCH_LIMIT; i++) {
    const r = await processNextZipExportJob(db);
    if (!r.processed) break;
    if (r.jobId) processedIds.push(r.jobId);
  }

  return NextResponse.json({ ok: true, processedJobIds: processedIds }, { status: 200 });
}
