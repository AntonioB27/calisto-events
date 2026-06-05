import { describe, it, expect } from "vitest";
import { buildReactionHtml, renderPostHtml } from "./blog";

describe("buildReactionHtml", () => {
  it("produces an img pointing to the correct mascot path", () => {
    const html = buildReactionHtml({ mascot: "aurora_camera", quote: "Hello" });
    expect(html).toContain('src="/brand/mascot/aurora_camera.png"');
  });

  it("includes the quote text", () => {
    const html = buildReactionHtml({ mascot: "aurora", quote: "Test quote" });
    expect(html).toContain("Test quote");
  });

  it("wraps output in .aurora-reaction", () => {
    const html = buildReactionHtml({ mascot: "aurora", quote: "x" });
    expect(html).toContain('class="aurora-reaction"');
  });
});

describe("renderPostHtml", () => {
  it("injects reaction card before the first H2", () => {
    const md = "## Section One\n\nBody text.";
    const html = renderPostHtml(md, [
      { mascot: "aurora_happy", quote: "Great section!" },
    ]);
    const reactionPos = html.indexOf("aurora-reaction");
    const h2Pos = html.indexOf("<h2>");
    expect(reactionPos).toBeGreaterThanOrEqual(0);
    expect(reactionPos).toBeLessThan(h2Pos);
  });

  it("renders post with no reactions as plain HTML without any reaction cards", () => {
    const md = "## Hello\n\nWorld.";
    const html = renderPostHtml(md, []);
    expect(html).not.toContain("aurora-reaction");
    expect(html).toContain("<h2>");
  });
});
