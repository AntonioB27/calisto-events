import { describe, expect, it } from "vitest";

import { csvCell } from "./rsvp-csv";

describe("csvCell", () => {
  it("quotes and escapes embedded quotes", () => {
    expect(csvCell('Ana "Anka" K, jr')).toBe('"Ana ""Anka"" K, jr"');
  });

  it("neutralizes spreadsheet formulas from guest input", () => {
    expect(csvCell("=HYPERLINK(\"x\")")).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell("+385 91 123")).toBe('"\'+385 91 123"');
    expect(csvCell("@foo")).toBe('"\'@foo"');
  });

  it("leaves numbers and plain text alone", () => {
    expect(csvCell(3)).toBe('"3"');
    expect(csvCell("Marija")).toBe('"Marija"');
  });
});
