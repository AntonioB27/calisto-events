import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { PhotoLightbox } from "@/components/app-ui/PhotoLightbox";

const copy = {
  lightboxAria: "Photo lightbox",
  closeLightboxAria: "Close lightbox",
  heartLikeAria: "Like this photo",
  heartUnlikeAria: "Unlike this photo",
  likeCount: (count: number) => `${count} likes`,
  likersHeading: "Liked by",
  likersEmpty: "No likes yet",
  toggleFail: "Could not update like.",
};

describe("PhotoLightbox", () => {
  it("renders like count and heart control", () => {
    const html = renderToStaticMarkup(
      createElement(PhotoLightbox, {
        signedUrl: "https://example.com/photo.jpg",
        likeCount: 3,
        likedByMe: false,
        canViewLikers: false,
        likers: [],
        likersLoading: false,
        togglePending: false,
        toggleError: null,
        copy,
        onClose: vi.fn(),
        onToggleLike: vi.fn(),
      }),
    );
    expect(html).toContain("3 likes");
    expect(html).toContain('aria-label="Like this photo"');
  });

  it("shows likers list when viewer can see names", () => {
    const html = renderToStaticMarkup(
      createElement(PhotoLightbox, {
        signedUrl: "https://example.com/photo.jpg",
        likeCount: 1,
        likedByMe: true,
        canViewLikers: true,
        likers: [{ userId: "u1", label: "Alex" }],
        likersLoading: false,
        togglePending: false,
        toggleError: null,
        copy,
        onClose: vi.fn(),
        onToggleLike: vi.fn(),
      }),
    );
    expect(html).toContain("Liked by");
    expect(html).toContain("Alex");
  });

  it("hides likers section when viewer cannot see names", () => {
    const html = renderToStaticMarkup(
      createElement(PhotoLightbox, {
        signedUrl: "https://example.com/photo.jpg",
        likeCount: 2,
        likedByMe: false,
        canViewLikers: false,
        likers: [{ userId: "u1", label: "Alex" }],
        likersLoading: false,
        togglePending: false,
        toggleError: null,
        copy,
        onClose: vi.fn(),
        onToggleLike: vi.fn(),
      }),
    );
    expect(html).not.toContain("Alex");
    expect(html).not.toContain("Liked by");
  });
});
