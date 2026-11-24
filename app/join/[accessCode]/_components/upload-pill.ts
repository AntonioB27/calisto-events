export type UploadStatus = "pending" | "done" | "error";
export type UploadPillPhase = "hidden" | "uploading" | "done" | "failed";

/** How long the gold "all uploaded" pill stays before it fades out. */
export const UPLOAD_DONE_HIDE_MS = 4000;
export const UPLOAD_FADE_MS = 400;

export function uploadPillPhase(items: readonly { status: UploadStatus }[]): UploadPillPhase {
  if (items.length === 0) return "hidden";
  if (items.some((i) => i.status === "pending")) return "uploading";
  if (items.some((i) => i.status === "error")) return "failed";
  return "done";
}

/**
 * Once everything succeeded and the list is closed: fade the pill, then clear the finished items.
 * Failures never auto-hide; they wait for a retry or Dismiss. Returns the effect cleanup.
 */
export function scheduleAutoHide(
  phase: UploadPillPhase,
  listOpen: boolean,
  fade: () => void,
  clear: () => void,
): (() => void) | undefined {
  if (phase !== "done" || listOpen) return undefined;
  const fadeId = setTimeout(fade, UPLOAD_DONE_HIDE_MS);
  const clearId = setTimeout(clear, UPLOAD_DONE_HIDE_MS + UPLOAD_FADE_MS);
  return () => {
    clearTimeout(fadeId);
    clearTimeout(clearId);
  };
}
