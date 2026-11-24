import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseServerClient } from "@/lib/supabase-server";

export type ExpireZipExportsResult = Readonly<{
  expiredIds: readonly string[];
  storageErrors: readonly string[];
  staleFailedIds?: readonly string[];
}>;

/** A running job whose row hasn't moved for this long was cut off (function time limit) and will never finish. */
const STALE_RUNNING_MS = 15 * 60 * 1000;

/**
 * Marks ready ZIP exports past `expires_at`, removes objects from `event-media`, sets status `expired`.
 */
export async function expireZipExportsPastDue(
  args?: Readonly<{ limit?: number; db?: SupabaseClient }>,
): Promise<ExpireZipExportsResult> {
  const limit = args?.limit ?? 50;
  const db = args?.db ?? getSupabaseServerClient();
  const nowIso = new Date().toISOString();

  const { data: rows, error: selErr } = await db
    .from("media_zip_exports")
    .select("id, storage_path")
    .eq("status", "ready")
    .not("storage_path", "is", null)
    .lt("expires_at", nowIso)
    .order("expires_at", { ascending: true })
    .limit(limit);

  if (selErr) {
    return { expiredIds: [], storageErrors: [selErr.message] };
  }

  const expiredIds: string[] = [];
  const storageErrors: string[] = [];

  for (const row of rows ?? []) {
    const id = typeof (row as { id?: unknown }).id === "string" ? (row as { id: string }).id : "";
    const path =
      typeof (row as { storage_path?: unknown }).storage_path === "string"
        ? (row as { storage_path: string }).storage_path
        : "";
    if (!id || !path) continue;

    const { error: rmErr } = await db.storage.from("event-media").remove([path]);
    if (rmErr) {
      storageErrors.push(`${id}: ${rmErr.message}`);
    }

    const { error: upErr } = await db
      .from("media_zip_exports")
      .update({ status: "expired", updated_at: nowIso })
      .eq("id", id);

    if (upErr) {
      storageErrors.push(`db ${id}: ${upErr.message}`);
      continue;
    }

    expiredIds.push(id);
  }

  // Free jobs left "running" by a killed worker so the organizer can see it failed and try again.
  const staleBefore = new Date(Date.now() - STALE_RUNNING_MS).toISOString();
  const { data: stale, error: staleErr } = await db
    .from("media_zip_exports")
    .update({ status: "failed", error_message: "Packing took too long and was stopped.", finished_at: nowIso })
    .eq("status", "running")
    .lt("updated_at", staleBefore)
    .select("id");
  if (staleErr) storageErrors.push(`stale: ${staleErr.message}`);
  const staleFailedIds = ((stale ?? []) as { id: string }[]).map((r) => r.id);

  return { expiredIds, storageErrors, staleFailedIds };
}
