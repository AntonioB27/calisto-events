import { describe, expect, it } from "vitest";

import { buildZipExportEmail, zipEmailLocale } from "./zip-export-email";

describe("buildZipExportEmail", () => {
  it("writes the started e-mail in the organizer's language with the status link", () => {
    const { subject, html } = buildZipExportEmail({
      kind: "started",
      locale: "hr",
      eventTitle: "Ana & Marko",
      statusUrl: "https://example.com/events/e1/zip/j1",
      photoUrls: ["https://cdn/a.jpg"],
    });
    expect(subject).toBe("Pakiramo vaš album: Ana & Marko");
    expect(html).toContain("Prati napredak");
    expect(html).toContain('href="https://example.com/events/e1/zip/j1"');
    expect(html).toContain("<strong>Ana &amp; Marko</strong>");
    expect(html).toContain('src="https://cdn/a.jpg"');
  });

  it("escapes the event title and falls back to English", () => {
    const { html } = buildZipExportEmail({
      kind: "ready",
      locale: zipEmailLocale("xx"),
      eventTitle: "<script>",
      statusUrl: "https://x",
      photoUrls: [],
    });
    expect(html).toContain("Download the album");
    expect(html).not.toContain("<script>");
  });
});
