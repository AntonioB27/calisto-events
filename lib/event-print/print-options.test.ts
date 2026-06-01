import { describe, expect, it } from "vitest";

import {
  DEFAULT_POSTER_TEMPLATE,
  DEFAULT_PRINT_PAPER,
  parsePosterContentLocale,
  parsePosterTemplate,
  parsePrintPaper,
  parsePrintRouteTemplate,
} from "./print-options";

describe("parsePrintRouteTemplate", () => {
  it("defaults for undefined", () => {
    expect(parsePrintRouteTemplate(undefined)).toBe(DEFAULT_POSTER_TEMPLATE);
  });
  it("accepts table templates", () => {
    expect(parsePrintRouteTemplate("table-minimal")).toBe("table-minimal");
    expect(parsePrintRouteTemplate("table-bold")).toBe("table-bold");
  });
  it("accepts wedding invitation template", () => {
    expect(parsePrintRouteTemplate("wedding-invite-blue-floral")).toBe("wedding-invite-blue-floral");
  });
  it("rejects unknown", () => {
    expect(parsePrintRouteTemplate("hacker")).toBe(DEFAULT_POSTER_TEMPLATE);
  });
  it("accepts qr-clean, qr-gold, qr-dark", () => {
    expect(parsePrintRouteTemplate("qr-clean")).toBe("qr-clean");
    expect(parsePrintRouteTemplate("qr-gold")).toBe("qr-gold");
    expect(parsePrintRouteTemplate("qr-dark")).toBe("qr-dark");
  });
});

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
  it("maps invitation route id to default table (table-only parser)", () => {
    expect(parsePosterTemplate("wedding-invite-blue-floral")).toBe(DEFAULT_POSTER_TEMPLATE);
  });
  it("accepts qr-clean", () => {
    expect(parsePosterTemplate("qr-clean")).toBe("qr-clean");
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

describe("parsePosterContentLocale", () => {
  it("uses fallback when undefined", () => {
    expect(parsePosterContentLocale(undefined, "en")).toBe("en");
    expect(parsePosterContentLocale(undefined, "hr")).toBe("hr");
  });
  it("accepts en hr de", () => {
    expect(parsePosterContentLocale("de", "en")).toBe("de");
    expect(parsePosterContentLocale("hr", "en")).toBe("hr");
  });
  it("rejects unknown", () => {
    expect(parsePosterContentLocale("fr", "de")).toBe("de");
  });
});
