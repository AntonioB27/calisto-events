import { describe, expect, it } from "vitest";

import {
  DEFAULT_POSTER_TEMPLATE,
  DEFAULT_PRINT_PAPER,
  parsePosterTemplate,
  parsePrintPaper,
} from "./print-options";

describe("parsePosterTemplate", () => {
  it("defaults for undefined", () => {
    expect(parsePosterTemplate(undefined)).toBe(DEFAULT_POSTER_TEMPLATE);
  });
  it("accepts table-minimal", () => {
    expect(parsePosterTemplate("table-minimal")).toBe("table-minimal");
  });
  it("accepts table-bold", () => {
    expect(parsePosterTemplate("table-bold")).toBe("table-bold");
  });
  it("rejects unknown", () => {
    expect(parsePosterTemplate("hacker")).toBe(DEFAULT_POSTER_TEMPLATE);
  });
});

describe("parsePrintPaper", () => {
  it("defaults for undefined", () => {
    expect(parsePrintPaper(undefined)).toBe(DEFAULT_PRINT_PAPER);
  });
  it("accepts a4 and letter", () => {
    expect(parsePrintPaper("a4")).toBe("a4");
    expect(parsePrintPaper("letter")).toBe("letter");
  });
  it("rejects unknown", () => {
    expect(parsePrintPaper("tabloid")).toBe(DEFAULT_PRINT_PAPER);
  });
});
