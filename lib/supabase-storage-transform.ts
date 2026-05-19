export function toThumbnailUrl(signedUrl: string): string {
  return signedUrl
    .replace("/storage/v1/object/sign/", "/storage/v1/render/image/sign/")
    + "&width=400&quality=80";
}
