import { NextResponse } from "next/server";

import { expireZipExportsPastDue } from "@/lib/expire-zip-exports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await expireZipExportsPastDue({ limit: 50 });

  return NextResponse.json(
    {
      ok: true,
      expiredIds: result.expiredIds,
      storageErrors: result.storageErrors,
    },
    { status: 200 },
  );
}
