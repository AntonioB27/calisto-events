import { describe, expect, it } from "vitest";
import { buildEventInviteShareText, getWebJoinUrl } from "./join-link";

describe("getWebJoinUrl", () => {
  it("builds join path with normalized code", () => {
    expect(getWebJoinUrl("https://calisto-events.com", "  abc123  ")).toBe(
      "https://calisto-events.com/join/ABC123",
    );
  });

  it("strips trailing slash on origin", () => {
    expect(getWebJoinUrl("https://example.com/", "XYZ")).toBe("https://example.com/join/XYZ");
  });
});

describe("buildEventInviteShareText", () => {
  it("uses friendly template by default tone", () => {
    const text = buildEventInviteShareText({
      eventTitle: "Sam & Alex",
      accessCode: "PARTY",
      joinLink: "https://x.com/join/PARTY",
      template: "friendly",
    });
    expect(text).toContain("You're invited to");
    expect(text).toContain("PARTY");
    expect(text).toContain("https://x.com/join/PARTY");
  });

  it("supports formal intro", () => {
    const text = buildEventInviteShareText({
      eventTitle: "Gala",
      accessCode: "G1",
      joinLink: "https://x/j",
      template: "formal",
    });
    expect(text).toContain("cordially invited");
  });
});
