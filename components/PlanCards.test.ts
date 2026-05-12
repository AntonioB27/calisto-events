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

const rowsHr = [
  { label: "Fotografije", value: "150" },
  { label: "Videos", value: "10" },
  { label: "Limit gostiju", value: "30" },
  { label: "ZIP izvoz", value: "Galerija — primarni organizator, 24h link" },
  { label: "Prozor za prijenos", value: "7 dana" },
  { label: "Brisanje događaja", value: "30 dana" },
];

const rowsDe = [
  { label: "Fotos", value: "150" },
  { label: "Videos", value: "10" },
  { label: "Gästelimit", value: "30" },
  { label: "ZIP-Export", value: "Galerie — Hauptorganisator, 24h-Link" },
  { label: "Upload-Fenster", value: "7 Tage" },
  { label: "Event-Löschung", value: "30 Tage" },
];

describe("splitPlanRows", () => {
  it("puts Photos, Videos, Guest limit into primaryRows (en)", () => {
    const { primaryRows } = splitPlanRows(rows);
    expect(primaryRows.map((r) => r.label)).toEqual(["Photos", "Videos", "Guest limit"]);
  });

  it("puts ZIP export, Upload window, Event deletion into secondaryRows (en)", () => {
    const { secondaryRows } = splitPlanRows(rows);
    expect(secondaryRows.map((r) => r.label)).toEqual([
      "ZIP export",
      "Upload window",
      "Event deletion",
    ]);
  });

  it("puts Fotografije, Videos, Limit gostiju into primaryRows (hr)", () => {
    const { primaryRows } = splitPlanRows(rowsHr);
    expect(primaryRows.map((r) => r.label)).toEqual(["Fotografije", "Videos", "Limit gostiju"]);
  });

  it("puts Fotos, Videos, Gästelimit into primaryRows (de)", () => {
    const { primaryRows } = splitPlanRows(rowsDe);
    expect(primaryRows.map((r) => r.label)).toEqual(["Fotos", "Videos", "Gästelimit"]);
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
