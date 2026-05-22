import { describe, expect, it } from "vitest";
import { DEMO_EVENT, DEMO_GUESTS, DEMO_PHOTOS } from "./demo-event";

describe("demo-event data", () => {
  it("event has a valid YYYY-MM-DD date", () => {
    expect(DEMO_EVENT.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("event has a non-empty access code", () => {
    expect(DEMO_EVENT.accessCode.length).toBeGreaterThan(0);
  });

  it("has at least 5 guests", () => {
    expect(DEMO_GUESTS.length).toBeGreaterThanOrEqual(5);
  });

  it("every guest has a non-empty name and valid role", () => {
    const validRoles = new Set(["organizer", "guest", "co_organizer"]);
    for (const g of DEMO_GUESTS) {
      expect(g.name.length).toBeGreaterThan(0);
      expect(validRoles.has(g.role)).toBe(true);
    }
  });

  it("has at least 6 photos", () => {
    expect(DEMO_PHOTOS.length).toBeGreaterThanOrEqual(6);
  });

  it("all photo src paths start with /demo/", () => {
    for (const p of DEMO_PHOTOS) {
      expect(p.src).toMatch(/^\/demo\//);
    }
  });

  it("event plan is a valid PlanId", () => {
    const valid = new Set(["free", "standard", "plus", "premium", "max"]);
    expect(valid.has(DEMO_EVENT.plan)).toBe(true);
  });
});
