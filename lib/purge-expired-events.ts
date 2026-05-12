import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseServerClient } from "@/lib/supabase-server";

const STORAGE_CHUNK = 400;

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

export type PurgeExpiredEventsResult = Readonly<{
  purgedIds: readonly string[];
  storageIncompleteIds: readonly string[];
  errors: readonly string[];
}>;

/**
 * Deletes events whose `scheduled_deletion_at` is in the past (or equal to `nowIso`).
 * Uses service-role RPC `delete_event_system_return_paths` then removes storage objects.
 */
export async function purgeEventsDueAsOf(
  nowIso: string,
  args?: Readonly<{ limit?: number; db?: SupabaseClient }>,
): Promise<PurgeExpiredEventsResult> {
  const limit = args?.limit ?? 40;
  const db = args?.db ?? getSupabaseServerClient();

  const { data: due, error: selErr } = await db
    .from("events")
    .select("id")
    .lte("scheduled_deletion_at", nowIso)
    .order("scheduled_deletion_at", { ascending: true })
    .limit(limit);

  if (selErr) {
    return { purgedIds: [], storageIncompleteIds: [], errors: [selErr.message] };
  }

  const ids = (due ?? [])
    .map((r) => (typeof (r as { id?: unknown }).id === "string" ? (r as { id: string }).id : ""))
    .filter((id) => id.length > 0);

  const purgedIds: string[] = [];
  const storageIncompleteIds: string[] = [];
  const errors: string[] = [];

  for (const eventId of ids) {
    const { data: pathsPayload, error: rpcErr } = await db.rpc("delete_event_system_return_paths", {
      p_event_id: eventId,
    });

    if (rpcErr) {
      errors.push(`${eventId}: ${rpcErr.message}`);
      continue;
    }

    const paths = pathsFromRpcPayload(pathsPayload as unknown);
    const storageError = paths.length > 0 ? await removeStoragePaths(db, paths) : null;
    if (storageError) {
      storageIncompleteIds.push(eventId);
      console.error("[purge-expired-events] storage remove incomplete", eventId, storageError.message);
    }

    purgedIds.push(eventId);
  }

  return { purgedIds, storageIncompleteIds, errors };
}
