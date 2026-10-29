import { describe, expect, it } from "vitest";

import { prepSteps, type PrepData } from "./prep-items";

const base: PrepData = { rows: [], guests: 0, coOrganizers: 0, rsvpConfirmed: 0, moderationEnabled: false };

describe("prepSteps", () => {
  it("shows every step to the organizer, none done on a fresh event", () => {
    const steps = prepSteps(base, [], true);
    expect(steps.map((s) => s.step)).toEqual(["invites", "qr", "share", "co", "moderation", "peek"]);
    expect(steps.every((s) => !s.done && !s.auto)).toBe(true);
  });

  it("hides invitations when the plan has no RSVP", () => {
    expect(prepSteps({ ...base, rsvpConfirmed: null }, [], true).map((s) => s.step)).not.toContain("invites");
  });

  it("hides co-organizer and settings steps from co-organizers", () => {
    expect(prepSteps(base, [], false).map((s) => s.step)).toEqual(["invites", "qr", "share", "peek"]);
  });

  it("ticks steps Calisto can see for itself", () => {
    const steps = prepSteps({ ...base, rsvpConfirmed: 3, guests: 7, coOrganizers: 1, moderationEnabled: true }, [], true);
    const auto = steps.filter((s) => s.auto).map((s) => s.step);
    expect(auto).toEqual(["invites", "share", "co", "moderation"]);
    expect(steps.filter((s) => s.done).map((s) => s.step)).toEqual(auto);
  });

  it("ticks steps done by hand, ignoring unticked rows and own items", () => {
    const rows = [
      { id: "1", step: "qr" as const, label: null, done: true },
      { id: "2", step: "peek" as const, label: null, done: false },
      { id: "3", step: null, label: "Buy card stands", done: true },
    ];
    const steps = prepSteps(base, rows, true);
    expect(steps.filter((s) => s.done).map((s) => s.step)).toEqual(["qr"]);
  });
});
