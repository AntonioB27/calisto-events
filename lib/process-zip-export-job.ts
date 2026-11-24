import type { SupabaseClient } from "@supabase/supabase-js";
import { createRequire } from "node:module";
import { once } from "node:events";
import { PassThrough } from "node:stream";

import { ZIP_EXPORT_EXPIRY_HOURS } from "@/lib/zip-export-constants";
import { splitEventTitleStored } from "@/lib/event-title";
import { sendZipExportEmail, zipEmailLocale, type ZipExportEmailKind } from "@/lib/zip-export-email";

/** How often the worker writes "file X of Y" to the job row while packing. */
const ZIP_PROGRESS_REPORT_MS = 1500;

/** Files downloaded ahead of the one being written, so Storage and the ZIP stream work at the same time. */
const ZIP_PREFETCH = 3;

/** archiver@8 — avoid `import("archiver")` in dev: Turbopack HMR can panic with `InvalidExport` on that ESM graph. */
const archiverRequire = createRequire(import.meta.url);

/** Minimal surface for our usage. */
type ZipArchiveInstance = NodeJS.EventEmitter & {
  pipe: (dest: NodeJS.WritableStream) => unknown;
  append: (source: Buffer | string, data?: { name: string }) => unknown;
  finalize: () => Promise<void>;
  abort: () => unknown;
  pointer: () => number;
};

function createZipArchive(): ZipArchiveInstance {
  const { ZipArchive } = archiverRequire("archiver") as {
    ZipArchive: new (options?: { store?: boolean }) => ZipArchiveInstance;
  };
  // Photos and videos are already compressed; deflating them burns minutes of CPU for ~1% smaller files.
  return new ZipArchive({ store: true });
}

function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "http://localhost:3000";
}

/** The ZIP status page: live progress, timeline, download or retry. E-mails link here. */
export function zipStatusUrl(eventId: string, jobId: string): string {
  return `${siteOrigin()}/events/${eventId}/zip/${jobId}`;
}

/** A few recent photos for the e-mail; signed for a week so the e-mail still shows them later. */
export async function emailPhotoUrls(db: SupabaseClient, eventId: string): Promise<string[]> {
  try {
    return await signedEmailPhotos(db, eventId);
  } catch {
    return []; // photos are decoration; the e-mail goes out without them
  }
}

async function signedEmailPhotos(db: SupabaseClient, eventId: string): Promise<string[]> {
  const { data } = await db
    .from("media_items")
    .select("storage_path, thumbnail_path, mime_type")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(12);
  const paths = ((data ?? []) as { storage_path: string; thumbnail_path: string | null; mime_type: string | null }[])
    .filter((r) => !r.mime_type?.startsWith("video/"))
    .slice(0, 3)
    .map((r) => r.thumbnail_path ?? r.storage_path);
  if (paths.length === 0) return [];
  const { data: signed } = await db.storage.from("event-media").createSignedUrls(paths, 7 * 24 * 60 * 60);
  return (signed ?? []).flatMap((x: { signedUrl: string | null }) => (x.signedUrl ? [x.signedUrl] : []));
}

/** Event name without the stored emoji prefix, for e-mail subjects. */
export function emailEventTitle(rawTitle: unknown): string {
  return splitEventTitleStored(String(rawTitle ?? "")).name.trim() || "Calisto";
}

/** A media file that could not be read; its name is shown on the status page. */
class ZipItemError extends Error {
  constructor(
    message: string,
    readonly item: string,
  ) {
    super(message);
  }
}


function logZipExportEmailSkipped(kind: ZipExportEmailKind, error: string) {
  const isResendRecipientOrDomain =
    /testing emails to your own|verify a domain at resend\.com/i.test(error);
  const hint = isResendRecipientOrDomain
    ? " (ZIP is still ready in the gallery — verify a sending domain at https://resend.com/domains and set RESEND_FROM to an address on that domain to email any recipient.)"
    : "";
  console.warn(`[zip-export] ${kind} email skipped:`, error + hint);
}

function safeZipEntryName(storagePath: string, id: string): string {
  const tail = storagePath.split("/").pop()?.trim() || "file";
  const cleaned = tail.replace(/[/\\]/g, "_");
  return `${id.slice(0, 8)}-${cleaned}`;
}

type ClaimedJobRow = {
  id: string;
  event_id: string;
  include_videos: boolean;
  requested_by: string;
  locale: string | null;
};

function asClaimedJob(data: unknown): ClaimedJobRow | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const event_id = typeof o.event_id === "string" ? o.event_id : "";
  const requested_by = typeof o.requested_by === "string" ? o.requested_by : "";
  const include_videos = Boolean(o.include_videos);
  const locale = typeof o.locale === "string" ? o.locale : null;
  if (!id || !event_id) return null;
  return { id, event_id, include_videos, requested_by, locale };
}

async function organizerEmail(db: SupabaseClient, organizerId: string): Promise<string | null> {
  const { data, error } = await db.auth.admin.getUserById(organizerId);
  if (error || !data?.user?.email) return null;
  return data.user.email;
}

/**
 * Streams the ZIP straight into Storage so memory stays at about one media file,
 * not the whole archive (video exports run 700 MB+). Returns the ZIP size in bytes.
 */
async function streamZipToStorage(
  db: SupabaseClient,
  eventId: string,
  includeVideos: boolean,
  storagePath: string,
  onProgress: (done: number, total: number) => Promise<void>,
): Promise<number> {
  let q = db.from("media_items").select("id, storage_path, mime_type").eq("event_id", eventId);
  if (!includeVideos) {
    q = q.or("mime_type.is.null,mime_type.ilike.image/%");
  }
  const { data: media, error } = await q;
  if (error) throw new Error(error.message);

  const rows = (media ?? []) as { id: string; storage_path: string; mime_type: string | null }[];

  const archive = createZipArchive();
  const body = new PassThrough();
  archive.pipe(body);
  archive.on("error", (err) => body.destroy(err));

  const upload = db.storage
    .from("event-media")
    .upload(storagePath, body, { contentType: "application/zip", upsert: true })
    .then(({ error: upErr }) => {
      if (upErr) throw new Error(upErr.message);
    });

  const feed = (async () => {
    await onProgress(0, rows.length);
    if (rows.length === 0) {
      archive.append("No media matched this export.\n", { name: "README.txt" });
    }
    let done = 0;
    let lastReport = Date.now();
    const fetchRow = (row: (typeof rows)[number]) => {
      const p = db.storage
        .from("event-media")
        .download(row.storage_path)
        .then(async ({ data: blob, error: dlErr }) => {
          if (dlErr || !blob) {
            throw new ZipItemError(dlErr?.message ?? "download failed", row.storage_path.split("/").pop() || row.storage_path);
          }
          return Buffer.from(await blob.arrayBuffer());
        });
      p.catch(() => {}); // surfaced when awaited below; avoids an unhandled rejection for files ahead
      return p;
    };
    const ahead = rows.slice(0, ZIP_PREFETCH).map(fetchRow);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const buf = await ahead.shift()!;
      if (i + ZIP_PREFETCH < rows.length) ahead.push(fetchRow(rows[i + ZIP_PREFETCH]));
      const entryDone = once(archive, "entry");
      archive.append(buf, { name: safeZipEntryName(row.storage_path, row.id) });
      // Wait until the entry is written so we never hold more than one file in memory.
      await entryDone;
      done += 1;
      if (done === rows.length || Date.now() - lastReport >= ZIP_PROGRESS_REPORT_MS) {
        lastReport = Date.now();
        await onProgress(done, rows.length);
      }
    }
    await archive.finalize();
  })();

  // Whichever side fails first, the other must not surface as an unhandled rejection.
  upload.catch(() => {});
  feed.catch(() => {});
  try {
    await Promise.all([upload, feed]);
  } catch (e) {
    archive.abort();
    body.destroy();
    throw e;
  }
  return archive.pointer();
}

/**
 * Claims one queued job via RPC, builds ZIP, uploads to `event-media`, updates row, emails organizer.
 */
export async function processNextZipExportJob(
  db: SupabaseClient,
): Promise<{ processed: boolean; jobId?: string }> {
  const { data: rawJob, error: claimErr } = await db.rpc("claim_next_zip_export_job");
  if (claimErr) {
    console.error("[zip-export] claim failed", claimErr.message);
    return { processed: false };
  }

  const job = asClaimedJob(rawJob);
  if (!job) {
    return { processed: false };
  }

  const jobId = job.id;
  const eventId = job.event_id;
  const locale = zipEmailLocale(job.locale);
  const now = () => new Date().toISOString();
  await db.from("media_zip_exports").update({ started_at: now() }).eq("id", jobId);

  // Ready/failed e-mail to the organizer; records when it went out for the status page's timeline.
  const notify = async (kind: "ready" | "failed") => {
    const { data: ev } = await db.from("events").select("title, organizer_id").eq("id", eventId).maybeSingle();
    const organizerId = typeof ev?.organizer_id === "string" ? ev.organizer_id : "";
    const to = organizerId ? await organizerEmail(db, organizerId) : null;
    if (!to) {
      console.warn("[zip-export] no organizer email for notify");
      return;
    }
    const sent = await sendZipExportEmail({
      kind,
      to,
      locale,
      eventTitle: emailEventTitle(ev?.title),
      statusUrl: zipStatusUrl(eventId, jobId),
      photoUrls: await emailPhotoUrls(db, eventId),
    });
    if (sent.ok) await db.from("media_zip_exports").update({ emailed_result_at: now() }).eq("id", jobId);
    else logZipExportEmailSkipped(kind, sent.error);
  };

  try {
    const { data: ev, error: evErr } = await db.from("events").select("id").eq("id", eventId).maybeSingle();
    if (evErr || !ev) {
      throw new Error("Event not found");
    }

    const storagePath = `exports/${eventId}/${jobId}.zip`;
    const zipBytes = await streamZipToStorage(db, eventId, job.include_videos, storagePath, async (done, total) => {
      // Best effort: a missed progress write must never fail the export itself.
      await db.from("media_zip_exports").update({ progress_done: done, progress_total: total }).eq("id", jobId);
    });

    const expiresAt = new Date(Date.now() + ZIP_EXPORT_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    const { error: upRowErr } = await db
      .from("media_zip_exports")
      .update({
        status: "ready",
        storage_path: storagePath,
        file_size_bytes: zipBytes,
        expires_at: expiresAt,
        finished_at: now(),
        updated_at: now(),
      })
      .eq("id", jobId);

    if (upRowErr) throw new Error(upRowErr.message);

    // The ZIP is ready either way; an e-mail problem must not turn it into a failure.
    await notify("ready").catch((err) => console.error("[zip-export] ready notify", err));
    return { processed: true, jobId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Export failed";
    const safe = "Could not build the ZIP. Try again or contact support.";

    await db
      .from("media_zip_exports")
      .update({
        status: "failed",
        error_message: safe,
        failed_item: e instanceof ZipItemError ? e.item : null,
        finished_at: now(),
        updated_at: now(),
      })
      .eq("id", jobId);

    try {
      await notify("failed");
    } catch {
      console.error("[zip-export] failed notify branch", msg);
    }

    return { processed: true, jobId };
  }
}
