import { notFound } from "next/navigation";

import { splitEventTitleStored } from "@/lib/event-title";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { maskEmail, ZIP_STATUS_COLUMNS, type ZipJob } from "@/lib/zip-export-view";

import { ZipStatusView, type ZipHistoryItem } from "./ZipStatusView";

type Props = Readonly<{ params: Promise<{ id: string; jobId: string }> }>;

const PRINTS = 12;

/** Status page for one gallery ZIP (linked from the e-mails and the dock). Primary organizer only. */
export default async function ZipStatusPage({ params }: Props) {
  const { id, jobId } = await params;
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event } = await supabase.from("events").select("id, title, organizer_id").eq("id", id).maybeSingle();
  if (!user || !event || event.organizer_id !== user.id) notFound();

  const { data: job } = await supabase
    .from("media_zip_exports")
    .select(ZIP_STATUS_COLUMNS)
    .eq("id", jobId)
    .eq("event_id", id)
    .maybeSingle();
  if (!job) notFound();

  const [photos, videos, sizes, latest, history] = await Promise.all([
    supabase.from("media_items").select("*", { count: "exact", head: true }).eq("event_id", id).not("mime_type", "ilike", "video/%"),
    supabase.from("media_items").select("*", { count: "exact", head: true }).eq("event_id", id).ilike("mime_type", "video/%"),
    supabase.from("media_items").select("size_bytes, mime_type").eq("event_id", id).range(0, 1999),
    supabase
      .from("media_items")
      .select("storage_path, thumbnail_path, mime_type")
      .eq("event_id", id)
      .order("created_at", { ascending: false })
      .limit(36),
    supabase
      .from("media_zip_exports")
      .select("id, status, include_videos, created_at, file_size_bytes")
      .eq("event_id", id)
      .neq("id", jobId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Null mime types count as photos, like the export itself.
  const { count: nullMime } = await supabase
    .from("media_items")
    .select("*", { count: "exact", head: true })
    .eq("event_id", id)
    .is("mime_type", null);
  const photoCount = (photos.count ?? 0) + (nullMime ?? 0);
  const videoCount = videos.count ?? 0;

  // Size estimate for the package; the API may cap rows, so scale the sum up.
  const sizeRows = (sizes.data ?? []) as { size_bytes: number | null; mime_type: string | null }[];
  const included = sizeRows.filter((r) => job.include_videos || !r.mime_type?.startsWith("video/"));
  const expected = job.include_videos ? photoCount + videoCount : photoCount;
  const scale = included.length > 0 && expected > included.length ? expected / included.length : 1;
  const estimatedBytes = included.reduce((sum, r) => sum + (r.size_bytes ?? 0), 0) * scale;

  const paths = ((latest.data ?? []) as { storage_path: string; thumbnail_path: string | null; mime_type: string | null }[])
    .filter((r) => !r.mime_type?.startsWith("video/") || r.thumbnail_path)
    .slice(0, PRINTS)
    .map((r) => r.thumbnail_path ?? r.storage_path);
  const thumbs =
    paths.length > 0
      ? ((await supabase.storage.from("event-media").createSignedUrls(paths, 3600)).data ?? []).flatMap((s: { signedUrl: string | null }) =>
          s.signedUrl ? [s.signedUrl] : [],
        )
      : [];

  return (
    <ZipStatusView
      eventId={id}
      eventName={splitEventTitleStored(String(event.title ?? "")).name}
      initialJob={job as ZipJob}
      photoCount={photoCount}
      videoCount={videoCount}
      estimatedBytes={estimatedBytes}
      thumbs={thumbs}
      maskedEmail={user.email ? maskEmail(user.email) : null}
      history={(history.data ?? []) as ZipHistoryItem[]}
    />
  );
}
