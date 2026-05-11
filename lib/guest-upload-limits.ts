/** Server-side caps per upload (bytes). Align with Supabase Storage project limits. */

export const GUEST_UPLOAD_MAX_PHOTO_BYTES = 35 * 1024 * 1024;

export const GUEST_UPLOAD_MAX_VIDEO_BYTES = 280 * 1024 * 1024;

export function maxGuestUploadBytesForMime(mimeType: string): number {
  if (mimeType.startsWith("video/")) return GUEST_UPLOAD_MAX_VIDEO_BYTES;
  return GUEST_UPLOAD_MAX_PHOTO_BYTES;
}
