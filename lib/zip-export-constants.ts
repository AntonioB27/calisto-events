/** Hours until the ZIP object is deleted from Storage after job becomes ready. */
export const ZIP_EXPORT_EXPIRY_HOURS = 24;

/** Max ZIP jobs the cron worker will pick up per invocation. */
export const ZIP_EXPORT_BATCH_LIMIT = 2;

/** Max media items per ZIP; refuse larger jobs in POST with clear error. */
export const ZIP_MAX_MEDIA_ITEMS = 2000;

/** Signed URL TTL for the browser download hop (seconds). */
export const ZIP_SIGNED_URL_SECONDS = 120;
