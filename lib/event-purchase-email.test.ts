import { describe, expect, it } from "vitest";

import { __test } from "./event-purchase-email";

const { getPurchaseTemplate, purchaseHtml, purchaseText } = __test;

const baseArgs = {
  eventTitle: "🎉 Ana & Marko",
  accessCode: "AB12CD34",
  eventUrl: "https://calisto-events.com/events/evt_123",
} as const;

describe("event-purchase-email", () => {
  it("renders a distinct template for each locale", () => {
    const en = getPurchaseTemplate("en", baseArgs.eventTitle);
    const hr = getPurchaseTemplate("hr", baseArgs.eventTitle);
    const de = getPurchaseTemplate("de", baseArgs.eventTitle);

    expect(en.title).toBe("💛 Thank you for your Calisto Events purchase!");
    expect(hr.title).toBe("💛 Hvala vam na kupnji Calisto Events paketa!");
    expect(de.title).toBe("💛 Vielen Dank für deinen Kauf eines Calisto Events Pakets!");

    // Event title is woven into every subject line.
    for (const t of [en, hr, de]) {
      expect(t.subject).toContain(baseArgs.eventTitle);
    }
  });

  it("includes the access code and CTA link in the HTML", () => {
    const html = purchaseHtml({ locale: "en", ...baseArgs });
    expect(html).toContain(baseArgs.accessCode);
    expect(html).toContain(`href="${baseArgs.eventUrl}"`);
    expect(html).toContain("Open your event");
    expect(html).toContain("Thank you for your Calisto Events purchase!");
  });

  it("escapes untrusted values in the HTML", () => {
    const html = purchaseHtml({
      locale: "en",
      eventTitle: "🎉 Ana & Marko",
      accessCode: '<script>alert("x")</script>',
      eventUrl: "https://calisto-events.com/events/evt_123",
    });
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("produces a plaintext variant with the code and link", () => {
    const text = purchaseText({ locale: "de", ...baseArgs });
    expect(text).toContain(baseArgs.accessCode);
    expect(text).toContain(baseArgs.eventUrl);
    expect(text).toContain("Vielen Dank für deinen Kauf");
  });
});
