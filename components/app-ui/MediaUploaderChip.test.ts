import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MediaUploaderChip } from "@/components/app-ui/MediaUploaderChip";

describe("MediaUploaderChip", () => {
  it("shows uploader label for other users uploads", () => {
    const html = renderToStaticMarkup(
      createElement(MediaUploaderChip, {
        label: "Alex",
        isMine: false,
        mineAria: "Your upload",
      }),
    );
    expect(html).toContain("Alex");
    expect(html).not.toContain('aria-label="Your upload"');
  });

  it("shows user icon for own uploads", () => {
    const html = renderToStaticMarkup(
      createElement(MediaUploaderChip, {
        label: "Alex",
        isMine: true,
        mineAria: "Your upload",
      }),
    );
    expect(html).toContain("Alex");
    expect(html).toContain('aria-label="Your upload"');
  });
});
