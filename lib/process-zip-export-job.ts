import type { SupabaseClient } from "@supabase/supabase-js";
import { PassThrough } from "node:stream";
import { finished } from "node:stream/promises";

import { ZIP_EXPORT_EXPIRY_HOURS } from "@/lib/zip-export-constants";
import { sendZipExportEmail } from "@/lib/zip-export-email";

/** archiver@8 is ESM (`ZipArchive`); keep a minimal surface for our usage. */
type ZipArchiveInstance = {
  pipe: (dest: NodeJS.WritableStream) => unknown;
  append: (source: Buffer | string, data?: { name: string }) => unknown;
  finalize: () => Promise<void>;
  on: (event: "error", listener: (err: Error) => void) => unknown;
};

async function createZipArchive(): Promise<ZipArchiveInstance> {
  const mod = (await import("archiver")) as unknown as {
    ZipArchive: new (options?: { zlib?: { level?: number } }) => ZipArchiveInstance;
  };
  return new mod.ZipArchive({ zlib: { level: 6 } });
}

function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "http://localhost:3000";
}

function galleryUrlForEvent(eventId: string): string {
  return `${siteOrigin()}/events/${eventId}?tab=gallery`;
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
};

function asClaimedJob(data: unknown): ClaimedJobRow | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const event_id = typeof o.event_id === "string" ? o.event_id : "";
  const requested_by = typeof o.requested_by === "string" ? o.requested_by : "";
  const include_videos = Boolean(o.include_videos);
  if (!id || !event_id) return null;
  return { id, event_id, include_videos, requested_by };
}

async function organizerEmail(db: SupabaseClient, organizerId: string): Promise<string | null> {
  const { data, error } = await db.auth.admin.getUserById(organizerId);
  if (error || !data?.user?.email) return null;
  return data.user.email;
}

async function buildZipBuffer(
  db: SupabaseClient,
  eventId: string,
  includeVideos: boolean,
): Promise<Buffer> {
  let q = db.from("media_items").select("id, storage_path, mime_type").eq("event_id", eventId);
  if (!includeVideos) {
    q = q.or("mime_type.is.null,mime_type.ilike.image/%");
  }
  const { data: media, error } = await q;
  if (error) throw new Error(error.message);

  const rows = (media ?? []) as { id: string; storage_path: string; mime_type: string | null }[];

  const archive = await createZipArchive();
  const pass = new PassThrough();
  const chunks: Buffer[] = [];
  pass.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
  archive.pipe(pass);

  if (rows.length === 0) {
    archive.append("No media matched this export.\n", { name: "README.txt" });
  }

  for (const row of rows) {
    const { data: blob, error: dlErr } = await db.storage.from("event-media").download(row.storage_path);
    if (dlErr || !blob) {
      throw new Error(dlErr?.message ?? "download failed");
    }
    const buf = Buffer.from(await blob.arrayBuffer());
    archive.append(buf, { name: safeZipEntryName(row.storage_path, row.id) });
  }

  const waitEnd = finished(pass);
  await archive.finalize();
  await waitEnd;

  return Buffer.concat(chunks);
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

  try {
    const { data: ev, error: evErr } = await db
      .from("events")
      .select("title, organizer_id")
      .eq("id", eventId)
      .maybeSingle();

    if (evErr || !ev) {
      throw new Error("Event not found");
    }

    const organizerId =
      typeof (ev as { organizer_id?: unknown }).organizer_id === "string"
        ? (ev as { organizer_id: string }).organizer_id
        : "";
    const eventTitle = String((ev as { title?: unknown }).title ?? "Event").trim() || "Event";

    const zipBuffer = await buildZipBuffer(db, eventId, job.include_videos);
    const storagePath = `exports/${eventId}/${jobId}.zip`;

    const { error: upErr } = await db.storage.from("event-media").upload(storagePath, zipBuffer, {
      contentType: "application/zip",
      upsert: true,
    });
    if (upErr) throw new Error(upErr.message);

    const expiresAt = new Date(Date.now() + ZIP_EXPORT_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    const { error: upRowErr } = await db
      .from("media_zip_exports")
      .update({
        status: "ready",
        storage_path: storagePath,
        file_size_bytes: zipBuffer.length,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (upRowErr) throw new Error(upRowErr.message);

    const to = await organizerEmail(db, organizerId);
    if (to) {
      const r = await sendZipExportEmail({
        kind: "ready",
        to,
        eventTitle,
        galleryUrl: galleryUrlForEvent(eventId),
        jobId,
      });
      if (!r.ok) console.warn("[zip-export] ready email skipped:", r.error);
    } else {
      console.warn("[zip-export] no organizer email for notify");
    }

    return { processed: true, jobId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Export failed";
    const safe = "Could not build the ZIP. Try again or contact support.";

    await db
      .from("media_zip_exports")
      .update({
        status: "failed",
        error_message: safe,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    try {
      const { data: evFail } = await db
        .from("events")
        .select("title, organizer_id")
        .eq("id", eventId)
        .maybeSingle();
      const organizerId =
        evFail && typeof (evFail as { organizer_id?: unknown }).organizer_id === "string"
          ? (evFail as { organizer_id: string }).organizer_id
          : "";
      const eventTitle =
        evFail && typeof (evFail as { title?: unknown }).title === "string"
          ? String((evFail as { title: string }).title).trim() || "Event"
          : "Event";
      const to = organizerId ? await organizerEmail(db, organizerId) : null;
      if (to) {
        await sendZipExportEmail({
          kind: "failed",
          to,
          eventTitle,
          galleryUrl: galleryUrlForEvent(eventId),
          jobId,
        });
      }
    } catch {
      console.error("[zip-export] failed notify branch", msg);
    }

    return { processed: true, jobId };
  }
}
