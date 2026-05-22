import { describe, expect, it } from "vitest";
import { resolveDemoRole, resolveDemoTab } from "./demo-role";

describe("resolveDemoRole", () => {
  it("defaults to organizer when undefined", () => {
    expect(resolveDemoRole(undefined)).toBe("organizer");
  });

  it("accepts 'guest'", () => {
    expect(resolveDemoRole("guest")).toBe("guest");
  });

  it("accepts 'organizer'", () => {
    expect(resolveDemoRole("organizer")).toBe("organizer");
  });

  it("falls back to organizer for unknown values", () => {
    expect(resolveDemoRole("admin")).toBe("organizer");
    expect(resolveDemoRole("")).toBe("organizer");
  });
});

describe("resolveDemoTab", () => {
  it("defaults to overview when undefined", () => {
    expect(resolveDemoTab(undefined)).toBe("overview");
  });

  it("accepts valid tab ids", () => {
    expect(resolveDemoTab("gallery")).toBe("gallery");
    expect(resolveDemoTab("guests")).toBe("guests");
    expect(resolveDemoTab("share")).toBe("share");
    expect(resolveDemoTab("overview")).toBe("overview");
  });

  it("falls back to overview for unknown values", () => {
    expect(resolveDemoTab("settings")).toBe("overview");
    expect(resolveDemoTab("unknown")).toBe("overview");
  });
});
