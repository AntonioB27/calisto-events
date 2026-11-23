import type { SupabaseClient } from "@supabase/supabase-js";

import { processNextZipExportJob } from "@/lib/process-zip-export-job";
import { ZIP_EXPORT_BATCH_LIMIT } from "@/lib/zip-export-constants";

/** Don't start another job past this point: a function killed mid-job leaves the row stuck in `running`. */
const START_NEW_JOB_BEFORE_MS = 60_000;

/** Processes queued ZIP jobs oldest first, up to the batch limit, and returns the ids it handled. */
export async function runZipExportBatch(db: SupabaseClient): Promise<string[]> {
  const processedIds: string[] = [];
  const startedAt = Date.now();
  for (let i = 0; i < ZIP_EXPORT_BATCH_LIMIT && Date.now() - startedAt < START_NEW_JOB_BEFORE_MS; i++) {
    const r = await processNextZipExportJob(db);
    if (!r.processed) break;
    if (r.jobId) processedIds.push(r.jobId);
  }
  return processedIds;
}
