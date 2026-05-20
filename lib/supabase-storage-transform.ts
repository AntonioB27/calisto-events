export function toThumbnailUrl(signedUrl: string): string {
  const transformed = signedUrl.replace(
    "/storage/v1/object/sign/",
    "/storage/v1/render/image/sign/",
  );
  const separator = transformed.includes("?") ? "&" : "?";
  return transformed + separator + "width=400&quality=80";
}
