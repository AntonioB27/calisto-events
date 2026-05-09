import { describe, expect, it } from "vitest";

import { composeEventTitle, displayNavEmoji, splitEventTitleStored } from "./event-title";

describe("event-title", () => {
  it("splits stored emoji prefix from name", () => {
    expect(splitEventTitleStored("🎉 Summer party")).toEqual({ emoji: "🎉", name: "Summer party" });
  });

  it("treats titles without a prefix as name-only", () => {
    expect(splitEventTitleStored("Engagement")).toEqual({ emoji: "", name: "Engagement" });
  });

  it("does not treat the first word of a spaced name as an icon", () => {
    expect(splitEventTitleStored("Kyle & Laura")).toEqual({ emoji: "", name: "Kyle & Laura" });
    expect(splitEventTitleStored("Summer party photos")).toEqual({ emoji: "", name: "Summer party photos" });
  });

  it("still splits real emoji prefixes from names that contain spaces", () => {
    expect(splitEventTitleStored("📅 Kyle & Laura")).toEqual({ emoji: "📅", name: "Kyle & Laura" });
    expect(splitEventTitleStored("🎉 Summer party")).toEqual({ emoji: "🎉", name: "Summer party" });
  });

  it("composes emoji and name", () => {
    expect(composeEventTitle("🎉", "Launch")).toBe("🎉 Launch");
  });

  it("composes name only when emoji blank", () => {
    expect(composeEventTitle("", "Launch")).toBe("Launch");
  });

  it("fills nav fallback emoji", () => {
    expect(displayNavEmoji("")).toBe("📅");
    expect(displayNavEmoji("🎊")).toBe("🎊");
  });
});
