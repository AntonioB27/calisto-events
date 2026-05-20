import { describe, expect, it } from "vitest";

import { toThumbnailUrl } from "./supabase-storage-transform";

const BASE = "https://abc.supabase.co/storage/v1/object/sign/event-media/events/uuid/photo.jpg?token=JWT123";

describe("toThumbnailUrl", () => {
  it("replaces the object path prefix with the render prefix", () => {
    const result = toThumbnailUrl(BASE);
    expect(result).toContain("/storage/v1/render/image/sign/");
    expect(result).not.toContain("/storage/v1/object/sign/");
  });

  it("appends width and quality params", () => {
    const result = toThumbnailUrl(BASE);
    expect(result).toContain("&width=400");
    expect(result).toContain("&quality=80");
  });

  it("preserves the original token and path", () => {
    const result = toThumbnailUrl(BASE);
    expect(result).toContain("token=JWT123");
    expect(result).toContain("event-media/events/uuid/photo.jpg");
  });

  it("returns the url unchanged when the prefix is not present", () => {
    const other = "https://other.cdn.com/image.jpg?token=XYZ";
    expect(toThumbnailUrl(other)).toBe(other + "&width=400&quality=80");
  });

  it("uses ? separator when the url has no existing query string", () => {
    const noQuery = "https://other.cdn.com/image.jpg";
    const result = toThumbnailUrl(noQuery);
    expect(result).toBe("https://other.cdn.com/image.jpg?width=400&quality=80");
  });
});
