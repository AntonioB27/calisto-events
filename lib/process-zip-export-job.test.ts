import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/zip-export-email", () => ({
  sendZipExportEmail: vi.fn(async () => ({ ok: true })),
  zipEmailLocale: () => "en",
}));

import { processNextZipExportJob } from "./process-zip-export-job";

type Update = Record<string, unknown>;

/** Minimal Supabase stand-in: one queued job, `files` in storage, records row updates and the uploaded bytes. */
function fakeDb(files: Record<string, Buffer>, uploadFails = false, brokenPath: string | null = null) {
  const updates: Update[] = [];
  let uploaded: Buffer | null = null;

  const query = (rows: unknown) => {
    const q = {
      select: () => q,
      eq: () => q,
      or: () => q,
      maybeSingle: async () => ({ data: { title: "Test", organizer_id: "org-1" }, error: null }),
      update: (u: Update) => {
        updates.push(u);
        return { eq: async () => ({ error: null }) };
      },
      then: (res: (v: unknown) => unknown) => res({ data: rows, error: null }),
    };
    return q;
  };

  const media = Object.keys(files).map((p, i) => ({ id: `id-${i}-xxxxxxxx`, storage_path: p, mime_type: "image/jpeg" }));

  const db = {
    rpc: async () => ({ data: { id: "job-1", event_id: "ev-1", include_videos: true, requested_by: "org-1" }, error: null }),
    from: (table: string) => query(table === "media_items" ? media : null),
    auth: { admin: { getUserById: async () => ({ data: { user: { email: "o@example.com" } }, error: null }) } },
    storage: {
      from: () => ({
        download: async (p: string) =>
          p === brokenPath ? { data: null, error: { message: "Object not found" } } : { data: new Blob([new Uint8Array(files[p])]), error: null },
        createSignedUrls: async () => ({ data: [], error: null }),
        upload: async (_path: string, body: AsyncIterable<Buffer>) => {
          if (uploadFails) return { error: { message: "Payload too large" } };
          const chunks: Buffer[] = [];
          for await (const c of body) chunks.push(c);
          uploaded = Buffer.concat(chunks);
          return { error: null };
        },
      }),
    },
  } as unknown as SupabaseClient;

  return { db, updates, uploaded: () => uploaded };
}

describe("processNextZipExportJob", () => {
  it("streams every media file into the uploaded ZIP and records its size", async () => {
    const files = {
      "a/one.jpg": Buffer.alloc(3 * 1024 * 1024, 1),
      "a/two.jpg": Buffer.alloc(2 * 1024 * 1024, 2),
      "a/three.mp4": Buffer.from("tiny"),
    };
    const { db, updates, uploaded } = fakeDb(files);

    await expect(processNextZipExportJob(db)).resolves.toEqual({ processed: true, jobId: "job-1" });

    const zip = uploaded();
    expect(zip).not.toBeNull();
    // End-of-central-directory record: total entry count at offset 10 of the last 22 bytes.
    expect(zip!.readUInt16LE(zip!.length - 22 + 10)).toBe(3);
    expect(updates.find((u) => u.status)).toMatchObject({ status: "ready", file_size_bytes: zip!.length });
    // Progress starts at 0 and the last report covers every file.
    expect(updates).toContainEqual({ progress_done: 0, progress_total: 3 });
    expect(updates).toContainEqual({ progress_done: 3, progress_total: 3 });
  });

  it("marks the job failed (and does not hang) when the upload is rejected", async () => {
    const { db, updates } = fakeDb({ "a/big.jpg": Buffer.alloc(8 * 1024 * 1024, 3) }, true);

    await expect(processNextZipExportJob(db)).resolves.toEqual({ processed: true, jobId: "job-1" });
    expect(updates.find((u) => u.status)).toMatchObject({ status: "failed", failed_item: null });
  });

  it("records which file broke the export and stamps start, finish and the result e-mail", async () => {
    const files = { "ev/a.jpg": Buffer.from("a"), "ev/VID_2207.mov": Buffer.from("b") };
    const { db, updates } = fakeDb(files, false, "ev/VID_2207.mov");

    await processNextZipExportJob(db);

    expect(updates[0]).toHaveProperty("started_at");
    const failed = updates.find((u) => u.status === "failed");
    expect(failed).toMatchObject({ failed_item: "VID_2207.mov" });
    expect(failed).toHaveProperty("finished_at");
    expect(updates.at(-1)).toHaveProperty("emailed_result_at");
  });
});
