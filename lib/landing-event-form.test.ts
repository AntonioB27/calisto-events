import { describe, expect, test } from "vitest";
import { buildPlanStartUrl } from "./landing-event-form";

describe("buildPlanStartUrl", () => {
  test("includes step=3, name, date, planId", () => {
    const url = buildPlanStartUrl("Birthday Party", "2026-12-25", "🎉", "premium");
    const parsed = new URL(url, "http://x");
    expect(parsed.pathname).toBe("/events/new");
    expect(parsed.searchParams.get("step")).toBe("3");
    expect(parsed.searchParams.get("name")).toBe("Birthday Party");
    expect(parsed.searchParams.get("date")).toBe("2026-12-25");
    expect(parsed.searchParams.get("planId")).toBe("premium");
    expect(parsed.searchParams.get("emoji")).toBe("🎉");
  });

  test("omits emoji param when empty string", () => {
    const url = buildPlanStartUrl("Test", "2026-01-01", "", "free");
    expect(url).not.toContain("emoji");
  });

  test("URL-encodes spaces in event name", () => {
    const url = buildPlanStartUrl("My Big Wedding", "2026-06-15", "", "standard");
    const parsed = new URL(url, "http://x");
    expect(parsed.searchParams.get("name")).toBe("My Big Wedding");
  });
});
