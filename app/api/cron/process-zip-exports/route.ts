import { NextResponse } from "next/server";

import { runZipExportBatch } from "@/lib/run-zip-export-batch";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const processedIds = await runZipExportBatch(getSupabaseServerClient());
  return NextResponse.json({ ok: true, processedJobIds: processedIds }, { status: 200 });
}
