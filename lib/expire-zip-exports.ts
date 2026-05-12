import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseServerClient } from "@/lib/supabase-server";

export type ExpireZipExportsResult = Readonly<{
  expiredIds: readonly string[];
  storageErrors: readonly string[];
}>;

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

  return { expiredIds, storageErrors };
}
