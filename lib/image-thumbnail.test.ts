import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { generateImageThumbnail } from "./image-thumbnail";

async function pngBuffer(width: number, height: number): Promise<ArrayBuffer> {
  const buf = await sharp({
    create: { width, height, channels: 3, background: { r: 255, g: 0, b: 0 } },
  })
    .png()
    .toBuffer();
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

describe("generateImageThumbnail", () => {
  it("returns a Buffer for a valid image mime type", async () => {
    const input = await pngBuffer(800, 600);
    const result = await generateImageThumbnail(input, "image/png");
    expect(result).toBeInstanceOf(Buffer);
    expect(result!.length).toBeGreaterThan(0);
  });

  it("resizes so neither dimension exceeds 600px", async () => {
    const input = await pngBuffer(1200, 900);
    const result = await generateImageThumbnail(input, "image/jpeg");
    const meta = await sharp(result!).metadata();
    expect(meta.width).toBeLessThanOrEqual(600);
    expect(meta.height).toBeLessThanOrEqual(600);
  });

  it("does not enlarge images already smaller than 600px", async () => {
    const input = await pngBuffer(300, 200);
    const result = await generateImageThumbnail(input, "image/jpeg");
    const meta = await sharp(result!).metadata();
    expect(meta.width).toBeLessThanOrEqual(300);
    expect(meta.height).toBeLessThanOrEqual(200);
  });

  it("returns null for video mime types", async () => {
    const input = new ArrayBuffer(8);
    const result = await generateImageThumbnail(input, "video/mp4");
    expect(result).toBeNull();
  });

  it("returns null for corrupt image data", async () => {
    const corrupt = new ArrayBuffer(10);
    const result = await generateImageThumbnail(corrupt, "image/jpeg");
    expect(result).toBeNull();
  });

  it("applies EXIF orientation instead of leaving the thumbnail sideways", async () => {
    // Landscape pixel data tagged with EXIF orientation 6 (rotate 90° CW to display correctly),
    // as produced by phone cameras for portrait shots.
    const buf = await sharp({
      create: { width: 800, height: 600, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();
    const input = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;

    const result = await generateImageThumbnail(input, "image/jpeg");
    const meta = await sharp(result!).metadata();

    // Orientation should be baked into the pixels (portrait) and the tag cleared, not left for
    // a viewer to apply on top of an already-reoriented thumbnail.
    expect(meta.width).toBeLessThan(meta.height!);
    expect(meta.orientation ?? 1).toBe(1);
  });
});
