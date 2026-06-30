import { describe, expect, it } from "vitest";
import { ANALYTICS_EVENTS } from "./analytics-events";

describe("ANALYTICS_EVENTS", () => {
  it("has all required funnel event names as non-empty strings", () => {
    const required = [
      "create_event_step1_viewed",
      "create_event_step1_completed",
      "create_event_step2_viewed",
      "create_event_step2_completed",
      "create_event_step3_viewed",
      "create_event_step3_completed",
      "create_event_completed",
    ];
    for (const name of required) {
      expect(Object.values(ANALYTICS_EVENTS)).toContain(name);
    }
  });

  it("has no duplicate values", () => {
    const values = Object.values(ANALYTICS_EVENTS);
    expect(new Set(values).size).toBe(values.length);
  });
});
