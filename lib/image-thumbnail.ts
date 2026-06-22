import sharp from "sharp";

/**
 * Resize an image to fit within 600×600px and re-encode as JPEG at 80% quality.
 * Returns null for non-image MIME types or if Sharp cannot decode the input.
 */
export async function generateImageThumbnail(
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<Buffer | null> {
  if (!mimeType.startsWith("image/")) return null;
  try {
    return await sharp(Buffer.from(buffer))
      .rotate()
      .resize(600, 600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch {
    return null;
  }
}
