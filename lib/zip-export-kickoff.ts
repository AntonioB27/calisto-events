import { after } from "next/server";

import type { Locale } from "@/lib/i18n";
import { emailEventTitle, emailPhotoUrls, zipStatusUrl } from "@/lib/process-zip-export-job";
import { runZipExportBatch } from "@/lib/run-zip-export-batch";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { sendZipExportEmail } from "@/lib/zip-export-email";

/**
 * Runs right after the "start export" response: emails the organizer that packing started,
 * then packs immediately instead of waiting for the scheduled worker (which stays as the fallback).
 */
export function kickOffZipExport(args: {
  eventId: string;
  eventTitle: string;
  jobId: string;
  to: string | null;
  locale: Locale;
}) {
  after(async () => {
    const db = getSupabaseServerClient();
    if (args.to) {
      const sent = await sendZipExportEmail({
        kind: "started",
        to: args.to,
        locale: args.locale,
        eventTitle: emailEventTitle(args.eventTitle),
        statusUrl: zipStatusUrl(args.eventId, args.jobId),
        photoUrls: await emailPhotoUrls(db, args.eventId),
      });
      if (sent.ok) {
        await db.from("media_zip_exports").update({ emailed_started_at: new Date().toISOString() }).eq("id", args.jobId);
      } else {
        console.warn("[zip-export] started email skipped:", sent.error);
      }
    }
    await runZipExportBatch(db);
  });
}
