import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MediaLikeBadge } from "@/components/app-ui/MediaLikeBadge";

describe("MediaLikeBadge", () => {
  it("renders heart and like count", () => {
    const html = renderToStaticMarkup(
      createElement(MediaLikeBadge, {
        liked: true,
        count: 5,
        pending: false,
        likeAria: "Like",
        unlikeAria: "Unlike",
        onToggle: vi.fn(),
      }),
    );
    expect(html).toContain("5");
    expect(html).toContain('aria-pressed="true"');
  });
});
