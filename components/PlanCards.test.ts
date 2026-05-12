import { describe, it, expect } from "vitest";
import { splitPlanRows } from "./PlanCards";

const rows = [
  { label: "Photos", value: "150" },
  { label: "Videos", value: "10" },
  { label: "Guest limit", value: "30" },
  { label: "ZIP export", value: "Gallery — primary organizer, 24h link" },
  { label: "Upload window", value: "7 days" },
  { label: "Event deletion", value: "30 days" },
];

describe("splitPlanRows", () => {
  it("puts Photos, Videos, Guest limit into primaryRows", () => {
    const { primaryRows } = splitPlanRows(rows);
    expect(primaryRows.map((r) => r.label)).toEqual(["Photos", "Videos", "Guest limit"]);
  });

  it("puts ZIP export, Upload window, Event deletion into secondaryRows", () => {
    const { secondaryRows } = splitPlanRows(rows);
    expect(secondaryRows.map((r) => r.label)).toEqual([
      "ZIP export",
      "Upload window",
      "Event deletion",
    ]);
  });

  it("handles empty input", () => {
    const result = splitPlanRows([]);
    expect(result.primaryRows).toEqual([]);
    expect(result.secondaryRows).toEqual([]);
  });

  it("preserves row values", () => {
    const { primaryRows } = splitPlanRows(rows);
    expect(primaryRows[0]!.value).toBe("150");
  });
});
